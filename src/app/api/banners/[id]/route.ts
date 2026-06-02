import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, subtitle, image, link, active, order } = body;

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    const banner = await db.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(image !== undefined && { image }),
        ...(link !== undefined && { link }),
        ...(active !== undefined && { active }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Update banner error:', error);
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

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    await db.banner.delete({ where: { id } });

    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete banner error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
