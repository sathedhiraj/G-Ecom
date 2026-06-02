import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined || quantity < 1) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    const cartItem = await db.cartItem.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    if (cartItem.product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    const updatedItem = await db.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ cartItem: updatedItem });
  } catch (error) {
    console.error('Update cart item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cartItem = await db.cartItem.findUnique({ where: { id } });
    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    await db.cartItem.delete({ where: { id } });

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
