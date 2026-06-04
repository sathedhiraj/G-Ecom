'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, Loader2 } from 'lucide-react';
import BackButton from '@/components/layout/BackButton';

export default function LoginPage() {
  const { navigate } = useUIStore();
  const { login, isLoading } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);

    if (success) {
      // Fetch cart and wishlist after login
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        fetchCart(userId);
        fetchWishlist(userId);
      }
      navigate('home');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton />
        </div>
        <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#2874f0]">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Log in to your G-Ecom account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full bg-[#2874f0] py-5 text-base font-semibold text-white hover:bg-[#1a5dc8]"
            >
              {submitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('register')}
                className="font-medium text-[#2874f0] hover:underline"
              >
                Register
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
