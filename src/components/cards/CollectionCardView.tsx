import React from 'react';
import { Link } from 'react-router-dom';
import { Card as UICard, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CollectionCard } from '../../types/index';
import { formatCurrency, getMarketPrice } from '../../lib/utils';
import { 
  Tag, 
  Repeat, 
  Check
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';
import {
  CommonIcon,
  UncommonIcon,
  RareIcon,
  DoubleRareIcon,
  UltraRareIcon,
  IllustrationRareIcon,
  SpecialIllustrationRareIcon,
  HyperRareIcon,
  SecretRareIcon
} from '../icons/RarityIcons';

interface CollectionCardViewProps {
  card: CollectionCard;
  onToggleCollection?: (cardId: string) => void;
}

// Helper function to get condition variant
const getConditionVariant = (condition: string): "primary" | "secondary" | "success" | "warning" | "error" => {
  switch (condition) {
    case 'Near Mint':
      return 'success';
    case 'Lightly Played':
      return 'primary';
    case 'Moderately Played':
      return 'secondary';
    case 'Heavily Played':
      return 'warning';
    case 'Damaged':
      return 'error';
    default:
      return 'secondary';
  }
};

// Helper function to get rarity icon
const getRarityIcon = (rarity: string) => {
  const iconClass = "w-4 h-4"; // Increased size
  switch (rarity?.toLowerCase()) {
    case 'common':
      return <CommonIcon className={iconClass} />;
    case 'uncommon':
      return <UncommonIcon className={iconClass} />;
    case 'rare':
    case 'rare holo':
    case 'holo rare':
      return <RareIcon className={iconClass} />;
    case 'double rare':
    case 'rare ultra':
      return <DoubleRareIcon className={iconClass} />;
    case 'ultra rare':
      return <UltraRareIcon className={iconClass} />;
    case 'illustration rare':
      return <IllustrationRareIcon className={iconClass} />;
    case 'special illustration rare':
      return <SpecialIllustrationRareIcon className={iconClass} />;
    case 'hyper rare':
      return <HyperRareIcon className={iconClass} />;
    case 'secret rare':
      return <SecretRareIcon className={iconClass} />;
    default:
      return <RareIcon className={iconClass} />;
  }
};

// Helper function to get abbreviated rarity text
const getAbbreviatedRarity = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'common':
      return 'C';
    case 'uncommon':
      return 'U';
    case 'rare':
    case 'holo rare':
      return 'R';
    case 'illustration rare':
      return 'IR';
    case 'special illustration rare':
      return 'SIR';
    case 'hyper rare':
      return 'HR';
    case 'double rare':
      return 'DR';
    case 'ultra rare':
      return 'UR';
    case 'secret rare':
      return 'SR';
    default:
      return rarity;
  }
};

export function CollectionCardView({ 
  card, 
  onToggleCollection
}: CollectionCardViewProps) {
  const marketPrice = getMarketPrice(card.tcgplayer?.prices);

  return (
    <UICard className="overflow-hidden group transition-all duration-300 hover:-translate-y-1 flex flex-col h-full relative">
      {/* Action buttons */}
      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between gap-2">
        {onToggleCollection && (
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "w-8 h-8 rounded-full transition-all",
              "bg-background/80 hover:bg-background shadow-md",
              "border-2",
              card.quantity > 0 ? "border-primary" : "border-muted-foreground"
            )}
            onClick={(e) => {
              e.preventDefault(); // Prevent Link navigation
              onToggleCollection(card.id);
            }}
          >
            <Check className={cn(
              "w-4 h-4 transition-all",
              card.quantity > 0 ? "text-primary" : "text-muted-foreground"
            )} />
          </Button>
        )}
      </div>

      <Link to={`/card/${card.id}`} className="flex flex-col flex-grow">
        <div className="relative w-full aspect-[2.5/3.5] bg-muted">
          <img 
            src={card.images.small}
            alt={card.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              <Repeat className="w-3 h-3 mr-1" />
              {card.quantity}
            </Badge>
          </div>
          {card.forTrade && (
            <Badge 
              variant="success" 
              className="absolute bottom-2 right-2 text-xs px-1.5 py-0.5"
            >
              <Tag className="w-3 h-3 mr-1" />
              For Trade
            </Badge>
          )}
        </div>
        <CardContent className="p-3 flex-grow flex flex-col">
          <h4 className="font-semibold truncate text-base leading-tight" title={card.name}>
            {card.name}
          </h4>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">#{card.number}</span>
            <Badge variant={getConditionVariant(card.condition)} className="capitalize text-xs px-1.5 py-0.5">
              {card.condition}
            </Badge>
          </div>
          <div className="mt-auto pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {marketPrice !== null ? (
                <p className="text-sm font-medium">
                  {formatCurrency(marketPrice)}
                </p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">
                  Price N/A
                </p>
              )}
            </div>
            {card.rarity && (
              <div className="flex items-center gap-1.5 text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                {getRarityIcon(card.rarity)}
                <span className="text-xs font-medium">{getAbbreviatedRarity(card.rarity)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </UICard>
  );
}