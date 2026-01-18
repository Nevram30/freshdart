import { auth } from "~/server/auth";
import {
  ShoppingCart,
  Package,
  Store,
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react";

export default async function MerchantDashboardPage() {
  const session = await auth();

  const stats = [
    {
      label: "Total Orders",
      value: "156",
      change: "+23 this week",
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      label: "Pending Orders",
      value: "12",
      change: "Awaiting fulfillment",
      icon: Package,
      color: "bg-amber-500",
    },
    {
      label: "Active Suppliers",
      value: "8",
      change: "Verified producers",
      icon: Store,
      color: "bg-teal-500",
    },
    {
      label: "Monthly Revenue",
      value: "₱485,000",
      change: "+18% vs last month",
      icon: DollarSign,
      color: "bg-emerald-500",
    },
  ];

  const recentActivity = [
    {
      type: "order",
      title: "New order received",
      description: "Order #2847 - 50kg Fresh Tuna",
      time: "2 hours ago",
    },
    {
      type: "delivery",
      title: "Order delivered",
      description: "Order #2843 successfully delivered",
      time: "5 hours ago",
    },
    {
      type: "supplier",
      title: "New supplier added",
      description: "Pacific Fisheries joined your network",
      time: "1 day ago",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "Merchant"}!
        </h1>
        <p className="mt-1 text-gray-600">
          Here&apos;s your business overview for today.
        </p>
      </div>

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
        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  {activity.type === "order" && (
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                  )}
                  {activity.type === "delivery" && (
                    <Package className="h-5 w-5 text-emerald-500" />
                  )}
                  {activity.type === "supplier" && (
                    <Users className="h-5 w-5 text-teal-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6">
            <button className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50">
              <ShoppingCart className="h-8 w-8 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">
                New Order
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50">
              <Package className="h-8 w-8 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">
                Check Inventory
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50">
              <Store className="h-8 w-8 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">
                Find Suppliers
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50">
              <TrendingUp className="h-8 w-8 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">
                View Reports
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
