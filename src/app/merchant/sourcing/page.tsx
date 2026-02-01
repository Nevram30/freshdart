"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  Info,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Fish,
  Eye,
  X,
  AlertTriangle,
  CheckCircle,
  Snowflake,
  Star,
  Package,
  Clock,
  Scale,
  Loader2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

// Types matching Prisma schema
type ProductType = "FRESH" | "FROZEN" | "PROCESSED" | "DRIED" | "LIVE";
type SeafoodType = "FISH" | "SHELLFISH" | "CRUSTACEAN" | "MOLLUSK" | "SEAWEED";

const categories = [
  { id: "all", name: "All Items", productType: null },
  { id: "fresh", name: "Fresh Catch", productType: "FRESH" as ProductType },
  { id: "frozen", name: "Frozen", productType: "FROZEN" as ProductType },
  { id: "live", name: "Live Seafood", productType: "LIVE" as ProductType },
  { id: "dried", name: "Dried Goods", productType: "DRIED" as ProductType },
  { id: "processed", name: "Processed", productType: "PROCESSED" as ProductType },
];

const seafoodTypeFilters = [
  { id: "all", name: "All Types" },
  { id: "FISH", name: "Fish" },
  { id: "SHELLFISH", name: "Shellfish" },
  { id: "CRUSTACEAN", name: "Crustaceans" },
  { id: "MOLLUSK", name: "Mollusks" },
  { id: "SEAWEED", name: "Seaweed" },
];

export default function SourcingMarketPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeafoodType, setSelectedSeafoodType] = useState("all");
  const [viewingProductId, setViewingProductId] = useState<string | null>(null);
  const [bulkOrderItems, setBulkOrderItems] = useState<Map<string, number>>(new Map());
  const [filters, setFilters] = useState({
    coldChainOnly: false,
    inStockOnly: true,
  });

  // Get the selected category's product type for the query
  const selectedCategory = categories.find((c) => c.id === activeCategory);
  const productTypeFilter = selectedCategory?.productType ?? undefined;
  const seafoodTypeFilter = selectedSeafoodType !== "all" ? (selectedSeafoodType as SeafoodType) : undefined;

  // Fetch products from database using tRPC
  const { data, isLoading, isError } = api.product.getForSourcing.useQuery({
    productType: productTypeFilter,
    seafoodType: seafoodTypeFilter,
    search: searchQuery.length > 0 ? searchQuery : undefined,
    requiresColdChain: filters.coldChainOnly ? true : undefined,
    inStockOnly: filters.inStockOnly,
    limit: 50,
  });

  // Get products from the query result
  const products = useMemo(() => data?.products ?? [], [data?.products]);

  // Find viewing product
  const viewingProduct = useMemo(() => {
    if (!viewingProductId) return null;
    return products.find((p) => p.id === viewingProductId) ?? null;
  }, [viewingProductId, products]);

  const handleAddToBulkOrder = (productId: string, minOrderQty: number, quantity?: number) => {
    const currentQty = bulkOrderItems.get(productId) ?? 0;
    const newQty = quantity ?? Number(minOrderQty);
    setBulkOrderItems(new Map(bulkOrderItems.set(productId, currentQty + newQty)));
  };

  const totalBulkItems = Array.from(bulkOrderItems.values()).reduce((sum, qty) => sum + qty, 0);

  const getStockStatus = (stockQuantity: number) => {
    if (stockQuantity === 0) return { label: "OUT OF STOCK", color: "bg-red-100 text-red-700" };
    if (stockQuantity < 10) return { label: "LOW STOCK", color: "bg-amber-100 text-amber-700" };
    return { label: "IN STOCK", color: "bg-green-100 text-green-700" };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sourcing Market</h1>
            <p className="mt-1 text-gray-600">
              Browse and source premium seafood directly from verified producers
            </p>
          </div>
          {totalBulkItems > 0 && (
            <div className="flex items-center gap-3 rounded-lg bg-blue-900 px-4 py-2.5 text-white">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">{totalBulkItems} items in bulk order</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for seafood, species, or local names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
                  activeCategory === category.id
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Seafood Type Filter */}
          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Type:</span>
            <div className="flex gap-2">
              {seafoodTypeFilters.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedSeafoodType(type.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all",
                    selectedSeafoodType === type.id
                      ? "bg-teal-100 text-teal-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

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
            <div className="mb-4 text-sm text-gray-600">
              Showing {products.length} products
            </div>
          )}

          {/* Product Grid */}
          {!isLoading && !isError && (
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const stockQty = Number(product.stockQuantity);
                const stockStatus = getStockStatus(stockQty);
                const price = Number(product.price);
                const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
                const minOrderQty = Number(product.minOrderQty);

                return (
                  <div
                    key={product.id}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0]?.url}
                          alt={product.images[0]?.alt ?? product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Fish className="h-16 w-16 text-teal-300" />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute left-3 top-3 flex flex-col gap-2">
                        {/* Featured Badge */}
                        {product.featured && (
                          <div className="flex items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-1 shadow-md">
                            <Star className="h-3.5 w-3.5 text-white" />
                            <span className="text-xs font-semibold text-white">Featured</span>
                          </div>
                        )}
                      </div>

                      {/* Cold Chain Indicator */}
                      {product.requiresColdChain && (
                        <div className="absolute bottom-3 right-3">
                          <div className="flex items-center gap-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                            <Snowflake className="h-3 w-3" />
                            Cold Chain
                          </div>
                        </div>
                      )}

                      {/* View Button */}
                      <button
                        onClick={() => setViewingProductId(product.id)}
                        className="absolute bottom-3 left-3 flex items-center gap-1 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      {/* Product Type Badge */}
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {product.productType}
                        </span>
                        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                          {product.seafoodType}
                        </span>
                      </div>

                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                        {product.localName && (
                          <p className="text-xs text-gray-500">({product.localName})</p>
                        )}
                      </div>

                      {/* Category Info */}
                      {product.category && (
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100">
                            <Fish className="h-3 w-3 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{product.category.name}</p>
                          </div>
                        </div>
                      )}

                      {/* Price and Stock */}
                      <div className="mb-3 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ₱{price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">/{product.stockUnit}</span>
                        {compareAtPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ₱{compareAtPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="mb-4 flex items-center gap-3 text-xs">
                        <span className="font-medium text-gray-600">
                          MOQ: {minOrderQty} {product.stockUnit}
                        </span>
                        <span className={cn("rounded-full px-2 py-0.5 font-semibold", stockStatus.color)}>
                          {stockStatus.label}
                        </span>
                      </div>

                      {/* Variants indicator */}
                      {product.variants.length > 0 && (
                        <div className="mb-3 text-xs text-teal-600">
                          {product.variants.length} variant{product.variants.length > 1 ? "s" : ""} available
                        </div>
                      )}

                      {/* Add to Bulk Order Button */}
                      <button
                        onClick={() => handleAddToBulkOrder(product.id, minOrderQty)}
                        disabled={stockQty === 0}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Bulk Order
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Fish className="h-16 w-16 text-gray-300" />
              <p className="mt-4 text-lg font-medium text-gray-500">No products found</p>
              <p className="mt-1 text-sm text-gray-400">
                Try adjusting your filters or search query
              </p>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !isError && products.length > 0 && (
            <div className="flex items-center justify-center gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 font-semibold text-white">
                1
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Advanced Filters Sidebar */}
        <div className="w-80 shrink-0">
          <div className="sticky top-6 space-y-6">
            {/* Filters Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button
                onClick={() =>
                  setFilters({
                    coldChainOnly: false,
                    inStockOnly: true,
                  })
                }
                className="text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                Reset
              </button>
            </div>

            {/* Stock & Cold Chain */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Availability</h3>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filters.inStockOnly}
                    onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500/20"
                  />
                  <span className="text-sm text-gray-700">In Stock Only</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filters.coldChainOnly}
                    onChange={(e) => setFilters({ ...filters, coldChainOnly: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500/20"
                  />
                  <div className="flex items-center gap-2">
                    <Snowflake className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Cold Chain Required</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Bulk Sourcing Help */}
            <div className="rounded-xl bg-teal-900 p-6 text-white">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-5 w-5" />
                <h3 className="font-bold">Bulk Sourcing Help</h3>
              </div>
              <p className="mb-4 text-sm text-teal-100">
                Need a customized quote or recurring order? Our sourcing agents can help you
                negotiate better terms directly with producers.
              </p>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-teal-900 transition-colors hover:bg-teal-50">
                <MessageCircle className="h-4 w-4" />
                Talk to an Agent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Product Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
              <button
                onClick={() => setViewingProductId(null)}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Product Content */}
            <div className="p-6">
              {/* Product Header */}
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-teal-100">
                  {viewingProduct.images.length > 0 ? (
                    <img
                      src={viewingProduct.images[0]?.url}
                      alt={viewingProduct.images[0]?.alt ?? viewingProduct.name}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <Fish className="h-10 w-10 text-teal-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-gray-900">{viewingProduct.name}</h3>
                    {viewingProduct.featured && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Featured
                      </span>
                    )}
                  </div>
                  {viewingProduct.localName && (
                    <p className="text-gray-500">({viewingProduct.localName})</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {viewingProduct.productType}
                    </span>
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                      {viewingProduct.seafoodType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {viewingProduct.shortDescription && (
                <div className="mb-6">
                  <p className="text-gray-700">{viewingProduct.shortDescription}</p>
                </div>
              )}

              {/* Category Info */}
              {viewingProduct.category && (
                <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                        <Fish className="h-6 w-6 text-teal-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{viewingProduct.category.name}</p>
                          <CheckCircle className="h-4 w-4 text-teal-600" />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5" />
                            Category
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing Section */}
              <div className="mb-6">
                <h4 className="mb-3 font-semibold text-gray-900">Pricing</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-teal-600">Price</p>
                    <p className="mt-1 text-xl font-bold text-teal-700">
                      ₱{Number(viewingProduct.price).toLocaleString()}
                    </p>
                    <p className="text-xs text-teal-600">per {viewingProduct.stockUnit}</p>
                  </div>
                  {viewingProduct.compareAtPrice && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Compare At
                      </p>
                      <p className="mt-1 text-xl font-bold text-gray-400 line-through">
                        ₱{Number(viewingProduct.compareAtPrice).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Min Order
                    </p>
                    <p className="mt-1 text-xl font-bold text-gray-700">
                      {Number(viewingProduct.minOrderQty)} {viewingProduct.stockUnit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stock & Availability */}
              <div className="mb-6">
                <h4 className="mb-3 font-semibold text-gray-900">Stock & Availability</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={cn(
                      "rounded-lg border p-4",
                      Number(viewingProduct.stockQuantity) < 10
                        ? "border-orange-200 bg-orange-50"
                        : "border-gray-200 bg-gray-50"
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs font-medium uppercase tracking-wide",
                        Number(viewingProduct.stockQuantity) < 10 ? "text-orange-600" : "text-gray-500"
                      )}
                    >
                      Available Stock
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-xl font-bold",
                        Number(viewingProduct.stockQuantity) < 10 ? "text-orange-600" : "text-gray-900"
                      )}
                    >
                      {Number(viewingProduct.stockQuantity)} {viewingProduct.stockUnit}
                    </p>
                    {Number(viewingProduct.stockQuantity) < 10 && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-orange-600">
                        <AlertTriangle className="h-3 w-3" />
                        Low stock
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-lg border p-4",
                      viewingProduct.requiresColdChain
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs font-medium uppercase tracking-wide",
                        viewingProduct.requiresColdChain ? "text-blue-600" : "text-gray-500"
                      )}
                    >
                      Cold Chain
                    </p>
                    <p
                      className={cn(
                        "mt-1 font-semibold",
                        viewingProduct.requiresColdChain ? "text-blue-700" : "text-gray-900"
                      )}
                    >
                      {viewingProduct.requiresColdChain ? "Required" : "Not Required"}
                    </p>
                  </div>
                  {viewingProduct.shelfLifeDays && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Shelf Life
                      </p>
                      <p className="mt-1 flex items-center gap-1 font-semibold text-gray-900">
                        <Clock className="h-4 w-4" />
                        {viewingProduct.shelfLifeDays} days
                      </p>
                    </div>
                  )}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Weight per Unit
                    </p>
                    <p className="mt-1 flex items-center gap-1 font-semibold text-gray-900">
                      <Scale className="h-4 w-4" />
                      {Number(viewingProduct.weightKg)} kg
                    </p>
                  </div>
                </div>
              </div>

              {/* Variants */}
              {viewingProduct.variants.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 font-semibold text-gray-900">
                    Available Variants ({viewingProduct.variants.length})
                  </h4>
                  <div className="space-y-3">
                    {viewingProduct.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{variant.name}</p>
                          <p className="text-sm text-gray-500">
                            SKU: {variant.sku} • {Number(variant.weightValue)}kg
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₱{Number(variant.price).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">{variant.stockQuantity} in stock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Species Info */}
              {viewingProduct.speciesName && (
                <div className="mb-6">
                  <h4 className="mb-3 font-semibold text-gray-900">Species Information</h4>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Scientific Name
                    </p>
                    <p className="mt-1 font-semibold italic text-gray-900">
                      {viewingProduct.speciesName}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {viewingProduct.tags.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 font-semibold text-gray-900">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingProduct.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description */}
              {viewingProduct.description && (
                <div className="mb-6">
                  <h4 className="mb-3 font-semibold text-gray-900">Full Description</h4>
                  <p className="text-gray-700">{viewingProduct.description}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div>
                <p className="text-sm text-gray-500">Add to your bulk order</p>
                <p className="font-semibold text-gray-900">
                  Min: {Number(viewingProduct.minOrderQty)} {viewingProduct.stockUnit}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewingProductId(null)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAddToBulkOrder(viewingProduct.id, Number(viewingProduct.minOrderQty));
                    setViewingProductId(null);
                  }}
                  disabled={Number(viewingProduct.stockQuantity) === 0}
                  className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Bulk Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
