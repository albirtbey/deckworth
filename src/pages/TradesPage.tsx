import React, { useState, useMemo } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TradeListing as TradeListingCard } from '../components/cards/TradeListing';
import { Badge } from '../components/ui/Badge';
import { TradeListing, User, CardCondition, CollectionCard } from '../types';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { DraggableCard } from '../components/dnd/DraggableCard';
import { Card as UICard, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const cardConditions: CardCondition[] = ["Mint", "Near Mint", "Excellent", "Good", "Played", "Poor"];

interface TradesPageProps {
  tradeListings: TradeListing[];
  currentUser: User | null;
  collection: CollectionCard[];
  updateCardTradeStatus: (cardId: string, forTrade: boolean) => void;
}

export function TradesPage({ tradeListings, currentUser, collection, updateCardTradeStatus }: TradesPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<{ type: string; rarity: string; condition: string }>(
    { type: '', rarity: '', condition: '' }
  );
  const [activeTab, setActiveTab] = useState("marketplace");

  // Get unique values for filters from both listings and collection
  const filterOptions = useMemo(() => {
    const types = new Set<string>();
    const rarities = new Set<string>();
    const conditions = new Set<string>();
    const sets = new Set<string>();

    // Add types from listings
    tradeListings.forEach(listing => {
      if (listing.cards && Array.isArray(listing.cards)) {
        listing.cards.forEach(card => 
          card.types?.forEach(type => types.add(type))
        );
      }
    });

    // Add types from collection
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
  }, [tradeListings, collection]);

  // Filter tradable cards from collection
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

      return true;
    });
  }, [collection, searchQuery, advancedFilters]);

  // Filter listings
  const filteredListings = useMemo(() => {
    return tradeListings.filter((listing) => {
      if (!listing || !listing.cards || !Array.isArray(listing.cards) || listing.cards.length === 0) {
        if (searchQuery && !listing.username.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (advancedFilters.type || advancedFilters.rarity || advancedFilters.condition) return false;
      }

      if (statusFilter !== 'all' && listing.status.toLowerCase() !== statusFilter) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        let matchesSearch = listing.username.toLowerCase().includes(query);
        if (!matchesSearch && listing.cards && listing.cards.length > 0) {
            matchesSearch = listing.cards.some(card => 
              card.name.toLowerCase().includes(query) || 
              card.set.name.toLowerCase().includes(query)
            );
        }
        if (!matchesSearch) return false;
      }

      if (listing.cards && listing.cards.length > 0) {
        if (advancedFilters.type && !listing.cards.some(card => card.types?.includes(advancedFilters.type))) {
          return false;
        }
        if (advancedFilters.rarity && !listing.cards.some(card => card.rarity === advancedFilters.rarity)) {
          return false;
        }
        if (advancedFilters.condition && !listing.cards.some(card => card.condition === advancedFilters.condition)) {
          return false;
        }
      } else {
        if (advancedFilters.type || advancedFilters.rarity || advancedFilters.condition) {
            return false;
        }
      }
      return true;
    });
  }, [tradeListings, statusFilter, searchQuery, advancedFilters]);

  const handleAdvancedFilterChange = (filterName: keyof typeof advancedFilters, value: string) => {
    setAdvancedFilters(prev => ({ ...prev, [filterName]: value === 'ALL' ? '' : value }));
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({ type: '', rarity: '', condition: '' });
  };

  const handleCreateListingClick = () => {
    if (currentUser) {
      navigate('/trades/create');
    } else {
      navigate('/login');
    }
  };

  const handleToggleTradeStatus = (card: CollectionCard) => {
    updateCardTradeStatus(card.id, !card.forTrade);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Trade Center</h1>
          <p className="text-muted-foreground mt-1">
            Find trades, manage your trade bin, and connect with other collectors
          </p>
        </div>
        <Button onClick={handleCreateListingClick}>
          <Plus className="mr-2 h-4 w-4" />
          Create Listing
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="trade-bin">Trade Bin ({tradableCards.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="mt-4">
          {/* Status Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Badge
              variant={statusFilter === 'all' ? 'primary' : 'outline'}
              className={`cursor-pointer px-3 py-1 ${
                statusFilter === 'all' ? '' : 'bg-background hover:bg-muted'
              }`}
              onClick={() => setStatusFilter('all')}
            >
              All Listings
            </Badge>
            <Badge
              variant={statusFilter === 'active' ? 'success' : 'outline'}
              className={`cursor-pointer px-3 py-1 ${
                statusFilter === 'active' ? '' : 'bg-background hover:bg-muted'
              }`}
              onClick={() => setStatusFilter('active')}
            >
              Active
            </Badge>
            <Badge
              variant={statusFilter === 'pending' ? 'warning' : 'outline'}
              className={`cursor-pointer px-3 py-1 ${
                statusFilter === 'pending' ? '' : 'bg-background hover:bg-muted'
              }`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </Badge>
            <Badge
              variant={statusFilter === 'completed' ? 'secondary' : 'outline'}
              className={`cursor-pointer px-3 py-1 ${
                statusFilter === 'completed' ? '' : 'bg-background hover:bg-muted'
              }`}
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </Badge>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by card name, set, or trader..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
              </Button>
            </div>

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 border rounded-lg bg-card shadow">
                <Select value={advancedFilters.type} onValueChange={(value) => handleAdvancedFilterChange('type', value)}>
                  <SelectTrigger><SelectValue placeholder="Filter by Type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    {filterOptions.types.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                <Select value={advancedFilters.rarity} onValueChange={(value) => handleAdvancedFilterChange('rarity', value)}>
                  <SelectTrigger><SelectValue placeholder="Filter by Rarity..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Rarities</SelectItem>
                    {filterOptions.rarities.map(rarity => <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={advancedFilters.condition} onValueChange={(value) => handleAdvancedFilterChange('condition', value)}>
                  <SelectTrigger><SelectValue placeholder="Filter by Condition..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Conditions</SelectItem>
                    {cardConditions.map(cond => <SelectItem key={cond} value={cond}>{cond}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                <Button variant="ghost" onClick={clearAdvancedFilters} className="text-sm">
                  Clear Advanced Filters
                </Button>
              </div>
            )}
          </div>

          {/* Trade Listings */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <TradeListingCard key={listing.id} listing={listing} currentUser={currentUser} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No trades found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search or filters, or create a new listing.
              </p>
              <Button className="mt-4" onClick={handleCreateListingClick}>
                <Plus className="mr-2 h-4 w-4" />
                Create Listing
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trade-bin" className="mt-4">
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
                <Select value={advancedFilters.type} onValueChange={(value) => handleAdvancedFilterChange('type', value)}>
                  <SelectTrigger><SelectValue placeholder="Filter by Type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    {filterOptions.types.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={advancedFilters.rarity} onValueChange={(value) => handleAdvancedFilterChange('rarity', value)}>
                  <SelectTrigger><SelectValue placeholder="Filter by Rarity..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Rarities</SelectItem>
                    {filterOptions.rarities.map(rarity => <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={advancedFilters.condition} onValueChange={(value) => handleAdvancedFilterChange('condition', value)}>
                  <SelectTrigger><SelectValue placeholder="Filter by Condition..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Conditions</SelectItem>
                    {cardConditions.map(condition => <SelectItem key={condition} value={condition}>{condition}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Button variant="ghost" onClick={clearAdvancedFilters} className="text-sm">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}