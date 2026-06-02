import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code || subtotal === undefined) {
      return NextResponse.json(
        { error: 'Coupon code and subtotal are required' },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code', valid: false },
        { status: 404 }
      );
    }

    if (!coupon.active) {
      return NextResponse.json(
        { error: 'Coupon is not active', valid: false },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json(
        { error: 'Coupon has expired', valid: false },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: 'Coupon usage limit reached', valid: false },
        { status: 400 }
      );
    }

    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return NextResponse.json(
        { error: `Minimum purchase of ₹${coupon.minPurchase} required`, valid: false },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discount) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discount;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount: coupon.discount,
        discountType: coupon.discountType,
        maxDiscount: coupon.maxDiscount,
      },
      discountAmount: discount,
      newSubtotal: subtotal - discount,
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
