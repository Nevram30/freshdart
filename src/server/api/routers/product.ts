import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
  // Get all products with optional filtering
  getAll: publicProcedure
    .input(
      z.object({
        categorySlug: z.string().optional(),
        featured: z.boolean().optional(),
        status: z.enum(["ACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        sortBy: z.enum(["name", "price", "createdAt", "bestBefore"]).optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        categorySlug,
        featured,
        status = "ACTIVE",
        search,
        limit = 20,
        cursor,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = input ?? {};

      const where = {
        status,
        ...(categorySlug && {
          category: { slug: categorySlug },
        }),
        ...(featured !== undefined && { featured }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { tags: { has: search.toLowerCase() } },
          ],
        }),
      };

      const products = await ctx.db.product.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { [sortBy]: sortOrder },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (products.length > limit) {
        const nextItem = products.pop();
        nextCursor = nextItem!.id;
      }

      return {
        products,
        nextCursor,
      };
    }),

  // Get featured products
  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(8) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 8;

      const products = await ctx.db.product.findMany({
        where: {
          featured: true,
          status: "ACTIVE",
        },
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
        },
      });

      return products;
    }),

  // Get single product by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { slug: input.slug },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return product;
    }),

  // Get products by category
  getByCategory: publicProcedure
    .input(
      z.object({
        categorySlug: z.string(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { categorySlug, limit, cursor } = input;

      const products = await ctx.db.product.findMany({
        where: {
          category: { slug: categorySlug },
          status: "ACTIVE",
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (products.length > limit) {
        const nextItem = products.pop();
        nextCursor = nextItem!.id;
      }

      return {
        products,
        nextCursor,
      };
    }),

  // Get products expiring soon (for promotions/discounts)
  getExpiringSoon: publicProcedure
    .input(z.object({ days: z.number().min(1).max(7).default(3) }).optional())
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 3;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + days);

      const products = await ctx.db.product.findMany({
        where: {
          status: "ACTIVE",
          bestBefore: {
            gte: new Date(),
            lte: cutoffDate,
          },
        },
        orderBy: { bestBefore: "asc" },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
        },
      });

      return products;
    }),

  // Search products
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;

      const products = await ctx.db.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { shortDescription: { contains: query, mode: "insensitive" } },
            { tags: { has: query.toLowerCase() } },
          ],
        },
        take: limit,
        orderBy: { name: "asc" },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
        },
      });

      return products;
    }),
});
