import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card as UICard, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/Badge';
import { User, CollectionCard } from '../types';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { DraggableCard } from '../components/dnd/DraggableCard';

interface TradeBinPageProps {
  currentUser: User | null;
  collection: CollectionCard[];
  updateCardTradeStatus: (cardId: string, forTrade: boolean) => void;
}

export function TradeBinPage({ currentUser, collection, updateCardTradeStatus }: TradeBinPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<{
    type: string;
    rarity: string;
    condition: string;
    set: string;
  }>({
    type: '',
    rarity: '',
    condition: '',
    set: '',
  });

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const types = new Set<string>();
    const rarities = new Set<string>();
    const conditions = new Set<string>();
    const sets = new Set<string>();

    collection.forEach(card => {
      card.types?.forEach(type => types.add(type));
      if (card.rarity) rarities.add(card.rarity);
      if (card.condition) conditions.add(card.condition);
      if (card.set.name) sets.add(card.set.name);
    });

    return {
      types: Array.from(types).sort(),
      rarities: Array.from(rarities).sort(),
      conditions: Array.from(conditions).sort(),
      sets: Array.from(sets).sort(),
    };
  }, [collection]);

  // Filter tradable cards
  const tradableCards = useMemo(() => {
    return collection.filter(card => {
      if (!card.forTrade) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!card.name.toLowerCase().includes(query) &&
            !card.set.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      if (advancedFilters.type && !card.types?.includes(advancedFilters.type)) return false;
      if (advancedFilters.rarity && card.rarity !== advancedFilters.rarity) return false;
      if (advancedFilters.condition && card.condition !== advancedFilters.condition) return false;
      if (advancedFilters.set && card.set.name !== advancedFilters.set) return false;

      return true;
    });
  }, [collection, searchQuery, advancedFilters]);

  const handleToggleTradeStatus = (card: CollectionCard) => {
    updateCardTradeStatus(card.id, !card.forTrade);
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/trades')} className="text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trades
        </Button>
        <h1 className="text-2xl font-bold">Your Trade Bin</h1>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by card name or set..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 border rounded-lg bg-card shadow">
            <Select value={advancedFilters.type} onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger><SelectValue placeholder="Filter by Type..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {filterOptions.types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={advancedFilters.rarity} onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, rarity: value }))}>
              <SelectTrigger><SelectValue placeholder="Filter by Rarity..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Rarities</SelectItem>
                {filterOptions.rarities.map(rarity => (
                  <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={advancedFilters.condition} onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, condition: value }))}>
              <SelectTrigger><SelectValue placeholder="Filter by Condition..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Conditions</SelectItem>
                {filterOptions.conditions.map(condition => (
                  <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={advancedFilters.set} onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, set: value }))}>
              <SelectTrigger><SelectValue placeholder="Filter by Set..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sets</SelectItem>
                {filterOptions.sets.map(set => (
                  <SelectItem key={set} value={set}>{set}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="ghost" 
              onClick={() => setAdvancedFilters({ type: '', rarity: '', condition: '', set: '' })}
              className="text-sm"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <UICard>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Cards Available for Trade ({tradableCards.length})</span>
            <Button variant="outline" onClick={() => navigate('/collection')}>
              Manage Collection
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tradableCards.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {tradableCards.map(card => (
                <div key={card.id} className="relative group">
                  <DraggableCard
                    id={card.id}
                    card={card}
                    onToggleSelection={() => handleToggleTradeStatus(card)}
                    isInOfferArea={false}
                  />
                  <Badge 
                    variant="secondary"
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                  >
                    {card.condition}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No cards marked for trade.</p>
              <Button className="mt-4" onClick={() => navigate('/collection')}>
                Go to Collection
              </Button>
            </div>
          )}
        </CardContent>
      </UICard>
    </div>
  );
} 