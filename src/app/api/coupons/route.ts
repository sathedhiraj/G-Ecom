import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, discount, discountType, minPurchase, maxDiscount, active, expiresAt, usageLimit } = body;

    if (!code || discount === undefined) {
      return NextResponse.json(
        { error: 'Code and discount are required' },
        { status: 400 }
      );
    }

    const existing = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 409 }
      );
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        discountType: discountType || 'PERCENTAGE',
        minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        active: active !== undefined ? active : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: usageLimit || null,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
