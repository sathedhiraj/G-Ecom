import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, image, description, featured } = body;

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await db.category.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 409 }
        );
      }
    }

    const category = await db.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(image !== undefined && { image }),
        ...(description !== undefined && { description }),
        ...(featured !== undefined && { featured }),
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
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

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const productCount = await db.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing products' },
        { status: 400 }
      );
    }

    await db.category.delete({ where: { id } });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
