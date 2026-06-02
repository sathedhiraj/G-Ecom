'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  ordersByStatus: Record<string, number>;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    user?: { name: string; email: string };
  }>;
  monthlySales: Array<{ month: string; sales: number; orders: number }>;
  topCategories: Array<{ id: string; name: string; productCount: number }>;
}

const CHART_COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const paymentColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-orange-100 text-orange-700',
};

function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          Failed to load dashboard statistics. Please try again later.
        </CardContent>
      </Card>
    );
  }

  const pieData = Object.entries(stats.ordersByStatus || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      change: '+12.5%',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString('en-IN'),
      icon: ShoppingCart,
      change: '+8.2%',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString('en-IN'),
      icon: Users,
      change: '+5.1%',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString('en-IN'),
      icon: Package,
      change: '+3.4%',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-500">{card.change}</span>
                      <span className="text-xs text-gray-400">vs last month</span>
                    </div>
                  </div>
                  <div className={`rounded-xl p-3 ${card.bg}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => formatPrice(value)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Top Categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No orders yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.user?.name || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusColors[order.status] || ''}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={paymentColors[order.paymentStatus] || ''}
                          >
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topCategories.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-8">No categories yet</p>
              ) : (
                stats.topCategories.map((category, index) => (
                  <div key={category.id} className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {category.productCount} products
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
