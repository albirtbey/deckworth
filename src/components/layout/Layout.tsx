import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';
import { Footer } from './Footer';
import { Card as CardType, User } from '../../types';

interface LayoutProps {
  wishlist: CardType[];
  currentUser: User | null;
  onLogout: () => void;
}

export function Layout({ wishlist, currentUser, onLogout }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar wishlistCount={wishlist.length} currentUser={currentUser} onLogout={onLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}