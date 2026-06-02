import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        city: true,
        state: true,
        country: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
