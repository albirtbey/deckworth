import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted mt-auto">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-full bg-primary-600 p-1">
                <div className="h-6 w-6 text-white">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 3V9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 15V21" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              <span className="text-xl font-bold text-primary-600">PokéTrade Hub</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              The ultimate platform for Pokémon TCG collectors and traders.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Explore</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/collection" className="text-sm text-muted-foreground hover:text-foreground">
                  Collection
                </Link>
              </li>
              <li>
                <Link to="/trades" className="text-sm text-muted-foreground hover:text-foreground">
                  Trades
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-sm text-muted-foreground hover:text-foreground">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/market" className="text-sm text-muted-foreground hover:text-foreground">
                  Market Values
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-sm text-muted-foreground hover:text-foreground">
                  Guides
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PokéTrade Hub. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-2 md:mt-0">
            Pokémon and Pokémon TCG are trademarks of Nintendo, Creatures, GAME FREAK, and The Pokémon Company.
            PokéTrade Hub is not affiliated with, endorsed, sponsored, or specifically approved by any of these entities.
          </p>
        </div>
      </div>
    </footer>
  );
}