import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Enums matching Prisma schema
const BusinessTypeEnum = z.enum(["MSME", "FISHERY", "AQUACULTURE", "PROCESSOR"]);
const VerificationStatusEnum = z.enum(["PENDING", "VERIFIED", "REJECTED"]);

export const merchantRouter = createTRPCRouter({
  // Get all producers (users with PRODUCER role and merchant profile) for sourcing market
  getProducers: publicProcedure
    .input(
      z
        .object({
          businessType: BusinessTypeEnum.optional(),
          verificationStatus: VerificationStatusEnum.optional(),
          search: z.string().optional(),
          verifiedOnly: z.boolean().default(true),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        businessType,
        verificationStatus,
        search,
        verifiedOnly = true,
        limit = 20,
        cursor,
      } = input ?? {};

      const where = {
        user: {
          role: "PRODUCER" as const,
        },
        ...(verifiedOnly && { verificationStatus: "VERIFIED" as const }),
        ...(verificationStatus && { verificationStatus }),
        ...(businessType && { businessType }),
        ...(search && {
          OR: [
            { businessName: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const merchants = await ctx.db.merchant.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ isFeatured: "desc" }, { totalSales: "desc" }, { createdAt: "desc" }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          products: {
            where: {
              status: "ACTIVE",
            },
            take: 1,
            orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
            include: {
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
              },
              category: true,
            },
          },
          _count: {
            select: {
              products: {
                where: {
                  status: "ACTIVE",
                },
              },
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (merchants.length > limit) {
        const nextItem = merchants.pop();
        nextCursor = nextItem!.id;
      }

      return {
        producers: merchants.map((merchant) => ({
          id: merchant.id,
          userId: merchant.userId,
          businessName: merchant.businessName,
          businessType: merchant.businessType,
          businessSize: merchant.businessSize,
          description: merchant.description,
          ratingAverage: merchant.ratingAverage,
          totalSales: merchant.totalSales,
          verificationStatus: merchant.verificationStatus,
          isFeatured: merchant.isFeatured,
          user: merchant.user,
          featuredProduct: merchant.products[0] ?? null,
          productCount: merchant._count.products,
          createdAt: merchant.createdAt,
        })),
        nextCursor,
      };
    }),

  // Get a single producer with all their products
  getProducerWithProducts: publicProcedure
    .input(
      z.object({
        merchantId: z.string().min(1),
        productType: z.enum(["FRESH", "FROZEN", "PROCESSED", "DRIED", "LIVE"]).optional(),
        seafoodType: z.enum(["FISH", "SHELLFISH", "CRUSTACEAN", "MOLLUSK", "SEAWEED"]).optional(),
        search: z.string().optional(),
        inStockOnly: z.boolean().default(true),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        merchantId,
        productType,
        seafoodType,
        search,
        inStockOnly = true,
        limit = 50,
        cursor,
      } = input;

      // Get merchant info
      const merchant = await ctx.db.merchant.findUnique({
        where: { id: merchantId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              products: {
                where: {
                  status: "ACTIVE",
                },
              },
            },
          },
        },
      });

      if (!merchant) {
        return { producer: null, products: [], nextCursor: undefined };
      }

      // Get products with filters
      const productWhere = {
        merchantId,
        status: "ACTIVE" as const,
        ...(productType && { productType }),
        ...(seafoodType && { seafoodType }),
        ...(inStockOnly && { stockQuantity: { gt: 0 } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { localName: { contains: search, mode: "insensitive" as const } },
            { speciesName: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const products = await ctx.db.product.findMany({
        where: productWhere,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
          variants: true,
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (products.length > limit) {
        const nextItem = products.pop();
        nextCursor = nextItem!.id;
      }

      return {
        producer: {
          id: merchant.id,
          userId: merchant.userId,
          businessName: merchant.businessName,
          businessType: merchant.businessType,
          businessSize: merchant.businessSize,
          description: merchant.description,
          ratingAverage: merchant.ratingAverage,
          totalSales: merchant.totalSales,
          verificationStatus: merchant.verificationStatus,
          isFeatured: merchant.isFeatured,
          user: merchant.user,
          productCount: merchant._count.products,
          createdAt: merchant.createdAt,
        },
        products,
        nextCursor,
      };
    }),
});
