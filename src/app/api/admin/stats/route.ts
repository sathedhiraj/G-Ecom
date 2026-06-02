import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Total counts
    const [totalUsers, totalProducts, totalOrders, totalRevenue] = await Promise.all([
      db.user.count(),
      db.product.count({ where: { active: true } }),
      db.order.count(),
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' },
      }),
    ]);

    // Orders by status
    const ordersByStatus = await db.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const ordersByStatusMap = ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Recent orders
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true },
            },
          },
        },
      },
    });

    // Monthly sales data for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        paymentStatus: 'PAID',
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const monthlySales: { month: string; sales: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthStart = new Date(year, date.getMonth(), 1);
      const monthEnd = new Date(year, date.getMonth() + 1, 1);

      const monthOrders = orders.filter(
        (o) => o.createdAt >= monthStart && o.createdAt < monthEnd
      );
      const sales = monthOrders.reduce((sum, o) => sum + o.total, 0);

      monthlySales.push({
        month: `${monthName} ${year}`,
        sales,
        orders: monthOrders.length,
      });
    }

    // Top categories by product count
    const topCategories = await db.category.findMany({
      take: 5,
      include: {
        _count: { select: { products: { where: { active: true } } } },
      },
      orderBy: { products: { _count: 'desc' } },
    });

    const topCategoriesData = topCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      productCount: cat._count.products,
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        ordersByStatus: ordersByStatusMap,
        recentOrders,
        monthlySales,
        topCategories: topCategoriesData,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
