import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  UserRole,
  BusinessType,
  BusinessSize,
  DocumentType,
} from "../../../../generated/prisma";

// Document schema for merchant/producer registration
const documentSchema = z.object({
  documentType: z.nativeEnum(DocumentType),
  documentNumber: z.string().min(1, "Document number is required"),
  expiryDate: z.string().transform((str) => new Date(str)),
  documentUrl: z.string().optional(),
});

// Business info schema for merchant/producer registration
const businessInfoSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessRegistrationNumber: z.string().min(1, "Registration number is required"),
  businessType: z.nativeEnum(BusinessType),
  businessSize: z.nativeEnum(BusinessSize),
  description: z.string().optional(),
});

// Base registration schema
const baseRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(UserRole),
});

// Extended registration schema for merchants/producers
const merchantRegisterSchema = baseRegisterSchema.extend({
  businessInfo: businessInfoSchema.optional(),
  documents: z.array(documentSchema).optional(),
});

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(merchantRegisterSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, email, password, role, businessInfo, documents } = input;

      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this email already exists",
        });
      }

      // Validate that merchants/producers have business info
      if ((role === "MERCHANT" || role === "PRODUCER") && !businessInfo) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Business information is required for merchant/producer accounts",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user with merchant profile if applicable
      const user = await ctx.db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          // Create merchant profile for MERCHANT or PRODUCER roles
          ...(businessInfo && (role === "MERCHANT" || role === "PRODUCER")
            ? {
                merchant: {
                  create: {
                    businessName: businessInfo.businessName,
                    businessRegistrationNumber: businessInfo.businessRegistrationNumber,
                    businessType: businessInfo.businessType,
                    businessSize: businessInfo.businessSize,
                    description: businessInfo.description,
                    // Create documents if provided
                    ...(documents && documents.length > 0
                      ? {
                          documents: {
                            create: documents.map((doc) => ({
                              documentType: doc.documentType,
                              documentNumber: doc.documentNumber,
                              expiryDate: doc.expiryDate,
                              documentUrl: doc.documentUrl,
                            })),
                          },
                        }
                      : {}),
                  },
                },
              }
            : {}),
        },
        include: {
          merchant: {
            include: {
              documents: true,
            },
          },
        },
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          merchant: user.merchant
            ? {
                id: user.merchant.id,
                businessName: user.merchant.businessName,
                verificationStatus: user.merchant.verificationStatus,
                documentsCount: user.merchant.documents.length,
              }
            : null,
        },
      };
    }),
});
