import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { brand: { contains: search } },
            { slug: { contains: search } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { reviews: true, orderItems: true },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin products list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, price, comparePrice, images, categoryId, brand, stock, rating, featured, active } = body;

    if (!name || !slug || !description || price === undefined || !categoryId) {
      return NextResponse.json(
        { error: 'Name, slug, description, price, and categoryId are required' },
        { status: 400 }
      );
    }

    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const existingSlug = await db.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 409 }
      );
    }

    const product = await db.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images: images || '',
        categoryId,
        brand: brand || null,
        stock: stock || 0,
        rating: rating || 0,
        featured: featured || false,
        active: active !== undefined ? active : true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
