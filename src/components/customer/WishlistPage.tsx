'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Heart, ShoppingCart, Trash2 } from 'lucide-react';

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function calcDiscount(price: number, comparePrice?: number) {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export default function WishlistPage() {
  const { navigate } = useUIStore();
  const { user, isLoggedIn } = useAuthStore();
  const { addItem } = useCartStore();
  const { items, isLoading, fetchWishlist, removeItem } = useWishlistStore();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWishlist(user.id);
    }
  }, [user, fetchWishlist]);

  const handleAddToCart = async (productId: string, productName: string) => {
    if (!user) return;
    await addItem(user.id, productId);
    toast({ title: 'Added to cart', description: `${productName} has been added to your cart` });
  };

  const handleRemove = async (itemId: string, productName: string) => {
    await removeItem(itemId);
    toast({ title: 'Removed', description: `${productName} removed from wishlist` });
  };

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Heart className="h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-600">Please log in to view your wishlist</h3>
        <Button onClick={() => navigate('login')} className="mt-4 bg-[#2874f0] text-white hover:bg-[#1a5dc8]">
          Login
        </Button>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-3">
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="mb-1 h-5 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Heart className="h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-600">Your wishlist is empty</h3>
        <p className="mt-1 text-sm text-gray-400">Save items you love for later</p>
        <Button onClick={() => navigate('products')} className="mt-4 bg-[#2874f0] text-white hover:bg-[#1a5dc8]">
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          My Wishlist <span className="text-base font-normal text-gray-500">({items.length} item{items.length !== 1 ? 's' : ''})</span>
        </h1>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const discount = calcDiscount(item.product.price, item.product.comparePrice);
            const image = item.product.images?.split(',')[0] || '/placeholder.png';

            return (
              <Card
                key={item.id}
                className="group overflow-hidden border border-gray-200 transition-shadow hover:shadow-lg"
              >
                <div
                  className="relative cursor-pointer aspect-square overflow-hidden bg-gray-50"
                  onClick={() => navigate('product-detail', { productId: item.productId })}
                >
                  <img
                    src={image}
                    alt={item.product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  {discount > 0 && (
                    <Badge className="absolute left-2 top-2 bg-[#ff9f00] text-xs font-semibold text-white hover:bg-[#ff9f00]">
                      {discount}% OFF
                    </Badge>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(item.id, item.product.name); }}
                    className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 shadow-sm transition-colors hover:bg-white"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
                <CardContent className="p-3">
                  <button
                    onClick={() => navigate('product-detail', { productId: item.productId })}
                    className="text-left"
                  >
                    <h3 className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-[#2874f0]">
                      {item.product.name}
                    </h3>
                  </button>
                  {item.product.brand && (
                    <p className="mt-0.5 text-xs text-gray-500">{item.product.brand}</p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-base font-bold text-gray-900">{formatPrice(item.product.price)}</span>
                    {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                      <span className="text-sm text-gray-400 line-through">{formatPrice(item.product.comparePrice)}</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="inline-flex items-center gap-0.5 rounded bg-green-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                      {item.product.rating.toFixed(1)} <Star className="h-2.5 w-2.5 fill-white" />
                    </span>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(item.productId, item.product.name)}
                    size="sm"
                    className="mt-3 w-full bg-[#ff9f00] text-white hover:bg-[#e89100]"
                  >
                    <ShoppingCart className="mr-1 h-3.5 w-3.5" /> Add to Cart
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
