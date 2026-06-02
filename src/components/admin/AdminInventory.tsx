'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Warehouse,
  Search,
  Minus,
  Plus,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';

function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

type StockFilter = 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export default function AdminInventory() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<StockFilter>('ALL');
  const [sortAsc, setSortAsc] = useState(true);
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateStock = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    try {
      setUpdatingStock(productId);
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
        toast({ title: 'Stock updated', description: `Stock updated to ${newStock}` });
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update stock', variant: 'destructive' });
    } finally {
      setUpdatingStock(null);
    }
  };

  // Compute stock stats from current products list
  const allProducts = products;
  const inStock = allProducts.filter((p) => p.stock > 10);
  const lowStock = allProducts.filter((p) => p.stock > 0 && p.stock <= 10);
  const outOfStock = allProducts.filter((p) => p.stock === 0);

  // Filter products
  const filteredProducts = allProducts
    .filter((product) => {
      switch (activeTab) {
        case 'IN_STOCK':
          return product.stock > 10;
        case 'LOW_STOCK':
          return product.stock > 0 && product.stock <= 10;
        case 'OUT_OF_STOCK':
          return product.stock === 0;
        default:
          return true;
      }
    })
    .sort((a, b) => (sortAsc ? a.stock - b.stock : b.stock - a.stock));

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge className="bg-red-100 text-red-700">Out of Stock</Badge>;
    }
    if (stock <= 10) {
      return <Badge className="bg-yellow-100 text-yellow-700">Low Stock</Badge>;
    }
    return <Badge className="bg-emerald-100 text-emerald-700">In Stock</Badge>;
  };

  const statsCards = [
    {
      title: 'Total Products',
      value: allProducts.length,
      icon: Package,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
    {
      title: 'In Stock',
      value: inStock.length,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Low Stock',
      value: lowStock.length,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Out of Stock',
      value: outOfStock.length,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stock Overview Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{card.title}</p>
                    <p className="text-xl font-bold">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortAsc(!sortAsc)}
        >
          {sortAsc ? '↑ Stock: Low to High' : '↓ Stock: High to Low'}
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StockFilter)}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="IN_STOCK">In Stock</TabsTrigger>
          <TabsTrigger value="LOW_STOCK">Low Stock</TabsTrigger>
          <TabsTrigger value="OUT_OF_STOCK">Out of Stock</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Warehouse className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">No products match the current filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Quick Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          {product.brand && (
                            <p className="text-xs text-gray-500">{product.brand}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {product.category?.name || '-'}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-bold ${
                          product.stock === 0
                            ? 'text-red-600'
                            : product.stock <= 10
                            ? 'text-yellow-600'
                            : 'text-gray-900'
                        }`}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>{getStockBadge(product.stock)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateStock(product.id, product.stock - 1)}
                            disabled={product.stock <= 0 || updatingStock === product.id}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={product.stock}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val >= 0) {
                                updateStock(product.id, val);
                              }
                            }}
                            className="h-7 w-16 text-center text-sm"
                            disabled={updatingStock === product.id}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateStock(product.id, product.stock + 1)}
                            disabled={updatingStock === product.id}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
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
