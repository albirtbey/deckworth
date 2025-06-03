import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card as UICard, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { User, CollectionCard, TradeListing } from '@/types';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
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
import { DroppableArea } from '@/components/dnd/DroppableArea';
import { DraggableCard } from '@/components/dnd/DraggableCard';

interface CreateTradePageProps {
    currentUser: User | null;
    collection: CollectionCard[];
    createTradeListing: (listingData: Omit<TradeListing, 'id' | 'userId' | 'username' | 'userAvatar' | 'userReputation' | 'createdAt' | 'status' | 'offers'>) => void;
}

const DROPPABLE_AREA_COLLECTION = 'userCollectionForListingMulti';
const DROPPABLE_AREA_LISTING_CARDS = 'listingCardsArea';

export function CreateTradePage({ currentUser, collection, createTradeListing }: CreateTradePageProps) {
    const navigate = useNavigate();
    
    const [availableCollectionCards, setAvailableCollectionCards] = useState<CollectionCard[]>([]);
    const [cardsInListing, setCardsInListing] = useState<CollectionCard[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeCardData, setActiveCardData] = useState<CollectionCard | null>(null);

    const [askingPrice, setAskingPrice] = useState<string>('');
    const [wishlistItems, setWishlistItems] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor)
    );

    useEffect(() => {
        if (!currentUser) {
            toast.error("You must be logged in to create a trade listing.");
            navigate('/login');
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        const pendingCardId = localStorage.getItem('cardPendingListing');
        if (pendingCardId) {
            const cardFromCollection = collection.find(c => c.id === pendingCardId && c.forTrade);
            if (cardFromCollection && !cardsInListing.some(c => c.id === cardFromCollection.id)) {
                setCardsInListing(prev => [...prev, cardFromCollection]);
                toast.success(`${cardFromCollection.name} automatically added for listing.`);
            }
            localStorage.removeItem('cardPendingListing');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collection]);

    useEffect(() => {
        // Only show cards that are marked for trade and not already in the listing
        setAvailableCollectionCards(
            collection.filter(c => c.forTrade && !cardsInListing.some(lic => lic.id === c.id))
                     .sort((a,b) => a.name.localeCompare(b.name))
        );
    }, [collection, cardsInListing]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        const card = availableCollectionCards.find(c => c.id === event.active.id) || cardsInListing.find(c => c.id === event.active.id);
        if (card) setActiveCardData(card);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveCardData(null);
        if (!over) return;

        const draggedCardId = active.id as string;
        const targetContainerId = over.id as string;

        const cardIsFromCollection = availableCollectionCards.some(c => c.id === draggedCardId);
        const cardIsFromListing = cardsInListing.some(c => c.id === draggedCardId);
        const cardToMove = cardIsFromCollection 
            ? availableCollectionCards.find(c => c.id === draggedCardId) 
            : cardsInListing.find(c => c.id === draggedCardId);

        if (!cardToMove) return;

        if (targetContainerId === DROPPABLE_AREA_LISTING_CARDS && cardIsFromCollection) {
            // Move from collection to listing
            setCardsInListing(prev => [...prev, cardToMove]);
            setAvailableCollectionCards(prev => prev.filter(c => c.id !== draggedCardId));
        } else if (targetContainerId === DROPPABLE_AREA_COLLECTION && cardIsFromListing) {
            // Move from listing back to collection
            setAvailableCollectionCards(prev => [...prev, cardToMove].sort((a,b) => a.name.localeCompare(b.name)));
            setCardsInListing(prev => prev.filter(c => c.id !== draggedCardId));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cardsInListing.length === 0) {
            toast.error("Please select at least one card to trade.");
            return;
        }
        const newListingData = {
            cards: cardsInListing,
            askingPrice: askingPrice ? parseFloat(askingPrice) : undefined,
            wishlist: wishlistItems.split(',').map(item => item.trim()).filter(item => item),
            description: description || undefined,
        };

        createTradeListing(newListingData);
        toast.success(`Trade listing with ${cardsInListing.length} card(s) created successfully!`);
        navigate('/my-trades');
    };

    if (!currentUser) {
        return <div className="container py-8 text-center">Loading...</div>;
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="container py-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Collection Cards */}
                    <div className="lg:col-span-2">
                        <UICard>
                            <CardHeader>
                                <CardTitle>Your Trade Bin</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DroppableArea 
                                    id={DROPPABLE_AREA_COLLECTION} 
                                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                                >
                                    {availableCollectionCards.length > 0 ? (
                                        availableCollectionCards.map(card => (
                                            <DraggableCard key={card.id} id={card.id} card={card} />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-8 text-muted-foreground">
                                            No cards available in your Trade Bin. Add cards to your Trade Bin first.
                                        </div>
                                    )}
                                </DroppableArea>
                            </CardContent>
                        </UICard>
                    </div>

                    {/* Listing Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <UICard>
                            <CardHeader>
                                <CardTitle>Create Trade Listing</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <Label htmlFor="cards">Selected Cards</Label>
                                        <DroppableArea 
                                            id={DROPPABLE_AREA_LISTING_CARDS} 
                                            className="mt-2 grid grid-cols-2 gap-4 min-h-[200px] bg-muted/50 rounded-lg p-4"
                                        >
                                            {cardsInListing.map(card => (
                                                <DraggableCard key={card.id} id={card.id} card={card} />
                                            ))}
                                            {cardsInListing.length === 0 && (
                                                <div className="col-span-2 flex items-center justify-center h-full text-muted-foreground text-sm">
                                                    Drag cards here to add them to your listing
                                                </div>
                                            )}
                                        </DroppableArea>
                                    </div>

                                    <div>
                                        <Label htmlFor="askingPrice">Asking Price (Optional)</Label>
                                        <Input
                                            id="askingPrice"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Enter asking price..."
                                            value={askingPrice}
                                            onChange={(e) => setAskingPrice(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="wishlist">Cards You Want (Optional)</Label>
                                        <Input
                                            id="wishlist"
                                            placeholder="Enter card names, separated by commas..."
                                            value={wishlistItems}
                                            onChange={(e) => setWishlistItems(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Add any additional details about your trade..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>

                                    {cardsInListing.length > 0 && (
                                        <div className="pt-4 border-t">
                                            <h4 className="font-semibold mb-2">Bundle Summary:</h4>
                                            <p className="text-sm">Number of cards: {cardsInListing.length}</p>
                                            <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                                                {cardsInListing.map(c => <li key={c.id}>{c.name} ({c.set.name}) - {c.condition}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={cardsInListing.length === 0}>
                                    <PlusCircle className="mr-2 h-5 w-5" />
                                    Create Bundle Listing
                                </Button>
                            </CardFooter>
                        </UICard>
                    </form>
                </div>
            </div>
            <DragOverlay dropAnimation={null}>
                {activeId && activeCardData ? (
                    <DraggableCard id={activeId} card={activeCardData} isOverlay />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
} 