"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FileText,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Fish,
  AlertTriangle,
  Snowflake,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Loader2,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  ORDER_PLACED: "Order Placed",
  PENDING_CONFIRMATION: "Pending Confirmation",
  CONFIRMED: "Confirmed",
  AWAITING_PAYMENT: "Awaiting Payment",
  PAID: "Paid",
  PREPARING: "Preparing",
  READY_FOR_SHIPMENT: "Ready to Ship",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  DISPUTED: "Disputed",
  RESOLVED: "Resolved",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  ORDER_PLACED: "bg-gray-100 text-gray-700",
  PENDING_CONFIRMATION: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-teal-100 text-teal-700",
  AWAITING_PAYMENT: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  PREPARING: "bg-orange-100 text-orange-700",
  READY_FOR_SHIPMENT: "bg-cyan-100 text-cyan-700",
  IN_TRANSIT: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  DISPUTED: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  FRESH: "Fresh",
  FROZEN: "Frozen",
  PROCESSED: "Processed",
  DRIED: "Dried",
  LIVE: "Live",
};

const SEAFOOD_TYPE_LABELS: Record<string, string> = {
  FISH: "Fish",
  SHELLFISH: "Shellfish",
  CRUSTACEAN: "Crustacean",
  MOLLUSK: "Mollusk",
  SEAWEED: "Seaweed",
};

const PRODUCT_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  DRAFT: "bg-gray-100 text-gray-600",
  INACTIVE: "bg-amber-100 text-amber-700",
  ARCHIVED: "bg-slate-100 text-slate-600",
  OUT_OF_STOCK: "bg-red-100 text-red-700",
  DISCONTINUED: "bg-red-100 text-red-700",
};

type ReportTab = "overview" | "products" | "customers" | "inventory";

export default function ProducerReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");

  const { data: profile } = api.profile.getProfile.useQuery();

  const { data: revenueData, isLoading: revenueLoading } =
    api.producer.getRevenueReport.useQuery({ months: 6 });
  const { data: orderStatusData, isLoading: orderStatusLoading } =
    api.producer.getOrderStatusReport.useQuery();
  const { data: productData, isLoading: productLoading } =
    api.producer.getProductPerformanceReport.useQuery();
  const { data: customerData, isLoading: customerLoading } =
    api.producer.getTopCustomersReport.useQuery();
  const { data: inventoryData, isLoading: inventoryLoading } =
    api.producer.getInventoryReport.useQuery();

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) {
      return `₱${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `₱${(amount / 1_000).toFixed(1)}K`;
    }
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const tabs: { key: ReportTab; label: string; icon: typeof FileText }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "products", label: "Products", icon: Fish },
    { key: "customers", label: "Customers", icon: Users },
    { key: "inventory", label: "Inventory", icon: Package },
  ];

  // Compute month-over-month change
  const getRevenueChange = () => {
    if (!revenueData?.monthly || revenueData.monthly.length < 2) return null;
    const current = revenueData.monthly[revenueData.monthly.length - 1]!.revenue;
    const previous = revenueData.monthly[revenueData.monthly.length - 2]!.revenue;
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = getRevenueChange();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
            <FileText className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile?.merchant?.businessName
                ? `${profile.merchant.businessName} Reports`
                : "Reports"}
            </h1>
            <p className="text-sm text-gray-600">
              Track your business performance and insights.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                {revenueChange !== null && (
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      revenueChange >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {revenueChange >= 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {Math.abs(revenueChange).toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">
                  {revenueLoading
                    ? "..."
                    : formatCurrency(revenueData?.totalRevenue ?? 0)}
                </p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">
                  {revenueLoading ? "..." : (revenueData?.totalOrders ?? 0)}
                </p>
                <p className="text-sm text-gray-500">Delivered Orders</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                <Fish className="h-5 w-5 text-teal-600" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">
                  {productLoading
                    ? "..."
                    : (productData?.products.length ?? 0)}
                </p>
                <p className="text-sm text-gray-500">Total Products</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">
                  {customerLoading ? "..." : (customerData?.length ?? 0)}
                </p>
                <p className="text-sm text-gray-500">Total Customers</p>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                Monthly Revenue (Last 6 Months)
              </h2>
            </div>
            <div className="p-6">
              {revenueLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : revenueData?.monthly && revenueData.monthly.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={revenueData.monthly}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                      tickFormatter={(value) => formatCurrency(Number(value))}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                      labelStyle={{ color: "#111827", fontWeight: 600 }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#14b8a6"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-12 text-center text-sm text-gray-500">
                  No revenue data yet. Delivered orders will appear here.
                </div>
              )}
            </div>
          </div>

          {/* Two Column: Order Status + Product Types */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Order Status Breakdown */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="font-semibold text-gray-900">
                  Order Status Breakdown
                </h2>
              </div>
              <div className="p-6">
                {orderStatusLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : orderStatusData?.statuses &&
                  orderStatusData.statuses.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={orderStatusData.statuses.map((item) => ({
                            name: STATUS_LABELS[item.status] ?? item.status,
                            value: item.count,
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {orderStatusData.statuses.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={[
                                "#14b8a6", "#f59e0b", "#3b82f6", "#8b5cf6",
                                "#ef4444", "#06b6d4", "#f97316", "#10b981",
                                "#6366f1", "#ec4899", "#84cc16", "#64748b",
                              ][index % 12]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [Number(value), "Orders"]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => (
                            <span className="text-xs text-gray-600">{String(value)}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-600">
                          Total Orders
                        </span>
                        <span className="font-bold text-gray-900">
                          {orderStatusData.total}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-sm text-gray-500">
                    No orders yet.
                  </div>
                )}
              </div>
            </div>

            {/* Product Type Distribution */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="font-semibold text-gray-900">
                  Revenue by Product Type
                </h2>
              </div>
              <div className="p-6">
                {productLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : productData?.byType && productData.byType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={productData.byType.map((item) => ({
                        name: PRODUCT_TYPE_LABELS[item.type] ?? item.type,
                        revenue: item.revenue,
                        count: item.count,
                      }))}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={false}
                        tickFormatter={(value) => formatCurrency(Number(value))}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={false}
                        width={55}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "revenue") return [formatCurrency(Number(value)), "Revenue"];
                          return [Number(value), "Products"];
                        }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#14b8a6"
                        radius={[0, 6, 6, 0]}
                        maxBarSize={35}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="py-8 text-center text-sm text-gray-500">
                    No product data yet.
                  </div>
                )}

                {/* Seafood Type Section */}
                {!productLoading &&
                  productData?.bySeafoodType &&
                  productData.bySeafoodType.length > 0 && (
                    <div className="mt-6 border-t border-gray-100 pt-4">
                      <h3 className="mb-3 text-sm font-semibold text-gray-600">
                        By Seafood Type
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {productData.bySeafoodType.map((item) => (
                          <div
                            key={item.type}
                            className="rounded-lg border border-gray-200 px-3 py-2"
                          >
                            <p className="text-xs font-medium text-gray-700">
                              {SEAFOOD_TYPE_LABELS[item.type] ?? item.type}
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {item.count}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatCurrency(item.revenue)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {productLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : productData?.products && productData.products.length > 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="font-semibold text-gray-900">
                  Product Performance
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  All products ranked by revenue from delivered orders.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Product
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Type
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Qty Sold
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productData.products.map((product, index) => (
                      <tr
                        key={product.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="w-5 text-xs text-gray-400">
                              {index + 1}
                            </span>
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-9 w-9 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100">
                                <Fish className="h-4 w-4 text-teal-600" />
                              </div>
                            )}
                            <span className="max-w-[180px] truncate text-sm font-medium text-gray-900">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {PRODUCT_TYPE_LABELS[product.productType] ??
                              product.productType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              PRODUCT_STATUS_COLORS[product.status] ??
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-700">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`text-sm font-medium ${
                              product.stockQuantity <= 0
                                ? "text-red-600"
                                : product.stockQuantity <= 50
                                  ? "text-amber-600"
                                  : "text-gray-700"
                            }`}
                          >
                            {product.stockQuantity.toLocaleString()}{" "}
                            {product.stockUnit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-700">
                          {product.totalOrders}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-700">
                          {product.totalQuantitySold.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(product.totalRevenue)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
              <Fish className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">
                No products found. Add products to see their performance here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          {customerLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : customerData && customerData.length > 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="font-semibold text-gray-900">
                  Top Customers
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Your top 10 customers ranked by total revenue from delivered orders.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Total Orders
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Delivered
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Last Order
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerData.map((customer, index) => (
                      <tr
                        key={customer.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="w-5 text-xs text-gray-400">
                              {index + 1}
                            </span>
                            {customer.image ? (
                              <img
                                src={customer.image}
                                alt={customer.name ?? ""}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100">
                                <Users className="h-4 w-4 text-teal-600" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {customer.name ?? "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-700">
                          {customer.totalOrders}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-700">
                          {customer.deliveredOrders}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(customer.totalRevenue)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                          {customer.lastOrderDate
                            ? new Date(customer.lastOrderDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">
                No customer data yet. Customer insights will appear here once
                you have orders.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {inventoryLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : inventoryData ? (
            <>
              {/* Inventory Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Total</span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {inventoryData.summary.totalProducts}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-emerald-600">
                    {inventoryData.summary.activeProducts}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-gray-500">Low Stock</span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-amber-600">
                    {inventoryData.summary.lowStockProducts}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-gray-500">Out of Stock</span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-red-600">
                    {inventoryData.summary.outOfStockProducts}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Snowflake className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-gray-500">Cold Chain</span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-blue-600">
                    {inventoryData.summary.coldChainProducts}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-gray-500">Stock Value</span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {formatCurrency(inventoryData.summary.totalStockValue)}
                  </p>
                </div>
              </div>

              {/* Inventory Table */}
              {inventoryData.items.length > 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white">
                  <div className="border-b border-gray-100 px-6 py-4">
                    <h2 className="font-semibold text-gray-900">
                      Inventory Details
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Products sorted by stock quantity (lowest first).
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 text-left">
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Product
                          </th>
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Type
                          </th>
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Unit Price
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Stock Value
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Cold Chain
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {inventoryData.items.map((item) => (
                          <tr
                            key={item.id}
                            className={`transition-colors hover:bg-gray-50 ${
                              item.stockQuantity <= 0
                                ? "bg-red-50/50"
                                : item.stockQuantity <= 50 &&
                                    item.status === "ACTIVE"
                                  ? "bg-amber-50/50"
                                  : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-9 w-9 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100">
                                    <Fish className="h-4 w-4 text-teal-600" />
                                  </div>
                                )}
                                <span className="max-w-[180px] truncate text-sm font-medium text-gray-900">
                                  {item.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {PRODUCT_TYPE_LABELS[item.productType] ??
                                item.productType}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  PRODUCT_STATUS_COLORS[item.status] ??
                                  "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span
                                className={`text-sm font-medium ${
                                  item.stockQuantity <= 0
                                    ? "text-red-600"
                                    : item.stockQuantity <= 50
                                      ? "text-amber-600"
                                      : "text-gray-700"
                                }`}
                              >
                                {item.stockQuantity.toLocaleString()}{" "}
                                {item.stockUnit}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-gray-700">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                              {formatCurrency(item.stockValue)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {item.requiresColdChain ? (
                                <Snowflake className="mx-auto h-4 w-4 text-blue-500" />
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">
                    No inventory data found.
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
