"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, ChevronDown, Calendar } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";

type UserRole = "CUSTOMER" | "MERCHANT" | "PRODUCER" | "ADMIN";

const profilePaths: Record<UserRole, string> = {
  CUSTOMER: "/customer/dashboard/profile",
  MERCHANT: "/merchant/dashboard/profile",
  PRODUCER: "/producer/dashboard/profile",
  ADMIN: "/admin/dashboard",
};

interface DashboardHeaderProps {
  userName?: string | null;
  userEmail?: string | null;
  role?: UserRole;
}

export function DashboardHeader({
  userName,
  userEmail,
  role,
}: DashboardHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-8">
        {/* Current Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100">
              <User className="h-5 w-5 text-teal-600" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-gray-900">
                {userName ?? "User"}
              </p>
              <p className="text-xs text-gray-500">
                {userEmail ?? "user@example.com"}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="truncate text-sm font-medium text-gray-900">
                  {userName ?? "User"}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {userEmail ?? "user@example.com"}
                </p>
              </div>
              {role && (
                <Link
                  href={profilePaths[role]}
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
