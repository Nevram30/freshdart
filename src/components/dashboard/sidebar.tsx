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
  UserCheck,
  Headphones,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

type UserRole = "CUSTOMER" | "MERCHANT" | "PRODUCER" | "ADMIN";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const customerNavItems: NavItem[] = [
  { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/customer/dashboard/orders", icon: ShoppingCart },
  { label: "Favorites", href: "/customer/dashboard/favorites", icon: Package },
  { label: "Profile", href: "/customer/dashboard/profile", icon: User },
  { label: "Settings", href: "/customer/dashboard/settings", icon: Settings },
];

const merchantNavItems: NavItem[] = [
  { label: "Dashboard", href: "/merchant/dashboard", icon: LayoutDashboard, badge: "Under-dev" },
  { label: "My Orders", href: "/merchant/orders", icon: ShoppingCart },
  { label: "Sourcing Market", href: "/merchant/sourcing", icon: Store },
  { label: "Inventory", href: "/merchant/inventory", icon: Package, badge: "Soon" },
  { label: "Invoices", href: "/merchant/dashboard/invoices", icon: Receipt, badge: "Soon" },
  { label: "Settings", href: "/merchant/dashboard/settings", icon: Settings, badge: "Under-dev" },
];

const producerNavItems: NavItem[] = [
  { label: "Dashboard", href: "/producer/dashboard", icon: LayoutDashboard, badge: "Under-dev" },
  { label: "Products", href: "/producer/products", icon: Fish },
  { label: "Orders", href: "/producer/dashboard/orders", icon: ShoppingCart },
  { label: "Shipments", href: "/producer/dashboard/shipments", icon: Truck },
  { label: "Customers", href: "/producer/dashboard/customers", icon: Users },
  { label: "Reports", href: "#", icon: FileText, badge: "Soon" },
  { label: "Analytics", href: "#", icon: TrendingUp, badge: "Soon" },
  { label: "Settings", href: "/producer/dashboard/settings", icon: Settings },
];

const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "User Verification", href: "/admin/producers", icon: UserCheck },
  { label: "Merchants", href: "/admin/merchants", icon: Store },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
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
  ADMIN: {
    title: "Admin Panel",
    navItems: adminNavItems,
    color: "purple",
  },
};

interface DashboardSidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onToggle?: () => void;
  businessName?: string | null;
}

export function DashboardSidebar({ role, isOpen = true, onToggle, businessName }: DashboardSidebarProps) {
  const pathname = usePathname();
  const config = roleConfig[role];

  // Use business name for merchant/producer, fallback to role title
  const displayTitle = (role === "MERCHANT" || role === "PRODUCER") && businessName
    ? businessName
    : config.title;

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
                <span className="text-xs font-bold text-gray-800">{displayTitle}</span>
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
                      "h-5 w-5 shrink-0",
                      isActive ? "text-teal-600" : "text-gray-400"
                    )}
                  />
                  {isOpen && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Customer Care & Feedback Card - Producer and Merchant only */}
      {(role === "PRODUCER" || role === "MERCHANT") && (
        <div className={cn("border-t border-gray-100 p-3", !isOpen && "flex flex-col items-center")}>
          {isOpen ? (
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Headphones className="h-4 w-4 text-teal-600" />
                <span className="text-xs font-semibold text-gray-800">Need Help?</span>
              </div>
              <p className="mb-3 text-[11px] leading-relaxed text-gray-500">
                Reach out to our support team for assistance or share your feedback.
              </p>
              <div className="flex flex-col gap-1.5">
                <a
                  href="mailto:support@freshdart.com"
                  className="flex items-center gap-2 rounded-md bg-teal-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-teal-700"
                >
                  <Headphones className="h-3.5 w-3.5" />
                  Customer Care
                </a>
                <a
                  href="mailto:feedback@freshdart.com"
                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Send Feedback
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <a
                href="mailto:support@freshdart.com"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-teal-50 hover:text-teal-600"
                title="Customer Care"
              >
                <Headphones className="h-5 w-5" />
              </a>
              <a
                href="mailto:feedback@freshdart.com"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                title="Send Feedback"
              >
                <MessageSquare className="h-5 w-5" />
              </a>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
