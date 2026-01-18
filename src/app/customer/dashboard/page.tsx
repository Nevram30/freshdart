import { auth } from "~/server/auth";
import {
  ShoppingCart,
  Package,
  Heart,
  TrendingUp,
} from "lucide-react";

export default async function CustomerDashboardPage() {
  const session = await auth();

  const stats = [
    {
      label: "Total Orders",
      value: "12",
      change: "+2 this month",
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      label: "Active Orders",
      value: "3",
      change: "In transit",
      icon: Package,
      color: "bg-teal-500",
    },
    {
      label: "Favorites",
      value: "8",
      change: "Products saved",
      icon: Heart,
      color: "bg-pink-500",
    },
    {
      label: "Total Spent",
      value: "₱24,500",
      change: "+12% vs last month",
      icon: TrendingUp,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "Customer"}!
        </h1>
        <p className="mt-1 text-gray-600">
          Here&apos;s what&apos;s happening with your orders today.
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

      {/* Recent Orders */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">No orders yet</p>
            <p className="text-sm">Start shopping to see your orders here!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
