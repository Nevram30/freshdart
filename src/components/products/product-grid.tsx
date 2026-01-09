"use client";

import { ProductCard } from "./product-card";
import type { Product } from "~/types";
import { cn } from "~/lib/utils";

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ProductGrid({
  products,
  columns = 4,
  className,
}: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-6xl">🥬</div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          No products found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or check back later for new items.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6", gridCols[columns], className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
}

export function ProductGridSkeleton({
  count = 8,
  columns = 4,
}: ProductGridSkeletonProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", gridCols[columns])}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white"
        >
          <div className="aspect-square bg-gray-100" />
          <div className="p-4">
            <div className="mb-2 h-3 w-16 rounded bg-gray-100" />
            <div className="mb-2 h-5 w-3/4 rounded bg-gray-100" />
            <div className="mb-3 h-6 w-20 rounded-full bg-gray-100" />
            <div className="h-6 w-24 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
