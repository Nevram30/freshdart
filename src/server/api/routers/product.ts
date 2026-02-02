import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

// Enums matching Prisma schema
const ProductStatusEnum = z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED", "OUT_OF_STOCK", "DISCONTINUED"]);
const ProductTypeEnum = z.enum(["FRESH", "FROZEN", "PROCESSED", "DRIED", "LIVE"]);
const SeafoodTypeEnum = z.enum(["FISH", "SHELLFISH", "CRUSTACEAN", "MOLLUSK", "SEAWEED"]);
const StockTypeEnum = z.enum(["WEIGHT", "UNIT"]);

// Variant schema for create/update
const VariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().min(0),
  weightValue: z.number().min(0),
  stockQuantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(10),
});

// Create product input schema
const CreateProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  productType: ProductTypeEnum.default("FRESH"),
  seafoodType: SeafoodTypeEnum.default("FISH"),
  speciesName: z.string().optional(),
  localName: z.string().optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().optional(),
  costPerItem: z.number().optional(),
  stockType: StockTypeEnum.default("WEIGHT"),
  stockQuantity: z.number().min(0),
  stockUnit: z.string().default("kg"),
  minOrderQty: z.number().min(0).default(1),
  maxOrderQty: z.number().optional(),
  weightKg: z.number().min(0).default(0),
  requiresColdChain: z.boolean().default(true),
  shelfLifeDays: z.number().int().optional(),
  categoryId: z.string().min(1),
  status: ProductStatusEnum.default("DRAFT"),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  variants: z.array(VariantSchema).default([]),
});

// Update product input schema
const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string().min(1),
});

export const productRouter = createTRPCRouter({
  // Get products for sourcing market (merchant view)
  getForSourcing: publicProcedure
    .input(
      z.object({
        productType: ProductTypeEnum.optional(),
        seafoodType: SeafoodTypeEnum.optional(),
        search: z.string().optional(),
        requiresColdChain: z.boolean().optional(),
        inStockOnly: z.boolean().default(true),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        productType,
        seafoodType,
        search,
        requiresColdChain,
        inStockOnly = true,
        limit = 50,
        cursor,
      } = input ?? {};

      const where = {
        status: "ACTIVE" as const,
        ...(productType && { productType }),
        ...(seafoodType && { seafoodType }),
        ...(requiresColdChain !== undefined && { requiresColdChain }),
        ...(inStockOnly && {
          stockQuantity: { gt: 0 },
        }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { localName: { contains: search, mode: "insensitive" as const } },
            { speciesName: { contains: search, mode: "insensitive" as const } },
            { tags: { has: search.toLowerCase() } },
          ],
        }),
      };

      const products = await ctx.db.product.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [
          { featured: "desc" },
          { createdAt: "desc" },
        ],
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
        products,
        nextCursor,
      };
    }),

  // Get all products with optional filtering
  getAll: publicProcedure
    .input(
      z.object({
        categorySlug: z.string().optional(),
        featured: z.boolean().optional(),
        status: ProductStatusEnum.optional(),
        productType: ProductTypeEnum.optional(),
        seafoodType: SeafoodTypeEnum.optional(),
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
        productType,
        seafoodType,
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
        ...(productType && { productType }),
        ...(seafoodType && { seafoodType }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { localName: { contains: search, mode: "insensitive" as const } },
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
          variants: true,
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

  // Get products for producer (all statuses) - filtered by logged-in producer's merchantId
  getForProducer: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        categoryId: z.string().optional(),
        status: ProductStatusEnum.optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        search,
        categoryId,
        status,
        limit = 50,
        cursor,
      } = input ?? {};

      // Get the user's merchant profile
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Merchant profile not found. Please complete your producer registration.",
        });
      }

      const where = {
        merchantId: merchant.id, // Filter by the producer's merchantId
        ...(status && { status }),
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { sku: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const products = await ctx.db.product.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
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
        products,
        nextCursor,
      };
    }),

  // Create a new product - links to the logged-in producer's merchantId
  create: protectedProcedure
    .input(CreateProductSchema)
    .mutation(async ({ ctx, input }) => {
      const { variants, ...productData } = input;

      // Get the user's merchant profile
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Merchant profile not found. Please complete your producer registration.",
        });
      }

      // Normalize optional string fields (treat empty strings as undefined)
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      const normalizedSlug = productData.slug || undefined;
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      const normalizedSku = productData.sku || undefined;

      // Generate slug if not provided
      const slug = normalizedSlug ?? productData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      // Check if slug already exists
      const existingProduct = await ctx.db.product.findUnique({
        where: { slug },
      });

      if (existingProduct) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A product with this slug already exists",
        });
      }

      // Check if SKU already exists (if provided)
      if (normalizedSku) {
        const existingSku = await ctx.db.product.findUnique({
          where: { sku: normalizedSku },
        });

        if (existingSku) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A product with this SKU already exists",
          });
        }
      }

      // Create product with variants and link to merchant
      const product = await ctx.db.product.create({
        data: {
          ...productData,
          slug,
          sku: normalizedSku ?? null,
          merchantId: merchant.id, // Link product to the producer's merchant profile
          variants: {
            create: variants.map((v) => ({
              name: v.name,
              sku: v.sku,
              price: v.price,
              weightValue: v.weightValue,
              stockQuantity: v.stockQuantity,
              lowStockThreshold: v.lowStockThreshold,
            })),
          },
        },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
          variants: true,
        },
      });

      return product;
    }),

  // Update an existing product - verifies ownership
  update: protectedProcedure
    .input(UpdateProductSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, variants, ...productData } = input;

      // Get the user's merchant profile
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Merchant profile not found.",
        });
      }

      // Normalize optional string fields (treat empty strings as undefined)
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      const normalizedSku = productData.sku || undefined;

      // Check if product exists and belongs to this producer
      const existingProduct = await ctx.db.product.findUnique({
        where: { id },
        include: { variants: true },
      });

      if (!existingProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Verify ownership
      if (existingProduct.merchantId !== merchant.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this product",
        });
      }

      // Check slug uniqueness if changed
      if (productData.slug && productData.slug !== existingProduct.slug) {
        const slugExists = await ctx.db.product.findUnique({
          where: { slug: productData.slug },
        });

        if (slugExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A product with this slug already exists",
          });
        }
      }

      // Check SKU uniqueness if changed
      if (normalizedSku && normalizedSku !== existingProduct.sku) {
        const skuExists = await ctx.db.product.findUnique({
          where: { sku: normalizedSku },
        });

        if (skuExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A product with this SKU already exists",
          });
        }
      }

      // Handle variants update
      if (variants) {
        // Get existing variant IDs
        const existingVariantIds = existingProduct.variants.map((v) => v.id);
        const inputVariantIds = variants.filter((v) => v.id).map((v) => v.id!);

        // Delete variants that are no longer in the input
        const variantsToDelete = existingVariantIds.filter((id) => !inputVariantIds.includes(id));

        if (variantsToDelete.length > 0) {
          await ctx.db.productVariant.deleteMany({
            where: { id: { in: variantsToDelete } },
          });
        }

        // Update or create variants
        for (const variant of variants) {
          if (variant.id && existingVariantIds.includes(variant.id)) {
            // Update existing variant
            await ctx.db.productVariant.update({
              where: { id: variant.id },
              data: {
                name: variant.name,
                sku: variant.sku,
                price: variant.price,
                weightValue: variant.weightValue,
                stockQuantity: variant.stockQuantity,
                lowStockThreshold: variant.lowStockThreshold,
              },
            });
          } else {
            // Create new variant
            await ctx.db.productVariant.create({
              data: {
                productId: id,
                name: variant.name,
                sku: variant.sku,
                price: variant.price,
                weightValue: variant.weightValue,
                stockQuantity: variant.stockQuantity,
                lowStockThreshold: variant.lowStockThreshold,
              },
            });
          }
        }
      }

      // Update product
      const product = await ctx.db.product.update({
        where: { id },
        data: {
          ...productData,
          sku: normalizedSku ?? null,
        },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
          variants: true,
        },
      });

      return product;
    }),

  // Delete a product - verifies ownership
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Get the user's merchant profile
      const merchant = await ctx.db.merchant.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Merchant profile not found.",
        });
      }

      // Check if product exists
      const existingProduct = await ctx.db.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Verify ownership
      if (existingProduct.merchantId !== merchant.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this product",
        });
      }

      // Delete product (variants and images will be cascade deleted)
      await ctx.db.product.delete({
        where: { id },
      });

      return { success: true };
    }),
});
