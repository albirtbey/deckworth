import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, PlusCircle, Loader2, TrendingUp, ListPlus, Send } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card as UICard, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { formatCurrency, getMarketPrice, getTcgPlayerPriceDetails, PriceDetail } from '../lib/utils';
import { ApiCard, User, CollectionCard, TCGPlayerPrice } from '../types';
import { fetchPokemonCard } from '../lib/api';
import { toast } from 'sonner';
import { Input } from '../components/ui/Input';

interface CardDetailPageProps {
    wishlist: ApiCard[];
    updateWishlist: (card: ApiCard) => void;
    currentUser: User | null;
    collection: CollectionCard[];
    addToCollection: (card: ApiCard, quantity: number) => void;
    updateCardTradeStatus: (cardId: string, forTrade: boolean) => void;
}

export function CardDetailPage({
    wishlist,
    updateWishlist,
    currentUser,
    collection,
    addToCollection,
    updateCardTradeStatus
}: CardDetailPageProps) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [card, setCard] = useState<ApiCard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tcgPlayerPrices, setTcgPlayerPrices] = useState<PriceDetail[]>([]);

    useEffect(() => {
        if (id) {
            setIsLoading(true);
            fetchPokemonCard(id)
                .then((data) => {
                    if (data) {
                        setCard(data);
                    } else {
                        setError('Card not found.');
                    }
                })
                .catch((err) => {
                    console.error('Error fetching card details:', err);
                    setError('Failed to load card details.');
                })
                .finally(() => setIsLoading(false));
        } else {
            setError('No card ID provided.');
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (card) {
            const pricesWithQuantity = getTcgPlayerPriceDetails(card).map(price => ({
                ...price,
                quantity: 0 // Default quantity to 0
            }));
            setTcgPlayerPrices(pricesWithQuantity);
        }
    }, [card]);

    const isInWishlist = card ? wishlist.some(item => item.id === card.id) : false;
    const handleAddToWishlist = () => card && updateWishlist(card);

    const mainMarketPrice = useMemo(() => card ? getMarketPrice(card.tcgplayer?.prices) : null, [card]);
    const ebayLastSold: { price: number }[] = useMemo(() => {
        return [];
    }, [id]);

    const getLatestEbaySoldPrice = useCallback(() => {
        if (ebayLastSold.length > 0) {
            return ebayLastSold[0]?.price || null;
        }
        return null;
    }, [ebayLastSold]);

    const cardMarketDisplayPrices = useMemo(() => {
        if (!card?.cardmarket?.prices) return [];
        const cmPrices = card.cardmarket.prices;
        const displayable = [
            { label: 'Average 1 Day', value: cmPrices.avg1 },
            { label: 'Average 7 Days', value: cmPrices.avg7 },
            { label: 'Average 30 Days', value: cmPrices.avg30 },
            { label: 'Trend Price', value: cmPrices.trendPrice },
            { label: 'Low Price', value: cmPrices.lowPrice },
        ];
        return displayable.filter(p => typeof p.value === 'number');
    }, [card]);

    const isOwned = currentUser && card ? collection.some(cc => cc.id === card.id) : false;
    const handleAddToCollection = () => {
        if (!currentUser) {
            console.log('User not logged in');
            return;
        }
        if (card && !isOwned) {
            addToCollection(card, 1);
            console.log('Added to collection');
        }
    };

    // Add logic to edit card condition
    const handleCardTypeUpdate = (type: string, updates: { quantity?: number; condition?: string }) => {
        if (card && currentUser) {
            setTcgPlayerPrices(prevPrices => prevPrices.map(price => (
                price.type === type ? { ...price, ...updates } : price
            )));
            toast.success(`Updated ${type} cards.`);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-8 text-center">
                <h1 className="text-2xl text-destructive mb-4">{error}</h1>
                <Button onClick={() => navigate(-1)} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        );
    }

    if (!card) {
        return (
            <div className="container py-8 text-center">
                <h1>Card data is unavailable.</h1>
                <Button onClick={() => navigate(-1)} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <UICard className="overflow-hidden shadow-xl">
                        <img
                            src={card.images.large}
                            alt={card.name}
                            className="w-full object-contain aspect-[2.5/3.5]"
                        />
                    </UICard>
                    <div className="space-y-2">
                        <Button className="w-full" onClick={handleAddToCollection} disabled={isOwned || !currentUser}>
                            <PlusCircle className="mr-2 h-5 w-5" />
                            {isOwned ? 'In Collection' : (currentUser ? 'Add to Collection' : 'Login to Collect')}
                        </Button>
                        <Button
                            variant={isInWishlist ? "default" : "outline"}
                            className="w-full"
                            onClick={handleAddToWishlist}
                            disabled={!card}
                        >
                            <Heart className="mr-2 h-5 w-5" />
                            {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                        </Button>
                        {isOwned && currentUser && card && (
                            <>
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => {
                                        updateCardTradeStatus(card.id, true);
                                        toast.success(`${card.name} added to Trade Bin. View it in the Trade Center.`);
                                    }}
                                >
                                    <ListPlus className="mr-2 h-5 w-5" />
                                    Add to Trade Bin
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => {
                                        localStorage.setItem('cardPendingOffer', card.id);
                                        navigate('/trades');
                                        toast.info(`Selected ${card.name} for an offer. Now choose a listing to make an offer on.`);
                                    }}
                                >
                                    <Send className="mr-2 h-5 w-5" />
                                    Add this Card to an Offer
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <UICard>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl font-bold leading-tight">{card.name}</CardTitle>
                                    <p className="text-lg text-muted-foreground mt-1">
                                        {card.set.name} <span className="font-mono">#{card.number}</span>
                                    </p>
                                    {card.rarity && <Badge variant="secondary" className="mt-1 capitalize">{card.rarity}</Badge>}
                                </div>
                                {mainMarketPrice !== null && (
                                    <div className="mt-2 sm:mt-0 text-left sm:text-right">
                                        <p className="text-xs text-muted-foreground flex items-center">Market Price <TrendingUp className="ml-1 h-4 w-4" /></p>
                                        <p className="text-2xl font-bold text-primary">{formatCurrency(mainMarketPrice)}</p>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <p className="text-xs text-muted-foreground">From <span className="font-semibold">{card.set.series} Series</span>, released on {new Date(card.set.releaseDate).toLocaleDateString()}.</p>
                            {card.artist && <p className="text-xs text-muted-foreground mt-1">Illustrated by <span className="font-semibold">{card.artist}</span>.</p>}
                        </CardContent>
                    </UICard>

                    <UICard>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Price Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">TCGPlayer Market</TableHead>
                                        <TableHead className="text-right">Cardmarket Trend</TableHead>
                                        <TableHead className="text-right">eBay Last Sold</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tcgPlayerPrices.map((price, idx) => {
                                        let cardmarketTrendPrice = cardMarketDisplayPrices.find(item => item.label === 'Trend Price')?.value || null;
                                        let latestEbaySoldPrice = getLatestEbaySoldPrice();

                                        return(
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{price.type}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(price.market)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(cardmarketTrendPrice, 'EUR')}</TableCell>
                                                <TableCell className="text-right">{latestEbaySoldPrice ? formatCurrency(latestEbaySoldPrice) : 'N/A'}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </UICard>

                    <UICard>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Manage Card Types</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Condition</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tcgPlayerPrices.map((price, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{price.type}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleCardTypeUpdate(price.type, { quantity: Math.max(price.quantity - 1, 0) })}
                                                        disabled={price.quantity <= 0}
                                                    >
                                                        -
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        value={price.quantity || 0}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCardTypeUpdate(price.type, { quantity: Number(e.target.value) })}
                                                        className="w-16 text-center"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleCardTypeUpdate(price.type, { quantity: price.quantity + 1 })}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <select
                                                    value={price.condition || ''}
                                                    onChange={(e) => handleCardTypeUpdate(price.type, { condition: e.target.value })}
                                                    className="input w-full"
                                                >
                                                    <option value="">Select Condition</option>
                                                    <option value="Near Mint">Near Mint</option>
                                                    <option value="Lightly Played">Lightly Played</option>
                                                    <option value="Moderately Played">Moderately Played</option>
                                                    <option value="Heavily Played">Heavily Played</option>
                                                    <option value="Damaged">Damaged</option>
                                                </select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </UICard>

                    {/* Other sections remain unchanged */}
                </div>
            </div>
        </div>
    );
}