import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const orderRouter = createTRPCRouter({
  // Get orders for a producer (orders containing their products)
  getProducerOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
        status: z.enum([
          "PENDING",
          "REVIEWING",
          "QUOTED",
          "CONFIRMED",
          "PROCESSING",
          "READY_FOR_PICKUP",
          "SHIPPED",
          "IN_TRANSIT",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
          "CANCELLED",
          "REJECTED",
        ]).optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;
      const status = input?.status;
      const search = input?.search;

      // Get the producer's merchant record
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a registered producer to view orders",
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
          orders: [],
          nextCursor: undefined,
          totalCount: 0,
        };
      }

      // Find bulk orders that contain items from this producer's products
      const bulkOrderIds = await ctx.db.bulkOrderItem.findMany({
        where: { productId: { in: productIds } },
        select: { bulkOrderId: true },
        distinct: ["bulkOrderId"],
      });

      const orderIds = bulkOrderIds.map((item) => item.bulkOrderId);

      // Build where clause
      const whereClause: Record<string, unknown> = {
        id: { in: orderIds },
      };

      if (status) {
        whereClause.status = status;
      }

      if (search) {
        whereClause.OR = [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { contactName: { contains: search, mode: "insensitive" } },
          { companyName: { contains: search, mode: "insensitive" } },
        ];
      }

      // Get total count
      const totalCount = await ctx.db.bulkOrder.count({
        where: whereClause,
      });

      // Fetch the bulk orders
      const bulkOrders = await ctx.db.bulkOrder.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          items: {
            where: { productId: { in: productIds } }, // Only include items from this producer
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
          quote: true,
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (bulkOrders.length > limit) {
        const nextItem = bulkOrders.pop();
        nextCursor = nextItem!.id;
      }

      return {
        orders: bulkOrders,
        nextCursor,
        totalCount,
      };
    }),

  // Get single order for producer
  getProducerOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get the producer's merchant record
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a registered producer to view orders",
        });
      }

      // Get product IDs belonging to this producer
      const producerProducts = await ctx.db.product.findMany({
        where: { merchantId: merchant.id },
        select: { id: true },
      });

      const productIds = producerProducts.map((p) => p.id);

      const bulkOrder = await ctx.db.bulkOrder.findFirst({
        where: {
          id: input.id,
          items: {
            some: { productId: { in: productIds } },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              phone: true,
            },
          },
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
          quote: {
            include: {
              items: true,
            },
          },
        },
      });

      if (!bulkOrder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return bulkOrder;
    }),

  // Update order status (for producer)
  updateOrderStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "REVIEWING",
          "QUOTED",
          "CONFIRMED",
          "PROCESSING",
          "READY_FOR_PICKUP",
          "SHIPPED",
          "IN_TRANSIT",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
          "REJECTED",
        ]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the producer's merchant record
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a registered producer to update orders",
        });
      }

      // Get product IDs belonging to this producer
      const producerProducts = await ctx.db.product.findMany({
        where: { merchantId: merchant.id },
        select: { id: true },
      });

      const productIds = producerProducts.map((p) => p.id);

      // Verify the order exists and contains producer's products
      const bulkOrder = await ctx.db.bulkOrder.findFirst({
        where: {
          id: input.id,
          items: {
            some: { productId: { in: productIds } },
          },
        },
      });

      if (!bulkOrder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Update the order status
      const updatedOrder = await ctx.db.bulkOrder.update({
        where: { id: input.id },
        data: {
          status: input.status,
          notes: input.notes,
        },
      });

      return {
        success: true,
        order: updatedOrder,
      };
    }),

  // Get merchant's orders (for merchant dashboard)
  getMerchantOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
        status: z.enum([
          "PENDING",
          "REVIEWING",
          "QUOTED",
          "CONFIRMED",
          "PROCESSING",
          "READY_FOR_PICKUP",
          "SHIPPED",
          "IN_TRANSIT",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
          "CANCELLED",
          "REJECTED",
        ]).optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;
      const status = input?.status;
      const search = input?.search;

      // Build where clause
      const whereClause: Record<string, unknown> = {
        userId: ctx.session.user.id,
      };

      if (status) {
        whereClause.status = status;
      }

      if (search) {
        whereClause.OR = [
          { orderNumber: { contains: search, mode: "insensitive" } },
          {
            items: {
              some: {
                productName: { contains: search, mode: "insensitive" },
              },
            },
          },
        ];
      }

      // Get total count
      const totalCount = await ctx.db.bulkOrder.count({
        where: whereClause,
      });

      // Get status counts for tabs
      const statusCounts = await ctx.db.bulkOrder.groupBy({
        by: ["status"],
        where: { userId: ctx.session.user.id },
        _count: { status: true },
      });

      const counts = {
        all: totalCount,
        PENDING: 0,
        REVIEWING: 0,
        QUOTED: 0,
        CONFIRMED: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
        REJECTED: 0,
      };

      statusCounts.forEach((sc) => {
        counts[sc.status as keyof typeof counts] = sc._count.status;
      });

      // Fetch the bulk orders
      const bulkOrders = await ctx.db.bulkOrder.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                include: {
                  merchant: {
                    select: {
                      id: true,
                      businessName: true,
                      user: {
                        select: {
                          name: true,
                          image: true,
                        },
                      },
                    },
                  },
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
          quote: true,
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (bulkOrders.length > limit) {
        const nextItem = bulkOrders.pop();
        nextCursor = nextItem!.id;
      }

      return {
        orders: bulkOrders,
        nextCursor,
        totalCount,
        counts,
      };
    }),

  // Get order stats for producer dashboard
  getProducerOrderStats: protectedProcedure.query(async ({ ctx }) => {
    // Get the producer's merchant record
    const merchant = await ctx.db.merchant.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!merchant) {
      return {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        totalRevenue: 0,
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
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        totalRevenue: 0,
      };
    }

    // Find bulk orders that contain items from this producer's products
    const bulkOrderIds = await ctx.db.bulkOrderItem.findMany({
      where: { productId: { in: productIds } },
      select: { bulkOrderId: true },
      distinct: ["bulkOrderId"],
    });

    const orderIds = bulkOrderIds.map((item) => item.bulkOrderId);

    // Get status counts
    const statusCounts = await ctx.db.bulkOrder.groupBy({
      by: ["status"],
      where: { id: { in: orderIds } },
      _count: { status: true },
    });

    const stats = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      totalRevenue: 0,
    };

    statusCounts.forEach((sc) => {
      if (["PENDING", "REVIEWING", "QUOTED"].includes(sc.status)) {
        stats.pending += sc._count.status;
      } else if (["CONFIRMED", "PROCESSING"].includes(sc.status)) {
        stats.processing += sc._count.status;
      } else if (sc.status === "SHIPPED") {
        stats.shipped += sc._count.status;
      } else if (sc.status === "DELIVERED") {
        stats.delivered += sc._count.status;
      }
    });

    // Calculate revenue from delivered orders
    const deliveredOrders = await ctx.db.bulkOrder.findMany({
      where: {
        id: { in: orderIds },
        status: "DELIVERED",
      },
      include: {
        items: {
          where: { productId: { in: productIds } },
        },
      },
    });

    stats.totalRevenue = deliveredOrders.reduce((sum, order) => {
      const orderTotal = order.items.reduce(
        (itemSum, item) => itemSum + Number(item.finalTotalPrice ?? item.totalPrice),
        0
      );
      return sum + orderTotal;
    }, 0);

    return stats;
  }),

  // Update order status for merchant (confirm quote or cancel order)
  updateMerchantOrderStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["CONFIRMED", "CANCELLED"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the order belongs to this merchant
      const order = await ctx.db.bulkOrder.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Validate status transitions
      if (input.status === "CONFIRMED") {
        // Can only confirm orders that are QUOTED
        if (order.status !== "QUOTED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only confirm orders that have a quote",
          });
        }
      }

      if (input.status === "CANCELLED") {
        // Can cancel orders that are not yet shipped or delivered
        if (["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REJECTED"].includes(order.status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot cancel order at this stage",
          });
        }
      }

      // Build update data
      const now = new Date();
      const updateData: Record<string, unknown> = {
        status: input.status,
        notes: input.notes ?? order.notes,
      };

      if (input.status === "CONFIRMED") {
        updateData.confirmedAt = now;
      } else if (input.status === "CANCELLED") {
        updateData.cancelledAt = now;
      }

      // Update the order
      const updatedOrder = await ctx.db.bulkOrder.update({
        where: { id: input.id },
        data: updateData,
      });

      // Add to status history
      await ctx.db.orderStatusHistory.create({
        data: {
          bulkOrderId: input.id,
          fromStatus: order.status,
          toStatus: input.status,
          changedById: ctx.session.user.id,
          changedByName: ctx.session.user.name ?? "Unknown",
          changedByRole: "MERCHANT",
          notes: input.notes ?? (input.status === "CONFIRMED" ? "Quote accepted by merchant" : "Order cancelled by merchant"),
        },
      });

      return {
        success: true,
        order: updatedOrder,
      };
    }),
});
