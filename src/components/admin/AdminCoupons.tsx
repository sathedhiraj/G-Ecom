'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Plus, Pencil, Trash2, Tag, Percent, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Coupon } from '@/types';

interface CouponFormData {
  code: string;
  discount: string;
  discountType: string;
  minPurchase: string;
  maxDiscount: string;
  usageLimit: string;
  expiresAt: string;
  active: boolean;
}

const defaultFormData: CouponFormData = {
  code: '',
  discount: '',
  discountType: 'PERCENTAGE',
  minPurchase: '0',
  maxDiscount: '',
  usageLimit: '',
  expiresAt: '',
  active: true,
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

export default function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CouponFormData>(defaultFormData);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleAdd = () => {
    setEditingCoupon(null);
    setFormData(defaultFormData);
    setFormOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount: coupon.discount.toString(),
      discountType: coupon.discountType,
      minPurchase: coupon.minPurchase.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      active: coupon.active,
    });
    setFormOpen(true);
  };

  const handleDelete = (coupon: Coupon) => {
    setDeletingCoupon(coupon);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCoupon) return;
    try {
      const res = await fetch(`/api/coupons/${deletingCoupon.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast({ title: 'Coupon deleted', description: 'Coupon has been removed.' });
        fetchCoupons();
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete coupon', variant: 'destructive' });
    } finally {
      setDeleteOpen(false);
      setDeletingCoupon(null);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !coupon.active }),
      });
      if (res.ok) {
        toast({
          title: coupon.active ? 'Coupon deactivated' : 'Coupon activated',
          description: `"${coupon.code}" is now ${coupon.active ? 'inactive' : 'active'}.`,
        });
        fetchCoupons();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to toggle coupon', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!formData.code || !formData.discount) {
      toast({ title: 'Validation Error', description: 'Code and discount are required.', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        code: formData.code.toUpperCase(),
        discount: parseFloat(formData.discount),
        discountType: formData.discountType,
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        expiresAt: formData.expiresAt || undefined,
        active: formData.active,
      };

      let res: Response;
      if (editingCoupon) {
        res = await fetch(`/api/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast({
          title: editingCoupon ? 'Coupon updated' : 'Coupon created',
          description: `"${formData.code}" has been ${editingCoupon ? 'updated' : 'created'} successfully.`,
        });
        setFormOpen(false);
        fetchCoupons();
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save coupon', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.expiresAt) return false;
    return new Date(coupon.expiresAt) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{coupons.length} coupons total</p>
        <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Tag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No coupons found</p>
              <p className="text-sm">Add your first coupon to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Min Purchase</TableHead>
                    <TableHead>Max Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm font-mono font-medium">
                          {coupon.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {coupon.discountType === 'PERCENTAGE' ? (
                            <>
                              <Percent className="h-3 w-3 text-gray-400" />
                              <span className="font-medium">{coupon.discount}%</span>
                            </>
                          ) : (
                            <>
                              <IndianRupee className="h-3 w-3 text-gray-400" />
                              <span className="font-medium">{formatPrice(coupon.discount)}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {coupon.minPurchase > 0 ? formatPrice(coupon.minPurchase) : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {coupon.maxDiscount ? formatPrice(coupon.maxDiscount) : '-'}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {coupon.usageCount}
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {coupon.expiresAt ? (
                          <span className={isExpired(coupon) ? 'text-red-500' : ''}>
                            {formatDate(coupon.expiresAt)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <button onClick={() => toggleActive(coupon)}>
                          <Badge
                            className={`cursor-pointer ${
                              !coupon.active || isExpired(coupon)
                                ? 'bg-gray-100 text-gray-500'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isExpired(coupon) ? 'Expired' : coupon.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(coupon)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(coupon)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-code">Code *</Label>
                <Input
                  id="coupon-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SAVE20"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-discount">Discount *</Label>
                <Input
                  id="coupon-discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) => setFormData({ ...formData, discountType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">
                    <div className="flex items-center gap-2">
                      <Percent className="h-3 w-3" />
                      Percentage
                    </div>
                  </SelectItem>
                  <SelectItem value="FIXED">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-3 w-3" />
                      Fixed Amount
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-min">Min Purchase</Label>
                <Input
                  id="coupon-min"
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-max">Max Discount</Label>
                <Input
                  id="coupon-max"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  placeholder="No limit"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-usage">Usage Limit</Label>
                <Input
                  id="coupon-usage"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="No limit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-expiry">Expiry Date</Label>
                <Input
                  id="coupon-expiry"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="coupon-active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="coupon-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : editingCoupon ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete coupon &quot;{deletingCoupon?.code}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
