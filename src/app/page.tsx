'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomePage from '@/components/customer/HomePage';
import ProductsPage from '@/components/customer/ProductsPage';
import ProductDetailPage from '@/components/customer/ProductDetailPage';
import CartPage from '@/components/customer/CartPage';
import WishlistPage from '@/components/customer/WishlistPage';
import CheckoutPage from '@/components/customer/CheckoutPage';
import OrdersPage from '@/components/customer/OrdersPage';
import OrderDetailPage from '@/components/customer/OrderDetailPage';
import LoginPage from '@/components/customer/LoginPage';
import RegisterPage from '@/components/customer/RegisterPage';
import AdminLayout from '@/components/admin/AdminLayout';

function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function Home() {
  const { currentPage } = useUIStore();
  const { user, checkAuth } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();

  // Initialize auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch cart and wishlist when user logs in
  useEffect(() => {
    if (user?.id) {
      fetchCart(user.id);
      fetchWishlist(user.id);
    }
  }, [user?.id, fetchCart, fetchWishlist]);

  // Check if current page is an admin page
  const isAdminPage = currentPage.startsWith('admin-');

  // Render admin layout for admin pages
  if (isAdminPage) {
    return <AdminLayout />;
  }

  // Render customer pages
  const renderCustomerPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'products':
        return <ProductsPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'cart':
        return <CartPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'orders':
        return <OrdersPage />;
      case 'order-detail':
        return <OrderDetailPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      default:
        return <HomePage />;
    }
  };

  return <CustomerLayout>{renderCustomerPage()}</CustomerLayout>;
}
