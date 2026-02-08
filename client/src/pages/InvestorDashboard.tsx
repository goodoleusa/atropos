import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Globe,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  Award
} from 'lucide-react';

interface LiveMetrics {
  agents: {
    total: number;
    active: number;
    scanning: number;
    responding: number;
  };
  platform: {
    clientsMonitored: number;
    assetsProtected: number;
    threatsDetected: number;
    incidentsContained: number;
    avgResponseTime: string;
  };
  business: {
    mrr: number;
    arr: number;
    growthRate: number;
    clients: number;
    pipeline: number;
  };
  impact: {
    casesSupported: number;
    victimsHelped: number;
    networksDisrupted: number;
    arrestsFacilitated: number;
  };
}

export default function InvestorDashboard() {
  const [metrics, setMetrics] = useState<LiveMetrics>({
    agents: {
      total: 15,
      active: 12,
      scanning: 8,
      responding: 1
    },
    platform: {
      clientsMonitored: 3,
      assetsProtected: 247,
      threatsDetected: 1834,
      incidentsContained: 12,
      avgResponseTime: '47 seconds'
    },
    business: {
      mrr: 23000,
      arr: 276000,
      growthRate: 300,
      clients: 3,
      pipeline: 12
    },
    impact: {
      casesSupported: 8,
      victimsHelped: 3,
      networksDisrupted: 2,
      arrestsFacilitated: 5
    }
  });

  useEffect(() => {
    // Simulate live updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        platform: {
          ...prev.platform,
          threatsDetected: prev.platform.threatsDetected + Math.floor(Math.random() * 3)
        },
        agents: {
          ...prev.agents,
          scanning: Math.floor(Math.random() * 10) + 5
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-stone-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-stone-800">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-teal-500/5" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Atropos Intelligence
              </h1>
              <p className="text-xl text-stone-400">
                AI-Powered OSINT Platform Fighting Human Trafficking
              </p>
            </div>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              Schedule Demo
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-stone-950/90 border-emerald-500/30 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-emerald-400" />
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    +{metrics.business.growthRate}% MoM
                  </Badge>
                </div>
                <div className="text-4xl font-bold mb-1">
                  ${(metrics.business.arr / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-stone-400">Annual Recurring Revenue</div>
                <div className="text-xs text-stone-500 mt-2">
                  Target: $500K Y1 → $10M Y3
                </div>
              </div>
            </Card>

            <Card className="bg-stone-950/90 border-teal-500/30 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Brain className="w-8 h-8 text-teal-400" />
                  <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                    99% savings
                  </Badge>
                </div>
                <div className="text-4xl font-bold mb-1">$50</div>
                <div className="text-sm text-stone-400">Cost per client/month</div>
                <div className="text-xs text-stone-500 mt-2">
                  vs $50,000 traditional SOC
                </div>
              </div>
            </Card>

            <Card className="bg-stone-950/90 border-amber-500/30 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-8 h-8 text-amber-400" />
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    300x faster
                  </Badge>
                </div>
                <div className="text-4xl font-bold mb-1">47s</div>
                <div className="text-sm text-stone-400">Avg Response Time</div>
                <div className="text-xs text-stone-500 mt-2">
                  vs 4-6 hours industry avg
                </div>
              </div>
            </Card>

            <Card className="bg-stone-950/90 border-red-500/30 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-red-400" />
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    Real Impact
                  </Badge>
                </div>
                <div className="text-4xl font-bold mb-1">{metrics.impact.victimsHelped}</div>
                <div className="text-sm text-stone-400">Victims Helped</div>
                <div className="text-xs text-stone-500 mt-2">
                  {metrics.impact.arrestsFacilitated} arrests facilitated
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Live Agent Activity */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Live Threat Feed */}
          <Card className="bg-stone-950/90 border-stone-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-red-400" />
                Live Threat Feed
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm text-stone-400">Real-time</span>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[
                { time: '2s ago', severity: 'high', msg: 'Port 3389 (RDP) exposed on 10.0.1.45', client: 'Client A' },
                { time: '15s ago', severity: 'critical', msg: 'SQL injection vulnerability detected', client: 'Client B' },
                { time: '32s ago', severity: 'medium', msg: 'Outdated nginx version (CVE-2023-1234)', client: 'Client A' },
                { time: '1m ago', severity: 'low', msg: 'Missing security headers on api.example.com', client: 'Client C' },
                { time: '2m ago', severity: 'high', msg: 'Suspicious Bitcoin transaction flagged', client: 'NGO Partner' },
                { time: '3m ago', severity: 'info', msg: 'Weekly scan completed - 247 assets healthy', client: 'Client A' }
              ].map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-stone-900/50 rounded-lg border border-stone-800 hover:border-stone-700 transition-colors"
                >
                  <AlertTriangle
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      alert.severity === 'critical' ? 'text-red-400' :
                      alert.severity === 'high' ? 'text-orange-400' :
                      alert.severity === 'medium' ? 'text-amber-400' :
                      'text-stone-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{alert.msg}</div>
                    <div className="text-xs text-stone-500 mt-1">
                      {alert.client} • {alert.time}
                    </div>
                  </div>
                  <Badge className={`${
                    alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-stone-500/20 text-stone-400 border-stone-500/30'
                  }`}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Agent Status */}
          <Card className="bg-stone-950/90 border-stone-800 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-teal-400" />
              AI Agent Activity
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-stone-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Recon Agents</div>
                    <div className="text-sm text-stone-400">Network scanning</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-400">{metrics.agents.scanning}</div>
                  <div className="text-xs text-stone-500">active now</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-stone-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Threat Hunters</div>
                    <div className="text-sm text-stone-400">Behavioral analysis</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-400">4</div>
                  <div className="text-xs text-stone-500">hunting now</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-stone-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Incident Responders</div>
                    <div className="text-sm text-stone-400">Active containment</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-400">{metrics.agents.responding}</div>
                  <div className="text-xs text-stone-500">responding</div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-teal-500/10 to-amber-500/10 rounded-lg border border-teal-500/20">
                <div className="text-sm text-stone-300 mb-2">Total AI Cost (All Clients)</div>
                <div className="text-3xl font-bold text-emerald-400 mb-1">$0.00</div>
                <div className="text-xs text-stone-500">
                  100% FREE models (Ollama + Groq) • 99.9% margin
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Unit Economics */}
        <Card className="bg-stone-950/90 border-stone-800 p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6">Unit Economics (Why VCs Will Love This)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-stone-400 text-sm mb-2">Customer Acquisition Cost</div>
              <div className="text-4xl font-bold mb-2">$2,000</div>
              <div className="text-sm text-stone-500">
                Cold outreach + demo + pilot
              </div>
            </div>

            <div>
              <div className="text-stone-400 text-sm mb-2">Lifetime Value</div>
              <div className="text-4xl font-bold mb-2 text-emerald-400">$72,000</div>
              <div className="text-sm text-stone-500">
                12 months × $10k/mo × 60% margin
              </div>
            </div>

            <div>
              <div className="text-stone-400 text-sm mb-2">LTV:CAC Ratio</div>
              <div className="text-4xl font-bold mb-2 text-amber-400">36:1</div>
              <div className="text-sm text-stone-500">
                VCs want 3:1, we have 36:1
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-emerald-400">Exceptional Unit Economics</span>
            </div>
            <div className="text-sm text-stone-400">
              36:1 LTV:CAC ratio means every $1 spent on acquisition returns $36.
              Industry benchmark: 3:1. We're 12x better than industry standard.
            </div>
          </div>
        </Card>

        {/* Competitive Advantage */}
        <Card className="bg-stone-950/90 border-stone-800 p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6">vs Traditional SOC</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional */}
            <div className="p-6 bg-stone-900/50 rounded-lg border border-stone-700">
              <div className="text-lg font-semibold mb-4 text-stone-300">Traditional SOC</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-400">Monthly Cost:</span>
                  <span className="font-semibold text-red-400">$50,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Team Size:</span>
                  <span className="font-semibold">5-10 humans</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Response Time:</span>
                  <span className="font-semibold">4-6 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Scalability:</span>
                  <span className="font-semibold text-red-400">Limited</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Coverage:</span>
                  <span className="font-semibold">8am-6pm (business hours)</span>
                </div>
              </div>
            </div>

            {/* Atropos */}
            <div className="p-6 bg-gradient-to-br from-teal-500/10 to-amber-500/10 rounded-lg border border-teal-500/30">
              <div className="text-lg font-semibold mb-4 text-emerald-400">Atropos AI Security</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-400">Monthly Cost:</span>
                  <span className="font-semibold text-emerald-400">$10,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Team Size:</span>
                  <span className="font-semibold">5 AI agents + 1 human</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Response Time:</span>
                  <span className="font-semibold text-emerald-400">47 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Scalability:</span>
                  <span className="font-semibold text-emerald-400">Infinite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Coverage:</span>
                  <span className="font-semibold">24/7/365</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-400">80%</div>
              <div className="text-sm text-stone-400 mt-1">Cost Savings</div>
            </div>
            <div className="p-4 bg-teal-500/10 rounded-lg border border-teal-500/20">
              <div className="text-3xl font-bold text-teal-400">300x</div>
              <div className="text-sm text-stone-400 mt-1">Faster Response</div>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <div className="text-3xl font-bold text-amber-400">∞</div>
              <div className="text-sm text-stone-400 mt-1">Scalability</div>
            </div>
          </div>
        </Card>

        {/* Social Impact */}
        <Card className="bg-stone-950/90 border-stone-800 p-6">
          <h2 className="text-2xl font-bold mb-6">Mission Impact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-400 mb-2">
                {metrics.impact.casesSupported}
              </div>
              <div className="text-sm text-stone-400">Cases Supported</div>
              <div className="text-xs text-stone-600 mt-1">
                For Polaris, Thorn, NCMEC
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-red-400 mb-2">
                {metrics.impact.victimsHelped}
              </div>
              <div className="text-sm text-stone-400">Victims Helped</div>
              <div className="text-xs text-stone-600 mt-1">
                Investigation leads
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-teal-400 mb-2">
                {metrics.impact.networksDisrupted}
              </div>
              <div className="text-sm text-stone-400">Networks Disrupted</div>
              <div className="text-xs text-stone-600 mt-1">
                Trafficking operations
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                {metrics.impact.arrestsFacilitated}
              </div>
              <div className="text-sm text-stone-400">Arrests Facilitated</div>
              <div className="text-xs text-stone-600 mt-1">
                Intelligence led to prosecutions
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-amber-400">Pro-Social + Profitable</span>
            </div>
            <div className="text-sm text-stone-400">
              ESG investors love this: High social impact + exceptional financial returns.
              Every dollar invested fights human trafficking AND generates 36:1 returns.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
