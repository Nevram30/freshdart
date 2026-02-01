"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Search,
  Fish,
  Snowflake,
  Star,
  AlertTriangle,
  Loader2,
  Building2,
  CheckCircle,
  Package,
  Plus,
  Check,
  User,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { useBulkOrderStore, type SourcingProduct } from "~/stores/bulk-order-store";

interface ProducerProductsModalProps {
  producerId: string | null;
  onClose: () => void;
}

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

const businessTypeLabels: Record<string, string> = {
  MSME: "MSME",
  FISHERY: "Fishery",
  AQUACULTURE: "Aquaculture",
  PROCESSOR: "Processor",
};

export function ProducerProductsModal({ producerId, onClose }: ProducerProductsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("all");
  const [selectedSeafoodType, setSelectedSeafoodType] = useState("all");
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  // Bulk order store
  const addItem = useBulkOrderStore((state) => state.addItem);

  // Fetch producer with products
  const { data, isLoading, isError } = api.merchant.getProducerWithProducts.useQuery(
    {
      merchantId: producerId ?? "",
      productType: selectedProductType !== "all" ? (selectedProductType as ProductType) : undefined,
      seafoodType: selectedSeafoodType !== "all" ? (selectedSeafoodType as SeafoodType) : undefined,
      search: searchQuery.length > 0 ? searchQuery : undefined,
      inStockOnly: true,
    },
    {
      enabled: !!producerId,
    }
  );

  const producer = data?.producer;
  const products = data?.products ?? [];

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (producerId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [producerId]);

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

  if (!producerId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl transition-transform duration-300">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-teal-600">
          {/* Producer Info */}
          {producer && (
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/30 bg-white/20">
                    {producer.user.image ? (
                      <img
                        src={producer.user.image}
                        alt={producer.businessName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-white" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{producer.businessName}</h2>
                      {producer.verificationStatus === "VERIFIED" && (
                        <CheckCircle className="h-4 w-4 text-green-300" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-teal-100">
                      <span className="rounded-full bg-white/20 px-2 py-0.5">
                        {businessTypeLabels[producer.businessType] ?? producer.businessType}
                      </span>
                      <div className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        <span>{producer.productCount} products</span>
                      </div>
                      <Link
                        href={`/merchant/producers/${producerId}`}
                        className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 transition-colors hover:bg-white/30"
                      >
                        <User className="h-3.5 w-3.5" />
                        <span>View Profile</span>
                      </Link>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-teal-700/50 px-6 py-3">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border-0 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {productTypeFilters.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedProductType(type.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all",
                    selectedProductType === type.id
                      ? "bg-white text-teal-700"
                      : "bg-white/20 text-white hover:bg-white/30"
                  )}
                >
                  {type.name}
                </button>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {seafoodTypeFilters.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedSeafoodType(type.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all",
                    selectedSeafoodType === type.id
                      ? "bg-teal-100 text-teal-700"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  )}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-4 text-gray-500">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <p className="mt-4 text-lg font-medium text-gray-700">Failed to load products</p>
              <p className="mt-1 text-sm text-gray-500">Please try again later</p>
            </div>
          )}

          {/* Results Count */}
          {!isLoading && !isError && (
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-2 text-sm text-gray-600">
              Showing {products.length} products
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && !isError && (
            <div className="p-4">
              {products.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
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
                        className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-md"
                      >
                        <div className="flex gap-3 p-3">
                          {/* Product Image */}
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-teal-50">
                            {product.images.length > 0 ? (
                              <img
                                src={product.images[0]?.url}
                                alt={product.images[0]?.alt ?? product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Fish className="h-8 w-8 text-teal-300" />
                              </div>
                            )}

                            {/* Featured Badge */}
                            {product.featured && (
                              <div className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
                                <Star className="h-3 w-3 text-white" />
                              </div>
                            )}

                            {/* Cold Chain */}
                            {product.requiresColdChain && (
                              <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                                <Snowflake className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-semibold text-gray-900">
                                  {product.name}
                                </h4>
                                {product.localName && (
                                  <p className="truncate text-xs text-gray-500">
                                    ({product.localName})
                                  </p>
                                )}
                              </div>
                              <span className={cn("flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", stockStatus.color)}>
                                {stockStatus.label}
                              </span>
                            </div>

                            {/* Type Badges */}
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                                {product.productType}
                              </span>
                              <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] text-teal-700">
                                {product.seafoodType}
                              </span>
                            </div>

                            {/* Price & MOQ */}
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <div>
                                <span className="text-base font-bold text-gray-900">
                                  ₱{price.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500">/{product.stockUnit}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                MOQ: {minOrderQty}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Add to Bulk Order Button */}
                        <div className="border-t border-gray-100 p-2">
                          <button
                            onClick={() => handleAddToBulkOrder(product as SourcingProduct)}
                            disabled={stockQty === 0}
                            className={cn(
                              "flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400",
                              addedProducts.has(product.id)
                                ? "bg-green-600 text-white"
                                : "bg-teal-600 text-white hover:bg-teal-700"
                            )}
                          >
                            {addedProducts.has(product.id) ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                Added to Bulk Order
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
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
                    Try adjusting your filters or search query
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
