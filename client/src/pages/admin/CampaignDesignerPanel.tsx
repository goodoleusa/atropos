import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Download, ExternalLink, Plus, Database, Globe, FileText } from "lucide-react";

export function CampaignDesignerPanel({ onOpenBuilder }: { onOpenBuilder: () => void }) {
  const { toast } = useToast();
  const { data: designerCampaigns = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/designer/campaigns'],
    queryFn: () => fetch('/api/designer/campaigns').then(r => r.ok ? r.json() : [])
  });

  const handleImportFromObsidian = () => {
    toast({
      title: "Obsidian Import",
      description: "Run 'npm run sync:campaigns -- --from-obsidian' in terminal to import campaigns from your Obsidian vault",
      className: "border-purple-500 text-purple-400 bg-black/90"
    });
  };

  const handleExportToObsidian = async () => {
    try {
      // Export current campaigns to markdown format
      const campaigns = designerCampaigns.map(c => ({
        id: c.campaignId,
        name: c.name,
        description: c.description,
        difficulty: c.difficulty,
        nodes: c.nodes,
        links: c.links
      }));
      
      toast({
        title: "Export Instructions",
        description: `${campaigns.length} campaigns ready. Run 'npm run sync:campaigns -- --to-obsidian' to export to Obsidian vault`,
        className: "border-teal-500 text-teal-400 bg-black/90"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-purple-500 flex items-center gap-2">
          <Layers className="w-5 h-5" /> Campaign Designer
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={handleImportFromObsidian}
            variant="outline"
            size="sm"
            className="border-purple-900/50 text-purple-400 hover:bg-purple-950/30"
          >
            <Download className="w-4 h-4 mr-1" />
            Import from Obsidian
          </Button>
          <Button
            onClick={handleExportToObsidian}
            variant="outline"
            size="sm"
            className="border-teal-900/50 text-teal-400 hover:bg-teal-950/30"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Export to Obsidian
          </Button>
          <Button
            onClick={onOpenBuilder}
            className="bg-purple-900/30 text-purple-300 hover:bg-purple-900/50 border border-purple-700/50"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Campaign
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Loading campaigns...
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="bg-[hsl(var(--card))] border-purple-900/30">
            <CardHeader>
              <CardTitle className="text-purple-400 text-sm">Quick Start</CardTitle>
              <CardDescription className="text-muted-foreground">
                Design investigations visually or import from Obsidian vault
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <Card className="bg-purple-950/20 border-purple-800/30 cursor-pointer hover:border-purple-600/50 transition-all"
                    onClick={onOpenBuilder}>
                <CardContent className="p-4 text-center">
                  <Layers className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="font-bold text-foreground text-sm mb-1">Visual Designer</h4>
                  <p className="text-muted-foreground text-xs">Create campaigns with node editor</p>
                </CardContent>
              </Card>

              <Card className="bg-teal-950/20 border-teal-800/30 cursor-pointer hover:border-teal-600/50 transition-all"
                    onClick={handleImportFromObsidian}>
                <CardContent className="p-4 text-center">
                  <Download className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                  <h4 className="font-bold text-foreground text-sm mb-1">Import from Obsidian</h4>
                  <p className="text-muted-foreground text-xs">Use your Obsidian vault campaigns</p>
                </CardContent>
              </Card>

              <Card className="bg-amber-950/20 border-amber-800/30 cursor-pointer hover:border-amber-600/50 transition-all">
                <CardContent className="p-4 text-center">
                  <FileText className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <h4 className="font-bold text-foreground text-sm mb-1">Documentation</h4>
                  <p className="text-muted-foreground text-xs">See docs/OBSIDIAN_VAULT_GUIDE.md</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(var(--card))] border-purple-900/30">
            <CardHeader>
              <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                Saved Campaigns ({designerCampaigns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {designerCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No campaigns yet</p>
                  <p className="text-muted-foreground text-sm">Create your first campaign to get started</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {designerCampaigns.map((campaign: any) => (
                    <Card 
                      key={campaign.campaignId} 
                      className="bg-card/30 border-border hover:border-purple-600/50 transition-all cursor-pointer"
                      onClick={() => {
                        onOpenBuilder();
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-foreground text-sm">{campaign.name}</h4>
                          {campaign.isPublished && (
                            <Badge className="bg-teal-900/50 text-teal-400 text-[10px]">Published</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs mb-2 line-clamp-2">{campaign.description}</p>
                        <div className="flex items-center gap-2 text-[10px]">
                          <Badge variant="outline" className="border-border">
                            {campaign.difficulty || 'intermediate'}
                          </Badge>
                          <Badge variant="outline" className="border-border">
                            {campaign.nodes?.length || 0} nodes
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-amber-950/20 border-amber-800/30">
            <CardHeader>
              <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Obsidian Vault Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground">
              <div>
                <h4 className="font-bold text-foreground mb-1">✨ Design campaigns offline in Obsidian</h4>
                <p className="text-muted-foreground text-xs">
                  Use Breadcrumbs for relationships, Excalibrain for visual graph, Templater for rapid creation
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Badge className="bg-purple-900/30 text-purple-400 text-[10px]">1</Badge>
                  <p className="text-xs text-muted-foreground">Edit campaigns in obsidian-vault/Campaigns/</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-purple-900/30 text-purple-400 text-[10px]">2</Badge>
                  <p className="text-xs text-muted-foreground">Use Templater templates for auto-fill</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-purple-900/30 text-purple-400 text-[10px]">3</Badge>
                  <p className="text-xs text-muted-foreground">Visualize relationships in Excalibrain</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-purple-900/30 text-purple-400 text-[10px]">4</Badge>
                  <p className="text-xs text-muted-foreground">Run: npm run sync:campaigns</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-purple-900/30 text-purple-400 text-[10px]">5</Badge>
                  <p className="text-xs text-muted-foreground">Campaigns appear in app automatically</p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-900/20">
                <code className="text-[10px] text-amber-500 bg-black/30 px-2 py-1 rounded">
                  npm run sync:campaigns -- --from-obsidian
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
