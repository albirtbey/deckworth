import React from 'react';
import { Link } from 'react-router-dom';
import { Card as UICard, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/button';
import { Check } from 'lucide-react';
import { ApiCard, User, CollectionCard } from '../../types';
import { formatCurrency, getMarketPrice } from '../../lib/utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PokemonCardProps {
  card: ApiCard;
  currentUser: User | null;
  collection: CollectionCard[];
  addToCollection: (card: ApiCard, quantity: number) => void;
}

export function PokemonCard({ card, currentUser, collection, addToCollection }: PokemonCardProps) {
  const marketPrice = getMarketPrice(card.tcgplayer?.prices);
  const currentCollection = collection ?? [];
  const isOwned = currentCollection.some(cc => cc.id === card.id);

  const handleCollectClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    if (!currentUser) {
      toast.error('Please log in to collect cards.');
      return;
    }
    if (!isOwned) {
      addToCollection(card, 1);
      toast.success(`${card.name} added to your collection!`);
    }
  };

  return (
    <UICard className="overflow-hidden group transition-all duration-300 hover:-translate-y-1 flex flex-col h-full relative">
      {/* Collect button */}
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "absolute top-2 left-2 z-10 w-8 h-8 rounded-full transition-all",
          "bg-background/80 hover:bg-background shadow-md",
          "border-2",
          isOwned ? "border-primary" : "border-muted-foreground"
        )}
        onClick={handleCollectClick}
      >
        <Check className={cn(
          "w-4 h-4 transition-all",
          isOwned ? "text-primary" : "text-muted-foreground"
        )} />
      </Button>

      <Link to={`/card/${card.id}`} className="flex flex-col flex-grow">
        <div className="relative w-full aspect-[2.5/3.5] bg-muted">
          <img 
            src={card.images.small}
            alt={card.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {card.rarity && (
              <Badge variant="primary" className="capitalize text-xs px-1.5 py-0.5">
                {card.rarity}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              #{card.number}
            </Badge>
          </div>
        </div>
        <CardContent className="p-3 flex-grow flex flex-col">
          <h4 className="font-semibold truncate text-base leading-tight" title={card.name}>
            {card.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {card.set.name}
          </p>
          {marketPrice !== null ? (
            <p className="text-sm font-medium mt-auto pt-2">
              {formatCurrency(marketPrice)}
            </p>
          ) : (
            <p className="text-sm font-medium mt-auto pt-2 text-muted-foreground">
              Price N/A
            </p>
          )}
        </CardContent>
      </Link>
    </UICard>
  );
}