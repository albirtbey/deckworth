import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { TradesPage } from './pages/TradesPage';
import { WishlistPage } from './pages/WishlistPage';
import { SetsPage } from './pages/SetsPage';
import { CardDetailPage } from './pages/CardDetailPage';
import { ApiCard as CardType, User, CollectionCard, CardCondition, TradeListing, TradeListingStatus, Offer } from './types';
import { LoginPage } from './pages/LoginPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { mockUsers, generateMockTradeListings } from './data/mock-data';
import { SetDetailPage } from './pages/SetDetailPage';
import { CreateTradePage } from './pages/CreateTradePage';
import { MakeOfferPage } from './pages/MakeOfferPage';
import { MyTradesPage } from './pages/MyTradesPage';
import { Toaster } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { fetchPokemonCards } from './lib/api';
import { EditTradePage } from './pages/EditTradePage';
import { TooltipProvider } from "@radix-ui/react-tooltip";

function App() {
  const [wishlist, setWishlist] = useState<CardType[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [collection, setCollection] = useState<CollectionCard[]>([]);
  const [tradeListings, setTradeListings] = useState<TradeListing[]>([]);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setAppLoading(true);
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        setCurrentUser(parsedUser);
        const storedCollection = localStorage.getItem(`${parsedUser.id}_collection`);
        if (storedCollection) {
          setCollection(JSON.parse(storedCollection));
        }
      }

      const storedTradeListings = localStorage.getItem('tradeListings');
      if (storedTradeListings) {
        const parsedListings = JSON.parse(storedTradeListings).map((listing: TradeListing) => ({
          ...listing,
          offers: listing.offers || [], 
        }));
        setTradeListings(parsedListings);
      } else if (mockUsers.length > 0) {
        try {
          const sampleCards = await fetchPokemonCards('rarity:Rare', 1, 5);
          if (sampleCards.length > 0) {
            const mockData = generateMockTradeListings(sampleCards, 3);
            setTradeListings(mockData.map(m => ({...m, offers: []})));
            localStorage.setItem('tradeListings', JSON.stringify(mockData));
          } else {
            setTradeListings([]);
          }
        } catch (error) {
          console.error("Failed to fetch sample cards for mock trades:", error);
          setTradeListings([]);
        }
      } else {
        setTradeListings([]);
      }
      setAppLoading(false);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentUser && collection.length > 0) {
      localStorage.setItem(`${currentUser.id}_collection`, JSON.stringify(collection));
    } else if (currentUser && collection.length === 0) {
      localStorage.removeItem(`${currentUser.id}_collection`);
    }
  }, [collection, currentUser]);

  useEffect(() => {
    if (!appLoading && tradeListings.length > 0) {
      localStorage.setItem('tradeListings', JSON.stringify(tradeListings));
    } else if (!appLoading && tradeListings.length === 0) {
      localStorage.removeItem('tradeListings');
    }
  }, [tradeListings, appLoading]);

  const updateWishlist = (card: CardType) => {
    setWishlist((prevWishlist) => {
      const isInWishlist = prevWishlist.find((item) => item.id === card.id);
      if (isInWishlist) {
        return prevWishlist.filter((item) => item.id !== card.id);
      } else {
        return [...prevWishlist, card];
      }
    });
  };

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    const storedCollection = localStorage.getItem(`${user.id}_collection`);
    if (storedCollection) {
      setCollection(JSON.parse(storedCollection));
    } else {
      try {
        const numCardsToFetch = user.username === 'testUser' ? 5 : 3;
        const fetchedCards = await fetchPokemonCards('supertype:pokemon', 1, numCardsToFetch);
        if (fetchedCards && fetchedCards.length > 0) {
          const defaultCollection: CollectionCard[] = fetchedCards.map(card => ({
            ...card,
            quantity: 1,
            condition: 'Near Mint' as CardCondition,
            purchaseDate: new Date().toISOString(),
            forTrade: false,
          }));
          setCollection(defaultCollection);
          localStorage.setItem(`${user.id}_collection`, JSON.stringify(defaultCollection));
        } else {
          setCollection([]);
        }
      } catch (error) {
        console.error('Failed to fetch default collection cards:', error);
        setCollection([]);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCollection([]);
    localStorage.removeItem('currentUser');
  };

  const addToCollection = (card: CardType, quantity: number = 1, condition: CardCondition = 'Near Mint') => {
    if (!currentUser) return;

    setCollection((prevCollection) => {
      const existingCard = prevCollection.find(c => c.id === card.id);
      if (existingCard) {
        return prevCollection.map(c => 
          c.id === card.id ? { ...c, quantity: c.quantity + quantity } : c
        );
      } else {
        const newCollectionCard: CollectionCard = {
          ...card,
          quantity: quantity,
          condition: condition,
          purchaseDate: new Date().toISOString(),
          forTrade: false,
        };
        return [...prevCollection, newCollectionCard];
      }
    });
  };

  const updateCollectionCard = (cardId: string, updates: Partial<CollectionCard>) => {
    if (!currentUser) return;

    setCollection((prevCollection) => {
      return prevCollection.map(card => 
        card.id === cardId ? { ...card, ...updates } : card
      );
    });
  };

  const removeFromCollection = (cardId: string) => {
    if (!currentUser) return;

    setCollection((prevCollection) => {
      return prevCollection.filter(card => card.id !== cardId);
    });
  };

  const createTradeListing = (listingData: Omit<TradeListing, 'id' | 'userId' | 'username' | 'userAvatar' | 'userReputation' | 'createdAt' | 'status' | 'offers'>) => {
    if (!currentUser) return;
    const newListing: TradeListing = {
      id: uuidv4(),
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar || '/placeholder-avatar.png',
      userReputation: currentUser.reputation,
      ...listingData,
      status: 'Active',
      createdAt: new Date().toISOString(),
      offers: [],
    };
    setTradeListings(prevListings => [newListing, ...prevListings]);
  };

  const makeOffer = (tradeId: string, offeredCards: CollectionCard[], message: string) => {
    if (!currentUser) return;
    setTradeListings(prevListings => 
      prevListings.map(listing => {
        if (listing.id === tradeId) {
          const newOffer: Offer = {
            id: uuidv4(),
            offerUserId: currentUser.id,
            offerUsername: currentUser.username,
            offerUserAvatar: currentUser.avatar || '/placeholder-avatar.png',
            offeredCards,
            message: message || undefined,
            createdAt: new Date().toISOString(),
            status: 'Pending',
          };
          return {
            ...listing,
            offers: [...(listing.offers || []), newOffer],
          };
        }
        return listing;
      })
    );
  };

  const acceptOffer = (tradeId: string, offerId: string) => {
    setTradeListings(prevListings =>
      prevListings.map(listing => {
        if (listing.id === tradeId) {
          return {
            ...listing,
            status: 'Completed',
            offers: listing.offers?.map(offer => 
              offer.id === offerId 
                ? { ...offer, status: 'Accepted' } 
                : { ...offer, status: 'Rejected' }
            ) || [],
          };
        }
        return listing;
      })
    );
  };

  const rejectOffer = (tradeId: string, offerId: string) => {
    setTradeListings(prevListings =>
      prevListings.map(listing => {
        if (listing.id === tradeId) {
          return {
            ...listing,
            offers: listing.offers?.map(offer =>
              offer.id === offerId ? { ...offer, status: 'Rejected' } : offer
            ) || [],
          };
        }
        return listing;
      })
    );
  };

  const cancelTradeListing = (tradeId: string) => {
    setTradeListings(prevListings => 
      prevListings.map(listing => 
        listing.id === tradeId 
          ? { ...listing, status: 'Cancelled', offers: listing.offers?.map(o => ({...o, status: 'Rejected'})) || [] } 
          : listing
      )
    );
  };

  const withdrawOffer = (tradeId: string, offerId: string) => {
    if (!currentUser) return;
    setTradeListings(prevListings =>
      prevListings.map(listing => {
        if (listing.id === tradeId) {
          return {
            ...listing,
            offers: listing.offers?.filter(offer => 
              !(offer.id === offerId && offer.offerUserId === currentUser.id)
            ) || [],
          };
        }
        return listing;
      })
    );
  };

  const updateCardTradeStatus = (cardId: string, forTrade: boolean) => {
    setCollection(prevCollection => {
      const updatedCollection = prevCollection.map(card => {
        if (card.id === cardId) {
          return { ...card, forTrade };
        }
        return card;
      });
      localStorage.setItem('userCollection', JSON.stringify(updatedCollection));
      return updatedCollection;
    });
  };

  const updateTradeListing = (listingId: string, listingData: Partial<TradeListing>) => {
    if (!currentUser) return;
    setTradeListings(prevListings => prevListings.map(listing => {
      if (listing.id === listingId && listing.userId === currentUser.id) {
        return {
          ...listing,
          ...listingData,
        };
      }
      return listing;
    }));
  };

  if (appLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="flex flex-col items-center">
          <img src="/pokeball.svg" alt="Loading..." className="h-16 w-16 animate-spin mb-4" />
          <p className="text-lg text-muted-foreground">Loading Trading Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout wishlist={wishlist} currentUser={currentUser} onLogout={handleLogout} />}>
            <Route index element={<HomePage />} />
            <Route path="collection" element={
              <CollectionPage 
                collection={collection} 
                currentUser={currentUser} 
                updateCollectionCard={updateCollectionCard}
                removeFromCollection={removeFromCollection}
                wishlist={wishlist}
                updateWishlist={updateWishlist}
              />
            } />
            <Route path="trades" element={
              <TradesPage 
                tradeListings={tradeListings} 
                currentUser={currentUser} 
                collection={collection}
                updateCardTradeStatus={updateCardTradeStatus}
              />
            } />
            <Route path="trades/create" element={<CreateTradePage currentUser={currentUser} collection={collection} createTradeListing={createTradeListing} />} />
            <Route path="trades/:tradeId/offer" element={<MakeOfferPage currentUser={currentUser} collection={collection} tradeListings={tradeListings} makeOffer={makeOffer} />} />
            <Route path="my-trades" element={
              currentUser ? (
                <MyTradesPage 
                  currentUser={currentUser} 
                  tradeListings={tradeListings} 
                  acceptOffer={acceptOffer} 
                  rejectOffer={rejectOffer} 
                  cancelTradeListing={cancelTradeListing} 
                  withdrawOffer={withdrawOffer} 
                />
              ) : (
                <Navigate to="/login" />
              )
            } />
            <Route path="wishlist" element={<WishlistPage wishlist={wishlist} updateWishlist={updateWishlist} />} />
            <Route path="sets" element={<SetsPage currentUser={currentUser} collection={collection} />} />
            <Route path="set/:setId" element={<SetDetailPage currentUser={currentUser} collection={collection} addToCollection={addToCollection} />} />
            <Route path="card/:id" element={
              <CardDetailPage 
                wishlist={wishlist} 
                updateWishlist={updateWishlist} 
                collection={collection} 
                addToCollection={addToCollection} 
                currentUser={currentUser}
                updateCardTradeStatus={updateCardTradeStatus}
              />
            } />
            <Route path="login" element={<LoginPage onLogin={handleLogin} mockUsers={mockUsers} />} />
            <Route 
              path="/profile" 
              element={currentUser ? <UserProfilePage currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/trades/:listingId/edit" 
              element={
                <EditTradePage 
                  currentUser={currentUser}
                  collection={collection}
                  tradeListings={tradeListings}
                  updateTradeListing={updateTradeListing}
                />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
      </Router>
    </TooltipProvider>
  );
}

export default App;