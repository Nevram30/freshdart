import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { calculateShippingCost } from "~/lib/shipping";
import { createPaymongoCheckout } from "~/lib/paymongo";

const shippingAddressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("Philippines"),
  phone: z.string().min(1, "Phone number is required"),
});

const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
});

export const checkoutRouter = createTRPCRouter({
  // Calculate cart totals (public - for cart preview)
  calculateTotals: publicProcedure
    .input(
      z.object({
        items: z.array(cartItemSchema),
        shippingType: z.enum(["standard", "express"]).default("standard"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { items, shippingType } = input;

      if (items.length === 0) {
        return {
          subtotal: 0,
          shippingCost: 0,
          tax: 0,
          total: 0,
          totalWeight: 0,
          estimatedDays: 0,
        };
      }

      // Fetch products
      const productIds = items.map((item) => item.productId);
      const products = await ctx.db.product.findMany({
        where: { id: { in: productIds } },
      });

      // Calculate totals
      let subtotal = 0;
      let totalWeight = 0;

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) continue;

        const price = Number(product.price);
        const weight = Number(product.weightKg);

        subtotal += price * item.quantity;
        totalWeight += weight * item.quantity;
      }

      const shipping = calculateShippingCost(totalWeight, shippingType);
      const tax = 0; // Implement tax calculation if needed

      return {
        subtotal,
        shippingCost: shipping.cost,
        tax,
        total: subtotal + shipping.cost + tax,
        totalWeight,
        estimatedDays: shipping.estimatedDays,
        shippingRateName: shipping.rateName,
      };
    }),

  // Create checkout session (authenticated)
  createSession: protectedProcedure
    .input(
      z.object({
        items: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
        shippingAddress: shippingAddressSchema,
        deliveryDate: z.date(),
        deliveryTimeSlot: z.string(),
        deliveryNotes: z.string().optional(),
        shippingType: z.enum(["standard", "express"]).default("standard"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        items,
        shippingAddress,
        deliveryDate,
        deliveryTimeSlot,
        deliveryNotes,
        shippingType,
      } = input;

      // Validate products and stock
      const productIds = items.map((item) => item.productId);
      const products = await ctx.db.product.findMany({
        where: { id: { in: productIds } },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      });

      // Check all products exist and are in stock
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);

        if (!product) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Product not found: ${item.productId}`,
          });
        }

        if (product.status !== "ACTIVE") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Product is not available: ${product.name}`,
          });
        }

        const stockQty = Number(product.stockQuantity);
        if (stockQty < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock for ${product.name}. Available: ${stockQty}`,
          });
        }
      }

      // Calculate totals
      let subtotal = 0;
      let totalWeight = 0;
      const orderItems = [];

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId)!;
        const price = Number(product.price);
        const weight = Number(product.weightKg);
        const itemTotal = price * item.quantity;
        const itemWeight = weight * item.quantity;

        subtotal += itemTotal;
        totalWeight += itemWeight;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productImage: product.images[0]?.url ?? null,
          quantity: item.quantity,
          unitType: product.stockUnit,
          unitPrice: price,
          totalPrice: itemTotal,
          weightKg: itemWeight,
        });
      }

      const shipping = calculateShippingCost(totalWeight, shippingType);
      const tax = 0;
      const total = subtotal + shipping.cost + tax;

      // Create order in database
      const order = await ctx.db.order.create({
        data: {
          userId: ctx.session.user.id,
          subtotal,
          shippingCost: shipping.cost,
          tax,
          total,
          totalWeightKg: totalWeight,
          deliveryDate,
          deliveryTimeSlot,
          deliveryNotes,
          shippingAddress,
          paymentMethod: "paymongo",
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Create Paymongo checkout session
      // Note: You need to add PAYMONGO_SECRET_KEY to your .env
      const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;

      if (!paymongoSecretKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment configuration error",
        });
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const checkoutSession = await createPaymongoCheckout({
          amount: Math.round(total * 100), // Convert to centavos
          description: `Order #${order.orderNumber}`,
          orderId: order.id,
          customerEmail: ctx.session.user.email ?? undefined,
          customerName: ctx.session.user.name ?? undefined,
          successUrl: `${baseUrl}/checkout/success?order_id=${order.id}`,
          cancelUrl: `${baseUrl}/checkout/cancel?order_id=${order.id}`,
          lineItems: orderItems.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            amount: Math.round(item.unitPrice * 100),
          })),
        });

        // Update order with payment intent ID
        await ctx.db.order.update({
          where: { id: order.id },
          data: { paymentIntentId: checkoutSession.id },
        });

        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          checkoutUrl: checkoutSession.checkout_url,
        };
      } catch {
        // If payment creation fails, delete the order
        await ctx.db.order.delete({ where: { id: order.id } });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create payment session",
        });
      }
    }),

  // Get order status
  getOrderStatus: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findFirst({
        where: {
          id: input.orderId,
          userId: ctx.session.user.id,
        },
        include: {
          items: {
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

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return order;
    }),

  // Get user's orders
  getMyOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;

      const orders = await ctx.db.order.findMany({
        where: { userId: ctx.session.user.id },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
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
      if (orders.length > limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem!.id;
      }

      return {
        orders,
        nextCursor,
      };
    }),
});

