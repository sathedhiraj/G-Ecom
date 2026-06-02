import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');

    const banners = await db.banner.findMany({
      where: all === 'true' ? {} : { active: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Get banners error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, subtitle, image, link, active, order } = body;

    if (!title || !image) {
      return NextResponse.json(
        { error: 'Title and image are required' },
        { status: 400 }
      );
    }

    const banner = await db.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        link: link || null,
        active: active !== undefined ? active : true,
        order: order || 0,
      },
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error('Create banner error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
