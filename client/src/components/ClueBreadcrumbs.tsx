import { useState } from 'react';
import { ChevronRight, Home, FileText, Link2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ClueNode {
  id: string;
  name: string;
  linkedTo: string[];
  linkedFrom: string[];
}

interface ClueBreadcrumbsProps {
  currentClue: ClueNode;
  allClues: ClueNode[];
  onNavigate: (clueId: string) => void;
  trail: string[];
  onTrailChange: (trail: string[]) => void;
}

export function ClueBreadcrumbs({ 
  currentClue, 
  allClues, 
  onNavigate, 
  trail,
  onTrailChange 
}: ClueBreadcrumbsProps) {
  const getClueById = (id: string) => allClues.find(c => c.id === id);

  const navigateForward = (clueId: string) => {
    const newTrail = [...trail, clueId];
    onTrailChange(newTrail);
    onNavigate(clueId);
  };

  const navigateBack = () => {
    if (trail.length > 1) {
      const newTrail = trail.slice(0, -1);
      onTrailChange(newTrail);
      onNavigate(newTrail[newTrail.length - 1]);
    }
  };

  const navigateToIndex = (index: number) => {
    const newTrail = trail.slice(0, index + 1);
    onTrailChange(newTrail);
    onNavigate(trail[index]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateBack}
          disabled={trail.length <= 1}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-500"
          data-testid="breadcrumb-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <ScrollArea className="flex-1">
          <div className="flex items-center gap-1 py-1">
            <button
              onClick={() => navigateToIndex(0)}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-amber-900/20 transition-colors"
              data-testid="breadcrumb-home"
            >
              <Home className="w-3 h-3 text-amber-600" />
              <span className="text-xs text-amber-500">Root</span>
            </button>
            
            {trail.map((clueId, index) => {
              const clue = getClueById(clueId);
              if (!clue) return null;
              
              const isLast = index === trail.length - 1;
              
              return (
                <div key={`${clueId}-${index}`} className="flex items-center">
                  <ChevronRight className="w-3 h-3 text-muted-foreground mx-1" />
                  <button
                    onClick={() => navigateToIndex(index)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                      isLast 
                        ? 'bg-amber-900/30 text-amber-400 border border-amber-700/50' 
                        : 'hover:bg-amber-900/20 text-muted-foreground hover:text-amber-500'
                    }`}
                    data-testid={`breadcrumb-${clueId}`}
                  >
                    <FileText className="w-3 h-3" />
                    <span className="text-xs font-mono truncate max-w-[100px]">{clue.name}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {currentClue && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Backlinks ({currentClue.linkedFrom.length})
            </p>
            <div className="space-y-1">
              {currentClue.linkedFrom.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No backlinks</p>
              ) : (
                currentClue.linkedFrom.map(id => {
                  const linked = getClueById(id);
                  return linked ? (
                    <button
                      key={id}
                      onClick={() => navigateForward(id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 bg-black/30 rounded border border-amber-900/20 hover:border-amber-600/50 transition-colors text-left"
                      data-testid={`backlink-${id}`}
                    >
                      <Link2 className="w-3 h-3 text-teal-500" />
                      <span className="text-xs text-muted-foreground truncate">{linked.name}</span>
                    </button>
                  ) : null;
                })
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              Forward Links ({currentClue.linkedTo.length}) <ArrowRight className="w-3 h-3" />
            </p>
            <div className="space-y-1">
              {currentClue.linkedTo.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No forward links</p>
              ) : (
                currentClue.linkedTo.map(id => {
                  const linked = getClueById(id);
                  return linked ? (
                    <button
                      key={id}
                      onClick={() => navigateForward(id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 bg-black/30 rounded border border-amber-900/20 hover:border-amber-600/50 transition-colors text-left"
                      data-testid={`forwardlink-${id}`}
                    >
                      <Link2 className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-muted-foreground truncate">{linked.name}</span>
                    </button>
                  ) : null;
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
