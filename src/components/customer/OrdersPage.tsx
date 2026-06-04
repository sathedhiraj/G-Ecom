'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import BackButton from '@/components/layout/BackButton';
import type { Order } from '@/types';

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
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

export default function OrdersPage() {
  const { navigate } = useUIStore();
  const { user, isLoggedIn } = useAuthStore();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?userId=${user.id}`);
        const data = await res.json();
        if (!cancelled) {
          setOrders(data.orders || data || []);
        }
      } catch {
        if (!cancelled) {
          toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchOrders();
    return () => { cancelled = true; };
  }, [user, toast]);

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Package className="h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-600">Please log in to view your orders</h3>
        <Button onClick={() => navigate('login')} className="mt-4 bg-[#2874f0] text-white hover:bg-[#1a5dc8]">
          Login
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Package className="h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-600">No orders yet</h3>
        <p className="mt-1 text-sm text-gray-400">Start shopping to see your orders here</p>
        <Button onClick={() => navigate('products')} className="mt-4 bg-[#2874f0] text-white hover:bg-[#1a5dc8]">
          <ShoppingBag className="mr-2 h-4 w-4" /> Shop Now
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items?.length || 0;

            return (
              <Card
                key={order.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => navigate('order-detail', { orderId: order.id })}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium text-gray-500">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <Badge variant="outline" className={statusColors[order.status] || ''}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                      <p className="text-sm text-gray-600">
                        {itemCount} item{itemCount !== 1 ? 's' : ''} &bull; {formatPrice(order.total)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto border-t pt-3">
                      {order.items.slice(0, 4).map((item) => {
                        const image = item.product?.images?.split(',')[0] || '/placeholder.png';
                        return (
                          <img
                            key={item.id}
                            src={image}
                            alt={item.product?.name || 'Product'}
                            className="h-14 w-14 flex-shrink-0 rounded-md border object-cover"
                          />
                        );
                      })}
                      {order.items.length > 4 && (
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md border bg-gray-50 text-xs text-gray-500">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
