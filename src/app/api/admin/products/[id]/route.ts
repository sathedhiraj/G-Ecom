import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, price, comparePrice, images, categoryId, brand, stock, rating, featured, active } = body;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await db.product.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Product with this slug already exists' },
          { status: 409 }
        );
      }
    }

    if (categoryId) {
      const category = await db.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(comparePrice !== undefined && { comparePrice: comparePrice ? parseFloat(comparePrice) : null }),
        ...(images !== undefined && { images }),
        ...(categoryId !== undefined && { categoryId }),
        ...(brand !== undefined && { brand }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(rating !== undefined && { rating: parseFloat(rating) }),
        ...(featured !== undefined && { featured }),
        ...(active !== undefined && { active }),
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
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

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Soft delete - set active to false
    const product = await db.product.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ product, message: 'Product deactivated successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
