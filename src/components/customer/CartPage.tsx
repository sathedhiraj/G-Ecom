'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Heart,
  Tag,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function CartPage() {
  const { navigate } = useUIStore();
  const { user, isLoggedIn } = useAuthStore();
  const { items, isLoading, fetchCart, updateItem, removeItem, getTotal, getItemCount } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  useEffect(() => {
    if (user) {
      fetchCart(user.id);
    }
  }, [user, fetchCart]);

  const subtotal = getTotal();
  const itemCount = getItemCount();
  const shipping = subtotal > 500 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const discount = items.reduce((acc, item) => {
    if (item.product.comparePrice && item.product.comparePrice > item.product.price) {
      return acc + (item.product.comparePrice - item.product.price) * item.quantity;
    }
    return acc;
  }, 0);
  const total = subtotal - couponDiscount + shipping;

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    await updateItem(itemId, quantity);
  };

  const handleRemove = async (itemId: string, productName: string) => {
    await removeItem(itemId);
    toast({ title: 'Removed', description: `${productName} removed from cart` });
  };

  const handleSaveForLater = async (itemId: string, productId: string) => {
    if (!user) return;
    await addToWishlist(user.id, productId);
    await removeItem(itemId);
    toast({ title: 'Saved for later', description: 'Item moved to wishlist' });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });

      const data = await res.json();
      if (res.ok) {
        setCouponDiscount(data.discountAmount || 0);
        setAppliedCoupon(couponCode);
        toast({ title: 'Coupon applied!', description: `You saved ${formatPrice(data.discountAmount || 0)}` });
      } else {
        setCouponError(data.error || 'Invalid coupon');
        setCouponDiscount(0);
        setAppliedCoupon('');
      }
    } catch {
      setCouponError('Failed to validate coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponDiscount(0);
    setAppliedCoupon('');
    setCouponCode('');
    toast({ title: 'Coupon removed' });
  };

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <ShoppingCart className="h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-600">Please log in to view your cart</h3>
        <Button onClick={() => navigate('login')} className="mt-4 bg-[#2874f0] text-white hover:bg-[#1a5dc8]">
          Login
        </Button>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <ShoppingCart className="h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-600">Your cart is empty</h3>
        <p className="mt-1 text-sm text-gray-400">Add items to your cart to get started</p>
        <Button onClick={() => navigate('products')} className="mt-4 bg-[#2874f0] text-white hover:bg-[#1a5dc8]">
          <ShoppingBag className="mr-2 h-4 w-4" /> Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Shopping Cart <span className="text-base font-normal text-gray-500">({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
        </h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => {
              const image = item.product.images?.split(',')[0] || '/placeholder.png';
              const itemDiscount = item.product.comparePrice && item.product.comparePrice > item.product.price
                ? Math.round(((item.product.comparePrice - item.product.price) / item.product.comparePrice) * 100)
                : 0;

              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <button
                        onClick={() => navigate('product-detail', { productId: item.productId })}
                        className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-50 sm:h-32 sm:w-32"
                      >
                        <img src={image} alt={item.product.name} className="h-full w-full object-cover" />
                      </button>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <button
                            onClick={() => navigate('product-detail', { productId: item.productId })}
                            className="text-sm font-medium text-gray-900 hover:text-[#2874f0] line-clamp-2 text-left"
                          >
                            {item.product.name}
                          </button>
                          {item.product.brand && (
                            <p className="mt-0.5 text-xs text-gray-500">{item.product.brand}</p>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-base font-bold text-gray-900">{formatPrice(item.product.price)}</span>
                            {itemDiscount > 0 && (
                              <>
                                <span className="text-sm text-gray-400 line-through">{formatPrice(item.product.comparePrice!)}</span>
                                <span className="text-sm font-medium text-green-600">{itemDiscount}% off</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          {/* Quantity */}
                          <div className="flex items-center rounded-md border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="flex h-8 w-8 items-center justify-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveForLater(item.id, item.productId)}
                            className="text-[#2874f0] hover:text-[#1a5dc8]"
                          >
                            <Heart className="mr-1 h-3.5 w-3.5" /> Save for Later
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(item.id, item.product.name)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                          </Button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="hidden text-right sm:block">
                        <p className="text-sm text-gray-500">Subtotal</p>
                        <p className="text-base font-bold text-gray-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600">-{formatPrice(discount)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Coupon ({appliedCoupon})</span>
                    <span className="text-green-600">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400">Add {formatPrice(500 - subtotal)} more for free shipping</p>
                )}

                <Separator />

                {/* Coupon */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 p-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">{appliedCoupon}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemoveCoupon} className="text-red-500 h-auto p-0">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                        className="text-sm"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                      >
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <p className="mt-1 text-xs text-red-500">{couponError}</p>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => navigate('checkout')}
                  className="w-full bg-[#fb641b] py-6 text-base font-semibold text-white hover:bg-[#e55a18]"
                >
                  Place Order <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
