import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PokemonSet, CollectionCard, User } from '../types/index';
import { fetchPokemonSets } from '../lib/api';
import { debounce } from 'lodash';
import { Link } from 'react-router-dom';
import { Progress } from '../components/ui/progress';

interface SetsPageProps {
  currentUser: User | null;
  collection: CollectionCard[];
}

export function SetsPage({ currentUser, collection }: SetsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [allFetchedSets, setAllFetchedSets] = useState<PokemonSet[]>([]);
  const [displayedSets, setDisplayedSets] = useState<PokemonSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<PokemonSet[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'standard' | 'expanded' | 'unlimited' | ''>('');

  const einzigartigeSerien = useMemo(() => {
    const series = new Set(allFetchedSets.map(s => s.series));
    return Array.from(series).sort();
  }, [allFetchedSets]);

  const einzigartigeJahre = useMemo(() => {
    const years = new Set(allFetchedSets.map(s => new Date(s.releaseDate).getFullYear().toString()));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [allFetchedSets]);

  const loadSetsData = async (params: { nameQuery?: string; series?: string; releaseYear?: string; format?: any; initialLoad?: boolean }) => {
    const { nameQuery, series, releaseYear, format, initialLoad } = params;
    if (initialLoad) {
      setIsLoading(true);
    } else {
      setIsSearching(true);
    }
    try {
      const fetchedSets = await fetchPokemonSets({
        nameQuery: nameQuery, 
        series: series,
        releaseYear: releaseYear,
        format: format,
      });
      if (initialLoad) {
        setAllFetchedSets(fetchedSets);
      }
      setDisplayedSets(fetchedSets);
      if (!nameQuery && !series && !releaseYear && !format) {
        setSuggestions(fetchedSets.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading sets:', error);
      setDisplayedSets([]);
      if (initialLoad) setAllFetchedSets([]);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    loadSetsData({ initialLoad: true });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!searchQuery && !selectedSeries && !selectedYear && !selectedFormat) {
        loadSetsData({ initialLoad: true });
      } else {
        debouncedFilterAndSearch();
      }
    }
  }, [searchQuery, selectedSeries, selectedYear, selectedFormat]);

  const debouncedFilterAndSearch = useCallback(
    debounce(() => {
      loadSetsData({
        nameQuery: searchQuery,
        series: selectedSeries,
        releaseYear: selectedYear,
        format: selectedFormat,
        initialLoad: false
      });
      if (searchQuery) {
        const filteredSuggestions = allFetchedSets
          .filter(set => set.name.toLowerCase().includes(searchQuery.toLowerCase()) || set.series.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 5);
        setSuggestions(filteredSuggestions);
      } else {
        setSuggestions(allFetchedSets.slice(0,5));
      }
    }, 700),
    [searchQuery, selectedSeries, selectedYear, selectedFormat, allFetchedSets]
  );
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === '') {
      setSuggestions(allFetchedSets.slice(0, 5));
      if (!selectedSeries && !selectedYear && !selectedFormat) {
        loadSetsData({ initialLoad: true });
      } 
    } else {
    }
  };
  
  const handleSuggestionClick = (suggestion: PokemonSet) => {
    setSearchQuery(suggestion.name);
    setSuggestions([]);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSeries('');
    setSelectedYear('');
    setSelectedFormat('');
    setShowFilters(false);
  };
  
  const displayedSetsToRender = displayedSets;

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pokémon TCG Sets</h1>
          <p className="text-muted-foreground mt-1">
            Browse and explore all Pokémon Trading Card Game sets
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sets by name or series..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="pl-9"
              autoComplete="off"
            />
            { (isSearching && suggestions.length > 0) && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
            )}
            {suggestions.length > 0 && searchQuery.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="px-4 py-2 hover:bg-muted cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.name} ({suggestion.series})
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 border rounded-md bg-card items-end">
            <div>
              <label htmlFor="seriesFilter" className="block text-sm font-medium mb-1">Series</label>
              <select id="seriesFilter" className="input" value={selectedSeries} onChange={(e) => setSelectedSeries(e.target.value)}>
                <option value="">All Series</option>
                {einzigartigeSerien.map(series => <option key={series} value={series}>{series}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="yearFilter" className="block text-sm font-medium mb-1">Year</label>
              <select id="yearFilter" className="input" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="">All Years</option>
                {einzigartigeJahre.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="formatFilter" className="block text-sm font-medium mb-1">Format</label>
              <select id="formatFilter" className="input" value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value as any)}>
                <option value="">Any Format</option>
                <option value="standard">Standard</option>
                <option value="expanded">Expanded</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
            <div>
              <Button variant="ghost" onClick={handleClearFilters} className="w-full">Clear Filters</Button>
            </div>
          </div>
        )}
      </div>

      {(isLoading && displayedSetsToRender.length === 0) ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
        </div>
      ) : isSearching ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin" /> 
        </div>
      ) : displayedSetsToRender.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedSets.map((set) => {
            let progress = null;
            if (currentUser && collection) {
              const cardsInSet = collection.filter(card => card.set.id === set.id);
              const count = cardsInSet.length;
              const total = set.total;
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              progress = (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Completed: {count} / {total} ({percentage}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            }
            return (
              <Link to={`/set/${set.id}`} key={set.id} className="block hover:no-underline group">
                <div className="border rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden bg-card text-card-foreground h-full flex flex-col">
                  <div className="p-4 bg-muted/30 flex justify-center items-center h-40">
                    <img src={set.images.logo} alt={`${set.name} logo`} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200" />
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{set.name}</h3>
                      <p className="text-sm text-muted-foreground">Series: {set.series}</p>
                      <p className="text-sm text-muted-foreground">Total Cards: {set.total}</p>
                    </div>
                    {progress}
                    <p className="text-xs text-muted-foreground mt-2 self-start">Released: {new Date(set.releaseDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No sets found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filters, or no sets match your criteria.
          </p>
        </div>
      )}
    </div>
  );
}