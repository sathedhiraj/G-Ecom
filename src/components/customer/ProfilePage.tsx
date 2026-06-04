'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Package,
  Heart,
  ShoppingCart,
  Loader2,
  Save,
  CalendarDays,
} from 'lucide-react';
import BackButton from '@/components/layout/BackButton';

export default function ProfilePage() {
  const { navigate } = useUIStore();
  const { user, isLoggedIn, checkAuth } = useAuthStore();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.street || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [zipCode, setZipCode] = useState(user?.zipCode || '');
  const [country, setCountry] = useState(user?.country || 'India');

  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchStats = async () => {
      try {
        if (user?.id) {
          const [ordersRes, wishlistRes, cartRes] = await Promise.all([
            fetch(`/api/orders?userId=${user.id}`),
            fetch(`/api/wishlist?userId=${user.id}`),
            fetch(`/api/cart?userId=${user.id}`),
          ]);
          const ordersData = await ordersRes.json();
          const wishlistData = await wishlistRes.json();
          const cartData = await cartRes.json();

          setOrderCount(ordersData.orders?.length || 0);
          setWishlistCount(wishlistData.items?.length || 0);
          setCartCount(cartData.items?.length || 0);
        }
      } catch {
        // Silently handle
      }
    };
    fetchStats();
  }, [isLoggedIn, user?.id]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setStreet(user.street || '');
      setCity(user.city || '');
      setState(user.state || '');
      setZipCode(user.zipCode || '');
      setCountry(user.country || 'India');
    }
  }, [user]);

  if (!isLoggedIn || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <User className="h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-600">Please log in to view your profile</h3>
        <Button onClick={() => navigate('login')} className="mt-4 bg-[#2874f0] text-white hover:bg-[#1a5dc8]">
          Login
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: name.trim(),
          phone: phone.trim() || null,
          street: street.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          zipCode: zipCode.trim() || null,
          country: country.trim() || 'India',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await checkAuth(user.id);
        setEditing(false);
        toast({ title: 'Profile updated', description: 'Your profile has been updated successfully' });
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to update profile', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setStreet(user.street || '');
    setCity(user.city || '');
    setState(user.state || '');
    setZipCode(user.zipCode || '');
    setCountry(user.country || 'India');
    setEditing(false);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-3">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-[#2874f0] to-[#1a5dc8] px-6 py-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-white/30">
                  <AvatarFallback className="bg-[#ff9f00] text-2xl font-bold text-white">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="mt-1 text-blue-100">{user.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className={`${user.role === 'ADMIN' ? 'bg-[#ff9f00]' : 'bg-white/20'} text-white hover:${user.role === 'ADMIN' ? 'bg-[#e89100]' : 'bg-white/30'}`}>
                      <Shield className="mr-1 h-3 w-3" />
                      {user.role === 'ADMIN' ? 'Admin' : 'Member'}
                    </Badge>
                    {user.phone && (
                      <span className="text-sm text-blue-100">
                        <Phone className="mr-1 inline h-3 w-3" /> {user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <CardContent className="p-0">
              <div className="grid grid-cols-3 divide-x">
                <button
                  onClick={() => navigate('orders')}
                  className="flex flex-col items-center gap-1 p-4 transition-colors hover:bg-gray-50"
                >
                  <Package className="h-5 w-5 text-[#2874f0]" />
                  <span className="text-lg font-bold text-gray-900">{orderCount}</span>
                  <span className="text-xs text-gray-500">Orders</span>
                </button>
                <button
                  onClick={() => navigate('wishlist')}
                  className="flex flex-col items-center gap-1 p-4 transition-colors hover:bg-gray-50"
                >
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-lg font-bold text-gray-900">{wishlistCount}</span>
                  <span className="text-xs text-gray-500">Wishlist</span>
                </button>
                <button
                  onClick={() => navigate('cart')}
                  className="flex flex-col items-center gap-1 p-4 transition-colors hover:bg-gray-50"
                >
                  <ShoppingCart className="h-5 w-5 text-[#ff9f00]" />
                  <span className="text-lg font-bold text-gray-900">{cartCount}</span>
                  <span className="text-xs text-gray-500">Cart Items</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Personal Information</CardTitle>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#2874f0] text-white hover:bg-[#1a5dc8]"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-1 h-3 w-3" /> Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic">
                <TabsList className="mb-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                </TabsList>

                <TabsContent value="basic">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" /> Full Name
                      </Label>
                      {editing ? (
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                        />
                      ) : (
                        <p className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                          {user.name || '-'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" /> Email
                      </Label>
                      <p className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-500">
                        {user.email}
                        <span className="ml-2 text-xs text-gray-400">(cannot be changed)</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> Phone
                      </Label>
                      {editing ? (
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                          {user.phone || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" /> Role
                      </Label>
                      <p className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                        {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                      </p>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" /> Member Since
                      </Label>
                      <p className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="address">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="street" className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> Street Address
                      </Label>
                      {editing ? (
                        <Input
                          id="street"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="Enter street address"
                        />
                      ) : (
                        <p className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                          {user.street || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      {editing ? (
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Enter city"
                        />
                      ) : (
                        <p className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                          {user.city || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      {editing ? (
                        <Input
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Enter state"
                        />
                      ) : (
                        <p className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                          {user.state || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      {editing ? (
                        <Input
                          id="zipCode"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="Enter ZIP code"
                        />
                      ) : (
                        <p className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                          {user.zipCode || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      {editing ? (
                        <Input
                          id="country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Enter country"
                        />
                      ) : (
                        <p className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900">
                          {user.country || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('orders')}
                  className="justify-start gap-2 h-12"
                >
                  <Package className="h-4 w-4 text-[#2874f0]" />
                  View My Orders
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('wishlist')}
                  className="justify-start gap-2 h-12"
                >
                  <Heart className="h-4 w-4 text-red-500" />
                  My Wishlist
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('cart')}
                  className="justify-start gap-2 h-12"
                >
                  <ShoppingCart className="h-4 w-4 text-[#ff9f00]" />
                  My Cart
                </Button>
                {user.role === 'ADMIN' && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('admin-dashboard')}
                    className="justify-start gap-2 h-12"
                  >
                    <Shield className="h-4 w-4 text-emerald-600" />
                    Admin Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
