import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Download, 
  Plus, 
  Trash2, 
  Target, 
  Shield, 
  AlertTriangle,
  FileText,
  Lightbulb,
  TrendingUp,
  Copy,
  Check,
  ExternalLink,
  Bot,
  Play,
  Radar
} from 'lucide-react';
import { 
  REPORT_SECTIONS, 
  VULNERABILITY_CATEGORIES, 
  HIGH_VALUE_INDICATORS,
  SEVERITY_SCORES,
  generateMarkdownReport,
  type Finding,
  type ReportSection
} from '@/config/reportTemplate';
import { useReportContext } from '@/hooks/useReportContext';
import { getCampaignById } from '@/config/agentCampaigns';

interface ReportData {
  [key: string]: string;
}

export default function ReportBuilder() {
  const { toolOutputs, pendingFindings, currentSession, targets } = useReportContext();
  const [activeSection, setActiveSection] = useState('executive_summary');
  const [reportData, setReportData] = useState<ReportData>({});
  const [findings, setFindings] = useState<Finding[]>([]);
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentFinding, setCurrentFinding] = useState<Partial<Finding>>({
    severity: 'medium',
    category: '',
    confidence: 'potential',
    status: 'new',
    evidence: []
  });
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const lastAutoFields = useRef<Record<string, string>>({});

  const activeModule = useMemo(() => {
    if (!currentSession?.activeCampaign) return undefined;
    return getCampaignById(currentSession.activeCampaign);
  }, [currentSession?.activeCampaign]);

  const autoCaptureActive = !!currentSession?.activeCampaign;

  useEffect(() => {
    const saved = localStorage.getItem('bugBountyReport');
    if (saved) {
      const parsed = JSON.parse(saved);
      setReportData(parsed.reportData || {});
      setFindings(parsed.findings || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bugBountyReport', JSON.stringify({ reportData, findings }));
  }, [reportData, findings]);

  useEffect(() => {
    if (!autoCaptureActive || pendingFindings.length === 0) return;

    setFindings(prev => {
      const existing = new Set(prev.map(f => `${f.title}::${f.description}`));
      const toAdd = pendingFindings
        .filter(f => f.title || f.description)
        .filter(f => !existing.has(`${f.title || 'Untitled'}::${f.description || ''}`))
        .map(f => ({
          id: `finding-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: f.title || 'Untitled Finding',
          severity: (f.severity as Finding['severity']) || 'medium',
          category: f.category || 'info_disclosure',
          description: f.description || '',
          stepsToReproduce: f.stepsToReproduce || 'TBD',
          impact: f.impact || '',
          recommendation: f.recommendation || '',
          evidence: f.evidence || [],
          estimatedBounty: f.estimatedBounty || '',
          confidence: (f.confidence as Finding['confidence']) || 'potential',
          status: (f.status as Finding['status']) || 'new'
        }));

      if (toAdd.length === 0) return prev;
      return [...prev, ...toAdd];
    });
  }, [autoCaptureActive, pendingFindings]);

  useEffect(() => {
    if (!autoCaptureActive) return;

    const targetScope = targets.length > 0
      ? targets.map(t => `${t.name || t.type}: ${t.value}`).join(', ')
      : 'Not specified';

    const toolSet = new Set<string>();
    (activeModule?.tools || []).forEach(tool => toolSet.add(tool));
    toolOutputs.forEach(output => {
      if (output.source) toolSet.add(output.source);
    });

    const toolsUsed = Array.from(toolSet).join(', ');
    const observations = toolOutputs
      .slice(-8)
      .map(output => {
        const snippet = output.content.length > 200 ? `${output.content.slice(0, 200)}...` : output.content;
        return `• [${output.source}] ${output.type}: ${snippet}`;
      })
      .join('\n');

    const findingsBySeverity = findings.reduce(
      (acc, f) => {
        acc[f.severity] = (acc[f.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalFindingsSummary = [
      `Critical: ${findingsBySeverity.critical || 0}`,
      `High: ${findingsBySeverity.high || 0}`,
      `Medium: ${findingsBySeverity.medium || 0}`,
      `Low: ${findingsBySeverity.low || 0}`,
      `Info: ${findingsBySeverity.info || 0}`
    ].join(', ');

    const methodologyLines = [
      activeModule ? `Module: ${activeModule.name}` : null,
      activeModule?.objectives?.length ? `Objectives:\n- ${activeModule.objectives.join('\n- ')}` : null,
      targetScope ? `Targets: ${targetScope}` : null,
      toolsUsed ? `Tools: ${toolsUsed}` : null
    ].filter(Boolean);

    const autoFields: Record<string, string> = {
      target: targetScope !== 'Not specified' ? targetScope : '',
      testing_period: new Date().toLocaleDateString(),
      total_findings: totalFindingsSummary,
      tools: toolsUsed,
      methodology: methodologyLines.join('\n\n'),
      observations
    };

    setReportData(prev => {
      const next = { ...prev };
      Object.entries(autoFields).forEach(([key, value]) => {
        if (!value) return;
        const existing = prev[key];
        if (!existing || existing.trim() === '' || existing === lastAutoFields.current[key]) {
          next[key] = value;
        }
      });
      lastAutoFields.current = { ...lastAutoFields.current, ...autoFields };
      return next;
    });
  }, [autoCaptureActive, activeModule, targets, toolOutputs, findings]);

  const updateField = (fieldId: string, value: string) => {
    setReportData(prev => ({ ...prev, [fieldId]: value }));
  };

  const addFinding = () => {
    if (!currentFinding.title || !currentFinding.category) return;
    
    const newFinding: Finding = {
      ...currentFinding as Finding,
      id: `finding-${Date.now()}`,
      evidence: currentFinding.evidence || []
    };
    
    setFindings(prev => [...prev, newFinding]);
    setCurrentFinding({
      severity: 'medium',
      category: '',
      confidence: 'potential',
      status: 'new',
      evidence: []
    });
    setSelectedIndicators([]);
    setShowFindingForm(false);
  };

  const removeFinding = (id: string) => {
    setFindings(prev => prev.filter(f => f.id !== id));
  };

  const exportReport = (format: 'markdown' | 'json') => {
    let content: string;
    let filename: string;
    let type: string;

    if (format === 'markdown') {
      content = generateMarkdownReport(reportData, findings);
      filename = `security-report-${new Date().toISOString().split('T')[0]}.md`;
      type = 'text/markdown';
    } else {
      content = JSON.stringify({ reportData, findings, exportedAt: new Date().toISOString() }, null, 2);
      filename = `security-report-${new Date().toISOString().split('T')[0]}.json`;
      type = 'application/json';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const markdown = generateMarkdownReport(reportData, findings);
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityColor = (severity: string) => {
    return SEVERITY_SCORES[severity as keyof typeof SEVERITY_SCORES]?.color || '#6b7280';
  };

  const calculateEstimatedBounty = () => {
    let total = { min: 0, max: 0 };
    findings.forEach(f => {
      const cat = VULNERABILITY_CATEGORIES.find(c => c.id === f.category);
      if (cat) {
        const [minStr, maxStr] = cat.avgBounty.replace(/\$/g, '').replace(/,/g, '').replace(/\+/g, '').split('-');
        const multiplier = SEVERITY_SCORES[f.severity]?.bountyMultiplier || 1;
        total.min += (parseInt(minStr) || 0) * multiplier;
        total.max += (parseInt(maxStr) || parseInt(minStr) * 2) * multiplier;
      }
    });
    return total;
  };

  const bountyEstimate = calculateEstimatedBounty();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--muted))] to-[hsl(var(--card))] text-foreground p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {autoCaptureActive ? (
          <div className="mb-4">
            <Card className="bg-teal-950/30 border-teal-700/40">
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-900/50 flex items-center justify-center">
                    <Radar className="w-5 h-5 text-teal-400 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-teal-400 text-xs uppercase font-bold">Investigation Active</p>
                    <p className="text-foreground text-sm font-semibold">
                      {activeModule?.name || currentSession?.name || 'Active Module'}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Targets: {targets.map(t => t.value).join(', ') || 'None'} • Findings: {pendingFindings.length}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-teal-700 text-teal-300 animate-pulse">
                  Auto-capturing
                </Badge>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mb-4">
            <Card className="bg-amber-950/20 border-amber-900/40 border-dashed">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-amber-400 font-bold mb-2">No Active Investigation</h3>
                <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
                  Start an investigation in the NEXUS Agent to auto-populate this report with your findings, targets, and tool outputs.
                </p>
                <Link href="/investigate">
                  <Button className="bg-amber-700 hover:bg-amber-600 text-black gap-2" data-testid="start-investigation-btn">
                    <Play className="w-4 h-4" />
                    Start Investigation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button variant="ghost" className="text-amber-600 hover:text-amber-500" data-testid="back-button">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button 
              onClick={copyToClipboard}
              variant="outline" 
              className="border-amber-900/30 text-amber-600"
              data-testid="copy-report-button"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy
            </Button>
            <Button 
              onClick={() => exportReport('markdown')}
              className="bg-amber-700 hover:bg-amber-600 text-black"
              data-testid="export-md-button"
            >
              <Download className="w-4 h-4 mr-2" /> Export MD
            </Button>
            <Button 
              onClick={() => exportReport('json')}
              variant="outline"
              className="border-teal-700 text-teal-500"
              data-testid="export-json-button"
            >
              <Download className="w-4 h-4 mr-2" /> Export JSON
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-4 mb-4">
          <Card className="bg-black/50 border-amber-900/30">
            <CardContent className="p-4">
              <div className="text-amber-600 text-xs uppercase mb-1">Findings</div>
              <div className="text-2xl font-bold text-amber-500">{findings.length}</div>
              <div className="text-xs text-muted-foreground">
                {findings.filter(f => f.severity === 'critical').length} Critical, {findings.filter(f => f.severity === 'high').length} High
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-teal-900/30">
            <CardContent className="p-4">
              <div className="text-teal-400 text-xs uppercase mb-1">Est. Bounty Range</div>
              <div className="text-2xl font-bold text-teal-400">
                ${bountyEstimate.min.toLocaleString()} - ${bountyEstimate.max.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Based on category averages</div>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-purple-900/30">
            <CardContent className="p-4">
              <div className="text-purple-400 text-xs uppercase mb-1">Sections Complete</div>
              <div className="text-2xl font-bold text-purple-400">
                {Object.keys(reportData).length} / {REPORT_SECTIONS.reduce((acc, s) => acc + s.fields.length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Fields filled</div>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-red-900/30">
            <CardContent className="p-4">
              <div className="text-red-400 text-xs uppercase mb-1">High-Value Leads</div>
              <div className="text-2xl font-bold text-red-400">
                {findings.filter(f => f.severity === 'critical' || f.severity === 'high').length}
              </div>
              <div className="text-xs text-muted-foreground">Priority targets</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card className="bg-black/50 border-amber-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-500 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Report Sections
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Structure your findings for maximum impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeSection} onValueChange={setActiveSection}>
                  <TabsList className="bg-[hsl(var(--card))] border border-amber-900/30 w-full flex-wrap h-auto gap-1 p-1">
                    {REPORT_SECTIONS.map((section) => (
                      <TabsTrigger 
                        key={section.id}
                        value={section.id}
                        className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500"
                        data-testid={`tab-${section.id}`}
                      >
                        {section.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {REPORT_SECTIONS.map((section) => (
                    <TabsContent key={section.id} value={section.id} className="mt-4 space-y-4">
                      <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-3">
                        <p className="text-amber-400 text-sm font-bold mb-1">{section.title}</p>
                        <p className="text-muted-foreground text-xs">{section.description}</p>
                        <p className="text-teal-400 text-xs mt-1">
                          <Lightbulb className="w-3 h-3 inline mr-1" />
                          <strong>Bounty Tip:</strong> {section.bountyImpact}
                        </p>
                      </div>

                      {section.fields.map((field) => (
                        <div key={field.id} className="space-y-1">
                          <Label className="text-amber-600 text-sm">{field.label}</Label>
                          {field.tip && (
                            <p className="text-muted-foreground text-xs">{field.tip}</p>
                          )}
                          {field.type === 'text' && (
                            <Input
                              value={reportData[field.id] || ''}
                              onChange={(e) => updateField(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              className="bg-black/50 border-amber-900/30 text-foreground"
                              data-testid={`input-${field.id}`}
                            />
                          )}
                          {field.type === 'textarea' && (
                            <Textarea
                              value={reportData[field.id] || ''}
                              onChange={(e) => updateField(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              className="bg-black/50 border-amber-900/30 text-foreground min-h-[100px]"
                              data-testid={`textarea-${field.id}`}
                            />
                          )}
                          {field.type === 'select' && field.options && (
                            <Select 
                              value={reportData[field.id] || ''} 
                              onValueChange={(v) => updateField(field.id, v)}
                            >
                              <SelectTrigger className="bg-black/50 border-amber-900/30">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map((opt) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {field.type === 'checklist' && field.options && (
                            <div className="flex flex-wrap gap-2">
                              {field.options.map((opt) => {
                                const currentVals = (reportData[field.id] || '').split(',').filter(Boolean);
                                const isChecked = currentVals.includes(opt);
                                return (
                                  <Badge
                                    key={opt}
                                    variant={isChecked ? "default" : "outline"}
                                    className={`cursor-pointer ${isChecked ? 'bg-amber-700' : 'border-amber-900/30'}`}
                                    onClick={() => {
                                      const newVals = isChecked 
                                        ? currentVals.filter(v => v !== opt)
                                        : [...currentVals, opt];
                                      updateField(field.id, newVals.join(','));
                                    }}
                                  >
                                    {opt}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-black/50 border-red-900/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-400 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4" /> Findings ({findings.length})
                  </CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setShowFindingForm(!showFindingForm)}
                    className="bg-red-700 hover:bg-red-600 text-white h-7"
                    data-testid="add-finding-button"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showFindingForm && (
                  <div className="bg-black/50 border border-red-900/30 rounded-lg p-3 mb-3 space-y-3">
                    <Input
                      placeholder="Finding title..."
                      value={currentFinding.title || ''}
                      onChange={(e) => setCurrentFinding(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-black/50 border-amber-900/30 text-sm"
                      data-testid="finding-title-input"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select 
                        value={currentFinding.severity} 
                        onValueChange={(v) => setCurrentFinding(prev => ({ ...prev, severity: v as Finding['severity'] }))}
                      >
                        <SelectTrigger className="bg-black/50 border-amber-900/30 h-8 text-xs">
                          <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select 
                        value={currentFinding.category} 
                        onValueChange={(v) => setCurrentFinding(prev => ({ ...prev, category: v }))}
                      >
                        <SelectTrigger className="bg-black/50 border-amber-900/30 h-8 text-xs">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {VULNERABILITY_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Description of the vulnerability..."
                      value={currentFinding.description || ''}
                      onChange={(e) => setCurrentFinding(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-black/50 border-amber-900/30 text-xs h-16"
                      data-testid="finding-description-input"
                    />
                    <Textarea
                      placeholder="Steps to reproduce..."
                      value={currentFinding.stepsToReproduce || ''}
                      onChange={(e) => setCurrentFinding(prev => ({ ...prev, stepsToReproduce: e.target.value }))}
                      className="bg-black/50 border-amber-900/30 text-xs h-16"
                    />
                    <Textarea
                      placeholder="Impact..."
                      value={currentFinding.impact || ''}
                      onChange={(e) => setCurrentFinding(prev => ({ ...prev, impact: e.target.value }))}
                      className="bg-black/50 border-amber-900/30 text-xs h-12"
                    />
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">High-Value Indicators</Label>
                      <div className="flex flex-wrap gap-1">
                        {HIGH_VALUE_INDICATORS.slice(0, 6).map((ind) => (
                          <Badge
                            key={ind.indicator}
                            variant={selectedIndicators.includes(ind.indicator) ? "default" : "outline"}
                            className={`cursor-pointer text-[10px] ${selectedIndicators.includes(ind.indicator) ? 'bg-teal-700' : 'border-border'}`}
                            onClick={() => setSelectedIndicators(prev => 
                              prev.includes(ind.indicator) 
                                ? prev.filter(i => i !== ind.indicator)
                                : [...prev, ind.indicator]
                            )}
                          >
                            {ind.icon} {ind.indicator.slice(0, 20)}...
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={addFinding}
                      className="w-full bg-amber-700 hover:bg-amber-600 text-black"
                      data-testid="save-finding-button"
                    >
                      Save Finding
                    </Button>
                  </div>
                )}

                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {findings.map((finding) => (
                      <div 
                        key={finding.id}
                        className="p-2 rounded border border-border bg-black/30"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge 
                                className="text-[10px] px-1"
                                style={{ backgroundColor: getSeverityColor(finding.severity) }}
                              >
                                {finding.severity.toUpperCase()}
                              </Badge>
                              <span className="text-amber-400 text-xs font-bold truncate">
                                {finding.title}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-[10px] mt-1">
                              {VULNERABILITY_CATEGORIES.find(c => c.id === finding.category)?.name}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFinding(finding.id)}
                            className="text-red-500 hover:text-red-400 h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {findings.length === 0 && (
                      <p className="text-muted-foreground text-xs text-center py-4">
                        No findings yet. Use the AI agent to discover vulnerabilities!
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-teal-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-teal-400 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4" /> High-Value Lead Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {HIGH_VALUE_INDICATORS.slice(0, 5).map((ind) => (
                    <div key={ind.indicator} className="flex items-center gap-2 text-xs">
                      <span>{ind.icon}</span>
                      <span className="text-muted-foreground flex-1">{ind.indicator}</span>
                      <Badge variant="outline" className="text-teal-400 border-teal-700 text-[10px]">
                        {ind.multiplier}x
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-[10px] mt-3">
                  Findings with these indicators typically pay more. Look for chains!
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-purple-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-400 flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4" /> Vuln Categories by Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-1">
                    {VULNERABILITY_CATEGORIES.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between text-xs py-1 border-b border-border last:border-0">
                        <span className="text-muted-foreground">{cat.name}</span>
                        <span className="text-amber-500 font-mono">{cat.avgBounty}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
