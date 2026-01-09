"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, Moon, Anchor } from "lucide-react";
import { useCartStore } from "~/stores/cart-store";

export function Header() {
  const openCart = useCartStore((state) => state.openCart);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const itemCount = getItemCount();

  return (
    <header className="sticky top-0 z-30 bg-[#0B3D4C]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-white"
          >
            <Anchor className="h-6 w-6" />
            <span className="hidden sm:inline">SEAMARKET</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/producers"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Producers
            </Link>
            <Link
              href="/msmes"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              MSMEs
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Consumer Store
            </Link>
            <Link
              href="/logistics"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Logistics
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Toggle dark mode"
            >
              <Moon className="h-5 w-5" />
            </button>

            <button
              className="flex items-center gap-2 rounded-full text-gray-300 transition-colors hover:text-white"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
              <span className="hidden text-sm font-medium sm:inline">Account</span>
            </button>

            <button
              onClick={openCart}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-[#0B3D4C]">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            <button
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
