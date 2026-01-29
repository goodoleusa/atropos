import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  FileText, 
  Trophy, 
  MessageSquare, 
  MapPin, 
  Sparkles,
  Filter,
  ChevronDown,
  Hash,
  Clock,
  Star,
  Zap
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

export type ContentType = 'clue' | 'quest' | 'message' | 'location' | 'route' | 'mystical';

export interface SearchableItem {
  id: string;
  name: string;
  type: ContentType;
  description?: string;
  content?: string;
  location?: string;
  tags?: string[];
  rarity?: string;
  category?: string;
  matchScore?: number;
}

interface ContentSearchProps {
  items: SearchableItem[];
  onSelect: (item: SearchableItem) => void;
  onFilter?: (filtered: SearchableItem[]) => void;
  placeholder?: string;
  showFilters?: boolean;
  autoFocus?: boolean;
  maxResults?: number;
}

const typeConfig: Record<ContentType, { icon: typeof FileText; color: string; label: string }> = {
  clue: { icon: FileText, color: 'text-amber-500', label: 'Clues' },
  quest: { icon: Trophy, color: 'text-purple-500', label: 'Quests' },
  message: { icon: MessageSquare, color: 'text-teal-500', label: 'Messages' },
  location: { icon: MapPin, color: 'text-blue-500', label: 'Locations' },
  route: { icon: Hash, color: 'text-orange-500', label: 'Routes' },
  mystical: { icon: Sparkles, color: 'text-pink-500', label: 'Mystical' }
};

export function ContentSearch({
  items,
  onSelect,
  onFilter,
  placeholder = "Search everything...",
  showFilters = true,
  autoFocus = false,
  maxResults = 20
}: ContentSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTypes, setActiveTypes] = useState<Set<ContentType>>(() => new Set<ContentType>(['clue', 'quest', 'message', 'location', 'route', 'mystical']));
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recent_searches') || '[]');
    } catch { return []; }
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const fuzzyMatch = useCallback((text: string, search: string): number => {
    if (!text || !search) return 0;
    const lowerText = text.toLowerCase();
    const lowerSearch = search.toLowerCase();
    
    if (lowerText === lowerSearch) return 100;
    if (lowerText.startsWith(lowerSearch)) return 90;
    if (lowerText.includes(lowerSearch)) return 70;
    
    let score = 0;
    let searchIdx = 0;
    for (let i = 0; i < lowerText.length && searchIdx < lowerSearch.length; i++) {
      if (lowerText[i] === lowerSearch[searchIdx]) {
        score += 10;
        searchIdx++;
      }
    }
    return searchIdx === lowerSearch.length ? score : 0;
  }, []);

  const filteredItems = useMemo(() => {
    let results = items.filter(item => activeTypes.has(item.type));

    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(/\s+/);
      
      results = results.map(item => {
        let totalScore = 0;
        
        searchTerms.forEach(term => {
          totalScore += fuzzyMatch(item.name, term) * 2;
          totalScore += fuzzyMatch(item.id, term) * 1.5;
          totalScore += fuzzyMatch(item.description || '', term);
          totalScore += fuzzyMatch(item.content || '', term) * 0.5;
          totalScore += fuzzyMatch(item.location || '', term) * 0.8;
          
          if (item.tags?.some(t => t.toLowerCase().includes(term))) {
            totalScore += 50;
          }
        });

        return { ...item, matchScore: totalScore };
      })
      .filter(item => (item.matchScore || 0) > 0)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return results.slice(0, maxResults);
  }, [items, query, activeTypes, fuzzyMatch, maxResults]);

  useEffect(() => {
    if (onFilter) {
      onFilter(filteredItems);
    }
  }, [filteredItems, onFilter]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      handleSelect(filteredItems[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (item: SearchableItem) => {
    onSelect(item);
    setIsOpen(false);
    
    if (query.trim() && !recentSearches.includes(query.trim())) {
      const updated = [query.trim(), ...recentSearches].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    }
  };

  const toggleType = (type: ContentType) => {
    const newTypes = new Set(activeTypes);
    if (newTypes.has(type)) {
      if (newTypes.size > 1) newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setActiveTypes(newTypes);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim() || !text) return text;
    
    const regex = new RegExp(`(${query.split(/\s+/).join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) 
        ? <mark key={i} className="bg-amber-500/30 text-amber-300 px-0.5 rounded">{part}</mark>
        : part
    );
  };

  const TypeIcon = ({ type }: { type: ContentType }) => {
    const config = typeConfig[type];
    const Icon = config.icon;
    return <Icon className={`w-4 h-4 ${config.color}`} />;
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="pl-10 pr-10 bg-black/50 border-amber-900/30 text-stone-300 placeholder:text-stone-600 focus:border-amber-600/50"
            data-testid="content-search-input"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="border-amber-900/30 text-amber-600 hover:bg-amber-900/20"
                data-testid="filter-dropdown"
              >
                <Filter className="w-4 h-4 mr-2" />
                {activeTypes.size === 6 ? 'All' : activeTypes.size}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0a0500] border-amber-900/30" align="end">
              <DropdownMenuLabel className="text-amber-600 text-xs">Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-amber-900/30" />
              {(Object.keys(typeConfig) as ContentType[]).map(type => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={activeTypes.has(type)}
                  onCheckedChange={() => toggleType(type)}
                  className="text-stone-400 focus:bg-amber-900/20 focus:text-amber-500"
                >
                  <TypeIcon type={type} />
                  <span className="ml-2">{typeConfig[type].label}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (query || recentSearches.length > 0) && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-[#0a0500] border border-amber-900/30 rounded-lg shadow-xl overflow-hidden"
          >
            <ScrollArea className="max-h-[400px]">
              {!query && recentSearches.length > 0 && (
                <div className="p-2 border-b border-amber-900/20">
                  <p className="text-[10px] text-stone-600 uppercase font-bold mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Recent Searches
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {recentSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(search)}
                        className="px-2 py-1 text-xs bg-amber-900/20 text-amber-500 rounded hover:bg-amber-900/40 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query && filteredItems.length === 0 && (
                <div className="p-8 text-center">
                  <Search className="w-8 h-8 text-stone-700 mx-auto mb-2" />
                  <p className="text-stone-500 text-sm">No results found for "{query}"</p>
                  <p className="text-stone-700 text-xs mt-1">Try different keywords or filters</p>
                </div>
              )}

              {filteredItems.length > 0 && (
                <div className="py-1">
                  {filteredItems.map((item, index) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-start gap-3 px-3 py-2 text-left transition-colors ${
                        index === selectedIndex 
                          ? 'bg-amber-900/30' 
                          : 'hover:bg-amber-900/10'
                      }`}
                      data-testid={`search-result-${item.id}`}
                    >
                      <div className="mt-0.5">
                        <TypeIcon type={item.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-amber-500 font-bold truncate">
                            {highlightMatch(item.name, query)}
                          </span>
                          {item.rarity && (
                            <Badge 
                              variant="outline" 
                              className={`text-[9px] py-0 ${
                                item.rarity === 'legendary' ? 'border-purple-500 text-purple-400' :
                                item.rarity === 'rare' ? 'border-blue-500 text-blue-400' :
                                item.rarity === 'uncommon' ? 'border-teal-500 text-teal-400' :
                                'border-stone-700 text-stone-500'
                              }`}
                            >
                              {item.rarity}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 truncate">
                          {highlightMatch(item.description || item.content || '', query)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-stone-700">{item.id}</span>
                          {item.location && (
                            <span className="text-[10px] text-stone-600 flex items-center gap-1">
                              <MapPin className="w-2 h-2" /> {item.location}
                            </span>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1">
                              {item.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[9px] bg-amber-900/20 text-amber-700 px-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {item.matchScore && query && (
                        <div className="text-[9px] text-stone-700">
                          {Math.round(item.matchScore)}%
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="px-3 py-2 border-t border-amber-900/20 flex items-center justify-between text-[10px] text-stone-600">
              <div className="flex items-center gap-3">
                <span><kbd className="px-1 py-0.5 bg-amber-900/30 rounded">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1 py-0.5 bg-amber-900/30 rounded">Enter</kbd> Select</span>
                <span><kbd className="px-1 py-0.5 bg-amber-900/30 rounded">Esc</kbd> Close</span>
              </div>
              <span>{filteredItems.length} results</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
