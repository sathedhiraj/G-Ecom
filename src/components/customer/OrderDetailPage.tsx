'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, CreditCard, Package } from 'lucide-react';
import BackButton from '@/components/layout/BackButton';
import type { Order } from '@/types';

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
  SHIPPED: 'bg-purple-100 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-blue-100 text-blue-700',
};

const paymentMethodLabels: Record<string, string> = {
  COD: 'Cash on Delivery',
  CARD: 'Credit / Debit Card',
  UPI: 'UPI',
  NETBANKING: 'Net Banking',
};

export default function OrderDetailPage() {
  const { selectedOrderId, navigate } = useUIStore();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrderId) return;
    let cancelled = false;
    const loadOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${selectedOrderId}`);
        const data = await res.json();
        if (!cancelled) setOrder(data.order || data);
      } catch {
        if (!cancelled) toast({ title: 'Error', description: 'Failed to load order details', variant: 'destructive' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadOrder();
    return () => { cancelled = true; };
  }, [selectedOrderId, toast]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Package className="h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-600">Order not found</h3>
        <Button onClick={() => navigate('orders')} variant="outline" className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <BackButton fallbackPage="orders" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <Badge variant="outline" className={`ml-auto ${statusColors[order.status] || ''}`}>
            {order.status}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-[#2874f0]" />
                Items ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items?.map((item) => {
                  const image = item.product?.images?.split(',')[0] || '/placeholder.png';
                  return (
                    <div key={item.id} className="flex gap-4 border-b pb-3 last:border-0 last:pb-0">
                      <button
                        onClick={() => item.product && navigate('product-detail', { productId: item.productId })}
                        className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-50"
                      >
                        <img src={image} alt={item.product?.name || 'Product'} className="h-full w-full object-cover" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => item.product && navigate('product-detail', { productId: item.productId })}
                          className="text-sm font-medium text-gray-900 hover:text-[#2874f0] text-left line-clamp-1"
                        >
                          {item.product?.name || 'Product'}
                        </button>
                        <p className="mt-0.5 text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatPrice(item.price)}</p>
                        <p className="text-xs text-gray-500">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-[#2874f0]" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700">
                <p>{order.shippingStreet}</p>
                <p>{order.shippingCity}, {order.shippingState} - {order.shippingZipCode}</p>
                <p>{order.shippingCountry}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-[#2874f0]" /> Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                  </p>
                  <p className="text-xs text-gray-500">Payment Status</p>
                </div>
                <Badge className={paymentStatusColors[order.paymentStatus] || ''}>
                  {order.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <span className="text-green-600">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className={order.shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax (18% GST)</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              {order.couponCode && (
                <p className="text-xs text-gray-400">Coupon applied: {order.couponCode}</p>
              )}
            </CardContent>
          </Card>

          {/* Back Button */}
          <Button
            onClick={() => navigate('orders')}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Orders
          </Button>
        </div>
      </div>
    </div>
  );
}
