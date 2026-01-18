"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Anchor,
  LayoutDashboard,
  ShoppingCart,
  Package,
  User,
  Settings,
  LogOut,
  Store,
  Fish,
  TrendingUp,
  Truck,
  Users,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

type UserRole = "CUSTOMER" | "MERCHANT" | "PRODUCER";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const customerNavItems: NavItem[] = [
  { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/customer/dashboard/orders", icon: ShoppingCart },
  { label: "Favorites", href: "/customer/dashboard/favorites", icon: Package },
  { label: "Profile", href: "/customer/dashboard/profile", icon: User },
  { label: "Settings", href: "/customer/dashboard/settings", icon: Settings },
];

const merchantNavItems: NavItem[] = [
  { label: "Dashboard", href: "/merchant/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/merchant/dashboard/orders", icon: ShoppingCart },
  { label: "Inventory", href: "/merchant/dashboard/inventory", icon: Package },
  { label: "Suppliers", href: "/merchant/dashboard/suppliers", icon: Store },
  { label: "Analytics", href: "/merchant/dashboard/analytics", icon: TrendingUp },
  { label: "Profile", href: "/merchant/dashboard/profile", icon: User },
  { label: "Settings", href: "/merchant/dashboard/settings", icon: Settings },
];

const producerNavItems: NavItem[] = [
  { label: "Dashboard", href: "/producer/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/producer/dashboard/products", icon: Fish },
  { label: "Orders", href: "/producer/dashboard/orders", icon: ShoppingCart },
  { label: "Shipments", href: "/producer/dashboard/shipments", icon: Truck },
  { label: "Customers", href: "/producer/dashboard/customers", icon: Users },
  { label: "Reports", href: "/producer/dashboard/reports", icon: FileText },
  { label: "Analytics", href: "/producer/dashboard/analytics", icon: TrendingUp },
  { label: "Profile", href: "/producer/dashboard/profile", icon: User },
  { label: "Settings", href: "/producer/dashboard/settings", icon: Settings },
];

const roleConfig = {
  CUSTOMER: {
    title: "Customer Portal",
    navItems: customerNavItems,
    color: "teal",
  },
  MERCHANT: {
    title: "Merchant Portal",
    navItems: merchantNavItems,
    color: "blue",
  },
  PRODUCER: {
    title: "Producer Portal",
    navItems: producerNavItems,
    color: "emerald",
  },
};

interface DashboardSidebarProps {
  role: UserRole;
  userName?: string | null;
  userEmail?: string | null;
}

export function DashboardSidebar({
  role,
  userName,
  userEmail,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const config = roleConfig[role];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B3D4C]">
          <Anchor className="h-5 w-5 text-teal-400" />
        </div>
        <div>
          <span className="font-bold text-[#0B3D4C]">SeaMarket</span>
          <p className="text-xs text-gray-500">{config.title}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {config.navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-teal-600" : "text-gray-400"
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-100 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
            <User className="h-5 w-5 text-teal-600" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-gray-900">
              {userName ?? "User"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {userEmail ?? "user@example.com"}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
