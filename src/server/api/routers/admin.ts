import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const VerificationStatusEnum = z.enum(["PENDING", "VERIFIED", "REJECTED"]);
const UserRoleEnum = z.enum(["CUSTOMER", "MERCHANT", "PRODUCER", "ADMIN"]);

export const adminRouter = createTRPCRouter({
  // Get all producers for review
  getProducers: adminProcedure
    .input(
      z
        .object({
          verificationStatus: VerificationStatusEnum.optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        verificationStatus,
        search,
        limit = 20,
        cursor,
      } = input ?? {};

      const where = {
        user: {
          role: "PRODUCER" as const,
        },
        ...(verificationStatus && { verificationStatus }),
        ...(search && {
          OR: [
            { businessName: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { user: { name: { contains: search, mode: "insensitive" as const } } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }),
      };

      const merchants = await ctx.db.merchant.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ createdAt: "desc" }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
              createdAt: true,
            },
          },
          documents: {
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              products: true,
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
          businessRegistrationNumber: merchant.businessRegistrationNumber,
          businessType: merchant.businessType,
          businessSize: merchant.businessSize,
          description: merchant.description,
          ratingAverage: merchant.ratingAverage,
          totalSales: merchant.totalSales,
          verificationStatus: merchant.verificationStatus,
          isFeatured: merchant.isFeatured,
          user: merchant.user,
          documents: merchant.documents,
          productCount: merchant._count.products,
          createdAt: merchant.createdAt,
          updatedAt: merchant.updatedAt,
        })),
        nextCursor,
      };
    }),

  // Get single producer details for review
  getProducerDetails: adminProcedure
    .input(
      z.object({
        merchantId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const merchant = await ctx.db.merchant.findUnique({
        where: { id: input.merchantId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
              createdAt: true,
            },
          },
          documents: {
            orderBy: { createdAt: "desc" },
          },
          products: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              images: {
                take: 1,
                orderBy: { sortOrder: "asc" },
              },
              category: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Producer not found",
        });
      }

      return {
        id: merchant.id,
        userId: merchant.userId,
        businessName: merchant.businessName,
        businessRegistrationNumber: merchant.businessRegistrationNumber,
        businessType: merchant.businessType,
        businessSize: merchant.businessSize,
        description: merchant.description,
        ratingAverage: merchant.ratingAverage,
        totalSales: merchant.totalSales,
        verificationStatus: merchant.verificationStatus,
        isFeatured: merchant.isFeatured,
        user: merchant.user,
        documents: merchant.documents,
        products: merchant.products,
        productCount: merchant._count.products,
        createdAt: merchant.createdAt,
        updatedAt: merchant.updatedAt,
      };
    }),

  // Update producer verification status
  updateVerificationStatus: adminProcedure
    .input(
      z.object({
        merchantId: z.string().min(1),
        verificationStatus: VerificationStatusEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const merchant = await ctx.db.merchant.findUnique({
        where: { id: input.merchantId },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Producer not found",
        });
      }

      const updated = await ctx.db.merchant.update({
        where: { id: input.merchantId },
        data: {
          verificationStatus: input.verificationStatus,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        producer: {
          id: updated.id,
          businessName: updated.businessName,
          verificationStatus: updated.verificationStatus,
          user: updated.user,
        },
      };
    }),

  // Get verification stats for dashboard
  getVerificationStats: adminProcedure.query(async ({ ctx }) => {
    const [pending, verified, rejected, total] = await Promise.all([
      ctx.db.merchant.count({
        where: {
          user: { role: "PRODUCER" },
          verificationStatus: "PENDING",
        },
      }),
      ctx.db.merchant.count({
        where: {
          user: { role: "PRODUCER" },
          verificationStatus: "VERIFIED",
        },
      }),
      ctx.db.merchant.count({
        where: {
          user: { role: "PRODUCER" },
          verificationStatus: "REJECTED",
        },
      }),
      ctx.db.merchant.count({
        where: {
          user: { role: "PRODUCER" },
        },
      }),
    ]);

    return {
      pending,
      verified,
      rejected,
      total,
    };
  }),

  // ============================================
  // USER MANAGEMENT
  // ============================================

  // Get all users
  getUsers: adminProcedure
    .input(
      z
        .object({
          role: UserRoleEnum.optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { role, search, limit = 20, cursor } = input ?? {};

      const where = {
        ...(role && { role }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const users = await ctx.db.user.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          merchant: {
            select: {
              id: true,
              businessName: true,
              verificationStatus: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (users.length > limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }

      return {
        users: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          image: user.image,
          role: user.role,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          merchant: user.merchant,
          orderCount: user._count.orders,
        })),
        nextCursor,
      };
    }),

  // Get user details
  getUserDetails: adminProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          merchant: {
            include: {
              documents: true,
              _count: {
                select: {
                  products: true,
                },
              },
            },
          },
          orders: {
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              orderNumber: true,
              total: true,
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              orders: true,
              bulkOrders: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        defaultAddress: user.defaultAddress,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        merchant: user.merchant,
        recentOrders: user.orders,
        orderCount: user._count.orders,
        bulkOrderCount: user._count.bulkOrders,
      };
    }),

  // Update user role
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        role: UserRoleEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Prevent changing own role
      if (user.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot change your own role",
        });
      }

      const updated = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return {
        success: true,
        user: updated,
      };
    }),

  // ============================================
  // MERCHANT MANAGEMENT
  // ============================================

  // Get all merchants
  getMerchants: adminProcedure
    .input(
      z
        .object({
          verificationStatus: VerificationStatusEnum.optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        verificationStatus,
        search,
        limit = 20,
        cursor,
      } = input ?? {};

      const where = {
        user: {
          role: "MERCHANT" as const,
        },
        ...(verificationStatus && { verificationStatus }),
        ...(search && {
          OR: [
            { businessName: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { user: { name: { contains: search, mode: "insensitive" as const } } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }),
      };

      const merchants = await ctx.db.merchant.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ createdAt: "desc" }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
              createdAt: true,
              _count: {
                select: {
                  orders: true,
                  bulkOrders: true,
                },
              },
            },
          },
          documents: {
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              products: true,
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
        merchants: merchants.map((merchant) => ({
          id: merchant.id,
          userId: merchant.userId,
          businessName: merchant.businessName,
          businessRegistrationNumber: merchant.businessRegistrationNumber,
          businessType: merchant.businessType,
          businessSize: merchant.businessSize,
          description: merchant.description,
          ratingAverage: merchant.ratingAverage,
          totalSales: merchant.totalSales,
          verificationStatus: merchant.verificationStatus,
          isFeatured: merchant.isFeatured,
          user: merchant.user,
          documents: merchant.documents,
          productCount: merchant._count.products,
          orderCount: merchant.user._count.orders,
          bulkOrderCount: merchant.user._count.bulkOrders,
          createdAt: merchant.createdAt,
          updatedAt: merchant.updatedAt,
        })),
        nextCursor,
      };
    }),

  // Get single merchant details
  getMerchantDetails: adminProcedure
    .input(
      z.object({
        merchantId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const merchant = await ctx.db.merchant.findFirst({
        where: {
          id: input.merchantId,
          user: {
            role: "MERCHANT",
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
              createdAt: true,
              _count: {
                select: {
                  orders: true,
                  bulkOrders: true,
                },
              },
            },
          },
          documents: {
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Merchant not found",
        });
      }

      return {
        id: merchant.id,
        userId: merchant.userId,
        businessName: merchant.businessName,
        businessRegistrationNumber: merchant.businessRegistrationNumber,
        businessType: merchant.businessType,
        businessSize: merchant.businessSize,
        description: merchant.description,
        ratingAverage: merchant.ratingAverage,
        totalSales: merchant.totalSales,
        verificationStatus: merchant.verificationStatus,
        isFeatured: merchant.isFeatured,
        user: merchant.user,
        documents: merchant.documents,
        productCount: merchant._count.products,
        orderCount: merchant.user._count.orders,
        bulkOrderCount: merchant.user._count.bulkOrders,
        createdAt: merchant.createdAt,
        updatedAt: merchant.updatedAt,
      };
    }),

  // Get merchant stats for dashboard
  getMerchantStats: adminProcedure.query(async ({ ctx }) => {
    const [pending, verified, rejected, total] = await Promise.all([
      ctx.db.merchant.count({
        where: {
          user: { role: "MERCHANT" },
          verificationStatus: "PENDING",
        },
      }),
      ctx.db.merchant.count({
        where: {
          user: { role: "MERCHANT" },
          verificationStatus: "VERIFIED",
        },
      }),
      ctx.db.merchant.count({
        where: {
          user: { role: "MERCHANT" },
          verificationStatus: "REJECTED",
        },
      }),
      ctx.db.merchant.count({
        where: {
          user: { role: "MERCHANT" },
        },
      }),
    ]);

    return {
      pending,
      verified,
      rejected,
      total,
    };
  }),

  // Update merchant verification status
  updateMerchantVerificationStatus: adminProcedure
    .input(
      z.object({
        merchantId: z.string().min(1),
        verificationStatus: VerificationStatusEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const merchant = await ctx.db.merchant.findFirst({
        where: {
          id: input.merchantId,
          user: {
            role: "MERCHANT",
          },
        },
      });

      if (!merchant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Merchant not found",
        });
      }

      const updated = await ctx.db.merchant.update({
        where: { id: input.merchantId },
        data: {
          verificationStatus: input.verificationStatus,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        merchant: {
          id: updated.id,
          businessName: updated.businessName,
          verificationStatus: updated.verificationStatus,
          user: updated.user,
        },
      };
    }),

  // Get user stats for dashboard
  getUserStats: adminProcedure.query(async ({ ctx }) => {
    const [customers, merchants, producers, admins, total] = await Promise.all([
      ctx.db.user.count({ where: { role: "CUSTOMER" } }),
      ctx.db.user.count({ where: { role: "MERCHANT" } }),
      ctx.db.user.count({ where: { role: "PRODUCER" } }),
      ctx.db.user.count({ where: { role: "ADMIN" } }),
      ctx.db.user.count(),
    ]);

    return {
      customers,
      merchants,
      producers,
      admins,
      total,
    };
  }),
});
