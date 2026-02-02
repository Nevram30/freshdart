import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { BusinessType, BusinessSize } from "../../../../generated/prisma";

export const profileRouter = createTRPCRouter({
  // Get the current user's profile with merchant info and documents
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      include: {
        merchant: {
          include: {
            documents: {
              orderBy: { createdAt: "desc" },
            },
            _count: {
              select: {
                products: true,
              },
            },
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
      createdAt: user.createdAt,
      merchant: user.merchant
        ? {
            id: user.merchant.id,
            businessName: user.merchant.businessName,
            businessRegistrationNumber: user.merchant.businessRegistrationNumber,
            businessType: user.merchant.businessType,
            businessSize: user.merchant.businessSize,
            description: user.merchant.description,
            ratingAverage: user.merchant.ratingAverage,
            totalSales: user.merchant.totalSales,
            verificationStatus: user.merchant.verificationStatus,
            isFeatured: user.merchant.isFeatured,
            productCount: user.merchant._count.products,
            documents: user.merchant.documents.map((doc) => ({
              id: doc.id,
              documentType: doc.documentType,
              documentNumber: doc.documentNumber,
              documentUrl: doc.documentUrl,
              expiryDate: doc.expiryDate,
              status: doc.status,
              createdAt: doc.createdAt,
            })),
            createdAt: user.merchant.createdAt,
          }
        : null,
    };
  }),

  // Update user's personal information
  updatePersonalInfo: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        phone: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const updatedUser = await ctx.db.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          phone: input.phone,
        },
      });

      return {
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          phone: updatedUser.phone,
        },
      };
    }),

  // Update merchant/business information
  updateBusinessInfo: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(2, "Business name must be at least 2 characters"),
        businessType: z.nativeEnum(BusinessType),
        businessSize: z.nativeEnum(BusinessSize),
        description: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // First check if the user has a merchant profile
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        include: { merchant: true },
      });

      if (!user?.merchant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Merchant profile not found",
        });
      }

      const updatedMerchant = await ctx.db.merchant.update({
        where: { id: user.merchant.id },
        data: {
          businessName: input.businessName,
          businessType: input.businessType,
          businessSize: input.businessSize,
          description: input.description,
        },
      });

      return {
        success: true,
        merchant: {
          id: updatedMerchant.id,
          businessName: updatedMerchant.businessName,
          businessType: updatedMerchant.businessType,
          businessSize: updatedMerchant.businessSize,
          description: updatedMerchant.description,
        },
      };
    }),
});
