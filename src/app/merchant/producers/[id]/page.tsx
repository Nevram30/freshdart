"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Star,
  Package,
  MapPin,
  Calendar,
  TrendingUp,
  Fish,
  Snowflake,
  MessageCircle,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  Plus,
  Check,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { useBulkOrderStore, type SourcingProduct } from "~/stores/bulk-order-store";
import { BulkOrderDrawer } from "~/components/bulk-order";
import { useState } from "react";

const businessTypeLabels: Record<string, string> = {
  MSME: "MSME",
  FISHERY: "Fishery",
  AQUACULTURE: "Aquaculture",
  PROCESSOR: "Processor",
};

const businessSizeLabels: Record<string, string> = {
  MICRO: "Micro Enterprise",
  SMALL: "Small Enterprise",
  MEDIUM: "Medium Enterprise",
  LARGE: "Large Enterprise",
};

type ProductType = "FRESH" | "FROZEN" | "PROCESSED" | "DRIED" | "LIVE";
type SeafoodType = "FISH" | "SHELLFISH" | "CRUSTACEAN" | "MOLLUSK" | "SEAWEED";

const productTypeFilters = [
  { id: "all", name: "All Types" },
  { id: "FRESH", name: "Fresh" },
  { id: "FROZEN", name: "Frozen" },
  { id: "LIVE", name: "Live" },
  { id: "DRIED", name: "Dried" },
  { id: "PROCESSED", name: "Processed" },
];

const seafoodTypeFilters = [
  { id: "all", name: "All" },
  { id: "FISH", name: "Fish" },
  { id: "SHELLFISH", name: "Shellfish" },
  { id: "CRUSTACEAN", name: "Crustaceans" },
  { id: "MOLLUSK", name: "Mollusks" },
  { id: "SEAWEED", name: "Seaweed" },
];

export default function ProducerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [selectedProductType, setSelectedProductType] = useState("all");
  const [selectedSeafoodType, setSelectedSeafoodType] = useState("all");
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  // Bulk order store
  const addItem = useBulkOrderStore((state) => state.addItem);
  const openDrawer = useBulkOrderStore((state) => state.openDrawer);
  const items = useBulkOrderStore((state) => state.items);

  const bulkItemCount = items.length;
  const totalBulkItems = items.reduce((total, item) => total + item.quantity, 0);

  // Fetch producer with products
  const { data, isLoading, isError } = api.merchant.getProducerWithProducts.useQuery({
    merchantId: id,
    productType: selectedProductType !== "all" ? (selectedProductType as ProductType) : undefined,
    seafoodType: selectedSeafoodType !== "all" ? (selectedSeafoodType as SeafoodType) : undefined,
    inStockOnly: false,
  });

  const producer = data?.producer;
  const products = data?.products ?? [];

  const handleAddToBulkOrder = (product: SourcingProduct) => {
    const minQty = typeof product.minOrderQty === "number"
      ? product.minOrderQty
      : parseFloat(product.minOrderQty?.toString() ?? "1");
    addItem(product, minQty);
    setAddedProducts((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProducts((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  const getStockStatus = (stockQuantity: number | string) => {
    const qty = typeof stockQuantity === "number" ? stockQuantity : parseFloat(stockQuantity?.toString() ?? "0");
    if (qty === 0) return { label: "OUT OF STOCK", color: "bg-red-100 text-red-700" };
    if (qty < 10) return { label: "LOW STOCK", color: "bg-amber-100 text-amber-700" };
    return { label: "IN STOCK", color: "bg-green-100 text-green-700" };
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="mt-4 text-gray-500">Loading producer profile...</p>
      </div>
    );
  }

  // Error State
  if (isError || !producer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg font-medium text-gray-700">Producer not found</p>
        <p className="mt-1 text-sm text-gray-500">The producer you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/merchant/sourcing"
          className="mt-6 flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sourcing
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/merchant/sourcing"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Producer Profile</h1>
              <p className="mt-1 text-gray-600">View producer details and browse products</p>
            </div>
          </div>
          <button
            onClick={openDrawer}
            className="relative rounded-lg border border-gray-300 bg-white p-2.5 text-gray-600 transition-all hover:bg-gray-50"
          >
            <ShoppingCart className="h-5 w-5" />
            {bulkItemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                {totalBulkItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Producer Profile Card */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Cover/Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl border-4 border-white/30 bg-white/20">
              {producer.user.image ? (
                <img
                  src={producer.user.image}
                  alt={producer.businessName}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <Building2 className="h-12 w-12 text-white" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{producer.businessName}</h2>
                {producer.verificationStatus === "VERIFIED" && (
                  <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-semibold text-green-100">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verified
                  </div>
                )}
                {producer.isFeatured && (
                  <div className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-100">
                    <Star className="h-3.5 w-3.5" />
                    Featured
                  </div>
                )}
              </div>
              <p className="mt-2 text-teal-100">
                {producer.description ?? "Premium seafood producer supplying fresh catches daily."}
              </p>

              {/* Badges */}
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                  {businessTypeLabels[producer.businessType] ?? producer.businessType}
                </span>
                {producer.businessSize && (
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                    {businessSizeLabels[producer.businessSize] ?? producer.businessSize}
                  </span>
                )}
              </div>
            </div>

            {/* Contact Button */}
            <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50">
              <MessageCircle className="h-4 w-4" />
              Contact Producer
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 divide-x divide-gray-100 border-t border-gray-100">
          <div className="px-6 py-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <Package className="h-5 w-5 text-teal-600" />
              <span className="text-2xl font-bold text-gray-900">{producer.productCount}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Products</p>
          </div>
          <div className="px-6 py-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold text-gray-900">
                {producer.ratingAverage ? Number(producer.ratingAverage).toFixed(1) : "N/A"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Rating</p>
          </div>
          <div className="px-6 py-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {producer.totalSales ? Number(producer.totalSales).toLocaleString() : "0"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Total Sales</p>
          </div>
          <div className="px-6 py-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {new Date(producer.createdAt).getFullYear()}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Member Since</p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Products</h3>
          <p className="text-sm text-gray-500">Browse all products from this producer</p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            {productTypeFilters.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedProductType(type.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all",
                  selectedProductType === type.id
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {type.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {seafoodTypeFilters.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedSeafoodType(type.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  selectedSeafoodType === type.id
                    ? "bg-teal-100 text-teal-700"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {products.length} products
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const stockQty = typeof product.stockQuantity === "number"
                ? product.stockQuantity
                : parseFloat(product.stockQuantity?.toString() ?? "0");
              const stockStatus = getStockStatus(stockQty);
              const price = typeof product.price === "number"
                ? product.price
                : parseFloat(product.price?.toString() ?? "0");
              const minOrderQty = typeof product.minOrderQty === "number"
                ? product.minOrderQty
                : parseFloat(product.minOrderQty?.toString() ?? "1");

              return (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-teal-50">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0]?.url}
                        alt={product.images[0]?.alt ?? product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Fish className="h-16 w-16 text-teal-200" />
                      </div>
                    )}

                    {/* Featured Badge */}
                    {product.featured && (
                      <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 shadow-md">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                    )}

                    {/* Cold Chain */}
                    {product.requiresColdChain && (
                      <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 shadow-md">
                        <Snowflake className="h-4 w-4 text-white" />
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    <div className="absolute right-2 top-2">
                      <span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold shadow-sm", stockStatus.color)}>
                        {stockStatus.label}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h4 className="truncate text-sm font-semibold text-gray-900">
                      {product.name}
                    </h4>
                    {product.localName && (
                      <p className="truncate text-xs text-gray-500">
                        ({product.localName})
                      </p>
                    )}

                    {/* Type Badges */}
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                        {product.productType}
                      </span>
                      <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] text-teal-700">
                        {product.seafoodType}
                      </span>
                    </div>

                    {/* Price & MOQ */}
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          ₱{price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">/{product.stockUnit}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        MOQ: {minOrderQty}
                      </span>
                    </div>

                    {/* Add to Bulk Order Button */}
                    <button
                      onClick={() => handleAddToBulkOrder(product as SourcingProduct)}
                      disabled={stockQty === 0}
                      className={cn(
                        "mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400",
                        addedProducts.has(product.id)
                          ? "bg-green-600 text-white"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      )}
                    >
                      {addedProducts.has(product.id) ? (
                        <>
                          <Check className="h-4 w-4" />
                          Added to Bulk Order
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add to Bulk Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Fish className="h-16 w-16 text-gray-300" />
            <p className="mt-4 text-lg font-medium text-gray-500">No products found</p>
            <p className="mt-1 text-sm text-gray-400">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>

      {/* Bulk Order Drawer */}
      <BulkOrderDrawer />
    </div>
  );
}
