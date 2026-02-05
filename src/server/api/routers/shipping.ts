import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

// Carrier enum matching Prisma
const ShippingCarrierEnum = z.enum([
  "JT_EXPRESS",
  "LALAMOVE",
  "GRAB_EXPRESS",
  "LBC",
  "GOGO_XPRESS",
  "NINJA_VAN",
  "SELF_DELIVERY",
  "OTHER",
]);

// Status enum matching Prisma
const BulkOrderStatusEnum = z.enum([
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
]);

// Cold chain surcharge rate (per kg)
const COLD_CHAIN_SURCHARGE_PER_KG = 25; // PHP 25 per kg for cold chain

export const shippingRouter = createTRPCRouter({
  // Add tracking information to an order
  addTracking: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        carrier: ShippingCarrierEnum,
        carrierOther: z.string().optional(),
        trackingNumber: z.string().min(1, "Tracking number is required"),
        trackingUrl: z.string().url().optional(),
        estimatedDeliveryDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the producer owns products in this order
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a registered producer",
        });
      }

      // Get producer's product IDs
      const producerProducts = await ctx.db.product.findMany({
        where: { merchantId: merchant.id },
        select: { id: true },
      });
      const productIds = producerProducts.map((p) => p.id);

      // Verify order contains producer's products
      const order = await ctx.db.bulkOrder.findFirst({
        where: {
          id: input.orderId,
          items: { some: { productId: { in: productIds } } },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Generate tracking URL based on carrier if not provided
      let trackingUrl = input.trackingUrl;
      if (!trackingUrl && input.trackingNumber) {
        trackingUrl = generateTrackingUrl(input.carrier, input.trackingNumber);
      }

      // Update order with tracking info
      const updatedOrder = await ctx.db.bulkOrder.update({
        where: { id: input.orderId },
        data: {
          carrier: input.carrier,
          carrierOther: input.carrierOther,
          trackingNumber: input.trackingNumber,
          trackingUrl,
          estimatedDeliveryDate: input.estimatedDeliveryDate,
          status: "IN_TRANSIT",
          inTransitAt: new Date(),
        },
      });

      // Add to status history
      await ctx.db.orderStatusHistory.create({
        data: {
          bulkOrderId: input.orderId,
          fromStatus: order.status,
          toStatus: "IN_TRANSIT",
          changedById: ctx.session.user.id,
          changedByName: ctx.session.user.name ?? "Unknown",
          changedByRole: "PRODUCER",
          notes: `Shipped via ${input.carrier}. Tracking: ${input.trackingNumber}`,
          metadata: {
            carrier: input.carrier,
            trackingNumber: input.trackingNumber,
            trackingUrl,
          },
        },
      });

      return {
        success: true,
        order: updatedOrder,
        trackingUrl,
      };
    }),

  // Update shipping status
  updateShippingStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: BulkOrderStatusEnum,
        notes: z.string().optional(),
        // For delivery confirmation
        deliveryProofUrl: z.string().url().optional(),
        deliverySignature: z.string().optional(),
        receivedBy: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify access
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a registered producer",
        });
      }

      const producerProducts = await ctx.db.product.findMany({
        where: { merchantId: merchant.id },
        select: { id: true },
      });
      const productIds = producerProducts.map((p) => p.id);

      const order = await ctx.db.bulkOrder.findFirst({
        where: {
          id: input.orderId,
          items: { some: { productId: { in: productIds } } },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Build update data based on new status
      const updateData: Record<string, unknown> = {
        status: input.status,
        notes: input.notes ?? order.notes,
      };

      // Set appropriate timestamp based on status
      const now = new Date();
      switch (input.status) {
        case "PENDING_CONFIRMATION":
          updateData.pendingConfirmationAt = now;
          break;
        case "CONFIRMED":
          updateData.confirmedAt = now;
          break;
        case "AWAITING_PAYMENT":
          updateData.awaitingPaymentAt = now;
          break;
        case "PAID":
          updateData.paidAt = now;
          break;
        case "PREPARING":
          updateData.preparingAt = now;
          break;
        case "READY_FOR_SHIPMENT":
          updateData.readyForShipmentAt = now;
          break;
        case "IN_TRANSIT":
          updateData.inTransitAt = now;
          break;
        case "DELIVERED":
          updateData.deliveredAt = now;
          updateData.actualDeliveryDate = now;
          if (input.deliveryProofUrl) updateData.deliveryProofUrl = input.deliveryProofUrl;
          if (input.deliverySignature) updateData.deliverySignature = input.deliverySignature;
          if (input.receivedBy) updateData.receivedBy = input.receivedBy;
          break;
        case "COMPLETED":
          updateData.completedAt = now;
          break;
        case "DISPUTED":
          updateData.disputedAt = now;
          break;
        case "RESOLVED":
          updateData.resolvedAt = now;
          break;
        case "CANCELLED":
          updateData.cancelledAt = now;
          break;
      }

      const updatedOrder = await ctx.db.bulkOrder.update({
        where: { id: input.orderId },
        data: updateData,
      });

      // Add to status history
      await ctx.db.orderStatusHistory.create({
        data: {
          bulkOrderId: input.orderId,
          fromStatus: order.status,
          toStatus: input.status,
          changedById: ctx.session.user.id,
          changedByName: ctx.session.user.name ?? "Unknown",
          changedByRole: "PRODUCER",
          notes: input.notes,
        },
      });

      return {
        success: true,
        order: updatedOrder,
      };
    }),

  // Get order status history
  getStatusHistory: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const history = await ctx.db.orderStatusHistory.findMany({
        where: { bulkOrderId: input.orderId },
        orderBy: { createdAt: "desc" },
      });

      return history;
    }),

  // Get shipments for producer (orders ready to ship or in transit)
  getProducerShipments: protectedProcedure
    .input(
      z.object({
        status: z.enum([
          "READY_TO_SHIP", // CONFIRMED + PROCESSING
          "IN_TRANSIT", // SHIPPED + IN_TRANSIT + OUT_FOR_DELIVERY
          "DELIVERED",
          "ALL",
        ]).optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;
      const statusFilter = input?.status ?? "ALL";

      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a registered producer",
        });
      }

      const producerProducts = await ctx.db.product.findMany({
        where: { merchantId: merchant.id },
        select: { id: true },
      });
      const productIds = producerProducts.map((p) => p.id);

      if (productIds.length === 0) {
        return { shipments: [], nextCursor: undefined };
      }

      // Get order IDs containing producer's products
      const orderItems = await ctx.db.bulkOrderItem.findMany({
        where: { productId: { in: productIds } },
        select: { bulkOrderId: true },
        distinct: ["bulkOrderId"],
      });
      const orderIds = orderItems.map((item) => item.bulkOrderId);

      // Build status filter
      let statusCondition: string[] = [];
      switch (statusFilter) {
        case "READY_TO_SHIP":
          statusCondition = ["PAID", "PREPARING", "READY_FOR_SHIPMENT"];
          break;
        case "IN_TRANSIT":
          statusCondition = ["IN_TRANSIT"];
          break;
        case "DELIVERED":
          statusCondition = ["DELIVERED", "COMPLETED"];
          break;
        default:
          statusCondition = [
            "PAID",
            "PREPARING",
            "READY_FOR_SHIPMENT",
            "IN_TRANSIT",
            "DELIVERED",
            "COMPLETED",
          ];
      }

      const shipments = await ctx.db.bulkOrder.findMany({
        where: {
          id: { in: orderIds },
          status: { in: statusCondition as never[] },
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
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
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (shipments.length > limit) {
        const nextItem = shipments.pop();
        nextCursor = nextItem!.id;
      }

      return {
        shipments,
        nextCursor,
      };
    }),

  // Get tracking info for merchant
  getTrackingInfo: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.bulkOrder.findFirst({
        where: {
          id: input.orderId,
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          carrier: true,
          carrierOther: true,
          trackingNumber: true,
          trackingUrl: true,
          estimatedDeliveryDate: true,
          actualDeliveryDate: true,
          inTransitAt: true,
          deliveredAt: true,
          deliveryProofUrl: true,
          receivedBy: true,
          shippingAddress: true,
          statusHistory: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return order;
    }),

  // Calculate shipping with cold chain surcharge
  calculateShipping: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().positive(),
          })
        ),
        shippingType: z.enum(["standard", "express"]).default("standard"),
      })
    )
    .query(async ({ ctx, input }) => {
      // Fetch products with cold chain info
      const productIds = input.items.map((item) => item.productId);
      const products = await ctx.db.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          weightKg: true,
          requiresColdChain: true,
          productType: true,
        },
      });

      let totalWeightKg = 0;
      let coldChainWeightKg = 0;
      let requiresColdChain = false;

      for (const item of input.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) continue;

        const itemWeight = Number(product.weightKg) * item.quantity;
        totalWeightKg += itemWeight;

        // Check if product requires cold chain
        if (
          product.requiresColdChain ||
          ["FRESH", "FROZEN", "LIVE"].includes(product.productType)
        ) {
          coldChainWeightKg += itemWeight;
          requiresColdChain = true;
        }
      }

      // Base shipping calculation
      let basePrice: number;
      let pricePerKg: number;
      let estimatedDays: number;

      if (input.shippingType === "express") {
        basePrice = 150;
        pricePerKg = 25;
        estimatedDays = 1;
      } else {
        // Standard rates by weight tier
        if (totalWeightKg <= 5) {
          basePrice = 50;
          pricePerKg = 15;
        } else if (totalWeightKg <= 15) {
          basePrice = 75;
          pricePerKg = 12;
        } else {
          basePrice = 100;
          pricePerKg = 10;
        }
        estimatedDays = 3;
      }

      const baseShippingCost = basePrice + totalWeightKg * pricePerKg;
      const coldChainSurcharge = requiresColdChain
        ? coldChainWeightKg * COLD_CHAIN_SURCHARGE_PER_KG
        : 0;
      const totalShippingCost = baseShippingCost + coldChainSurcharge;

      return {
        totalWeightKg,
        coldChainWeightKg,
        requiresColdChain,
        baseShippingCost,
        coldChainSurcharge,
        totalShippingCost,
        estimatedDays,
        shippingType: input.shippingType,
        breakdown: {
          basePrice,
          pricePerKg,
          coldChainPricePerKg: COLD_CHAIN_SURCHARGE_PER_KG,
        },
      };
    }),

  // Get available carriers
  getCarriers: protectedProcedure.query(async () => {
    return [
      { value: "JT_EXPRESS", label: "J&T Express", trackingUrlTemplate: "https://www.jtexpress.ph/trajectoryQuery?waybillNo={tracking}" },
      { value: "LALAMOVE", label: "Lalamove", trackingUrlTemplate: null },
      { value: "GRAB_EXPRESS", label: "Grab Express", trackingUrlTemplate: null },
      { value: "LBC", label: "LBC Express", trackingUrlTemplate: "https://www.lbcexpress.com/track?tracking_no={tracking}" },
      { value: "GOGO_XPRESS", label: "GoGo Xpress", trackingUrlTemplate: "https://gogoxpress.com/track/{tracking}" },
      { value: "NINJA_VAN", label: "Ninja Van", trackingUrlTemplate: "https://www.ninjavan.co/en-ph/tracking?id={tracking}" },
      { value: "SELF_DELIVERY", label: "Self Delivery", trackingUrlTemplate: null },
      { value: "OTHER", label: "Other", trackingUrlTemplate: null },
    ];
  }),

  // Confirm delivery (for merchants)
  confirmDelivery: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        receivedBy: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.bulkOrder.findFirst({
        where: {
          id: input.orderId,
          userId: ctx.session.user.id,
          status: { in: ["IN_TRANSIT"] },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found or not available for delivery confirmation",
        });
      }

      const now = new Date();

      const updatedOrder = await ctx.db.bulkOrder.update({
        where: { id: input.orderId },
        data: {
          status: "DELIVERED",
          deliveredAt: now,
          actualDeliveryDate: now,
          receivedBy: input.receivedBy ?? ctx.session.user.name,
        },
      });

      // Add to status history
      await ctx.db.orderStatusHistory.create({
        data: {
          bulkOrderId: input.orderId,
          fromStatus: order.status,
          toStatus: "DELIVERED",
          changedById: ctx.session.user.id,
          changedByName: ctx.session.user.name ?? "Unknown",
          changedByRole: "MERCHANT",
          notes: input.notes ?? "Delivery confirmed by merchant",
        },
      });

      return {
        success: true,
        order: updatedOrder,
      };
    }),
});

// Helper function to generate tracking URLs
function generateTrackingUrl(carrier: string, trackingNumber: string): string | undefined {
  const templates: Record<string, string> = {
    JT_EXPRESS: `https://www.jtexpress.ph/trajectoryQuery?waybillNo=${trackingNumber}`,
    LBC: `https://www.lbcexpress.com/track?tracking_no=${trackingNumber}`,
    GOGO_XPRESS: `https://gogoxpress.com/track/${trackingNumber}`,
    NINJA_VAN: `https://www.ninjavan.co/en-ph/tracking?id=${trackingNumber}`,
  };

  return templates[carrier];
}
