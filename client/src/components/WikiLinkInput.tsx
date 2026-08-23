import { useState, useRef, useEffect, useCallback } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Link2, FileText, MapPin, Sparkles } from 'lucide-react';

interface WikiLinkInputProps {
  value: string;
  onChange: (value: string) => void;
  availableLinks: Array<{
    id: string;
    name: string;
    type: 'clue' | 'quest' | 'location' | 'route';
  }>;
  placeholder?: string;
  className?: string;
}

export function WikiLinkInput({ 
  value, 
  onChange, 
  availableLinks, 
  placeholder = "Type [[ to link...",
  className = ""
}: WikiLinkInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkStart, setLinkStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'clue': return <FileText className="w-3 h-3 text-amber-500" />;
      case 'quest': return <Sparkles className="w-3 h-3 text-purple-500" />;
      case 'location': return <MapPin className="w-3 h-3 text-teal-500" />;
      case 'route': return <Link2 className="w-3 h-3 text-blue-500" />;
      default: return <FileText className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const pos = e.target.selectionStart || 0;
    onChange(newValue);
    setCursorPosition(pos);

    const textBeforeCursor = newValue.slice(0, pos);
    const linkMatch = textBeforeCursor.match(/\[\[([^\]]*?)$/);

    if (linkMatch) {
      setShowSuggestions(true);
      setSearchQuery(linkMatch[1].toLowerCase());
      setLinkStart(pos - linkMatch[1].length - 2);

      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        setPopoverPosition({ x: rect.left, y: rect.bottom });
      }
    } else {
      setShowSuggestions(false);
      setSearchQuery('');
      setLinkStart(-1);
    }
  }, [onChange]);

  const insertLink = useCallback((link: { id: string; name: string }) => {
    if (linkStart === -1) return;

    const before = value.slice(0, linkStart);
    const after = value.slice(cursorPosition);
    const newValue = `${before}[[${link.id}|${link.name}]]${after}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    setSearchQuery('');
    setLinkStart(-1);

    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = linkStart + link.id.length + link.name.length + 5;
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.focus();
      }
    }, 0);
  }, [value, linkStart, cursorPosition, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const filteredLinks = availableLinks.filter(link => 
    link.id.toLowerCase().includes(searchQuery) || 
    link.name.toLowerCase().includes(searchQuery)
  );

  const renderFormattedText = () => {
    const parts = value.split(/(\[\[[^\]]+\]\])/g);
    return parts.map((part, i) => {
      const linkMatch = part.match(/\[\[([^|]+)(?:\|([^\]]+))?\]\]/);
      if (linkMatch) {
        const [, id, displayName] = linkMatch;
        return (
          <span key={i} className="bg-amber-900/30 text-amber-400 px-1 rounded border border-amber-700/50">
            {displayName || id}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
        <PopoverAnchor asChild>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full min-h-[120px] bg-black/50 border border-amber-900/30 rounded-lg p-3 text-foreground text-sm font-mono focus:border-amber-600/50 focus:outline-none resize-y"
            data-testid="wikilink-input"
          />
        </PopoverAnchor>
        <PopoverContent 
          className="w-64 p-0 bg-[hsl(var(--card))] border border-amber-900/50" 
          align="start"
          sideOffset={5}
        >
          <Command className="bg-transparent">
            <CommandList>
              <CommandEmpty className="py-3 text-center text-muted-foreground text-xs">
                No matching links found
              </CommandEmpty>
              <CommandGroup heading="Available Links" className="text-amber-600 text-[10px]">
                {filteredLinks.slice(0, 8).map((link) => (
                  <CommandItem
                    key={link.id}
                    value={link.id}
                    onSelect={() => insertLink(link)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-amber-900/20 py-2"
                    data-testid={`link-suggestion-${link.id}`}
                  >
                    {getIconForType(link.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-amber-500 text-xs font-bold truncate">{link.name}</p>
                      <p className="text-muted-foreground text-[10px] truncate">{link.id}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground uppercase">{link.type}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-2">
        <span className="bg-amber-900/20 px-1.5 py-0.5 rounded">[[</span>
        <span>to link</span>
        <span className="text-muted-foreground">|</span>
        <span className="bg-amber-900/20 px-1.5 py-0.5 rounded">Tab</span>
        <span>to select</span>
      </div>
    </div>
  );
}

export function parseWikiLinks(text: string): Array<{ id: string; displayName: string; start: number; end: number }> {
  const links: Array<{ id: string; displayName: string; start: number; end: number }> = [];
  const regex = /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    links.push({
      id: match[1],
      displayName: match[2] || match[1],
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  return links;
}

export function extractLinkIds(text: string): string[] {
  return parseWikiLinks(text).map(link => link.id);
}
