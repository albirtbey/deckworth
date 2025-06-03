import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowDownUp, TrendingUp, Search, Heart, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PokemonCard } from '../components/cards/PokemonCard';
import { TradeListing } from '../components/cards/TradeListing';
import { ApiCard, TradeListing as TradeListingType } from '../types';
import { fetchPokemonCards } from '../lib/api';
import { generateMockTradeListings, mockUsers } from '../data/mock-data';

export function HomePage() {
  const [featuredCards, setFeaturedCards] = useState<ApiCard[]>([]);
  const [activeListings, setActiveListings] = useState<TradeListingType[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [isLoadingTrades, setIsLoadingTrades] = useState(true);

  useEffect(() => {
    const loadFeaturedCards = async () => {
      setIsLoadingFeatured(true);
      try {
        const cards = await fetchPokemonCards('Pikachu OR Charizard OR Eevee OR Greninja', 1, 4);
        setFeaturedCards(cards);

        if (cards.length > 0 && mockUsers.length > 0) {
          const mockTrades = generateMockTradeListings(cards, Math.min(cards.length, 3))
            .filter(listing => listing.status === 'Active');
          setActiveListings(mockTrades);
        }

      } catch (error) {
        console.error('Error fetching featured cards:', error);
        setFeaturedCards([]);
      } finally {
        setIsLoadingFeatured(false);
        setIsLoadingTrades(false);
      }
    };
    loadFeaturedCards();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container py-12 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
              Trade and Collect <br />Pokémon Cards <br />Like Never Before
            </h1>
            <p className="mt-4 md:text-lg opacity-90 animate-slide-up">
              PokéTrade Hub is the ultimate platform for Pokémon TCG enthusiasts. 
              Manage your collection, trade with other collectors, and stay on top 
              of market values—all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 animate-slide-up">
              <Link to="/register">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-700">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="white" d="M47.7,-61.1C59.9,-51.1,66.2,-33.4,70.7,-15.2C75.2,3,77.9,21.5,71.1,36.5C64.4,51.5,48.3,62.9,30.9,69.2C13.6,75.4,-5.1,76.4,-22,71.3C-38.9,66.3,-54,55.2,-65.1,39.9C-76.3,24.6,-83.5,5,-79.8,-12.2C-76.1,-29.4,-61.4,-44.2,-45.7,-53.5C-29.9,-62.8,-13.2,-66.8,2.9,-70.5C19,-74.2,35.5,-71.1,47.7,-61.1Z" transform="translate(100 100)" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container">
          <h2 className="text-center text-3xl md:text-4xl font-bold">Everything You Need in One Platform</h2>
          <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
            PokéTrade Hub combines collection management, trading, and market analytics to create
            the ultimate Pokémon TCG experience.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-card hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Collection Management</h3>
              <p className="text-muted-foreground">
                Organize your cards, track their value, and manage your entire collection with ease.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-card hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 mb-4">
                <ArrowDownUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">P2P Trading</h3>
              <p className="text-muted-foreground">
                Connect with other collectors and trade cards safely and securely.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-card hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center text-accent-600 mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Market Valuation</h3>
              <p className="text-muted-foreground">
                Stay updated on card values and track your collection's worth over time.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-card hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wishlist</h3>
              <p className="text-muted-foreground">
                Keep track of cards you want and get notified when they become available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cards Section */}
      <section className="py-12 bg-muted">
        <div className="container">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Cards</h2>
            <Link to="/search" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              <Search className="h-4 w-4 mr-1" />
              Search All Cards
            </Link>
          </div>
          
          {isLoadingFeatured ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
            </div>
          ) : featuredCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {featuredCards.map((card) => (
              <PokemonCard key={card.id} card={card} />
            ))}
          </div>
          ) : (
            <p className="text-center text-muted-foreground">Could not load featured cards.</p>
          )}
        </div>
      </section>

      {/* Recent Trades Section */}
      <section className="py-12 bg-background">
        <div className="container">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Trade Listings</h2>
            <Link to="/trades" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View All Trades
            </Link>
          </div>
          
          {isLoadingTrades ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
            </div>
          ) : activeListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeListings.map((listing) => (
              <TradeListing key={listing.id} listing={listing} />
            ))}
          </div>
          ) : (
            <p className="text-center text-muted-foreground">No active trade listings at the moment. Check back soon!</p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-primary-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900">Ready to Start Your Trading Journey?</h2>
            <p className="mt-4 text-primary-800">
              Join thousands of Pokémon TCG enthusiasts on PokéTrade Hub. Create your account today
              and start managing your collection, trading cards, and connecting with other collectors.
            </p>
            <div className="mt-8">
              <Link to="/register">
                <Button size="lg" className="px-8">
                  Sign Up for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}