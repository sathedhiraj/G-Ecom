'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ShoppingCart,
  Heart,
  Search,
  User,
  Menu,
  Package,
  LogOut,
  LayoutDashboard,
  Home,
  ChevronDown,
} from 'lucide-react';
import { Category } from '@/types';

export default function Header() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const { getItemCount, fetchCart } = useCartStore();
  const cartCount = getItemCount();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();
  const wishlistCount = wishlistItems.length;
  const { navigate, setProductFilters } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchCart(user.id);
      fetchWishlist(user.id);
    }
  }, [user, fetchCart, fetchWishlist]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || data || []))
      .catch(() => {});
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setProductFilters({ search: searchQuery.trim() });
      navigate('products');
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    setProductFilters({ category: categorySlug });
    navigate('products');
  };

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#2874f0] shadow-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center gap-4">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex h-full flex-col">
                <div className="bg-[#2874f0] p-4">
                  <h2 className="text-xl font-bold text-white">G-Ecom</h2>
                  {isLoggedIn && user && (
                    <p className="mt-1 text-sm text-blue-100">Hello, {user.name}</p>
                  )}
                </div>
                <nav className="flex-1 space-y-1 p-4">
                  <button
                    onClick={() => { navigate('home'); setMobileMenuOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <Home className="h-4 w-4" /> Home
                  </button>
                  <button
                    onClick={() => { navigate('products'); setMobileMenuOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <Package className="h-4 w-4" /> All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { handleCategoryClick(cat.slug); setMobileMenuOpen(false); }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 pl-9"
                    >
                      {cat.name}
                    </button>
                  ))}
                  <div className="my-2 border-t" />
                  {isLoggedIn ? (
                    <>
                      <button
                        onClick={() => { navigate('orders'); setMobileMenuOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <Package className="h-4 w-4" /> My Orders
                      </button>
                      <button
                        onClick={() => { navigate('wishlist'); setMobileMenuOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <Heart className="h-4 w-4" /> Wishlist
                      </button>
                      <button
                        onClick={() => { navigate('cart'); setMobileMenuOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <ShoppingCart className="h-4 w-4" /> Cart
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => { navigate('admin-dashboard'); setMobileMenuOpen(false); }}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { navigate('login'); setMobileMenuOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4" /> Login
                      </button>
                      <button
                        onClick={() => { navigate('register'); setMobileMenuOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4" /> Register
                      </button>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex-shrink-0 text-xl font-bold text-white"
          >
            G-Ecom
          </button>

          {/* Search Bar - hidden on small screens */}
          <div className="hidden flex-1 md:flex md:max-w-lg lg:max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-9 w-full rounded-md border-0 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('home')}
              className="text-sm font-medium text-white hover:bg-white/10"
            >
              Home
            </Button>

            {/* Products dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-white hover:bg-white/10"
                >
                  Products <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => { setProductFilters({ category: '' }); navigate('products'); }}>
                  All Products
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.id} onClick={() => handleCategoryClick(cat.slug)}>
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right Side Actions */}
          <div className="ml-auto flex items-center gap-1">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 md:hidden"
              onClick={() => {
                if (searchInputRef.current) {
                  searchInputRef.current.scrollIntoView({ behavior: 'smooth' });
                }
                // Toggle a mobile search - just navigate to products with search
                handleSearch();
              }}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('wishlist')}
              className="relative text-white hover:bg-white/10"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-[#ff9f00] text-[10px] font-bold text-white px-1">
                  {wishlistCount}
                </Badge>
              )}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('cart')}
              className="relative text-white hover:bg-white/10"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-[#ff9f00] text-[10px] font-bold text-white px-1">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 text-white hover:bg-white/10">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-[#ff9f00] text-xs text-white">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium lg:inline">{user.name.split(' ')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('orders')}>
                    <Package className="mr-2 h-4 w-4" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('wishlist')}>
                    <Heart className="mr-2 h-4 w-4" /> Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('profile')}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('admin-dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-1 sm:flex">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('login')}
                  className="text-sm font-medium text-white hover:bg-white/10"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('register')}
                  className="bg-white text-sm font-medium text-[#2874f0] hover:bg-gray-100"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar (below main nav) */}
        <div className="pb-2 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-8 w-full rounded-md border-0 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
