import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

const bulkOrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  variantId: z.string().optional(),
});

const contactInfoSchema = z.object({
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().min(1, "Phone number is required"),
  companyName: z.string().optional(),
});

const shippingAddressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("Philippines"),
}).optional();

export const bulkOrderRouter = createTRPCRouter({
  // Submit a bulk order request
  submitBulkOrder: protectedProcedure
    .input(
      z.object({
        items: z.array(bulkOrderItemSchema).min(1, "At least one item is required"),
        contactInfo: contactInfoSchema,
        shippingAddress: shippingAddressSchema,
        preferredDeliveryDate: z.date().optional(),
        deliveryNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { items, contactInfo, shippingAddress, preferredDeliveryDate, deliveryNotes } = input;

      // Fetch all products
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

      // Validate all products exist and are active
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
      }

      // Calculate estimated totals
      let estimatedSubtotal = 0;
      let estimatedWeightKg = 0;
      const orderItems = [];

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId)!;
        const price = Number(product.price);
        const weight = Number(product.weightKg);
        const itemTotal = price * item.quantity;
        const itemWeight = weight * item.quantity;

        estimatedSubtotal += itemTotal;
        estimatedWeightKg += itemWeight;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productImage: product.images[0]?.url ?? null,
          localName: product.localName,
          productType: product.productType,
          seafoodType: product.seafoodType,
          quantity: item.quantity,
          unitType: product.stockUnit,
          unitPrice: price,
          totalPrice: itemTotal,
          weightKg: itemWeight,
        });
      }

      // Create bulk order
      const bulkOrder = await ctx.db.bulkOrder.create({
        data: {
          userId: ctx.session.user.id,
          estimatedSubtotal,
          estimatedTotal: estimatedSubtotal, // Will be updated with shipping when quote is generated
          estimatedWeightKg,
          preferredDeliveryDate,
          deliveryNotes,
          contactName: contactInfo.contactName,
          contactEmail: contactInfo.contactEmail,
          contactPhone: contactInfo.contactPhone,
          companyName: contactInfo.companyName,
          shippingAddress: shippingAddress ?? undefined,
          status: "PENDING",
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      return {
        success: true,
        bulkOrderId: bulkOrder.id,
        orderNumber: bulkOrder.orderNumber,
        message: "Your bulk order request has been submitted successfully. Our team will review and contact you shortly.",
      };
    }),

  // Request a quote (similar to bulk order but creates a Quote record)
  requestQuote: protectedProcedure
    .input(
      z.object({
        items: z.array(bulkOrderItemSchema).min(1, "At least one item is required"),
        contactInfo: contactInfoSchema,
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { items, contactInfo, notes } = input;

      // Fetch all products
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

      // Validate all products exist and are active
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
      }

      // Calculate totals
      let subtotal = 0;
      let totalWeightKg = 0;
      const quoteItems = [];

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId)!;
        const price = Number(product.price);
        const weight = Number(product.weightKg);
        const itemTotal = price * item.quantity;
        const itemWeight = weight * item.quantity;

        subtotal += itemTotal;
        totalWeightKg += itemWeight;

        quoteItems.push({
          productId: product.id,
          productName: product.name,
          productImage: product.images[0]?.url ?? null,
          localName: product.localName,
          productType: product.productType,
          seafoodType: product.seafoodType,
          quantity: item.quantity,
          unitType: product.stockUnit,
          unitPrice: price,
          totalPrice: itemTotal,
          weightKg: itemWeight,
        });
      }

      // Quote valid for 7 days
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 7);

      // Create quote
      const quote = await ctx.db.quote.create({
        data: {
          userId: ctx.session.user.id,
          subtotal,
          total: subtotal, // Will be updated with final pricing
          totalWeightKg,
          contactName: contactInfo.contactName,
          contactEmail: contactInfo.contactEmail,
          contactPhone: contactInfo.contactPhone,
          companyName: contactInfo.companyName,
          customerNotes: notes,
          validUntil,
          status: "PENDING",
          items: {
            create: quoteItems,
          },
        },
        include: {
          items: true,
        },
      });

      return {
        success: true,
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
        validUntil: quote.validUntil,
        message: "Your quote request has been submitted. We will prepare and send your quote shortly.",
      };
    }),

  // Get user's bulk orders
  getMyBulkOrders: protectedProcedure
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
          "SHIPPED",
          "DELIVERED",
          "CANCELLED",
          "REJECTED",
        ]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;
      const status = input?.status;

      const bulkOrders = await ctx.db.bulkOrder.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(status ? { status } : {}),
        },
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
          quote: true,
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (bulkOrders.length > limit) {
        const nextItem = bulkOrders.pop();
        nextCursor = nextItem!.id;
      }

      return {
        bulkOrders,
        nextCursor,
      };
    }),

  // Get single bulk order
  getBulkOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const bulkOrder = await ctx.db.bulkOrder.findFirst({
        where: {
          id: input.id,
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
          message: "Bulk order not found",
        });
      }

      return bulkOrder;
    }),

  // Get user's quotes
  getMyQuotes: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
        status: z.enum([
          "PENDING",
          "PROCESSING",
          "SENT",
          "ACCEPTED",
          "REJECTED",
          "EXPIRED",
        ]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;
      const status = input?.status;

      const quotes = await ctx.db.quote.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(status ? { status } : {}),
        },
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
          bulkOrder: true,
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (quotes.length > limit) {
        const nextItem = quotes.pop();
        nextCursor = nextItem!.id;
      }

      return {
        quotes,
        nextCursor,
      };
    }),

  // Get single quote
  getQuote: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const quote = await ctx.db.quote.findFirst({
        where: {
          id: input.id,
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
          bulkOrder: {
            include: {
              items: true,
            },
          },
        },
      });

      if (!quote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quote not found",
        });
      }

      return quote;
    }),

  // Cancel bulk order (only if pending or reviewing)
  cancelBulkOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const bulkOrder = await ctx.db.bulkOrder.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!bulkOrder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bulk order not found",
        });
      }

      if (!["PENDING", "REVIEWING", "QUOTED"].includes(bulkOrder.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot cancel this order. It is already being processed.",
        });
      }

      await ctx.db.bulkOrder.update({
        where: { id: input.id },
        data: { status: "CANCELLED" },
      });

      return {
        success: true,
        message: "Bulk order cancelled successfully",
      };
    }),
});
