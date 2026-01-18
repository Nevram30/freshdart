import { auth } from "~/server/auth";
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

export default async function ProducerDashboardPage() {
  const session = await auth();

  const stats = [
    {
      label: "Active Products",
      value: "24",
      change: "In marketplace",
      icon: Fish,
      color: "bg-teal-500",
    },
    {
      label: "Pending Orders",
      value: "18",
      change: "Awaiting shipment",
      icon: ShoppingCart,
      color: "bg-amber-500",
    },
    {
      label: "In Transit",
      value: "7",
      change: "Being delivered",
      icon: Truck,
      color: "bg-blue-500",
    },
    {
      label: "Monthly Revenue",
      value: "₱1.2M",
      change: "+25% vs last month",
      icon: DollarSign,
      color: "bg-emerald-500",
    },
  ];

  const topProducts = [
    { name: "Fresh Tuna", sold: "450 kg", revenue: "₱315,000" },
    { name: "Pacific Salmon", sold: "280 kg", revenue: "₱224,000" },
    { name: "Tiger Prawns", sold: "180 kg", revenue: "₱198,000" },
    { name: "Blue Crab", sold: "120 kg", revenue: "₱144,000" },
  ];

  const alerts = [
    {
      type: "warning",
      message: "Low stock alert: Fresh Tuna (only 50kg remaining)",
    },
    {
      type: "info",
      message: "3 new merchant inquiries pending",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "Producer"}!
        </h1>
        <p className="mt-1 text-gray-600">
          Here&apos;s your production and sales overview.
        </p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
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
            <h2 className="font-semibold text-gray-900">Top Selling Products</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                    <Fish className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sold} sold</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">{product.revenue}</p>
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
              <Fish className="h-8 w-8 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">
                Add Product
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50">
              <Package className="h-8 w-8 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">
                Update Stock
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50">
              <Truck className="h-8 w-8 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">
                Schedule Shipment
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50">
              <Users className="h-8 w-8 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">
                View Customers
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
