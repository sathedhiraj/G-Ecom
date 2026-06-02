import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const wishlistItem = await db.wishlist.findUnique({ where: { id } });
    if (!wishlistItem) {
      return NextResponse.json(
        { error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    await db.wishlist.delete({ where: { id } });

    return NextResponse.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Remove wishlist item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
