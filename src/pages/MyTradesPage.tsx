import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card as UICard, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { User, TradeListing, Offer, CollectionCard } from '../types';
import { ArrowLeft, Eye, CheckCircle, XCircle, Trash2, Inbox, CornerDownLeft, Edit2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Tooltip } from '../components/ui/Tooltip';

interface MyTradesPageProps {
    currentUser: User | null;
    tradeListings: TradeListing[];
    acceptOffer: (tradeId: string, offerId: string) => void;
    rejectOffer: (tradeId: string, offerId: string) => void;
    cancelTradeListing: (tradeId: string) => void;
    withdrawOffer: (tradeId: string, offerId: string) => void;
}

export function MyTradesPage({ 
    currentUser, 
    tradeListings, 
    acceptOffer, 
    rejectOffer, 
    cancelTradeListing,
    withdrawOffer
}: MyTradesPageProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("my-listings");
    const [isLoading, setIsLoading] = useState(false);
    
    // Confirmation dialog states
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        action: 'accept' | 'reject' | 'cancel' | 'withdraw';
        tradeId: string;
        offerId?: string;
    }>({
        isOpen: false,
        action: 'cancel',
        tradeId: '',
    });

    if (!currentUser) {
        toast.error("Please log in to view your trades.");
        navigate('/login');
        return null;
    }

    const myTradeListings = tradeListings.filter(t => t.userId === currentUser.id);
    const myOffersMade = tradeListings.reduce((acc, trade) => {
        const userOffersOnThisTrade = trade.offers?.filter(offer => offer.offerUserId === currentUser.id) || [];
        if (userOffersOnThisTrade.length > 0) {
            acc.push({ ...trade, offers: userOffersOnThisTrade });
        }
        return acc;
    }, [] as TradeListing[]);

    const handleConfirmAction = async () => {
        setIsLoading(true);
        try {
            switch (confirmDialog.action) {
                case 'accept':
                    if (confirmDialog.offerId) {
                        acceptOffer(confirmDialog.tradeId, confirmDialog.offerId);
                        toast.success('Offer accepted successfully!');
                    }
                    break;
                case 'reject':
                    if (confirmDialog.offerId) {
                        rejectOffer(confirmDialog.tradeId, confirmDialog.offerId);
                        toast.info('Offer rejected.');
                    }
                    break;
                case 'cancel':
                    cancelTradeListing(confirmDialog.tradeId);
                    toast.info('Listing cancelled.');
                    break;
                case 'withdraw':
                    if (confirmDialog.offerId) {
                        withdrawOffer(confirmDialog.tradeId, confirmDialog.offerId);
                        toast.info('Offer withdrawn.');
                    }
                    break;
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
    };

    const renderOfferCard = (trade: TradeListing, offer: Offer) => (
        <div key={offer.id} className="p-3 border rounded-md bg-muted/30 space-y-2">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm">Offer from: <span className="font-semibold">{offer.offerUsername}</span></p>
                    <p className="text-xs text-muted-foreground">On: {new Date(offer.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge variant={offer.status === 'Pending' ? 'warning' : offer.status === 'Accepted' ? 'success' : 'destructive'}>
                    {offer.status}
                </Badge>
            </div>
            <div className="text-sm">
                <p className="font-medium mb-1">Offered Cards:</p>
                {offer.offeredCards.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {offer.offeredCards.map(card => (
                            <div key={card.id} className="border rounded p-1 text-xs text-center bg-background">
                                <img src={card.images.small} alt={card.name} className="w-full h-auto object-contain aspect-[2.5/3.5] rounded-sm mx-auto mb-1"/>
                                {card.name}
                            </div>
                        ))}
                    </div>
                ) : <p className="text-xs italic">No cards offered.</p>}
            </div>
            {offer.message && <p className="text-xs border-t pt-1 mt-1">Message: "{offer.message}"</p>}
            {trade.status === 'Active' && offer.status === 'Pending' && (
                <div className="flex gap-2 pt-2 border-t mt-2">
                    <Tooltip content="Accept this offer and complete the trade" side="top">
                        <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => setConfirmDialog({
                                isOpen: true,
                                action: 'accept',
                                tradeId: trade.id,
                                offerId: offer.id
                            })}
                        >
                            <CheckCircle className="w-4 h-4 mr-1"/> Accept
                        </Button>
                    </Tooltip>
                    <Tooltip content="Reject this offer" side="top">
                        <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => setConfirmDialog({
                                isOpen: true,
                                action: 'reject',
                                tradeId: trade.id,
                                offerId: offer.id
                            })}
                        >
                            <XCircle className="w-4 h-4 mr-1"/> Reject
                        </Button>
                    </Tooltip>
                </div>
            )}
        </div>
    );

    if (isLoading) {
        return <LoadingState text="Processing your request..." />;
    }

    return (
        <>
            <div className="container py-8">
                <Button variant="ghost" onClick={() => navigate('/trades')} className="mb-6 text-sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Marketplace
                </Button>
                <UICard>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-bold">Manage Your Trades</CardTitle>
                            <Tooltip content="View and manage your trade listings and offers" side="left">
                                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                            </Tooltip>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="my-listings">My Listings ({myTradeListings.length})</TabsTrigger>
                                <TabsTrigger value="my-offers">My Offers ({myOffersMade.length})</TabsTrigger>
                            </TabsList>
                            <TabsContent value="my-listings" className="mt-4">
                                {myTradeListings.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <Inbox className="w-12 h-12 mx-auto mb-2" />
                                        You haven't created any trade listings yet.
                                    </div>
                                )}
                                <div className="space-y-6">
                                    {myTradeListings.map(trade => {
                                        const firstCard = trade.cards && trade.cards.length > 0 ? trade.cards[0] : null;
                                        return (
                                            <UICard key={trade.id} className="overflow-hidden">
                                                <CardHeader className="flex flex-row justify-between items-start bg-muted/20 p-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold">
                                                            {firstCard ? 
                                                                (trade.cards.length > 1 ? `Bundle: ${firstCard.name} + ${trade.cards.length - 1} more` : firstCard.name) :
                                                                'Untitled Listing'
                                                            }
                                                        </h3>
                                                        {firstCard && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {firstCard.set.name}
                                                                {trade.cards.length === 1 && ` - Condition: ${firstCard.condition}`}
                                                                {trade.cards.length > 1 && ` (${trade.cards.length} cards total)`}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground">Listed: {new Date(trade.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant={trade.status === 'Active' || trade.status === 'Pending' ? 'success' : 'secondary'}>{trade.status}</Badge>
                                                        {trade.askingPrice && <p className="text-lg font-semibold mt-1">{formatCurrency(trade.askingPrice)}</p>}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4 space-y-3">
                                                    <div>
                                                        <h4 className="text-sm font-medium mb-2">Offers Received ({trade.offers?.length || 0}):</h4>
                                                        {(!trade.offers || trade.offers.length === 0) && <p className="text-xs text-muted-foreground italic">No offers yet.</p>}
                                                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                                            {trade.offers?.map(offer => renderOfferCard(trade, offer))}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                {trade.status === 'Active' || trade.status === 'Pending' ? (
                                                    <CardFooter className="bg-muted/20 p-4 flex justify-end gap-2">
                                                        {trade.status === 'Active' && (
                                                            <Tooltip content="Edit this listing" side="top">
                                                                <Button size="sm" variant="outline" onClick={() => navigate(`/trades/${trade.id}/edit`)}>
                                                                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                                                                </Button>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip content="Cancel this listing" side="top">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => setConfirmDialog({
                                                                    isOpen: true,
                                                                    action: 'cancel',
                                                                    tradeId: trade.id
                                                                })}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-1" /> Cancel Listing
                                                            </Button>
                                                        </Tooltip>
                                                    </CardFooter>
                                                ) : trade.status === 'Completed' ? (
                                                    <CardFooter className="bg-green-50 dark:bg-green-900/30 p-3 text-center">
                                                        <p className="text-sm text-green-700 dark:text-green-400 font-medium w-full">Trade Completed</p>
                                                    </CardFooter>
                                                ) : null}
                                            </UICard>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                            <TabsContent value="my-offers" className="mt-4">
                                {myOffersMade.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground">
                                         <Inbox className="w-12 h-12 mx-auto mb-2" />
                                        You haven't made any offers yet.
                                    </div>
                                )}
                                <div className="space-y-4">
                                    {myOffersMade.map(trade => {
                                        const myOfferOnThisTrade = trade.offers?.[0];
                                        if (!myOfferOnThisTrade) return null;
                                        const firstListedCard = trade.cards && trade.cards.length > 0 ? trade.cards[0] : null;

                                        return (
                                         <UICard key={`offer-${trade.id}-${myOfferOnThisTrade.id}`} className="overflow-hidden">
                                            <CardHeader className="flex flex-row justify-between items-start bg-muted/20 p-4">
                                                <div>
                                                    <h3 className="text-base font-semibold">
                                                        Offer on: {firstListedCard ? 
                                                            (trade.cards.length > 1 ? `Bundle: ${firstListedCard.name} + ${trade.cards.length - 1} more` : firstListedCard.name) :
                                                            'Listing'
                                                        }
                                                        {firstListedCard && trade.cards.length === 1 && <span className="text-sm text-muted-foreground"> ({firstListedCard.set.name})</span>}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground">To: {trade.username}</p>
                                                </div>
                                                 <Badge variant={myOfferOnThisTrade.status === 'Pending' ? 'warning' : myOfferOnThisTrade.status === 'Accepted' ? 'success' : 'destructive'}>
                                                    {myOfferOnThisTrade.status}
                                                </Badge>
                                            </CardHeader>
                                            <CardContent className="p-4">
                                                 <div className="space-y-2">
                                                    <p className="text-xs text-muted-foreground">Offered on: {new Date(myOfferOnThisTrade.createdAt).toLocaleDateString()}</p>
                                                    <div className="text-sm">
                                                        <p className="font-medium mb-1">Your Offered Cards:</p>
                                                        {myOfferOnThisTrade.offeredCards.length > 0 ? (
                                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                                {myOfferOnThisTrade.offeredCards.map(card => (
                                                                    <div key={card.id} className="border rounded p-1 text-xs text-center bg-background">
                                                                        <img src={card.images.small} alt={card.name} className="w-full h-auto object-contain aspect-[2.5/3.5] rounded-sm mx-auto mb-1"/>
                                                                        {card.name}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : <p className="text-xs italic">No cards in this offer.</p>}
                                                    </div>
                                                    {myOfferOnThisTrade.message && <p className="text-xs border-t pt-1 mt-1">Your Message: "{myOfferOnThisTrade.message}"</p>}
                                                </div>
                                            </CardContent>
                                            {myOfferOnThisTrade.status === 'Pending' && (
                                                <CardFooter className="bg-muted/20 p-3 flex justify-end">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => {
                                                            withdrawOffer(trade.id, myOfferOnThisTrade.id);
                                                            toast.info('Offer withdrawn.');
                                                        }}
                                                    >
                                                        <CornerDownLeft className="w-4 h-4 mr-1" /> Withdraw Offer
                                                    </Button>
                                                </CardFooter>
                                            )}
                                        </UICard>
                                     );
                                    })}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </UICard>
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmAction}
                title={
                    confirmDialog.action === 'accept' ? 'Accept Offer' :
                    confirmDialog.action === 'reject' ? 'Reject Offer' :
                    confirmDialog.action === 'cancel' ? 'Cancel Listing' :
                    'Withdraw Offer'
                }
                description={
                    confirmDialog.action === 'accept' ? 'Are you sure you want to accept this offer? This will complete the trade and reject all other offers.' :
                    confirmDialog.action === 'reject' ? 'Are you sure you want to reject this offer?' :
                    confirmDialog.action === 'cancel' ? 'Are you sure you want to cancel this listing? This action cannot be undone.' :
                    'Are you sure you want to withdraw your offer?'
                }
                confirmText={
                    confirmDialog.action === 'accept' ? 'Accept' :
                    confirmDialog.action === 'reject' ? 'Reject' :
                    confirmDialog.action === 'cancel' ? 'Cancel Listing' :
                    'Withdraw'
                }
                variant={confirmDialog.action === 'accept' ? 'default' : 'destructive'}
            />
        </>
    );
} 