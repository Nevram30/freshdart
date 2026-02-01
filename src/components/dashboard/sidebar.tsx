"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  User,
  Settings,
  Store,
  Fish,
  TrendingUp,
  Truck,
  Users,
  FileText,
  Utensils,
  Receipt,
  ChevronLeft,
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
  { label: "My Orders", href: "/merchant/orders", icon: ShoppingCart },
  { label: "Sourcing Market", href: "/merchant/sourcing", icon: Store },
  { label: "Inventory", href: "/merchant/inventory", icon: Package },
  { label: "Invoices", href: "/merchant/dashboard/invoices", icon: Receipt },
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
    title: "Merchant Hub",
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
  isOpen?: boolean;
  onToggle?: () => void;
}

export function DashboardSidebar({ role, isOpen = true, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();
  const config = roleConfig[role];

  return (
    <aside
      className={`fixed left-0 top-0 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo */}
      <div className={`flex h-16 items-center justify-between border-b border-gray-100 ${isOpen ? 'px-6' : 'justify-center px-3'}`}>
        {isOpen ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800">
                <Utensils className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-800">{config.title}</span>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <Utensils className="h-5 w-5 text-white" />
          </button>
        )}
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
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    !isOpen && "justify-center"
                  )}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-teal-600" : "text-gray-400"
                    )}
                  />
                  {isOpen && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
