'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Star,
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  X,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import BackButton from '@/components/layout/BackButton';
import type { Product, Category } from '@/types';

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function calcDiscount(price: number, comparePrice?: number) {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export default function ProductsPage() {
  const { navigate, productFilters, setProductFilters, resetProductFilters } = useUIStore();
  const { user, isLoggedIn } = useAuthStore();
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  // Local filter state for the UI
  const [localSearch, setLocalSearch] = useState(productFilters.search || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    productFilters.minPrice ?? 0,
    productFilters.maxPrice ?? 100000,
  ]);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || data || []))
      .catch(() => {});
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (productFilters.search) params.set('search', productFilters.search);
        if (productFilters.category) params.set('category', productFilters.category);
        if (productFilters.brand) params.set('brand', productFilters.brand);
        if (productFilters.minPrice !== null) params.set('minPrice', String(productFilters.minPrice));
        if (productFilters.maxPrice !== null) params.set('maxPrice', String(productFilters.maxPrice));
        if (productFilters.rating !== null) params.set('rating', String(productFilters.rating));
        if (productFilters.sort) params.set('sort', productFilters.sort);
        params.set('page', String(page));
        params.set('limit', String(limit));

        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setTotalProducts(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [productFilters, page]);

  // Extract unique brands from products
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandSet.add(p.brand);
    });
    return Array.from(brandSet).sort();
  }, [products]);

  const handleSearch = () => {
    setProductFilters({ search: localSearch });
    setPage(1);
  };

  const handleCategoryChange = (slug: string, checked: boolean) => {
    setProductFilters({ category: checked ? slug : '' });
    setPage(1);
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    setProductFilters({ brand: checked ? brand : '' });
    setPage(1);
  };

  const handleRatingFilter = (rating: number) => {
    setProductFilters({ rating: productFilters.rating === rating ? null : rating });
    setPage(1);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const applyPriceFilter = () => {
    setProductFilters({ minPrice: priceRange[0], maxPrice: priceRange[1] });
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setProductFilters({ sort: value });
    setPage(1);
  };

  const handleClearFilters = () => {
    resetProductFilters();
    setLocalSearch('');
    setPriceRange([0, 100000]);
    setPage(1);
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!isLoggedIn || !user) {
      navigate('login');
      return;
    }
    await addItem(user.id, product.id);
    toast({ title: 'Added to cart', description: `${product.name} has been added to your cart` });
  };

  const handleWishlist = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!isLoggedIn || !user) {
      navigate('login');
      return;
    }
    const inWishlist = isInWishlist(product.id);
    if (inWishlist) {
      const item = useWishlistStore.getState().items.find((i) => i.productId === product.id);
      if (item) await removeFromWishlist(item.id);
      toast({ title: 'Removed from wishlist' });
    } else {
      await addToWishlist(user.id, product.id);
      toast({ title: 'Added to wishlist' });
    }
  };

  const hasActiveFilters = productFilters.search || productFilters.category || productFilters.brand || productFilters.minPrice !== null || productFilters.maxPrice !== null || productFilters.rating !== null;

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-[#2874f0]">
            Clear All
          </Button>
        )}
      </div>

      <Separator />

      {/* Category Filter */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={productFilters.category === cat.slug}
                onCheckedChange={(checked) => handleCategoryChange(cat.slug, !!checked)}
              />
              <span className="text-sm text-gray-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Price Range</h4>
        <div className="px-2">
          <Slider
            min={0}
            max={100000}
            step={500}
            value={priceRange}
            onValueChange={handlePriceChange}
            className="mb-3"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
          <Button size="sm" onClick={applyPriceFilter} className="mt-2 w-full bg-[#2874f0] text-white hover:bg-[#1a5dc8]">
            Apply
          </Button>
        </div>
      </div>

      <Separator />

      {/* Brand Filter */}
      {brands.length > 0 && (
        <>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Brand</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={productFilters.brand === brand}
                    onCheckedChange={(checked) => handleBrandChange(brand, !!checked)}
                  />
                  <span className="text-sm text-gray-700">{brand}</span>
                </label>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Rating Filter */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Customer Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingFilter(rating)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                productFilters.rating === rating ? 'bg-blue-50 text-[#2874f0]' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-0.5">
                {rating}
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
              <span>& above</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-4">
        {/* Top Bar with Back Button, Search & Sort */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <BackButton />
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-4">
                <SheetTitle className="sr-only">Product Filters</SheetTitle>
                <FilterSidebar />
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Showing {products.length} of {totalProducts} products
            </span>
            <Select value={productFilters.sort || 'featured'} onValueChange={handleSortChange}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Active Filters:</span>
            {productFilters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: {productFilters.search}
                <X className="h-3 w-3 cursor-pointer" onClick={() => { setProductFilters({ search: '' }); setLocalSearch(''); }} />
              </Badge>
            )}
            {productFilters.category && (
              <Badge variant="secondary" className="gap-1">
                Category: {categories.find(c => c.slug === productFilters.category)?.name || productFilters.category}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setProductFilters({ category: '' })} />
              </Badge>
            )}
            {productFilters.brand && (
              <Badge variant="secondary" className="gap-1">
                Brand: {productFilters.brand}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setProductFilters({ brand: '' })} />
              </Badge>
            )}
            {productFilters.rating !== null && (
              <Badge variant="secondary" className="gap-1">
                {productFilters.rating}★ & above
                <X className="h-3 w-3 cursor-pointer" onClick={() => setProductFilters({ rating: null })} />
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <Card className="sticky top-20 p-4">
              <FilterSidebar />
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <CardContent className="p-3">
                      <Skeleton className="mb-2 h-4 w-3/4" />
                      <Skeleton className="mb-1 h-3 w-1/2" />
                      <Skeleton className="mb-1 h-5 w-2/3" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Package className="h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-600">No products found</h3>
                <p className="mt-1 text-sm text-gray-400">Try adjusting your filters or search terms</p>
                <Button onClick={handleClearFilters} variant="outline" className="mt-4">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => {
                    const discount = calcDiscount(product.price, product.comparePrice);
                    const inWishlist = isInWishlist(product.id);
                    const image = product.images?.split(',')[0] || '/placeholder.png';

                    return (
                      <Card
                        key={product.id}
                        className="group cursor-pointer overflow-hidden border border-gray-200 transition-shadow hover:shadow-lg"
                        onClick={() => navigate('product-detail', { productId: product.id })}
                      >
                        <div className="relative aspect-square overflow-hidden bg-gray-50">
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                          {discount > 0 && (
                            <Badge className="absolute left-2 top-2 bg-[#ff9f00] text-xs font-semibold text-white hover:bg-[#ff9f00]">
                              {discount}% OFF
                            </Badge>
                          )}
                          <button
                            onClick={(e) => handleWishlist(e, product)}
                            className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 shadow-sm transition-colors hover:bg-white"
                          >
                            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                          </button>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="line-clamp-2 text-sm font-medium text-gray-900">{product.name}</h3>
                          {product.brand && (
                            <p className="mt-0.5 text-xs text-gray-500">{product.brand}</p>
                          )}
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
                            {product.comparePrice && product.comparePrice > product.price && (
                              <span className="text-sm text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="inline-flex items-center gap-0.5 rounded bg-green-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                              {product.rating.toFixed(1)} <Star className="h-2.5 w-2.5 fill-white" />
                            </span>
                            <span className="text-xs text-gray-500">({product.numReviews})</span>
                          </div>
                          <Button
                            onClick={(e) => handleAddToCart(e, product)}
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="px-1 text-gray-400">...</span>
                          )}
                          <Button
                            variant={p === page ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setPage(p)}
                            className={p === page ? 'bg-[#2874f0] text-white hover:bg-[#1a5dc8]' : ''}
                          >
                            {p}
                          </Button>
                        </span>
                      ))}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
