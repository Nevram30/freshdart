"use client";

import Link from "next/link";
import { ShoppingCart, Search, User, Menu, Leaf } from "lucide-react";
import { useCartStore } from "~/stores/cart-store";
import { Button } from "~/components/ui/button";

export function Header() {
  const openCart = useCartStore((state) => state.openCart);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const itemCount = getItemCount();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">FreshDart</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/products"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-green-600"
            >
              All Products
            </Link>
            <Link
              href="/products?category=fresh-produce"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-green-600"
            >
              Fresh Produce
            </Link>
            <Link
              href="/products?category=processed"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-green-600"
            >
              Processed Foods
            </Link>
            <Link
              href="/products?featured=true"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-green-600"
            >
              Featured
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden flex-1 max-w-md lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <User className="h-5 w-5" />
            </Button>

            <button
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-600"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
