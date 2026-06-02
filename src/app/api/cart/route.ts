import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    select: { id: true, name: true, slug: true },
                  },
                },
              },
            },
          },
        },
      });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return NextResponse.json({
      cart: {
        ...cart,
        subtotal,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, productId, quantity = 1 } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'userId and productId are required' },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    let cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await db.cart.create({ data: { userId } });
    }

    const existingItem = await db.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        );
      }
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    const updatedCart = await db.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
    });

    const subtotal = updatedCart!.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return NextResponse.json({
      cart: {
        ...updatedCart!,
        subtotal,
        itemCount: updatedCart!.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
