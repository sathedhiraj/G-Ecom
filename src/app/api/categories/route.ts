import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: { where: { active: true } } },
        },
      },
    });

    const categoriesWithCount = categories.map(({ _count, ...category }) => ({
      ...category,
      productCount: _count.products,
    }));

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Categories list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, image, description, featured } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const existingSlug = await db.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        image: image || null,
        description: description || null,
        featured: featured || false,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
