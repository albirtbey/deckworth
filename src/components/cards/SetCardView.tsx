import React from 'react';
import { Link } from 'react-router-dom';
import { Card as UICard, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check } from 'lucide-react';
import { ApiCard, User } from '../../types/index';
import { formatCurrency, getMarketPrice } from '../../lib/utils';
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

interface SetCardViewProps {
  card: ApiCard;
  currentUser: User | null;
  isOwned: boolean;
  onAddToCollection: (card: ApiCard) => void;
}

const getRarityIcon = (rarity: string) => {
  const iconClass = 'w-4 h-4';
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

export function SetCardView({ card, isOwned, onAddToCollection }: Omit<SetCardViewProps, 'currentUser'>) {
  const marketPrice = getMarketPrice(card.tcgplayer?.prices);

  return (
    <UICard className="overflow-hidden group transition-all duration-300 hover:-translate-y-1 flex flex-col h-full relative">
      {/* Action buttons */}
      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between gap-2">
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "w-8 h-8 rounded-full transition-all",
            "bg-background/80 hover:bg-background shadow-md",
            "border-2",
            isOwned ? "border-primary" : "border-muted-foreground"
          )}
          onClick={(e) => {
            e.preventDefault(); // Prevent Link navigation
            if (!isOwned) onAddToCollection(card);
          }}
        >
          <Check className={cn(
            "w-4 h-4 transition-all",
            isOwned ? "text-primary" : "text-muted-foreground"
          )} />
        </Button>
      </div>

      <Link to={`/card/${card.id}`} className="flex flex-col flex-grow">
        <div className="relative w-full aspect-[2.5/3.5] bg-muted">
          <img 
            src={card.images.small}
            alt={card.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <CardContent className="p-3 flex-grow flex flex-col">
          <h4 className="font-semibold truncate text-base leading-tight" title={card.name}>
            {card.name}
          </h4>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">#{card.number}</span>
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
