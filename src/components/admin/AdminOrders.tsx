'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';

function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

interface AdminOrder extends Order {
  user?: { id: string; name: string; email: string; avatar?: string };
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(activeTab !== 'ALL' && { status: activeTab }),
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingStatus(orderId);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast({ title: 'Order updated', description: `Status changed to ${status}` });
        fetchOrders();
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update order', variant: 'destructive' });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) {
        toast({ title: 'Payment updated', description: `Payment status changed to ${paymentStatus}` });
        fetchOrders();
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update payment status', variant: 'destructive' });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
        <TabsList className="flex-wrap h-auto gap-1 bg-gray-100 p-1">
          <TabsTrigger value="ALL" className="text-xs">All</TabsTrigger>
          {ORDER_STATUSES.map((status) => (
            <TabsTrigger key={status} value={status} className="text-xs">
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm">Orders will appear here when customers place them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <Fragment key={order.id}>
                      <TableRow>
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{order.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{order.user?.email || ''}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{order.items?.length || 0}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                            disabled={updatingStatus === order.id}
                          >
                            <SelectTrigger className="h-7 w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s.charAt(0) + s.slice(1).toLowerCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.paymentStatus}
                            onValueChange={(value) => updatePaymentStatus(order.id, value)}
                            disabled={updatingStatus === order.id}
                          >
                            <SelectTrigger className="h-7 w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="COMPLETED">Completed</SelectItem>
                              <SelectItem value="FAILED">Failed</SelectItem>
                              <SelectItem value="REFUNDED">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(order.id)}
                            className="h-8"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {expandedOrder === order.id ? 'Hide' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedOrder === order.id && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50 p-4">
                            <div className="space-y-3">
                              <h4 className="font-medium text-sm">Order Items</h4>
                              <div className="grid gap-2">
                                {order.items?.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-3 rounded-lg bg-white p-3 border"
                                  >
                                    {item.product?.images && (
                                      <img
                                        src={item.product.images.split(',')[0]?.trim()}
                                        alt={item.product?.name}
                                        className="h-10 w-10 rounded object-cover"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {item.product?.name || 'Unknown Product'}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Qty: {item.quantity} × {formatPrice(item.price)}
                                      </p>
                                    </div>
                                    <p className="text-sm font-medium">
                                      {formatPrice(item.price * item.quantity)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-end">
                                <div className="text-sm space-y-1 text-right">
                                  <p>Subtotal: {formatPrice(order.subtotal)}</p>
                                  <p>Tax: {formatPrice(order.tax)}</p>
                                  <p>Shipping: {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</p>
                                  {order.discount > 0 && (
                                    <p className="text-emerald-600">Discount: -{formatPrice(order.discount)}</p>
                                  )}
                                  <p className="font-bold text-base border-t pt-1">
                                    Total: {formatPrice(order.total)}
                                  </p>
                                </div>
                              </div>
                              {order.shippingCity && (
                                <div className="text-sm text-gray-600">
                                  <p className="font-medium">Shipping Address:</p>
                                  <p>
                                    {[order.shippingStreet, order.shippingCity, order.shippingState, order.shippingZipCode]
                                      .filter(Boolean)
                                      .join(', ')}
                                  </p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
