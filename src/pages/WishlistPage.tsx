import React, { useState } from 'react';
import { Search, SortDesc, Filter, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PokemonCard } from '../components/cards/PokemonCard';
import { ApiCard } from '../types';

interface WishlistPageProps {
  wishlist: ApiCard[];
  updateWishlist: (card: ApiCard) => void;
}

export function WishlistPage({ wishlist, updateWishlist }: WishlistPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter cards based on search query
  const filteredCards = wishlist.filter((card) =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (card.set && card.set.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground mt-1">
            Track cards you want to add to your collection
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add to Wishlist
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <SortDesc className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-4 border rounded-md bg-card">
            <div>
              <label className="block text-sm font-medium mb-1">Set</label>
              <select className="input">
                <option value="">All Sets</option>
                <option value="sv01">Scarlet & Violet</option>
                <option value="crz">Crown Zenith</option>
                <option value="sit">Silver Tempest</option>
                {/* Add more options */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rarity</label>
              <select className="input">
                <option value="">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="rareholoex">Rare Holo EX</option>
                <option value="ultrarare">Ultra Rare</option>
                <option value="secretrare">Secret Rare</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price Range</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="w-full"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select className="input">
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredCards.map((card) => (
            <PokemonCard key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Your wishlist is empty</h3>
          <p className="text-muted-foreground mt-1">
            Add cards to your wishlist to track what you're looking for.
          </p>
          <Button className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add to Wishlist
          </Button>
        </div>
      )}
    </div>
  );
}