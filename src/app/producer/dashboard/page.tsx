"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import {
  Fish,
  ShoppingCart,
  Truck,
  DollarSign,
  TrendingUp,
  Package,
  Users,
  AlertCircle,
} from "lucide-react";

export default function ProducerDashboardPage() {
  const { data: dashboardStats, isLoading: statsLoading } =
    api.producer.getDashboardStats.useQuery();
  const { data: topProducts, isLoading: topProductsLoading } =
    api.producer.getTopSellingProducts.useQuery();
  const { data: alerts, isLoading: alertsLoading } =
    api.producer.getAlerts.useQuery();
  const { data: quickActionCounts, isLoading: quickActionsLoading } =
    api.producer.getQuickActionCounts.useQuery();

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) {
      return `₱${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `₱${(amount / 1_000).toFixed(0)}K`;
    }
    return `₱${amount.toLocaleString()}`;
  };

  const stats = [
    {
      label: "Active Products",
      value: statsLoading ? "..." : String(dashboardStats?.activeProducts ?? 0),
      change: "In marketplace",
      icon: Fish,
      color: "bg-teal-500",
    },
    {
      label: "Pending Orders",
      value: statsLoading ? "..." : String(dashboardStats?.pendingOrders ?? 0),
      change: "Awaiting shipment",
      icon: ShoppingCart,
      color: "bg-amber-500",
    },
    {
      label: "In Transit",
      value: statsLoading ? "..." : String(dashboardStats?.inTransit ?? 0),
      change: "Being delivered",
      icon: Truck,
      color: "bg-blue-500",
    },
    {
      label: "Monthly Revenue",
      value: statsLoading
        ? "..."
        : formatCurrency(dashboardStats?.monthlyRevenue ?? 0),
      change: "This month (delivered)",
      icon: DollarSign,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Producer Dashboard
        </h1>
        <p className="mt-1 text-gray-600">
          Here&apos;s your production and sales overview.
        </p>
      </div>

      {/* Alerts */}
      {!alertsLoading && alerts && alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                alert.type === "warning"
                  ? "bg-amber-50 text-amber-800"
                  : "bg-blue-50 text-blue-800"
              }`}
            >
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-xs text-gray-400">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling Products */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">
              Top Selling Products
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {topProductsLoading ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">
                Loading...
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              topProducts.map((product) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                        <Fish className="h-5 w-5 text-teal-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.totalQuantity.toLocaleString()}{" "}
                        {product.unitType} sold
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(product.totalRevenue)}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-sm text-gray-500">
                No sales data yet. Delivered orders will appear here.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6">
            <Link
              href="/producer/products"
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50"
            >
              <Fish className="h-8 w-8 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">
                Add Product
              </span>
              {!quickActionsLoading && quickActionCounts && (
                <span className="text-xs text-gray-400">
                  {quickActionCounts.totalProducts} total
                </span>
              )}
            </Link>
            <Link
              href="/producer/products"
              className="relative flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50"
            >
              <Package className="h-8 w-8 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">
                Update Stock
              </span>
              {!quickActionsLoading &&
                quickActionCounts &&
                quickActionCounts.lowStockCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                    {quickActionCounts.lowStockCount}
                  </span>
                )}
            </Link>
            <Link
              href="/producer/dashboard/orders"
              className="relative flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50"
            >
              <Truck className="h-8 w-8 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">
                Schedule Shipment
              </span>
              {!quickActionsLoading &&
                quickActionCounts &&
                quickActionCounts.readyToShipCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                    {quickActionCounts.readyToShipCount}
                  </span>
                )}
            </Link>
            <Link
              href="/producer/dashboard/customers"
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50"
            >
              <Users className="h-8 w-8 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">
                View Customers
              </span>
              {!quickActionsLoading && quickActionCounts && (
                <span className="text-xs text-gray-400">
                  {quickActionCounts.uniqueCustomerCount} customers
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
