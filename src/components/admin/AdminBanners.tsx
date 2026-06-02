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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Banner } from '@/types';

interface BannerFormData {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  active: boolean;
  order: string;
}

const defaultFormData: BannerFormData = {
  title: '',
  subtitle: '',
  image: '',
  link: '',
  active: true,
  order: '0',
};

export default function AdminBanners() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BannerFormData>(defaultFormData);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/banners?all=true');
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners);
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleAdd = () => {
    setEditingBanner(null);
    setFormData(defaultFormData);
    setFormOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image,
      link: banner.link || '',
      active: banner.active,
      order: banner.order.toString(),
    });
    setFormOpen(true);
  };

  const handleDelete = (banner: Banner) => {
    setDeletingBanner(banner);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBanner) return;
    try {
      const res = await fetch(`/api/banners/${deletingBanner.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast({ title: 'Banner deleted', description: 'Banner has been removed.' });
        fetchBanners();
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete banner', variant: 'destructive' });
    } finally {
      setDeleteOpen(false);
      setDeletingBanner(null);
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !banner.active }),
      });
      if (res.ok) {
        toast({
          title: banner.active ? 'Banner deactivated' : 'Banner activated',
          description: `"${banner.title}" is now ${banner.active ? 'inactive' : 'active'}.`,
        });
        fetchBanners();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to toggle banner', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.image) {
      toast({ title: 'Validation Error', description: 'Title and image are required.', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        image: formData.image,
        link: formData.link || undefined,
        active: formData.active,
        order: parseInt(formData.order) || 0,
      };

      let res: Response;
      if (editingBanner) {
        res = await fetch(`/api/banners/${editingBanner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast({
          title: editingBanner ? 'Banner updated' : 'Banner created',
          description: `"${formData.title}" has been ${editingBanner ? 'updated' : 'created'} successfully.`,
        });
        setFormOpen(false);
        fetchBanners();
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save banner', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{banners.length} banners total</p>
        <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      {/* Banners Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-16 w-28 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : banners.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No banners found</p>
              <p className="text-sm">Add your first banner to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        {banner.image ? (
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="h-14 w-24 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-24 items-center justify-center rounded bg-gray-100">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{banner.title}</p>
                          {banner.subtitle && (
                            <p className="text-xs text-gray-500">{banner.subtitle}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {banner.link ? (
                          <div className="flex items-center gap-1 text-sm text-emerald-600">
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{banner.link}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{banner.order}</Badge>
                      </TableCell>
                      <TableCell>
                        <button onClick={() => toggleActive(banner)}>
                          <Badge
                            className={`cursor-pointer ${
                              banner.active
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {banner.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(banner)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(banner)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="banner-title">Title *</Label>
              <Input
                id="banner-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Banner title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-subtitle">Subtitle</Label>
              <Input
                id="banner-subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Banner subtitle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-image">Image URL *</Label>
              <Input
                id="banner-image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-link">Link URL</Label>
              <Input
                id="banner-link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://example.com/page"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner-order">Order</Label>
                <Input
                  id="banner-order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="banner-active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="banner-active">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : editingBanner ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingBanner?.title}&quot;? This action cannot be undone.
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
