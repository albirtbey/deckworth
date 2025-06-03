import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ApiCard, PokemonSet, CollectionCard, User } from '../types/index';
import { fetchPokemonCardsBySetId, fetchPokemonSet } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Progress } from '../components/ui/progress';
import { ArrowLeft, Loader2, Search, Tag, BarChart3, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { getMarketPrice, formatCurrency } from '../lib/utils';
import { SetCardView } from '../components/cards/SetCardView';

interface SetDetailPageProps {
  currentUser: User | null;
  collection: CollectionCard[];
  addToCollection: (card: ApiCard, quantity: number) => void;
}

export function SetDetailPage({ currentUser, collection, addToCollection }: SetDetailPageProps) {
  const { setId } = useParams<{ setId: string }>();
  const [setDetails, setSetDetails] = useState<PokemonSet | null>(null);
  const [allCardsInSet, setAllCardsInSet] = useState<ApiCard[]>([]);
  const [isLoadingSet, setIsLoadingSet] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiPageSize = 50;

  const [searchTerm, setSearchTerm] = useState('');
  const [activeSort, setActiveSort] = useState('number-asc');

  const collectionProgress = useMemo(() => {
    if (!setDetails || !collection || collection.length === 0) {
      return { count: 0, total: setDetails?.total || 0, percentage: 0 };
    }
    const cardsInSetFromCollection = collection.filter(cc => cc.set.id === setId);
    const count = cardsInSetFromCollection.length;
    const total = setDetails.total;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { count, total, percentage };
  }, [collection, setDetails, setId]);

  const currentSetMarketValue = useMemo(() => {
    if (!allCardsInSet || allCardsInSet.length === 0 || allCardsInSet.length < (setDetails?.total || 0)) {
      return 0;
    }
    return allCardsInSet.reduce((sum, card) => {
      const price = getMarketPrice(card.tcgplayer?.prices);
      return sum + (price || 0);
    }, 0);
  }, [allCardsInSet, setDetails]);

  useEffect(() => {
    if (!setId) return;

    const loadSetDetails = async () => {
      setIsLoadingSet(true);
      try {
        const fetchedSet = await fetchPokemonSet(setId);
        setSetDetails(fetchedSet);
      } catch (err) {
        setError('Failed to load set details.');
        console.error(err);
      }
      setIsLoadingSet(false);
    };

    loadSetDetails();
  }, [setId]);

  useEffect(() => {
    if (!setId || !setDetails || !setDetails.total) return;

    const fetchAllCardsForSet = async () => {
      setIsLoadingCards(true);
      setAllCardsInSet([]);
      setError(null);
      let fetchedCardsAccumulator: ApiCard[] = [];
      let currentPage = 1;
      let continueFetching = true;

      try {
        while (continueFetching) {
          const newCards = await fetchPokemonCardsBySetId(setId, currentPage, apiPageSize);
          if (newCards && newCards.length > 0) {
            fetchedCardsAccumulator = [...fetchedCardsAccumulator, ...newCards];
            if (fetchedCardsAccumulator.length >= setDetails.total || newCards.length < apiPageSize) {
              continueFetching = false;
            }
            currentPage++;
          } else {
            continueFetching = false;
          }
        }
        setAllCardsInSet(fetchedCardsAccumulator);
      } catch (err) {
        setError('Failed to load all cards in this set.');
        console.error(err);
      }
      setIsLoadingCards(false);
    };

    fetchAllCardsForSet();
  }, [setId, setDetails]);

  const filteredAndSortedCards = useMemo(() => {
    let items = [...allCardsInSet];

    if (searchTerm) {
      items = items.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    items.sort((a, b) => {
      const numA = parseInt(a.number.replace(/\D/g, '') || '0');
      const numB = parseInt(b.number.replace(/\D/g, '') || '0');
      const priceA = getMarketPrice(a.tcgplayer?.prices) ?? Infinity;
      const priceB = getMarketPrice(b.tcgplayer?.prices) ?? Infinity;

      switch (activeSort) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'number-asc': return numA - numB;
        case 'number-desc': return numB - numA;
        case 'price-asc': return priceA - priceB;
        case 'price-desc': return priceB - priceA;
        default: return numA - numB;
      }
    });
    return items;
  }, [allCardsInSet, searchTerm, activeSort]);

  const handleAddToCollection = (card: ApiCard) => {
    if (!currentUser) {
      toast.error('Please log in to add cards to your collection.');
      return;
    }
    addToCollection(card, 1);
    toast.success(`${card.name} added to your collection!`);
  };
  
  const isCardInCollection = (cardId: string) => {
    return collection.some(cc => cc.id === cardId);
  };

  if (isLoadingSet && !setDetails) {
    return (
      <div className="container mx-auto py-8 text-center flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" /> 
        <p className="text-muted-foreground">Loading Set Details...</p>
      </div>
    );
  }

  if (error && !setDetails && allCardsInSet.length === 0) {
    return <div className="container mx-auto py-8 text-center text-red-500">Error loading set details: {error}</div>;
  }

  if (!setDetails && !isLoadingSet) {
    return <div className="container mx-auto py-8 text-center">Set not found or failed to load.</div>;
  }

  const renderSortButton = (sortKey: string, label: string, icon: React.ReactNode) => {
    const isActive = activeSort.startsWith(sortKey);
    const isAsc = activeSort.endsWith('-asc');
    let nextSortState = `${sortKey}-asc`;
    if (isActive) {
      nextSortState = isAsc ? `${sortKey}-desc` : `${sortKey}-asc`;
    }

    return (
      <Button 
        variant={isActive ? "default" : "outline"} 
        size="sm"
        onClick={() => setActiveSort(nextSortState)}
        className="flex items-center gap-1.5 text-xs whitespace-nowrap"
      >
        {icon}
        {label}
        {isActive && (
          isAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        )}
      </Button>
    );
  };

  const allCardsLoaded = setDetails && allCardsInSet.length >= setDetails.total;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Link to="/sets" className="inline-flex items-center text-primary hover:underline mb-4">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to All Sets
      </Link>
      
      {setDetails && (
        <div className="mb-6 p-4 border rounded-lg shadow-sm bg-card">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="flex flex-col sm:flex-row items-center sm:items-start flex-grow">
              <img 
                src={setDetails.images.logo} 
                alt={`${setDetails.name} logo`} 
                className="w-24 h-24 md:w-32 md:h-32 object-contain mr-0 sm:mr-6 mb-4 sm:mb-0 flex-shrink-0"
              />
              <div className="flex-grow text-center sm:text-left w-full">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{setDetails.name}</h1>
                  <p className="text-md text-muted-foreground">{setDetails.series}</p>
                  <p className="text-sm text-muted-foreground">
                    Released: {new Date(setDetails.releaseDate).toLocaleDateString()} • {setDetails.total} cards in set
                  </p>
                  {currentUser && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-muted-foreground">Collection Progress:</p>
                        <p className="text-sm font-semibold text-foreground">
                          {collectionProgress.count} / {collectionProgress.total} ({collectionProgress.percentage}%)
                        </p>
                      </div>
                      <Progress value={collectionProgress.percentage} className="h-2" />
                    </div>
                  )}
              </div>
            </div>

            {allCardsLoaded && currentSetMarketValue > 0 && (
              <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Set Value</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(currentSetMarketValue)}
                </p>
                 <p className="text-xs text-muted-foreground">
                    Based on all {setDetails.total} cards
                </p>
              </div>
            )}
            {isLoadingCards && setDetails && (
                 <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Set Value</p>
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto md:mx-0" />
                    <p className="text-xs text-muted-foreground">Calculating...</p>
                 </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-6 p-4 border rounded-lg bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-grow w-full">
            <Input 
              type="text" 
              placeholder="Search cards by name or number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 h-10 text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {renderSortButton('number', 'Number', <GripVertical className="h-3.5 w-3.5" />)}
            {renderSortButton('price', 'Price', <Tag className="h-3.5 w-3.5" />)}
            {renderSortButton('name', 'Name', <BarChart3 className="h-3.5 w-3.5" />)}
          </div>
        </div>
      </div>
      
      {error && setDetails && <p className="text-red-500 text-center mb-4">{error}</p>}

      {isLoadingCards && setDetails && (
         <div className="w-full flex items-center justify-center py-10">
          <p className="text-muted-foreground mr-2">Loading all {setDetails?.total || ''} cards for the set...</p>
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      {!isLoadingCards && setDetails && (
        filteredAndSortedCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAndSortedCards.map((card) => (
              <SetCardView
                key={card.id}
                card={card}
                currentUser={currentUser}
                isOwned={isCardInCollection(card.id)}
                onAddToCollection={handleAddToCollection}
              />
            ))}
          </div>
        ) : (
          (searchTerm || allCardsInSet.length > 0 || !error) &&
          <p className="text-center text-muted-foreground py-10">No cards match your search criteria in this set.</p>
        )
      )}
      
      {!isLoadingCards && !isLoadingSet && allCardsInSet.length === 0 && setDetails && !error && (
         <p className="text-center text-muted-foreground py-10">No cards found in this set.</p>
      )}
    </div>
  );
}