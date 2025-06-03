import React, { useState, useMemo } from 'react';
import { CollectionCard, User, ApiCard } from '../types';
import { CollectionCardView } from '../components/cards/CollectionCardView';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { PlusCircle, LayoutGrid, List, Filter, Search, XCircle, Tag, Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/badge';

interface CollectionPageProps {
  collection: CollectionCard[];
  currentUser: User | null;
  updateCollectionCard?: (cardId: string, updates: Partial<CollectionCard>) => void;
  removeFromCollection?: (cardId: string) => void;
  wishlist: ApiCard[];
  updateWishlist?: (card: ApiCard) => void;
}

export function CollectionPage({ 
  collection, 
  currentUser,
  updateCollectionCard,
  removeFromCollection,
  wishlist,
  updateWishlist
}: CollectionPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState<{ type: string; rarity: string; set: string; forTrade: string }>({ type: '', rarity: '', set: '', forTrade: '' });

  const filteredAndSortedCollection = useMemo(() => {
    let items = [...collection];

    // Filter by search term (name and set name)
    if (searchTerm) {
      items = items.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        card.set.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.type && filters.type !== 'ALL_TYPES') items = items.filter(card => card.types?.includes(filters.type));
    if (filters.rarity && filters.rarity !== 'ALL_RARITIES') items = items.filter(card => card.rarity === filters.rarity);
    if (filters.set && filters.set !== 'ALL_SETS') items = items.filter(card => card.set.id === filters.set);
    if (filters.forTrade === 'yes') items = items.filter(card => card.forTrade);
    if (filters.forTrade === 'no') items = items.filter(card => !card.forTrade);

    // Sort
    items.sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'set-asc': return a.set.name.localeCompare(b.set.name) || a.number.localeCompare(b.number);
        case 'set-desc': return b.set.name.localeCompare(a.set.name) || b.number.localeCompare(a.number);
        case 'date-added-asc': return new Date(a.purchaseDate || 0).getTime() - new Date(b.purchaseDate || 0).getTime();
        case 'date-added-desc': return new Date(b.purchaseDate || 0).getTime() - new Date(a.purchaseDate || 0).getTime();
        case 'quantity-asc': return a.quantity - b.quantity;
        case 'quantity-desc': return b.quantity - a.quantity;
        default: return 0;
      }
    });
    return items;
  }, [collection, searchTerm, sortOrder, filters]);

  const uniqueTypes = useMemo(() => Array.from(new Set(collection.flatMap(c => c.types || []))).sort(), [collection]);
  const uniqueRarities = useMemo(() => Array.from(new Set(collection.map(c => c.rarity || 'N/A'))).sort(), [collection]);
  const uniqueSets = useMemo(() => {
    const setsMap = new Map<string, string>();
    collection.forEach(c => setsMap.set(c.set.id, c.set.name));
    return Array.from(setsMap.entries()).map(([id, name]) => ({ id, name })).sort((a,b) => a.name.localeCompare(b.name));
  }, [collection]);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ type: 'ALL_TYPES', rarity: 'ALL_RARITIES', set: 'ALL_SETS', forTrade: 'ANY_STATUS' });
    setSortOrder('name-asc');
  }

  const handleToggleCollection = (cardId: string) => {
    const card = collection.find(c => c.id === cardId);
    if (!card) return;

    if (card.quantity > 0 && removeFromCollection) {
      removeFromCollection(cardId);
    } else if (updateCollectionCard) {
      updateCollectionCard(cardId, { quantity: card.quantity + 1 });
    }
  };

  const handleToggleWishlist = (cardId: string) => {
    const card = collection.find(c => c.id === cardId);
    if (!card || !updateWishlist) return;
    updateWishlist(card);
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">Access Your Collection</h1>
        <p className="text-muted-foreground mb-6">Please log in to view and manage your Pokémon card collection.</p>
        <Button asChild>
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  if (collection.length === 0) {
  return (
      <div className="container mx-auto py-12 text-center">
        <PlusCircle className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-2xl font-semibold mb-2">Your Collection is Empty</h1>
        <p className="text-muted-foreground mb-6">Start adding cards to your collection from Sets or individual card pages.</p>
        <Button asChild>
          <Link to="/sets">Browse Sets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground">My Collection ({filteredAndSortedCollection.length} cards)</h1>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setViewMode('grid')} disabled={viewMode === 'grid'}><LayoutGrid className="w-5 h-5"/></Button>
            <Button variant="outline" onClick={() => setViewMode('list')} disabled={viewMode === 'list'}><List className="w-5 h-5"/></Button>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="mb-8 p-4 border rounded-lg bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="relative">
            <Input
              type="text" 
              placeholder="Search by name or set..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
          </div>
          
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger><SelectValue placeholder="Sort by..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="set-asc">Set (A-Z)</SelectItem>
              <SelectItem value="set-desc">Set (Z-A)</SelectItem>
              <SelectItem value="date-added-desc">Date Added (Newest)</SelectItem>
              <SelectItem value="date-added-asc">Date Added (Oldest)</SelectItem>
              <SelectItem value="quantity-desc">Quantity (High-Low)</SelectItem>
              <SelectItem value="quantity-asc">Quantity (Low-High)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
            <SelectTrigger><SelectValue placeholder="Filter by Type..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_TYPES">All Types</SelectItem>
              {uniqueTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.rarity} onValueChange={(value) => handleFilterChange('rarity', value)}>
            <SelectTrigger><SelectValue placeholder="Filter by Rarity..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_RARITIES">All Rarities</SelectItem>
              {uniqueRarities.map(rarity => <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.set} onValueChange={(value) => handleFilterChange('set', value)}>
            <SelectTrigger><SelectValue placeholder="Filter by Set..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_SETS">All Sets</SelectItem>
              {uniqueSets.map(set => <SelectItem key={set.id} value={set.id}>{set.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.forTrade} onValueChange={(value) => handleFilterChange('forTrade', value)}>
            <SelectTrigger><SelectValue placeholder="For Trade Status..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ANY_STATUS">Any Status</SelectItem>
              <SelectItem value="yes">Yes, For Trade</SelectItem>
              <SelectItem value="no">No, Not For Trade</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || filters.type || filters.rarity || filters.set || filters.forTrade) && 
            <Button variant="ghost" onClick={clearFilters} className="lg:col-start-4">
                <XCircle className="w-5 h-5 mr-2"/> Clear Filters
            </Button>}
        </div>
            </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAndSortedCollection.map((card) => (
            <CollectionCardView 
              key={card.id} 
              card={card} 
              currentUser={currentUser}
              onToggleCollection={handleToggleCollection}
              isInWishlist={wishlist.some(w => w.id === card.id)}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedCollection.map((card) => (
            <div key={card.id} className="flex items-center p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
              <img src={card.images.small} alt={card.name} className="w-16 h-auto mr-4 rounded"/>
              <div className="flex-grow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-md">{card.name}</h3>
                    <p className="text-sm text-muted-foreground">{card.set.name}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    {card.forTrade && (
                      <Badge variant="success" className="mb-1">
                        <Tag className="w-3 h-3 mr-1" />
                        For Trade
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      <Repeat className="w-3 h-3 mr-1" />
                      Qty: {card.quantity}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Condition: {card.condition}</p>
                  <p className="text-sm">Added: {new Date(card.purchaseDate || '').toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {filteredAndSortedCollection.length === 0 && (
         <p className="text-center text-muted-foreground py-10">No cards match your current filters.</p>
      )}
    </div>
  );
}