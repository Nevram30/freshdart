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
          "ORDER_PLACED",
          "PENDING_CONFIRMATION",
          "CONFIRMED",
          "AWAITING_PAYMENT",
          "PAID",
          "PREPARING",
          "READY_FOR_SHIPMENT",
          "IN_TRANSIT",
          "DELIVERED",
          "COMPLETED",
          "DISPUTED",
          "RESOLVED",
          "CANCELLED",
        ]).optional(),
        search: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        minAmount: z.number().min(0).optional(),
        maxAmount: z.number().min(0).optional(),
        carriers: z.array(z.enum([
          "JT_EXPRESS", "LALAMOVE", "GRAB_EXPRESS", "LBC",
          "GOGO_XPRESS", "NINJA_VAN", "SELF_DELIVERY", "OTHER",
        ])).optional(),
        requiresColdChain: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;
      const status = input?.status;
      const search = input?.search;
      const dateFrom = input?.dateFrom;
      const dateTo = input?.dateTo;
      const minAmount = input?.minAmount;
      const maxAmount = input?.maxAmount;
      const carriers = input?.carriers;
      const requiresColdChain = input?.requiresColdChain;

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

      // Date range filter
      if (dateFrom || dateTo) {
        const createdAtFilter: Record<string, unknown> = {};
        if (dateFrom) {
          createdAtFilter.gte = dateFrom;
        }
        if (dateTo) {
          const endOfDay = new Date(dateTo);
          endOfDay.setHours(23, 59, 59, 999);
          createdAtFilter.lte = endOfDay;
        }
        whereClause.createdAt = createdAtFilter;
      }

      // Amount range filter
      if (minAmount !== undefined || maxAmount !== undefined) {
        const amountFilter: Record<string, unknown> = {};
        if (minAmount !== undefined) {
          amountFilter.gte = minAmount;
        }
        if (maxAmount !== undefined) {
          amountFilter.lte = maxAmount;
        }
        whereClause.estimatedTotal = amountFilter;
      }

      // Carrier filter
      if (carriers && carriers.length > 0) {
        whereClause.carrier = { in: carriers };
      }

      // Cold chain filter
      if (requiresColdChain !== undefined) {
        whereClause.requiresColdChain = requiresColdChain;
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
          "PENDING_CONFIRMATION",
          "CONFIRMED",
          "AWAITING_PAYMENT",
          "PAID",
          "PREPARING",
          "READY_FOR_SHIPMENT",
          "IN_TRANSIT",
          "DELIVERED",
          "COMPLETED",
          "RESOLVED",
          "CANCELLED",
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
          "ORDER_PLACED",
          "PENDING_CONFIRMATION",
          "CONFIRMED",
          "AWAITING_PAYMENT",
          "PAID",
          "PREPARING",
          "READY_FOR_SHIPMENT",
          "IN_TRANSIT",
          "DELIVERED",
          "COMPLETED",
          "DISPUTED",
          "RESOLVED",
          "CANCELLED",
        ]).optional(),
        search: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        minAmount: z.number().min(0).optional(),
        maxAmount: z.number().min(0).optional(),
        carriers: z.array(z.enum([
          "JT_EXPRESS", "LALAMOVE", "GRAB_EXPRESS", "LBC",
          "GOGO_XPRESS", "NINJA_VAN", "SELF_DELIVERY", "OTHER",
        ])).optional(),
        requiresColdChain: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;
      const status = input?.status;
      const search = input?.search;
      const dateFrom = input?.dateFrom;
      const dateTo = input?.dateTo;
      const minAmount = input?.minAmount;
      const maxAmount = input?.maxAmount;
      const carriers = input?.carriers;
      const requiresColdChain = input?.requiresColdChain;

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

      // Date range filter
      if (dateFrom || dateTo) {
        const createdAtFilter: Record<string, unknown> = {};
        if (dateFrom) {
          createdAtFilter.gte = dateFrom;
        }
        if (dateTo) {
          const endOfDay = new Date(dateTo);
          endOfDay.setHours(23, 59, 59, 999);
          createdAtFilter.lte = endOfDay;
        }
        whereClause.createdAt = createdAtFilter;
      }

      // Amount range filter
      if (minAmount !== undefined || maxAmount !== undefined) {
        const amountFilter: Record<string, unknown> = {};
        if (minAmount !== undefined) {
          amountFilter.gte = minAmount;
        }
        if (maxAmount !== undefined) {
          amountFilter.lte = maxAmount;
        }
        whereClause.estimatedTotal = amountFilter;
      }

      // Carrier filter
      if (carriers && carriers.length > 0) {
        whereClause.carrier = { in: carriers };
      }

      // Cold chain filter
      if (requiresColdChain !== undefined) {
        whereClause.requiresColdChain = requiresColdChain;
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
        ORDER_PLACED: 0,
        PENDING_CONFIRMATION: 0,
        CONFIRMED: 0,
        AWAITING_PAYMENT: 0,
        PAID: 0,
        PREPARING: 0,
        READY_FOR_SHIPMENT: 0,
        IN_TRANSIT: 0,
        DELIVERED: 0,
        COMPLETED: 0,
        DISPUTED: 0,
        RESOLVED: 0,
        CANCELLED: 0,
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
      if (["ORDER_PLACED", "PENDING_CONFIRMATION"].includes(sc.status)) {
        stats.pending += sc._count.status;
      } else if (["CONFIRMED", "AWAITING_PAYMENT", "PAID", "PREPARING", "READY_FOR_SHIPMENT"].includes(sc.status)) {
        stats.processing += sc._count.status;
      } else if (sc.status === "IN_TRANSIT") {
        stats.shipped += sc._count.status;
      } else if (["DELIVERED", "COMPLETED"].includes(sc.status)) {
        stats.delivered += sc._count.status;
      }
    });

    // Calculate revenue from delivered orders
    const deliveredOrders = await ctx.db.bulkOrder.findMany({
      where: {
        id: { in: orderIds },
        status: { in: ["DELIVERED", "COMPLETED"] },
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
        status: z.enum(["CONFIRMED", "PAID", "COMPLETED", "DISPUTED", "CANCELLED"]),
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
        if (order.status !== "PENDING_CONFIRMATION") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only confirm orders that are pending confirmation",
          });
        }
      }

      if (input.status === "PAID") {
        if (order.status !== "AWAITING_PAYMENT") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only pay orders that are awaiting payment",
          });
        }
      }

      if (input.status === "COMPLETED") {
        if (order.status !== "DELIVERED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only complete orders that have been delivered",
          });
        }
      }

      if (input.status === "DISPUTED") {
        if (order.status !== "DELIVERED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only dispute orders that have been delivered",
          });
        }
      }

      if (input.status === "CANCELLED") {
        if (["PAID", "PREPARING", "READY_FOR_SHIPMENT", "IN_TRANSIT", "DELIVERED", "COMPLETED", "DISPUTED", "RESOLVED", "CANCELLED"].includes(order.status)) {
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

      switch (input.status) {
        case "CONFIRMED":
          updateData.confirmedAt = now;
          break;
        case "PAID":
          updateData.paidAt = now;
          updateData.paymentStatus = "paid";
          break;
        case "COMPLETED":
          updateData.completedAt = now;
          break;
        case "DISPUTED":
          updateData.disputedAt = now;
          if (input.notes) updateData.disputeReason = input.notes;
          break;
        case "CANCELLED":
          updateData.cancelledAt = now;
          break;
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
          notes: input.notes ?? (() => {
            switch (input.status) {
              case "CONFIRMED": return "Order confirmed by merchant";
              case "PAID": return "Payment confirmed by merchant";
              case "COMPLETED": return "Order completed by merchant";
              case "DISPUTED": return "Dispute raised by merchant";
              case "CANCELLED": return "Order cancelled by merchant";
              default: return "Status updated by merchant";
            }
          })(),
        },
      });

      return {
        success: true,
        order: updatedOrder,
      };
    }),
});
