import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/textarea';
import { Card as UICard, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { User, CollectionCard, TradeListing } from '../types';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { DroppableArea } from '../components/dnd/DroppableArea';
import { DraggableCard } from '../components/dnd/DraggableCard';

interface MakeOfferPageProps {
  currentUser: User | null;
  collection: CollectionCard[];
  tradeListings: TradeListing[];
  makeOffer: (tradeId: string, offeredCards: CollectionCard[], message: string) => void;
}

const DROPPABLE_GROUP_COLLECTION = 'userCollection';
const DROPPABLE_GROUP_OFFER = 'userOffer';

export function MakeOfferPage({ currentUser, collection, tradeListings, makeOffer }: MakeOfferPageProps) {
  const { tradeId } = useParams<{ tradeId: string }>();
  const navigate = useNavigate();
  const [selectedTrade, setSelectedTrade] = useState<TradeListing | null>(null);
  const [message, setMessage] = useState<string>('');

  // Cards available in user's collection for offering
  const [availableCollectionCards, setAvailableCollectionCards] = useState<CollectionCard[]>([]);
  // Cards currently in the "offer" area
  const [cardsInOffer, setCardsInOffer] = useState<CollectionCard[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null); // ID of the card being dragged
  const [activeCard, setActiveCard] = useState<CollectionCard | null>(null); // The card object being dragged

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (!currentUser) {
      toast.error("You must be logged in to make an offer.");
      navigate('/login');
      return;
    }
    if (tradeId) {
      const trade = tradeListings.find(t => t.id === tradeId);
      if (trade) {
        if (trade.userId === currentUser.id) {
          toast.error("You cannot make an offer on your own listing.");
          navigate('/trades');
          return;
        }
        setSelectedTrade(trade);
      } else {
        toast.error("Trade listing not found.");
        navigate('/trades');
      }
    }
  }, [currentUser, navigate, tradeId, tradeListings]);

  useEffect(() => {
    const pendingCardId = localStorage.getItem('cardPendingOffer');
    if (pendingCardId) {
      const cardFromCollection = collection.find(c => c.id === pendingCardId && c.quantity > 0);
      if (cardFromCollection && !cardsInOffer.some(oc => oc.id === cardFromCollection.id)) {
        // Add to offer if not already there
        setCardsInOffer(prev => [...prev, cardFromCollection]);
        // availableCollectionCards will be updated by the next useEffect due to cardsInOffer changing
        toast.success(`${cardFromCollection.name} automatically added to your offer.`);
      }
      localStorage.removeItem('cardPendingOffer');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]); // Only run when collection data is available

  useEffect(() => {
    // Initialize/update available cards, excluding any that are already in the offer
    setAvailableCollectionCards(collection.filter(c => c.quantity > 0 && !cardsInOffer.some(oc => oc.id === c.id))
                                        .sort((a,b) => a.name.localeCompare(b.name)) // Keep it sorted
    );
  }, [collection, cardsInOffer]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Ensure we get the card from the correct list when drag starts
    const cardFromCollection = availableCollectionCards.find(c => c.id === event.active.id);
    const cardFromOffer = cardsInOffer.find(c => c.id === event.active.id);
    const card = cardFromCollection || cardFromOffer;
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveCard(null);

    if (!over) return; // Dropped outside a droppable area

    const activeCardId = active.id as string;
    const overContainerId = over.id as string;

    const cardIsFromCollection = availableCollectionCards.some(c => c.id === activeCardId);
    const cardIsFromOffer = cardsInOffer.some(c => c.id === activeCardId);

    if (cardIsFromCollection && overContainerId === DROPPABLE_GROUP_OFFER) {
      // Move from Collection to Offer
      const cardToMove = availableCollectionCards.find(c => c.id === activeCardId);
      if (cardToMove) {
        setCardsInOffer(prev => [...prev, cardToMove]);
        setAvailableCollectionCards(prev => prev.filter(c => c.id !== activeCardId));
      }
    } else if (cardIsFromOffer && overContainerId === DROPPABLE_GROUP_COLLECTION) {
      // Move from Offer to Collection
      const cardToMove = cardsInOffer.find(c => c.id === activeCardId);
      if (cardToMove) {
        setAvailableCollectionCards(prev => [...prev, cardToMove]);
        setCardsInOffer(prev => prev.filter(c => c.id !== activeCardId));
      }
    } else if (cardIsFromCollection && overContainerId === DROPPABLE_GROUP_COLLECTION) {
      // Reordering within Collection (if needed, not primary for this page)
      setAvailableCollectionCards(prev => arrayMove(prev, prev.findIndex(c=>c.id === activeCardId), over.data.current?.sortable?.index ?? 0));
    } else if (cardIsFromOffer && overContainerId === DROPPABLE_GROUP_OFFER) {
      // Reordering within Offer
      const oldIndex = cardsInOffer.findIndex(c => c.id === activeCardId);
      const newIndex = over.data.current?.sortable?.index ?? oldIndex;
      if (oldIndex !== newIndex) {
        setCardsInOffer(prev => arrayMove(prev, oldIndex, newIndex));
      }
    }
  };

  const toggleCardSelection = (cardToToggle: CollectionCard) => {
    const isCurrentlyInOffer = cardsInOffer.some(c => c.id === cardToToggle.id);

    if (isCurrentlyInOffer) {
      // Move from Offer to Collection
      setCardsInOffer(prev => prev.filter(c => c.id !== cardToToggle.id));
      setAvailableCollectionCards(prev => [...prev, cardToToggle].sort((a,b) => collection.findIndex(x => x.id === a.id) - collection.findIndex(x => x.id === b.id))); // Maintain original collection order
    } else {
      // Move from Collection to Offer
      setAvailableCollectionCards(prev => prev.filter(c => c.id !== cardToToggle.id));
      setCardsInOffer(prev => [...prev, cardToToggle]);
    }
  };

  const handleSubmitOffer = () => {
    if (!selectedTrade) return;
    if (cardsInOffer.length === 0) {
      toast.error("You must offer at least one card.");
      return;
    }
    makeOffer(selectedTrade.id, cardsInOffer, message);
    toast.success("Offer submitted successfully!");
    navigate(`/trades`);
  };

  if (!currentUser || !selectedTrade) {
    return <div className="container py-8 text-center">Loading trade details...</div>;
  }

  // Get the first card from the trade listing's cards array
  const firstListedCard = selectedTrade.cards && selectedTrade.cards.length > 0 ? selectedTrade.cards[0] : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Listing Details Column */}
          <div className="md:col-span-1 space-y-6">
            <UICard>
              <CardHeader><CardTitle>Listing Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {firstListedCard ? (
                  <>
                    <div>
                      <img 
                        src={firstListedCard.images.large} 
                        alt={firstListedCard.name} 
                        className="w-full rounded-lg shadow-md" 
                      />
                    </div>
                    <h3 className="text-xl font-semibold">
                      {selectedTrade.cards.length > 1 
                        ? `Bundle: ${firstListedCard.name} + ${selectedTrade.cards.length - 1} more` 
                        : firstListedCard.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {firstListedCard.set.name} - #{firstListedCard.number}
                      {selectedTrade.cards.length > 1 && ` (${selectedTrade.cards.length} cards total)`}
                    </p>
                    {selectedTrade.cards.length === 1 && (
                      <p><span className="font-medium">Condition:</span> {firstListedCard.condition}</p>
                    )}
                    {selectedTrade.cards.length > 1 && (
                      <div>
                        <p className="font-medium mb-1">Cards in Bundle:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {selectedTrade.cards.map(card => (
                            <li key={card.id}>{card.name} ({card.condition})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-center">No card details available</p>
                )}
                {selectedTrade.askingPrice && (
                  <p><span className="font-medium">Asking Price:</span> {formatCurrency(selectedTrade.askingPrice)}</p>
                )}
                {selectedTrade.wishlist && selectedTrade.wishlist.length > 0 && (
                  <p><span className="font-medium">Looking for:</span> {selectedTrade.wishlist.join(', ')}</p>
                )}
                {selectedTrade.description && (
                  <p><span className="font-medium">Description:</span> {selectedTrade.description}</p>
                )}
                <div className="flex items-center pt-2 mt-2 border-t">
                  <img src={selectedTrade.userAvatar} alt={selectedTrade.username} className="w-8 h-8 rounded-full mr-2" />
                  <div>
                    <p className="text-sm font-medium">{selectedTrade.username}</p>
                    <p className="text-xs text-muted-foreground">Rep: {selectedTrade.userReputation}</p>
                  </div>
                </div>
              </CardContent>
            </UICard>
          </div>

          {/* Offer Creation Column */}
          <div className="md:col-span-2 space-y-6">
            <UICard>
              <CardHeader><CardTitle>Your Offer</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {/* Droppable Area for User's Collection Cards */}
                <div>
                  <h4 className="font-medium mb-2">Your Collection (Drag cards to offer)</h4>
                  <SortableContext items={availableCollectionCards.map(c => c.id)} strategy={rectSortingStrategy}>
                    <DroppableArea id={DROPPABLE_GROUP_COLLECTION} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-3 min-h-[150px] bg-muted/30 rounded-md border-dashed border-border max-h-96 overflow-y-auto">
                      {availableCollectionCards.length > 0 ? (
                        availableCollectionCards.map(card => (
                          <DraggableCard 
                            key={card.id} 
                            id={card.id} 
                            card={card} 
                            onToggleSelection={toggleCardSelection}
                            isInOfferArea={false}
                          />
                        ))
                      ) : (
                        <p className="col-span-full text-sm text-muted-foreground text-center py-4">No cards available to offer, or all cards are in your offer.</p>
                      )}
                    </DroppableArea>
                  </SortableContext>
                </div>

                {/* Droppable Area for Cards Being Offered */}
                <div>
                  <h4 className="font-medium mb-2">Cards in Your Offer (Drag cards here)</h4>
                  <SortableContext items={cardsInOffer.map(c => c.id)} strategy={rectSortingStrategy}>
                    <DroppableArea id={DROPPABLE_GROUP_OFFER} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-3 min-h-[150px] bg-primary/10 rounded-md border-dashed border-border max-h-96 overflow-y-auto">
                      {cardsInOffer.length > 0 ? (
                        cardsInOffer.map(card => (
                          <DraggableCard 
                            key={card.id} 
                            id={card.id} 
                            card={card} 
                            onToggleSelection={toggleCardSelection}
                            isInOfferArea={true}
                          />
                        ))
                      ) : (
                        <p className="col-span-full text-sm text-muted-foreground text-center py-4">Drag cards here or click '+' on cards above to add them to your offer.</p>
                      )}
                    </DroppableArea>
                  </SortableContext>
                </div>

                {/* Message Input */}
                <div>
                  <h4 className="font-medium mb-2">Message (Optional)</h4>
                  <Textarea
                    placeholder="Add a message to the trade owner..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleSubmitOffer} disabled={cardsInOffer.length === 0}>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Offer
                </Button>
              </CardFooter>
            </UICard>
          </div>
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeId && activeCard ? (
          <DraggableCard id={activeId} card={activeCard} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
} 