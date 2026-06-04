export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  featured: boolean;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string; // comma-separated URLs
  categoryId: string;
  brand?: string;
  stock: number;
  rating: number;
  numReviews: number;
  featured: boolean;
  active: boolean;
  category?: Category;
  reviews?: Review[];
}

export interface CartItemType {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItemType[];
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'COD' | 'CARD' | 'UPI' | 'NETBANKING';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZipCode?: string;
  shippingCountry?: string;
  couponCode?: string;
  createdAt: string;
  items: OrderItem[];
  user?: User;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  active: boolean;
  order: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  minPurchase: number;
  maxDiscount?: number;
  active: boolean;
  expiresAt?: string;
  usageLimit?: number;
  usageCount: number;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  user?: User;
}

export type PageRoute =
  | 'home'
  | 'products'
  | 'product-detail'
  | 'cart'
  | 'wishlist'
  | 'checkout'
  | 'orders'
  | 'order-detail'
  | 'login'
  | 'register'
  | 'profile'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-categories'
  | 'admin-orders'
  | 'admin-users'
  | 'admin-banners'
  | 'admin-coupons'
  | 'admin-inventory';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Order[];
  ordersByStatus: Record<string, number>;
  monthlySales: { month: string; revenue: number; orders: number }[];
}
