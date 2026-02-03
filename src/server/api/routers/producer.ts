import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const producerRouter = createTRPCRouter({
  // Get dashboard stats: active products, pending orders, in transit, monthly revenue
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const merchant = await ctx.db.merchant.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!merchant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a registered producer to view dashboard",
      });
    }

    // Get producer's product IDs
    const producerProducts = await ctx.db.product.findMany({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    const productIds = producerProducts.map((p) => p.id);

    // Active products count
    const activeProducts = await ctx.db.product.count({
      where: {
        merchantId: merchant.id,
        status: "ACTIVE",
      },
    });

    if (productIds.length === 0) {
      return {
        activeProducts,
        pendingOrders: 0,
        inTransit: 0,
        monthlyRevenue: 0,
      };
    }

    // Get bulk order IDs that contain this producer's products
    const bulkOrderIds = await ctx.db.bulkOrderItem.findMany({
      where: { productId: { in: productIds } },
      select: { bulkOrderId: true },
      distinct: ["bulkOrderId"],
    });

    const orderIds = bulkOrderIds.map((item) => item.bulkOrderId);

    // Pending orders (PENDING, REVIEWING, QUOTED)
    const pendingOrders = await ctx.db.bulkOrder.count({
      where: {
        id: { in: orderIds },
        status: { in: ["PENDING", "REVIEWING", "QUOTED"] },
      },
    });

    // In transit (SHIPPED, IN_TRANSIT, OUT_FOR_DELIVERY)
    const inTransit = await ctx.db.bulkOrder.count({
      where: {
        id: { in: orderIds },
        status: { in: ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"] },
      },
    });

    // Monthly revenue - delivered orders in the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const deliveredOrders = await ctx.db.bulkOrder.findMany({
      where: {
        id: { in: orderIds },
        status: "DELIVERED",
        deliveredAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        items: {
          where: { productId: { in: productIds } },
        },
      },
    });

    const monthlyRevenue = deliveredOrders.reduce((sum, order) => {
      const orderTotal = order.items.reduce(
        (itemSum, item) =>
          itemSum + Number(item.finalTotalPrice ?? item.totalPrice),
        0,
      );
      return sum + orderTotal;
    }, 0);

    return {
      activeProducts,
      pendingOrders,
      inTransit,
      monthlyRevenue,
    };
  }),

  // Get top selling products based on delivered bulk order items
  getTopSellingProducts: protectedProcedure.query(async ({ ctx }) => {
    const merchant = await ctx.db.merchant.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!merchant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a registered producer to view dashboard",
      });
    }

    const producerProducts = await ctx.db.product.findMany({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    const productIds = producerProducts.map((p) => p.id);

    if (productIds.length === 0) {
      return [];
    }

    // Get delivered bulk order IDs containing this producer's products
    const deliveredOrderIds = await ctx.db.bulkOrder.findMany({
      where: {
        status: "DELIVERED",
        items: {
          some: { productId: { in: productIds } },
        },
      },
      select: { id: true },
    });

    const orderIds = deliveredOrderIds.map((o) => o.id);

    if (orderIds.length === 0) {
      return [];
    }

    // Get all bulk order items for delivered orders belonging to this producer
    const deliveredItems = await ctx.db.bulkOrderItem.findMany({
      where: {
        bulkOrderId: { in: orderIds },
        productId: { in: productIds },
      },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    // Aggregate by product
    const productMap = new Map<
      string,
      {
        productId: string;
        name: string;
        image: string | null;
        totalQuantity: number;
        totalRevenue: number;
        unitType: string;
      }
    >();

    for (const item of deliveredItems) {
      const existing = productMap.get(item.productId);
      const revenue = Number(item.finalTotalPrice ?? item.totalPrice);
      const quantity = Number(item.quantity);

      if (existing) {
        existing.totalQuantity += quantity;
        existing.totalRevenue += revenue;
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          name: item.productName,
          image: item.product.images[0]?.url ?? null,
          totalQuantity: quantity,
          totalRevenue: revenue,
          unitType: item.unitType,
        });
      }
    }

    // Sort by revenue descending and take top 4
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 4);

    return topProducts;
  }),

  // Get alerts: low stock products and pending order count
  getAlerts: protectedProcedure.query(async ({ ctx }) => {
    const merchant = await ctx.db.merchant.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!merchant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a registered producer to view dashboard",
      });
    }

    const alerts: { type: "warning" | "info"; message: string }[] = [];

    // Low stock products (stockQuantity <= 50)
    const lowStockProducts = await ctx.db.product.findMany({
      where: {
        merchantId: merchant.id,
        status: "ACTIVE",
        stockQuantity: { lte: 50 },
      },
      select: { name: true, stockQuantity: true, stockUnit: true },
      orderBy: { stockQuantity: "asc" },
      take: 3,
    });

    for (const product of lowStockProducts) {
      alerts.push({
        type: "warning",
        message: `Low stock alert: ${product.name} (only ${Number(product.stockQuantity)}${product.stockUnit} remaining)`,
      });
    }

    // Pending merchant inquiries (orders with PENDING status)
    const producerProducts = await ctx.db.product.findMany({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    const productIds = producerProducts.map((p) => p.id);

    if (productIds.length > 0) {
      const pendingOrderIds = await ctx.db.bulkOrderItem.findMany({
        where: { productId: { in: productIds } },
        select: { bulkOrderId: true },
        distinct: ["bulkOrderId"],
      });

      const orderIds = pendingOrderIds.map((item) => item.bulkOrderId);

      const pendingCount = await ctx.db.bulkOrder.count({
        where: {
          id: { in: orderIds },
          status: "PENDING",
        },
      });

      if (pendingCount > 0) {
        alerts.push({
          type: "info",
          message: `${pendingCount} new merchant ${pendingCount === 1 ? "inquiry" : "inquiries"} pending`,
        });
      }
    }

    return alerts;
  }),

  // Get quick action counts (for badges on quick action buttons)
  getQuickActionCounts: protectedProcedure.query(async ({ ctx }) => {
    const merchant = await ctx.db.merchant.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!merchant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a registered producer to view dashboard",
      });
    }

    // Total products
    const totalProducts = await ctx.db.product.count({
      where: { merchantId: merchant.id },
    });

    // Low stock products count
    const lowStockCount = await ctx.db.product.count({
      where: {
        merchantId: merchant.id,
        status: "ACTIVE",
        stockQuantity: { lte: 50 },
      },
    });

    // Orders ready to ship (CONFIRMED or PROCESSING)
    const producerProducts = await ctx.db.product.findMany({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    const productIds = producerProducts.map((p) => p.id);

    let readyToShipCount = 0;
    let uniqueCustomerCount = 0;

    if (productIds.length > 0) {
      const bulkOrderIds = await ctx.db.bulkOrderItem.findMany({
        where: { productId: { in: productIds } },
        select: { bulkOrderId: true },
        distinct: ["bulkOrderId"],
      });

      const orderIds = bulkOrderIds.map((item) => item.bulkOrderId);

      readyToShipCount = await ctx.db.bulkOrder.count({
        where: {
          id: { in: orderIds },
          status: { in: ["CONFIRMED", "PROCESSING", "READY_FOR_PICKUP"] },
        },
      });

      // Unique customers who have ordered from this producer
      const customers = await ctx.db.bulkOrder.findMany({
        where: { id: { in: orderIds } },
        select: { userId: true },
        distinct: ["userId"],
      });

      uniqueCustomerCount = customers.length;
    }

    return {
      totalProducts,
      lowStockCount,
      readyToShipCount,
      uniqueCustomerCount,
    };
  }),

  // ============================================
  // REPORT PROCEDURES
  // ============================================

  // Get monthly revenue for the last 6 months
  getRevenueReport: protectedProcedure
    .input(z.object({ months: z.number().min(1).max(12).default(6) }))
    .query(async ({ ctx, input }) => {
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a registered producer to view reports",
        });
      }

      const producerProducts = await ctx.db.product.findMany({
        where: { merchantId: merchant.id },
        select: { id: true },
      });

      const productIds = producerProducts.map((p) => p.id);

      if (productIds.length === 0) {
        return { monthly: [], totalRevenue: 0, totalOrders: 0 };
      }

      const bulkOrderIds = await ctx.db.bulkOrderItem.findMany({
        where: { productId: { in: productIds } },
        select: { bulkOrderId: true },
        distinct: ["bulkOrderId"],
      });

      const orderIds = bulkOrderIds.map((item) => item.bulkOrderId);

      // Get delivered orders for the last N months
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - (input.months - 1), 1);

      const deliveredOrders = await ctx.db.bulkOrder.findMany({
        where: {
          id: { in: orderIds },
          status: "DELIVERED",
          deliveredAt: { gte: startDate },
        },
        include: {
          items: {
            where: { productId: { in: productIds } },
          },
        },
        orderBy: { deliveredAt: "asc" },
      });

      // Group revenue by month
      const monthlyMap = new Map<string, { revenue: number; orders: number }>();

      for (let i = 0; i < input.months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (input.months - 1 - i), 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyMap.set(key, { revenue: 0, orders: 0 });
      }

      let totalRevenue = 0;

      for (const order of deliveredOrders) {
        if (!order.deliveredAt) continue;
        const key = `${order.deliveredAt.getFullYear()}-${String(order.deliveredAt.getMonth() + 1).padStart(2, "0")}`;
        const entry = monthlyMap.get(key);
        const orderRevenue = order.items.reduce(
          (sum, item) => sum + Number(item.finalTotalPrice ?? item.totalPrice),
          0,
        );
        if (entry) {
          entry.revenue += orderRevenue;
          entry.orders += 1;
        }
        totalRevenue += orderRevenue;
      }

      const monthly = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        label: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        revenue: data.revenue,
        orders: data.orders,
      }));

      return {
        monthly,
        totalRevenue,
        totalOrders: deliveredOrders.length,
      };
    }),

  // Get order status breakdown
  getOrderStatusReport: protectedProcedure.query(async ({ ctx }) => {
    const merchant = await ctx.db.merchant.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!merchant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a registered producer to view reports",
      });
    }

    const producerProducts = await ctx.db.product.findMany({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    const productIds = producerProducts.map((p) => p.id);

    if (productIds.length === 0) {
      return { statuses: [], total: 0 };
    }

    const bulkOrderIds = await ctx.db.bulkOrderItem.findMany({
      where: { productId: { in: productIds } },
      select: { bulkOrderId: true },
      distinct: ["bulkOrderId"],
    });

    const orderIds = bulkOrderIds.map((item) => item.bulkOrderId);

    const orders = await ctx.db.bulkOrder.findMany({
      where: { id: { in: orderIds } },
      select: { status: true },
    });

    // Count by status
    const statusMap = new Map<string, number>();
    for (const order of orders) {
      statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1);
    }

    const statuses = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    return { statuses, total: orders.length };
  }),

  // Get product performance report
  getProductPerformanceReport: protectedProcedure.query(async ({ ctx }) => {
    const merchant = await ctx.db.merchant.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!merchant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a registered producer to view reports",
      });
    }

    const producerProducts = await ctx.db.product.findMany({
      where: { merchantId: merchant.id },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    const productIds = producerProducts.map((p) => p.id);

    if (productIds.length === 0) {
      return { products: [], byType: [], bySeafoodType: [] };
    }

    // Get all delivered order items for these products
    const deliveredOrderIds = await ctx.db.bulkOrder.findMany({
      where: {
        status: "DELIVERED",
        items: { some: { productId: { in: productIds } } },
      },
      select: { id: true },
    });

    const deliveredIds = deliveredOrderIds.map((o) => o.id);

    const deliveredItems = deliveredIds.length > 0
      ? await ctx.db.bulkOrderItem.findMany({
          where: {
            bulkOrderId: { in: deliveredIds },
            productId: { in: productIds },
          },
        })
      : [];

    // Aggregate per product
    const productSales = new Map<string, { quantity: number; revenue: number; orders: number }>();
    for (const item of deliveredItems) {
      const existing = productSales.get(item.productId) ?? { quantity: 0, revenue: 0, orders: 0 };
      existing.quantity += Number(item.quantity);
      existing.revenue += Number(item.finalTotalPrice ?? item.totalPrice);
      existing.orders += 1;
      productSales.set(item.productId, existing);
    }

    const products = producerProducts
      .map((p) => {
        const sales = productSales.get(p.id) ?? { quantity: 0, revenue: 0, orders: 0 };
        return {
          id: p.id,
          name: p.name,
          image: p.images[0]?.url ?? null,
          status: p.status,
          productType: p.productType,
          seafoodType: p.seafoodType,
          price: Number(p.price),
          stockQuantity: Number(p.stockQuantity),
          stockUnit: p.stockUnit,
          totalQuantitySold: sales.quantity,
          totalRevenue: sales.revenue,
          totalOrders: sales.orders,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Aggregate by product type
    const typeMap = new Map<string, { count: number; revenue: number }>();
    for (const p of products) {
      const existing = typeMap.get(p.productType) ?? { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += p.totalRevenue;
      typeMap.set(p.productType, existing);
    }
    const byType = Array.from(typeMap.entries())
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // Aggregate by seafood type
    const seafoodMap = new Map<string, { count: number; revenue: number }>();
    for (const p of products) {
      const existing = seafoodMap.get(p.seafoodType) ?? { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += p.totalRevenue;
      seafoodMap.set(p.seafoodType, existing);
    }
    const bySeafoodType = Array.from(seafoodMap.entries())
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    return { products, byType, bySeafoodType };
  }),

  // Get top customers report
  getTopCustomersReport: protectedProcedure.query(async ({ ctx }) => {
    const merchant = await ctx.db.merchant.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!merchant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a registered producer to view reports",
      });
    }

    const producerProducts = await ctx.db.product.findMany({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    const productIds = producerProducts.map((p) => p.id);

    if (productIds.length === 0) {
      return [];
    }

    const bulkOrderIds = await ctx.db.bulkOrderItem.findMany({
      where: { productId: { in: productIds } },
      select: { bulkOrderId: true },
      distinct: ["bulkOrderId"],
    });

    const orderIds = bulkOrderIds.map((item) => item.bulkOrderId);

    const orders = await ctx.db.bulkOrder.findMany({
      where: { id: { in: orderIds } },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        items: {
          where: { productId: { in: productIds } },
        },
      },
    });

    // Aggregate by customer
    const customerMap = new Map<
      string,
      {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
        totalOrders: number;
        deliveredOrders: number;
        totalRevenue: number;
        lastOrderDate: Date | null;
      }
    >();

    for (const order of orders) {
      const existing = customerMap.get(order.userId) ?? {
        id: order.userId,
        name: order.user.name,
        email: order.user.email,
        image: order.user.image,
        totalOrders: 0,
        deliveredOrders: 0,
        totalRevenue: 0,
        lastOrderDate: null,
      };

      existing.totalOrders += 1;

      if (order.status === "DELIVERED") {
        existing.deliveredOrders += 1;
        const orderRevenue = order.items.reduce(
          (sum, item) => sum + Number(item.finalTotalPrice ?? item.totalPrice),
          0,
        );
        existing.totalRevenue += orderRevenue;
      }

      if (!existing.lastOrderDate || order.createdAt > existing.lastOrderDate) {
        existing.lastOrderDate = order.createdAt;
      }

      customerMap.set(order.userId, existing);
    }

    return Array.from(customerMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }),

  // Get inventory status report
  getInventoryReport: protectedProcedure.query(async ({ ctx }) => {
    const merchant = await ctx.db.merchant.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!merchant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a registered producer to view reports",
      });
    }

    const products = await ctx.db.product.findMany({
      where: { merchantId: merchant.id },
      select: {
        id: true,
        name: true,
        status: true,
        stockQuantity: true,
        stockUnit: true,
        stockType: true,
        productType: true,
        price: true,
        requiresColdChain: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { stockQuantity: "asc" },
    });

    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === "ACTIVE").length;
    const lowStockProducts = products.filter(
      (p) => p.status === "ACTIVE" && Number(p.stockQuantity) <= 50,
    ).length;
    const outOfStockProducts = products.filter(
      (p) => Number(p.stockQuantity) === 0,
    ).length;
    const coldChainProducts = products.filter((p) => p.requiresColdChain).length;

    const totalStockValue = products.reduce(
      (sum, p) => sum + Number(p.stockQuantity) * Number(p.price),
      0,
    );

    const items = products.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      stockQuantity: Number(p.stockQuantity),
      stockUnit: p.stockUnit,
      stockType: p.stockType,
      productType: p.productType,
      price: Number(p.price),
      requiresColdChain: p.requiresColdChain,
      image: p.images[0]?.url ?? null,
      stockValue: Number(p.stockQuantity) * Number(p.price),
    }));

    return {
      summary: {
        totalProducts,
        activeProducts,
        lowStockProducts,
        outOfStockProducts,
        coldChainProducts,
        totalStockValue,
      },
      items,
    };
  }),

  // ============================================
  // ANALYTICS PROCEDURES
  // ============================================

  // Get revenue trend for the last 12 months (for line/area chart)
  getRevenueTrend: protectedProcedure
    .input(z.object({ months: z.number().min(3).max(12).default(12) }))
    .query(async ({ ctx, input }) => {
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a registered producer to view analytics",
        });
      }

      const producerProducts = await ctx.db.product.findMany({
        where: { merchantId: merchant.id },
        select: { id: true },
      });

      const productIds = producerProducts.map((p) => p.id);

      if (productIds.length === 0) {
        return [];
      }

      const bulkOrderIds = await ctx.db.bulkOrderItem.findMany({
        where: { productId: { in: productIds } },
        select: { bulkOrderId: true },
        distinct: ["bulkOrderId"],
      });

      const orderIds = bulkOrderIds.map((item) => item.bulkOrderId);

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - (input.months - 1), 1);

      const deliveredOrders = await ctx.db.bulkOrder.findMany({
        where: {
          id: { in: orderIds },
          status: "DELIVERED",
          deliveredAt: { gte: startDate },
        },
        include: {
          items: { where: { productId: { in: productIds } } },
        },
        orderBy: { deliveredAt: "asc" },
      });

      // Also get all orders for order count trend
      const allOrders = await ctx.db.bulkOrder.findMany({
        where: {
          id: { in: orderIds },
          createdAt: { gte: startDate },
        },
        select: { createdAt: true, status: true },
      });

      // Build monthly data
      const monthlyMap = new Map<
        string,
        { revenue: number; orders: number; newOrders: number }
      >();

      for (let i = 0; i < input.months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (input.months - 1 - i), 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyMap.set(key, { revenue: 0, orders: 0, newOrders: 0 });
      }

      for (const order of deliveredOrders) {
        if (!order.deliveredAt) continue;
        const key = `${order.deliveredAt.getFullYear()}-${String(order.deliveredAt.getMonth() + 1).padStart(2, "0")}`;
        const entry = monthlyMap.get(key);
        if (entry) {
          entry.revenue += order.items.reduce(
            (sum, item) => sum + Number(item.finalTotalPrice ?? item.totalPrice),
            0,
          );
          entry.orders += 1;
        }
      }

      for (const order of allOrders) {
        const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`;
        const entry = monthlyMap.get(key);
        if (entry) {
          entry.newOrders += 1;
        }
      }

      return Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        label: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
        }),
        fullLabel: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        revenue: data.revenue,
        deliveredOrders: data.orders,
        newOrders: data.newOrders,
      }));
    }),

  // Get daily orders for the last 30 days (for bar chart)
  getDailyOrdersTrend: protectedProcedure.query(async ({ ctx }) => {
    const merchant = await ctx.db.merchant.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!merchant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a registered producer to view analytics",
      });
    }

    const producerProducts = await ctx.db.product.findMany({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    const productIds = producerProducts.map((p) => p.id);

    if (productIds.length === 0) {
      return [];
    }

    const bulkOrderIds = await ctx.db.bulkOrderItem.findMany({
      where: { productId: { in: productIds } },
      select: { bulkOrderId: true },
      distinct: ["bulkOrderId"],
    });

    const orderIds = bulkOrderIds.map((item) => item.bulkOrderId);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);

    const orders = await ctx.db.bulkOrder.findMany({
      where: {
        id: { in: orderIds },
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        items: { where: { productId: { in: productIds } } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Build daily map
    const dailyMap = new Map<string, { orders: number; revenue: number }>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (29 - i));
      const key = d.toISOString().split("T")[0]!;
      dailyMap.set(key, { orders: 0, revenue: 0 });
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().split("T")[0]!;
      const entry = dailyMap.get(key);
      if (entry) {
        entry.orders += 1;
        if (order.status === "DELIVERED") {
          entry.revenue += order.items.reduce(
            (sum, item) => sum + Number(item.finalTotalPrice ?? item.totalPrice),
            0,
          );
        }
      }
    }

    return Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      label: new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      orders: data.orders,
      revenue: data.revenue,
    }));
  }),

  // Get order fulfillment analytics (for pie chart)
  getOrderFulfillmentAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const merchant = await ctx.db.merchant.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!merchant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a registered producer to view analytics",
      });
    }

    const producerProducts = await ctx.db.product.findMany({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    const productIds = producerProducts.map((p) => p.id);

    if (productIds.length === 0) {
      return { segments: [], avgFulfillmentDays: 0 };
    }

    const bulkOrderIds = await ctx.db.bulkOrderItem.findMany({
      where: { productId: { in: productIds } },
      select: { bulkOrderId: true },
      distinct: ["bulkOrderId"],
    });

    const orderIds = bulkOrderIds.map((item) => item.bulkOrderId);

    const orders = await ctx.db.bulkOrder.findMany({
      where: { id: { in: orderIds } },
      select: {
        status: true,
        createdAt: true,
        deliveredAt: true,
        confirmedAt: true,
      },
    });

    // Group into segments for pie chart
    const pending = orders.filter((o) =>
      ["PENDING", "REVIEWING", "QUOTED"].includes(o.status),
    ).length;
    const inProgress = orders.filter((o) =>
      ["CONFIRMED", "PROCESSING", "READY_FOR_PICKUP"].includes(o.status),
    ).length;
    const shipping = orders.filter((o) =>
      ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status),
    ).length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const cancelled = orders.filter((o) =>
      ["CANCELLED", "REJECTED"].includes(o.status),
    ).length;

    const segments = [
      { name: "Pending", value: pending, color: "#f59e0b" },
      { name: "In Progress", value: inProgress, color: "#3b82f6" },
      { name: "Shipping", value: shipping, color: "#8b5cf6" },
      { name: "Delivered", value: delivered, color: "#10b981" },
      { name: "Cancelled", value: cancelled, color: "#ef4444" },
    ].filter((s) => s.value > 0);

    // Average fulfillment time (confirmed → delivered)
    const fulfilledOrders = orders.filter(
      (o) => o.status === "DELIVERED" && o.confirmedAt && o.deliveredAt,
    );
    const avgFulfillmentDays =
      fulfilledOrders.length > 0
        ? fulfilledOrders.reduce((sum, o) => {
            const days =
              (o.deliveredAt!.getTime() - o.confirmedAt!.getTime()) /
              (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / fulfilledOrders.length
        : 0;

    return { segments, avgFulfillmentDays };
  }),

  // Get top products analytics with comparison (for bar chart)
  getTopProductsAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const merchant = await ctx.db.merchant.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!merchant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a registered producer to view analytics",
      });
    }

    const producerProducts = await ctx.db.product.findMany({
      where: { merchantId: merchant.id },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    const productIds = producerProducts.map((p) => p.id);

    if (productIds.length === 0) {
      return [];
    }

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get delivered orders for this and last month
    const deliveredOrderIds = await ctx.db.bulkOrder.findMany({
      where: {
        status: "DELIVERED",
        items: { some: { productId: { in: productIds } } },
        deliveredAt: { gte: lastMonthStart },
      },
      select: { id: true, deliveredAt: true },
    });

    const thisMonthOrderIds = deliveredOrderIds
      .filter((o) => o.deliveredAt && o.deliveredAt >= thisMonthStart)
      .map((o) => o.id);
    const lastMonthOrderIds = deliveredOrderIds
      .filter(
        (o) =>
          o.deliveredAt &&
          o.deliveredAt >= lastMonthStart &&
          o.deliveredAt < thisMonthStart,
      )
      .map((o) => o.id);

    const getItemsForOrders = async (ids: string[]) => {
      if (ids.length === 0) return [];
      return ctx.db.bulkOrderItem.findMany({
        where: {
          bulkOrderId: { in: ids },
          productId: { in: productIds },
        },
      });
    };

    const [thisMonthItems, lastMonthItems] = await Promise.all([
      getItemsForOrders(thisMonthOrderIds),
      getItemsForOrders(lastMonthOrderIds),
    ]);

    // Aggregate per product
    const productMap = new Map<
      string,
      { thisMonth: number; lastMonth: number }
    >();

    for (const item of thisMonthItems) {
      const existing = productMap.get(item.productId) ?? {
        thisMonth: 0,
        lastMonth: 0,
      };
      existing.thisMonth += Number(item.finalTotalPrice ?? item.totalPrice);
      productMap.set(item.productId, existing);
    }

    for (const item of lastMonthItems) {
      const existing = productMap.get(item.productId) ?? {
        thisMonth: 0,
        lastMonth: 0,
      };
      existing.lastMonth += Number(item.finalTotalPrice ?? item.totalPrice);
      productMap.set(item.productId, existing);
    }

    return producerProducts
      .filter((p) => productMap.has(p.id))
      .map((p) => {
        const data = productMap.get(p.id)!;
        return {
          name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
          fullName: p.name,
          thisMonth: data.thisMonth,
          lastMonth: data.lastMonth,
        };
      })
      .sort((a, b) => b.thisMonth - a.thisMonth)
      .slice(0, 8);
  }),

  // Get customer growth analytics
  getCustomerGrowth: protectedProcedure
    .input(z.object({ months: z.number().min(3).max(12).default(6) }))
    .query(async ({ ctx, input }) => {
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a registered producer to view analytics",
        });
      }

      const producerProducts = await ctx.db.product.findMany({
        where: { merchantId: merchant.id },
        select: { id: true },
      });

      const productIds = producerProducts.map((p) => p.id);

      if (productIds.length === 0) {
        return [];
      }

      const bulkOrderIds = await ctx.db.bulkOrderItem.findMany({
        where: { productId: { in: productIds } },
        select: { bulkOrderId: true },
        distinct: ["bulkOrderId"],
      });

      const orderIds = bulkOrderIds.map((item) => item.bulkOrderId);

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - (input.months - 1), 1);

      const orders = await ctx.db.bulkOrder.findMany({
        where: {
          id: { in: orderIds },
          createdAt: { gte: startDate },
        },
        select: { userId: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      });

      // Track first-time and returning customers per month
      const seenCustomers = new Set<string>();

      // Pre-populate with customers from before the period
      const historicalOrders = await ctx.db.bulkOrder.findMany({
        where: {
          id: { in: orderIds },
          createdAt: { lt: startDate },
        },
        select: { userId: true },
        distinct: ["userId"],
      });

      for (const o of historicalOrders) {
        seenCustomers.add(o.userId);
      }

      const monthlyMap = new Map<
        string,
        { newCustomers: number; returningCustomers: number; totalCustomers: number }
      >();

      for (let i = 0; i < input.months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (input.months - 1 - i), 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyMap.set(key, { newCustomers: 0, returningCustomers: 0, totalCustomers: 0 });
      }

      // Track unique customers per month
      const monthCustomers = new Map<string, Set<string>>();
      for (const key of monthlyMap.keys()) {
        monthCustomers.set(key, new Set());
      }

      for (const order of orders) {
        const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`;
        const monthSet = monthCustomers.get(key);
        if (!monthSet || monthSet.has(order.userId)) continue;

        monthSet.add(order.userId);
        const entry = monthlyMap.get(key);
        if (entry) {
          if (seenCustomers.has(order.userId)) {
            entry.returningCustomers += 1;
          } else {
            entry.newCustomers += 1;
            seenCustomers.add(order.userId);
          }
        }
      }

      // Set cumulative total
      let runningTotal = seenCustomers.size - Array.from(monthlyMap.values()).reduce((s, v) => s + v.newCustomers, 0);
      for (const [, data] of monthlyMap) {
        runningTotal += data.newCustomers;
        data.totalCustomers = runningTotal;
      }

      return Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        label: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
        }),
        newCustomers: data.newCustomers,
        returningCustomers: data.returningCustomers,
        totalCustomers: data.totalCustomers,
      }));
    }),
});
