import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MessageCircle, Star, Package } from 'lucide-react';
import { TradeListing as TradeListingType, User, CollectionCard } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

interface TradeListingProps {
  listing: TradeListingType;
  currentUser?: User | null;
}

export function TradeListing({ listing, currentUser }: TradeListingProps) {
  const navigate = useNavigate();

  // Ensure listing.cards exists and is an array
  const cards = listing.cards && Array.isArray(listing.cards) ? listing.cards : [];
  const firstCard = cards.length > 0 ? cards[0] : null;

  const handleMakeOfferClick = () => {
    if (currentUser) {
      if (listing.userId === currentUser.id) {
        alert("You cannot make an offer on your own listing.");
        return;
      }
      navigate(`/trades/${listing.id}/offer`);
    } else {
      navigate('/login');
    }
  };
  
  const canMakeOffer = currentUser && listing.userId !== currentUser.id;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <img
              src={listing.userAvatar}
              alt={listing.username}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <h4 className="text-sm font-medium">{listing.username}</h4>
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-accent-500 text-accent-500 mr-1" />
                <span className="text-xs text-muted-foreground">{listing.userReputation}</span>
              </div>
            </div>
          </div>
          <Badge
            variant={
              listing.status === 'Active'
                ? 'success'
                : listing.status === 'Pending'
                ? 'warning'
                : 'primary'
            }
          >
            {listing.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3 flex-grow">
        {firstCard ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <img
              src={firstCard.images.small}
              alt={firstCard.name}
              className="w-full sm:w-28 rounded-md object-contain aspect-[2.5/3.5] self-start"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-base leading-tight">
                {cards.length > 1 ? `Bundle: ${firstCard.name} + ${cards.length - 1} more` : firstCard.name}
              </h3>
              {cards.length === 1 && (
                <p className="text-sm text-muted-foreground">
                  {firstCard.set.name} · #{firstCard.number} / {firstCard.set.printedTotal}
                </p>
              )}
              {cards.length > 1 && (
                 <p className="text-xs text-muted-foreground">({cards.length} cards total)</p>
              )}
              <div className="mt-1 space-x-1">
                {cards.slice(0,3).map(card => (
                    <Badge key={card.id} variant="secondary" className="text-xs">{card.condition}</Badge>
                ))}
                {cards.length > 3 && <Badge variant="outline">+ more</Badge>}
              </div>

              {firstCard.rarity && (
                <Badge variant="outline" className="capitalize mt-1 text-xs">{firstCard.rarity}</Badge>
              )}

              <div className="mt-2 space-y-1">
                {listing.askingPrice && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Asking:</span>{' '}
                    <span className="font-medium">{formatCurrency(listing.askingPrice)}</span>
                    {cards.length > 1 && <span className="text-xs text-muted-foreground"> (for bundle)</span>}
                  </p>
                )}
                {listing.wishlist && listing.wishlist.length > 0 && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Looking for:</span>{' '}
                    <span className="line-clamp-2">{listing.wishlist.join(', ')}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No card details available for this listing.</p>
        )}
        {listing.description && (
          <p className="mt-3 text-sm border-t border-border pt-2 line-clamp-3">{listing.description}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleMakeOfferClick} 
          disabled={!canMakeOffer && !currentUser}
        >
          {cards.length > 1 ? <Package className="mr-2 h-4 w-4" /> : <MessageCircle className="mr-2 h-4 w-4" />}
          {currentUser ? (canMakeOffer ? (cards.length > 1 ? 'Make Offer on Bundle' : 'Make Offer') : 'Your Listing') : 'Login to Make Offer'}
        </Button>
      </CardFooter>
    </Card>
  );
}