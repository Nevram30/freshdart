import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const customerRouter = createTRPCRouter({
  // Get customers for a producer (customers who have placed orders containing producer's products)
  getProducerCustomers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;
      const search = input?.search;

      // Get the producer's merchant record
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a registered producer to view customers",
        });
      }

      // Get product IDs belonging to this producer
      const producerProducts = await ctx.db.product.findMany({
        where: { merchantId: merchant.id },
        select: { id: true },
      });

      const productIds = producerProducts.map((p) => p.id);

      if (productIds.length === 0) {
        return {
          customers: [],
          nextCursor: undefined,
          totalCount: 0,
        };
      }

      // Find bulk orders that contain items from this producer's products
      const bulkOrdersWithProducerItems = await ctx.db.bulkOrderItem.findMany({
        where: { productId: { in: productIds } },
        select: { bulkOrderId: true },
        distinct: ["bulkOrderId"],
      });

      const orderIds = bulkOrdersWithProducerItems.map((item) => item.bulkOrderId);

      if (orderIds.length === 0) {
        return {
          customers: [],
          nextCursor: undefined,
          totalCount: 0,
        };
      }

      // Get unique user IDs from these orders
      const ordersWithUsers = await ctx.db.bulkOrder.findMany({
        where: { id: { in: orderIds } },
        select: {
          userId: true,
          contactName: true,
          contactEmail: true,
          contactPhone: true,
          companyName: true,
        },
        distinct: ["userId"],
      });

      const userIds = ordersWithUsers.map((o) => o.userId);

      // Build where clause for users
      const whereClause: Record<string, unknown> = {
        id: { in: userIds },
      };

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      // Get total count of unique customers
      const totalCount = await ctx.db.user.count({
        where: whereClause,
      });

      // Fetch the customers with their order statistics
      const users = await ctx.db.user.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          createdAt: true,
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (users.length > limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }

      // For each user, get their order statistics for this producer
      const customersWithStats = await Promise.all(
        users.map(async (user) => {
          // Get all orders from this user that contain producer's products
          const userOrders = await ctx.db.bulkOrder.findMany({
            where: {
              userId: user.id,
              id: { in: orderIds },
            },
            include: {
              items: {
                where: { productId: { in: productIds } },
              },
            },
            orderBy: { createdAt: "desc" },
          });

          // Get the latest order contact info
          const latestOrder = userOrders[0];

          // Calculate statistics
          const totalOrders = userOrders.length;
          const totalSpent = userOrders.reduce((sum, order) => {
            const orderTotal = order.items.reduce(
              (itemSum, item) => itemSum + Number(item.finalTotalPrice ?? item.totalPrice),
              0
            );
            return sum + orderTotal;
          }, 0);

          const deliveredOrders = userOrders.filter(o => o.status === "DELIVERED").length;
          const pendingOrders = userOrders.filter(o =>
            ["PENDING", "REVIEWING", "QUOTED", "CONFIRMED", "PROCESSING", "READY_FOR_PICKUP", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status)
          ).length;

          return {
            ...user,
            // Contact info from latest order
            contactName: latestOrder?.contactName ?? user.name,
            contactEmail: latestOrder?.contactEmail ?? user.email,
            contactPhone: latestOrder?.contactPhone ?? user.phone,
            companyName: latestOrder?.companyName ?? null,
            // Statistics
            totalOrders,
            totalSpent,
            deliveredOrders,
            pendingOrders,
            lastOrderDate: latestOrder?.createdAt ?? null,
          };
        })
      );

      return {
        customers: customersWithStats,
        nextCursor,
        totalCount,
      };
    }),

  // Get single customer details for producer
  getProducerCustomer: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get the producer's merchant record
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a registered producer to view customers",
        });
      }

      // Get product IDs belonging to this producer
      const producerProducts = await ctx.db.product.findMany({
        where: { merchantId: merchant.id },
        select: { id: true },
      });

      const productIds = producerProducts.map((p) => p.id);

      // Get the user
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          defaultAddress: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      // Get all orders from this user that contain producer's products
      const userOrders = await ctx.db.bulkOrder.findMany({
        where: {
          userId: user.id,
          items: {
            some: { productId: { in: productIds } },
          },
        },
        include: {
          items: {
            where: { productId: { in: productIds } },
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
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (userOrders.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer has no orders with your products",
        });
      }

      // Get the latest order contact info
      const latestOrder = userOrders[0];

      // Calculate statistics
      const totalOrders = userOrders.length;
      const totalSpent = userOrders.reduce((sum, order) => {
        const orderTotal = order.items.reduce(
          (itemSum, item) => itemSum + Number(item.finalTotalPrice ?? item.totalPrice),
          0
        );
        return sum + orderTotal;
      }, 0);

      const deliveredOrders = userOrders.filter(o => o.status === "DELIVERED").length;
      const cancelledOrders = userOrders.filter(o => ["CANCELLED", "REJECTED"].includes(o.status)).length;

      // Get most ordered products
      const productCounts: Record<string, { product: typeof userOrders[0]["items"][0]["product"]; count: number; totalQuantity: number }> = {};

      userOrders.forEach(order => {
        order.items.forEach(item => {
          productCounts[item.productId] ??= {
            product: item.product,
            count: 0,
            totalQuantity: 0,
          };
          productCounts[item.productId]!.count += 1;
          productCounts[item.productId]!.totalQuantity += Number(item.quantity);
        });
      });

      const topProducts = Object.values(productCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        ...user,
        // Contact info from latest order
        contactName: latestOrder?.contactName ?? user.name,
        contactEmail: latestOrder?.contactEmail ?? user.email,
        contactPhone: latestOrder?.contactPhone ?? user.phone,
        companyName: latestOrder?.companyName ?? null,
        shippingAddress: latestOrder?.shippingAddress ?? user.defaultAddress,
        // Statistics
        totalOrders,
        totalSpent,
        deliveredOrders,
        cancelledOrders,
        lastOrderDate: latestOrder?.createdAt ?? null,
        firstOrderDate: userOrders[userOrders.length - 1]?.createdAt ?? null,
        // Recent orders
        recentOrders: userOrders.slice(0, 5),
        // Top products
        topProducts,
      };
    }),

  // Get customer statistics for producer dashboard
  getProducerCustomerStats: protectedProcedure.query(async ({ ctx }) => {
    // Get the producer's merchant record
    const merchant = await ctx.db.merchant.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!merchant) {
      return {
        totalCustomers: 0,
        newCustomersThisMonth: 0,
        repeatCustomers: 0,
        averageOrderValue: 0,
      };
    }

    // Get product IDs belonging to this producer
    const producerProducts = await ctx.db.product.findMany({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    const productIds = producerProducts.map((p) => p.id);

    if (productIds.length === 0) {
      return {
        totalCustomers: 0,
        newCustomersThisMonth: 0,
        repeatCustomers: 0,
        averageOrderValue: 0,
      };
    }

    // Find bulk orders that contain items from this producer's products
    const bulkOrdersWithProducerItems = await ctx.db.bulkOrderItem.findMany({
      where: { productId: { in: productIds } },
      select: { bulkOrderId: true },
      distinct: ["bulkOrderId"],
    });

    const orderIds = bulkOrdersWithProducerItems.map((item) => item.bulkOrderId);

    if (orderIds.length === 0) {
      return {
        totalCustomers: 0,
        newCustomersThisMonth: 0,
        repeatCustomers: 0,
        averageOrderValue: 0,
      };
    }

    // Get all orders with user info
    const orders = await ctx.db.bulkOrder.findMany({
      where: { id: { in: orderIds } },
      select: {
        userId: true,
        createdAt: true,
        items: {
          where: { productId: { in: productIds } },
          select: {
            totalPrice: true,
            finalTotalPrice: true,
          },
        },
      },
    });

    // Calculate unique customers
    const uniqueUserIds = [...new Set(orders.map((o) => o.userId))];
    const totalCustomers = uniqueUserIds.length;

    // Calculate new customers this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const ordersThisMonth = orders.filter(
      (o) => new Date(o.createdAt) >= startOfMonth
    );
    const newUserIdsThisMonth = [...new Set(ordersThisMonth.map((o) => o.userId))];

    // Check if these users had orders before this month
    const ordersBeforeThisMonth = orders.filter(
      (o) => new Date(o.createdAt) < startOfMonth
    );
    const existingUserIds = new Set(ordersBeforeThisMonth.map((o) => o.userId));

    const newCustomersThisMonth = newUserIdsThisMonth.filter(
      (id) => !existingUserIds.has(id)
    ).length;

    // Calculate repeat customers (more than 1 order)
    const userOrderCounts: Record<string, number> = {};
    orders.forEach((o) => {
      userOrderCounts[o.userId] = (userOrderCounts[o.userId] ?? 0) + 1;
    });
    const repeatCustomers = Object.values(userOrderCounts).filter(
      (count) => count > 1
    ).length;

    // Calculate average order value
    const totalRevenue = orders.reduce((sum, order) => {
      const orderTotal = order.items.reduce(
        (itemSum, item) => itemSum + Number(item.finalTotalPrice ?? item.totalPrice),
        0
      );
      return sum + orderTotal;
    }, 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      totalCustomers,
      newCustomersThisMonth,
      repeatCustomers,
      averageOrderValue,
    };
  }),
});
