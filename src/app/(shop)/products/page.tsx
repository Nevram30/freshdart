"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { api } from "~/trpc/react";
import { ProductGrid, ProductGridSkeleton } from "~/components/products/product-grid";
import { CategorySidebar } from "~/components/layout/category-sidebar";
import { Button } from "~/components/ui/button";
import type { Product } from "~/types";

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const featured = searchParams.get("featured") === "true" ? true : undefined;
  const search = searchParams.get("search") ?? undefined;

  const { data, isLoading, isError, error } = api.product.getAll.useQuery({
    categorySlug: category,
    featured,
    search,
    limit: 20,
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-6xl">😕</div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          Something went wrong
        </h3>
        <p className="text-gray-500">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return <ProductGridSkeleton count={8} />;
  }

  // Transform Prisma products to our Product type
  const products: Product[] = data?.products.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    stockQuantity: Number(p.stockQuantity),
    minOrderQty: Number(p.minOrderQty),
    maxOrderQty: p.maxOrderQty ? Number(p.maxOrderQty) : null,
    weightKg: Number(p.weightKg),
  })) ?? [];

  return <ProductGrid products={products} columns={3} />;
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const featured = searchParams.get("featured") === "true";

  const getTitle = () => {
    if (featured) return "Featured Products";
    if (category) {
      return category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return "All Products";
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {getTitle()}
          </h1>
          <p className="mt-2 text-gray-500">
            Fresh produce and quality processed foods delivered to your door
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <CategorySidebar />

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20">
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="freshness">Freshness</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <ProductsContent />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50/50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="h-9 w-48 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-5 w-72 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="flex gap-8">
              <div className="hidden w-64 lg:block" />
              <main className="flex-1">
                <ProductGridSkeleton count={8} columns={3} />
              </main>
            </div>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
