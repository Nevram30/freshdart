"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingCart,
  User,
  Menu,
  Moon,
  Anchor,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "~/stores/cart-store";

type UserRole = "CUSTOMER" | "MERCHANT" | "PRODUCER";

const dashboardPaths: Record<UserRole, string> = {
  CUSTOMER: "/customer/dashboard",
  MERCHANT: "/merchant/dashboard",
  PRODUCER: "/producer/dashboard",
};

export function Header() {
  const { data: session, status } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const openCart = useCartStore((state) => state.openCart);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const itemCount = getItemCount();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userRole = session?.user?.role as UserRole | undefined;
  const dashboardPath = userRole ? dashboardPaths[userRole] : "/customer/dashboard";

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
            <span className="hidden sm:inline">katig</span>
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
              href="/merchants"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Merchants
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Consumer Store
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

            {status === "loading" ? (
              <div className="flex h-9 w-9 items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
              </div>
            ) : session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-full text-gray-300 transition-colors hover:text-white"
                  aria-label="User menu"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden max-w-30 truncate text-sm font-medium sm:inline">
                    {session.user?.name ?? "Account"}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 sm:block" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {session.user?.name ?? "User"}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {session.user?.email}
                      </p>
                    </div>
                    <Link
                      href={dashboardPath}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 text-gray-400" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full text-gray-300 transition-colors hover:text-white"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
                <span className="hidden text-sm font-medium sm:inline">Sign In</span>
              </Link>
            )}

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
