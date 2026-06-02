import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { code, discount, discountType, minPurchase, maxDiscount, active, expiresAt, usageLimit } = body;

    const existing = await db.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    if (code && code.toUpperCase() !== existing.code) {
      const codeExists = await db.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });
      if (codeExists) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 409 }
        );
      }
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: {
        ...(code !== undefined && { code: code.toUpperCase() }),
        ...(discount !== undefined && { discount: parseFloat(discount) }),
        ...(discountType !== undefined && { discountType }),
        ...(minPurchase !== undefined && { minPurchase: parseFloat(minPurchase) }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null }),
        ...(active !== undefined && { active }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit || null }),
      },
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Update coupon error:', error);
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

    const existing = await db.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    await db.coupon.delete({ where: { id } });

    return NextResponse.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
