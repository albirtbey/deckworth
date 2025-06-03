import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, User as UserIcon, LogOut, Heart, Settings, BookOpen, Library, ArrowDownUp, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/Button';
import { User as UserType } from '../../types';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface NavBarProps {
  wishlistCount: number;
  currentUser: UserType | null;
  onLogout: () => void;
}

export function NavBar({ wishlistCount, currentUser, onLogout }: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : prevTheme === 'dark' ? 'system' : 'light');
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="h-5 w-5" />;
    if (theme === 'dark') return <Moon className="h-5 w-5" />;
    return <Sun className="h-5 w-5" />;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogoutClick = () => {
    onLogout();
    closeMenu();
    navigate('/');
  };

  const navLinkClass = (path: string) =>
    `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary ${
      isActive(path) ? 'text-primary bg-muted' : 'text-muted-foreground'
    }`;

  const mobileNavLinkClass = (path: string) =>
    `flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
      isActive(path) 
        ? 'bg-primary text-primary-foreground' 
        : 'text-foreground hover:bg-muted'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <div className="rounded-full bg-primary p-1">
              <div className="h-6 w-6 text-primary-foreground">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 3V9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 15V21" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold text-foreground">PokéTrade Hub</span>
          </Link>
        </div>

        <nav className="hidden md:flex flex-1 items-center justify-center gap-x-2 lg:gap-x-4 xl:gap-x-6">
          <NavLink to="/collection" className={navLinkClass('/collection')} onClick={closeMenu}>
            <BookOpen className="w-4 h-4 mr-2" />
            Collection
          </NavLink>
          <NavLink to="/sets" className={navLinkClass('/sets')} onClick={closeMenu}>
            <Library className="w-4 h-4 mr-2" />
            Sets
          </NavLink>
          <NavLink to="/trades" className={navLinkClass('/trades')} onClick={closeMenu}>
            <ArrowDownUp className="w-4 h-4 mr-2" />
            Trade Center
          </NavLink>
          <NavLink to="/wishlist" className={navLinkClass('/wishlist')} onClick={closeMenu}>
            <Heart className="w-4 h-4 mr-2" />
            Wishlist {wishlistCount > 0 && <span className="ml-1 text-xs">({wishlistCount})</span>}
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="hidden md:inline-flex">
            {getThemeIcon()}
          </Button>

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
                    <AvatarFallback>{currentUser.username.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/profile"><UserIcon className="mr-2 h-4 w-4" /><span>Profile</span></Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/my-trades"><ShoppingBag className="mr-2 h-4 w-4" /><span>My Trades</span></Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/settings"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogoutClick}><LogOut className="mr-2 h-4 w-4" /><span>Log out</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" asChild><Link to="/login">Log In</Link></Button>
              <Button size="sm" asChild><Link to="/register">Sign Up</Link></Button>
            </div>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border">
          <nav className="space-y-1 px-2 py-3">
            <NavLink to="/collection" className={mobileNavLinkClass('/collection')} onClick={closeMenu}>
              <BookOpen className="w-5 h-5 mr-3" />Collection
            </NavLink>
            <NavLink to="/sets" className={mobileNavLinkClass('/sets')} onClick={closeMenu}>
              <Library className="w-5 h-5 mr-3" />Sets
            </NavLink>
            <NavLink to="/trades" className={mobileNavLinkClass('/trades')} onClick={closeMenu}>
              <ArrowDownUp className="w-5 h-5 mr-3" />Trade Center
            </NavLink>
            <NavLink to="/wishlist" className={mobileNavLinkClass('/wishlist')} onClick={closeMenu}>
              <Heart className="w-5 h-5 mr-3" />Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </NavLink>
            
            <div className="pt-4 pb-2 border-t border-border mt-2">
              {currentUser ? (
                <>
                  <NavLink to="/profile" className={mobileNavLinkClass('/profile')} onClick={closeMenu}>
                    <UserIcon className="w-5 h-5 mr-3" />Profile
                  </NavLink>
                  <NavLink to="/my-trades" className={mobileNavLinkClass('/my-trades')} onClick={closeMenu}>
                    <ShoppingBag className="w-5 h-5 mr-3" />My Trades
                  </NavLink>
                  <NavLink to="/settings" className={mobileNavLinkClass('/settings')} onClick={closeMenu}>
                    <Settings className="w-5 h-5 mr-3" />Settings
                  </NavLink>
                   <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="w-full justify-start mt-2 px-3 py-2 text-base font-medium rounded-md text-foreground hover:bg-muted">
                    {getThemeIcon()} <span className="ml-3">Toggle Theme</span>
                  </Button>
                  <button 
                    onClick={handleLogoutClick}
                    className={`${mobileNavLinkClass('logout')} w-full text-left mt-1`}
                  >
                    <LogOut className="w-5 h-5 mr-3" />Log out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button variant="outline" asChild className="w-full justify-center" onClick={closeMenu}><Link to="/login"><UserIcon className="mr-2 h-4 w-4" />Log In</Link></Button>
                  <Button asChild className="w-full justify-center" onClick={closeMenu}><Link to="/register">Sign Up</Link></Button>
                   <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="w-full justify-start mt-2 px-3 py-2 text-base font-medium rounded-md text-foreground hover:bg-muted">
                    {getThemeIcon()} <span className="ml-3">Toggle Theme</span>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}