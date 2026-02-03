"use client";

import { useRef, useState } from "react";
import { api } from "~/trpc/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  Loader2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  CheckCircle2,
  Package,
  type LucideIcon,
} from "lucide-react";

type TimeRange = "6" | "12";

export default function ProducerAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("12");

  const revenueTrendRef = useRef<HTMLDivElement>(null);
  const dailyOrdersRef = useRef<HTMLDivElement>(null);
  const fulfillmentRef = useRef<HTMLDivElement>(null);
  const topProductsRef = useRef<HTMLDivElement>(null);
  const customerGrowthRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navSections: { label: string; icon: LucideIcon; ref: React.RefObject<HTMLDivElement | null> }[] = [
    { label: "Revenue Trend", icon: TrendingUp, ref: revenueTrendRef },
    { label: "Daily Orders", icon: CalendarDays, ref: dailyOrdersRef },
    { label: "Order Fulfillment", icon: CheckCircle2, ref: fulfillmentRef },
    { label: "Top Products", icon: Package, ref: topProductsRef },
    { label: "Customer Growth", icon: Users, ref: customerGrowthRef },
  ];

  const { data: profile } = api.profile.getProfile.useQuery();

  const { data: revenueTrend, isLoading: revenueTrendLoading } =
    api.producer.getRevenueTrend.useQuery({ months: Number(timeRange) });
  const { data: dailyOrders, isLoading: dailyOrdersLoading } =
    api.producer.getDailyOrdersTrend.useQuery();
  const { data: fulfillment, isLoading: fulfillmentLoading } =
    api.producer.getOrderFulfillmentAnalytics.useQuery();
  const { data: topProducts, isLoading: topProductsLoading } =
    api.producer.getTopProductsAnalytics.useQuery();
  const { data: customerGrowth, isLoading: customerGrowthLoading } =
    api.producer.getCustomerGrowth.useQuery({ months: Number(timeRange) });

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `₱${(value / 1_000).toFixed(1)}K`;
    return `₱${value.toLocaleString()}`;
  };

  const formatTooltipCurrency = (value: number) => {
    return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Compute summary stats from revenue trend
  const totalRevenue = revenueTrend?.reduce((sum, m) => sum + m.revenue, 0) ?? 0;
  const totalDelivered = revenueTrend?.reduce((sum, m) => sum + m.deliveredOrders, 0) ?? 0;
  const totalNewOrders = revenueTrend?.reduce((sum, m) => sum + m.newOrders, 0) ?? 0;
  const avgOrderValue = totalDelivered > 0 ? totalRevenue / totalDelivered : 0;

  // Month-over-month revenue change
  const getRevenueChange = () => {
    if (!revenueTrend || revenueTrend.length < 2) return null;
    const current = revenueTrend[revenueTrend.length - 1]!.revenue;
    const previous = revenueTrend[revenueTrend.length - 2]!.revenue;
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = getRevenueChange();

  const CHART_COLORS = {
    teal: "#0d9488",
    tealLight: "#5eead4",
    blue: "#3b82f6",
    purple: "#8b5cf6",
    amber: "#f59e0b",
    emerald: "#10b981",
    red: "#ef4444",
    gray: "#6b7280",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
            <TrendingUp className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile?.merchant?.businessName
                ? `${profile.merchant.businessName} Analytics`
                : "Analytics"}
            </h1>
            <p className="text-sm text-gray-600">
              Visualize your business trends and performance.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setTimeRange("6")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              timeRange === "6"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            6 Months
          </button>
          <button
            onClick={() => setTimeRange("12")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              timeRange === "12"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            12 Months
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            {revenueChange !== null && (
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
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
              {revenueTrendLoading ? "..." : formatCurrency(totalRevenue)}
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
              {revenueTrendLoading ? "..." : totalNewOrders}
            </p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900">
              {revenueTrendLoading ? "..." : formatCurrency(avgOrderValue)}
            </p>
            <p className="text-sm text-gray-500">Avg Order Value</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900">
              {fulfillmentLoading
                ? "..."
                : fulfillment?.avgFulfillmentDays
                  ? `${fulfillment.avgFulfillmentDays.toFixed(1)}d`
                  : "N/A"}
            </p>
            <p className="text-sm text-gray-500">Avg Fulfillment Time</p>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="mb-6 flex flex-wrap gap-2">
        {navSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.label}
              onClick={() => scrollTo(section.ref)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Revenue Trend - Area Chart */}
      <div ref={revenueTrendRef} className="mb-6 scroll-mt-4 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Revenue Trend</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Monthly revenue from delivered orders over the last {timeRange} months.
          </p>
        </div>
        <div className="p-6">
          {revenueTrendLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : revenueTrend && revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.teal} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={CHART_COLORS.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(v: number) => formatCurrency(v)}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    fontSize: "13px",
                  }}
                  formatter={(value) => [formatTooltipCurrency(Number(value)), "Revenue"]}
                  labelFormatter={(label) => {
                    const found = revenueTrend.find((m) => m.label === String(label));
                    return found?.fullLabel ?? String(label);
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_COLORS.teal}
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-16 text-center text-sm text-gray-500">
              No revenue data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Two Column: Daily Orders + Order Fulfillment */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Daily Orders - Bar Chart */}
        <div ref={dailyOrdersRef} className="scroll-mt-4 rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Daily Orders</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Orders received over the last 30 days.
            </p>
          </div>
          <div className="p-6">
            {dailyOrdersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : dailyOrders && dailyOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      fontSize: "13px",
                    }}
                    formatter={(value, name) => [
                      name === "revenue" ? formatTooltipCurrency(Number(value)) : Number(value),
                      name === "revenue" ? "Revenue" : "Orders",
                    ]}
                  />
                  <Bar
                    dataKey="orders"
                    fill={CHART_COLORS.teal}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-12 text-center text-sm text-gray-500">
                No order data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Order Fulfillment - Pie Chart */}
        <div ref={fulfillmentRef} className="scroll-mt-4 rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Order Fulfillment</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Current distribution of order statuses.
            </p>
          </div>
          <div className="p-6">
            {fulfillmentLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : fulfillment?.segments && fulfillment.segments.length > 0 ? (
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={fulfillment.segments}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {fulfillment.segments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                        fontSize: "13px",
                      }}
                      formatter={(value) => [Number(value), "Orders"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:flex-col sm:justify-start">
                  {fulfillment.segments.map((segment) => (
                    <div key={segment.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="text-sm text-gray-600">
                        {segment.name}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {segment.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-gray-500">
                No order data available yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products Comparison - Bar Chart */}
      <div ref={topProductsRef} className="mb-6 scroll-mt-4 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">
            Top Products: This Month vs Last Month
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Revenue comparison of your top performing products.
          </p>
        </div>
        <div className="p-6">
          {topProductsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : topProducts && topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topProducts} layout="vertical" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(v: number) => formatCurrency(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#374151" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    fontSize: "13px",
                  }}
                  formatter={(value, name) => [
                    formatTooltipCurrency(Number(value)),
                    name === "thisMonth" ? "This Month" : "Last Month",
                  ]}
                  labelFormatter={(label) => {
                    const product = topProducts.find((p) => p.name === String(label));
                    return product?.fullName ?? String(label);
                  }}
                />
                <Legend
                  formatter={(value: string) =>
                    value === "thisMonth" ? "This Month" : "Last Month"
                  }
                />
                <Bar dataKey="thisMonth" fill={CHART_COLORS.teal} radius={[0, 4, 4, 0]} maxBarSize={20} />
                <Bar dataKey="lastMonth" fill={CHART_COLORS.tealLight} radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-16 text-center text-sm text-gray-500">
              No product sales data available yet. Complete some deliveries to
              see comparisons here.
            </div>
          )}
        </div>
      </div>

      {/* Customer Growth - Line Chart */}
      <div ref={customerGrowthRef} className="mb-6 scroll-mt-4 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Customer Growth</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            New vs returning customers and cumulative growth.
          </p>
        </div>
        <div className="p-6">
          {customerGrowthLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : customerGrowth && customerGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    fontSize: "13px",
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="newCustomers"
                  fill={CHART_COLORS.teal}
                  name="New Customers"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  yAxisId="left"
                  dataKey="returningCustomers"
                  fill={CHART_COLORS.blue}
                  name="Returning Customers"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={24}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalCustomers"
                  stroke={CHART_COLORS.amber}
                  strokeWidth={2.5}
                  dot={{ fill: CHART_COLORS.amber, r: 4 }}
                  name="Total Customers"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-16 text-center text-sm text-gray-500">
              No customer data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
