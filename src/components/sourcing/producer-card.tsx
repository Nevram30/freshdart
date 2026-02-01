"use client";

import {
  Fish,
  Star,
  CheckCircle,
  Package,
  TrendingUp,
  ChevronRight,
  Building2,
  Snowflake,
} from "lucide-react";
import { cn } from "~/lib/utils";

// Type for numeric values that could be Prisma Decimal, number, or string
type NumericValue = number | string | { toString(): string };

interface ProducerCardProps {
  producer: {
    id: string;
    businessName: string;
    businessType: string;
    businessSize: string;
    description: string | null;
    ratingAverage: NumericValue;
    totalSales: number;
    verificationStatus: string;
    isFeatured: boolean;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    featuredProduct: {
      id: string;
      name: string;
      localName: string | null;
      price: NumericValue;
      stockUnit: string;
      productType: string;
      requiresColdChain: boolean;
      images: Array<{
        url: string;
        alt: string | null;
      }>;
    } | null;
    productCount: number;
  };
  onViewProducts: (producerId: string) => void;
}

const businessTypeLabels: Record<string, string> = {
  MSME: "MSME",
  FISHERY: "Fishery",
  AQUACULTURE: "Aquaculture",
  PROCESSOR: "Processor",
};

const businessSizeLabels: Record<string, string> = {
  MICRO: "Micro",
  SMALL: "Small",
  MEDIUM: "Medium",
};

export function ProducerCard({ producer, onViewProducts }: ProducerCardProps) {
  const rating = typeof producer.ratingAverage === "number"
    ? producer.ratingAverage
    : parseFloat(producer.ratingAverage?.toString() ?? "0");

  const featuredProduct = producer.featuredProduct;
  const featuredProductPrice = featuredProduct
    ? typeof featuredProduct.price === "number"
      ? featuredProduct.price
      : parseFloat(featuredProduct.price?.toString() ?? "0")
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg">
      {/* Featured Badge */}
      {producer.isFeatured && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-1 shadow-md">
          <Star className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-semibold text-white">Featured</span>
        </div>
      )}

      {/* Verified Badge */}
      {producer.verificationStatus === "VERIFIED" && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 shadow-md">
          <CheckCircle className="h-3 w-3 text-white" />
          <span className="text-xs font-semibold text-white">Verified</span>
        </div>
      )}

      {/* Producer Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 pt-10">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/30 bg-white/20">
            {producer.user.image ? (
              <img
                src={producer.user.image}
                alt={producer.businessName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <Building2 className="h-7 w-7 text-white" />
            )}
          </div>

          {/* Business Info */}
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-lg font-bold text-white">
              {producer.businessName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-teal-100">
              <span className="rounded-full bg-white/20 px-2 py-0.5">
                {businessTypeLabels[producer.businessType] ?? producer.businessType}
              </span>
              <span>
                {businessSizeLabels[producer.businessSize] ?? producer.businessSize}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 text-xs text-teal-100">
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-white">{rating.toFixed(1)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{producer.totalSales} sales</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            <span className="font-medium text-white">{producer.productCount} products</span>
          </div>
        </div>
      </div>

      {/* Featured Product */}
      <div className="flex flex-1 flex-col p-4">
        {featuredProduct ? (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              Featured Product
            </p>
            <div className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
              {/* Product Image */}
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-teal-50">
                {featuredProduct.images.length > 0 ? (
                  <img
                    src={featuredProduct.images[0]?.url}
                    alt={featuredProduct.images[0]?.alt ?? featuredProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Fish className="h-8 w-8 text-teal-300" />
                  </div>
                )}
                {featuredProduct.requiresColdChain && (
                  <div className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                    <Snowflake className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="truncate text-sm font-semibold text-gray-900">
                  {featuredProduct.name}
                </h4>
                {featuredProduct.localName && (
                  <p className="truncate text-xs text-gray-500">
                    ({featuredProduct.localName})
                  </p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold text-teal-600">
                    ₱{featuredProductPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    /{featuredProduct.stockUnit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6">
            <p className="text-sm text-gray-400">No products listed yet</p>
          </div>
        )}

        {/* Description */}
        {producer.description && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
            {producer.description}
          </p>
        )}

        {/* View Products Button */}
        <div className="mt-auto">
          <button
            onClick={() => onViewProducts(producer.id)}
            disabled={producer.productCount === 0}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
              producer.productCount > 0
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "cursor-not-allowed bg-gray-100 text-gray-400"
            )}
          >
            View {producer.productCount} Products
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
