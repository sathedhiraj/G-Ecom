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

    const orders = await db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, shippingAddress, paymentMethod = 'COD', couponCode } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user's cart
    const cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Check stock availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product.name}` },
          { status: 400 }
        );
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Apply coupon if provided
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode },
      });

      if (!coupon || !coupon.active) {
        return NextResponse.json(
          { error: 'Invalid coupon code' },
          { status: 400 }
        );
      }

      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return NextResponse.json(
          { error: 'Coupon has expired' },
          { status: 400 }
        );
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json(
          { error: 'Coupon usage limit reached' },
          { status: 400 }
        );
      }

      if (coupon.minPurchase && subtotal < coupon.minPurchase) {
        return NextResponse.json(
          { error: `Minimum purchase of ₹${coupon.minPurchase} required` },
          { status: 400 }
        );
      }

      if (coupon.discountType === 'PERCENTAGE') {
        discount = (subtotal * coupon.discount) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.discount;
      }

      appliedCoupon = coupon;
    }

    const tax = (subtotal - discount) * 0.18; // 18% GST
    const shipping = subtotal > 500 ? 0 : 49; // Free shipping over ₹500
    const total = subtotal - discount + tax + shipping;

    // Get user's address for shipping
    const user = await db.user.findUnique({ where: { id: userId } });

    const order = await db.order.create({
      data: {
        userId,
        subtotal,
        total,
        tax,
        shipping,
        discount,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        status: 'PENDING',
        shippingStreet: shippingAddress?.street || user?.street || null,
        shippingCity: shippingAddress?.city || user?.city || null,
        shippingState: shippingAddress?.state || user?.state || null,
        shippingZipCode: shippingAddress?.zipCode || user?.zipCode || null,
        shippingCountry: shippingAddress?.country || user?.country || 'India',
        couponCode: couponCode || null,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                price: true,
              },
            },
          },
        },
      },
    });

    // Update product stock
    for (const item of cart.items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Update coupon usage
    if (appliedCoupon) {
      await db.coupon.update({
        where: { id: appliedCoupon.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Clear cart
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
