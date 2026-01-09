"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export function CategorySidebar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const { data: categories, isLoading } = api.category.getAll.useQuery();

  if (isLoading) {
    return (
      <aside className="w-64 flex-shrink-0">
        <div className="sticky top-20 space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-100" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden w-64 flex-shrink-0 lg:block">
      <div className="sticky top-20">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Categories
        </h3>

        <nav className="space-y-1">
          <Link
            href="/products"
            className={cn(
              "flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              !currentCategory
                ? "bg-green-50 text-green-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <span>All Products</span>
          </Link>

          {categories?.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className={cn(
                "flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                currentCategory === category.slug
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span>{category.name}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  currentCategory === category.slug
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {category._count.products}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
