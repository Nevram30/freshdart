import {
  ShoppingCart,
  Truck,
  Calendar,
  PiggyBank,
  DollarSign,
  Sparkles,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

export default async function MerchantDashboardPage() {

  const orders = [
    {
      id: "#ORD-8821",
      producer: "Blue Ocean Fisheries",
      status: "SHIPPED",
      statusColor: "bg-blue-100 text-blue-700",
      expectedDelivery: "Today, 02:00 PM",
    },
    {
      id: "#ORD-8819",
      producer: "Arctic Harvest Co.",
      status: "PREPARING",
      statusColor: "bg-amber-100 text-amber-700",
      expectedDelivery: "Oct 25, 09:00 AM",
    },
    {
      id: "#ORD-8790",
      producer: "Bay Side Farmers",
      status: "DELIVERED",
      statusColor: "bg-emerald-100 text-emerald-700",
      expectedDelivery: "Yesterday",
    },
    {
      id: "#ORD-8772",
      producer: "Sustainable Shells",
      status: "DELIVERED",
      statusColor: "bg-emerald-100 text-emerald-700",
      expectedDelivery: "22 Oct 2023",
    },
  ];

  const sourcingRecommendations = [
    {
      name: "Fresh Atlantic Mackerel",
      price: "$12/kg",
      discount: "15% lower than usual",
      icon: "🐟",
    },
    {
      name: "Blue Mussel Bulk Deal",
      subtitle: "New batch available today",
      icon: "🐚",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Merchant Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor your orders, inventory, and sourcing deals.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-white shadow-sm transition-colors hover:bg-blue-800">
          <ShoppingCart className="h-5 w-5" />
          New Sourcing Order
        </button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Orders */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Active Orders
            </span>
            <Truck className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mb-1 text-4xl font-bold text-gray-900">07</div>
          <div className="text-sm text-green-600">4 arriving today</div>
        </div>

        {/* Total Spent */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Total Spent (MTD)
            </span>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mb-1 text-4xl font-bold text-gray-900">$4,280</div>
          <div className="text-sm text-gray-500">Budget: $5,000</div>
        </div>

        {/* Next Delivery */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Next Delivery
            </span>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mb-1 text-2xl font-bold italic text-gray-900">
            Oct 24, 2023
          </div>
          <div className="text-sm font-semibold text-blue-600">
            ON THE WAY (10:30 AM)
          </div>
        </div>

        {/* Savings */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Savings
            </span>
            <PiggyBank className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mb-1 text-4xl font-bold text-green-600">$845</div>
          <div className="text-sm text-gray-500">Bulk deals</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders & Tracking - Takes 2 columns */}
        <div className="rounded-xl border border-gray-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders & Tracking
            </h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View All History
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Producer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Expected Delivery
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {order.producer}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${order.statusColor}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {order.expectedDelivery}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Sourcing Recommendations & Inventory Alert */}
        <div className="space-y-6">
          {/* Sourcing Recommendations */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Sourcing Recommendations
              </h2>
              <Sparkles className="h-5 w-5 text-blue-500" />
            </div>
            <div className="divide-y divide-gray-100 p-4">
              {sourcingRecommendations.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.price && (
                      <p className="text-sm text-gray-600">
                        From {item.price} • {item.discount}
                      </p>
                    )}
                    {item.subtitle && (
                      <p className="text-sm text-gray-600">{item.subtitle}</p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 px-6 py-3">
              <button className="w-full rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                Marketplace
              </button>
            </div>
          </div>

          {/* Inventory Alert */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <div className="mb-3 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-amber-900">Inventory Alert</h3>
            </div>
            <p className="mb-4 text-sm text-gray-700">
              You are low on <span className="font-semibold text-amber-900">Jumbo Prawns</span> and{" "}
              <span className="font-semibold text-amber-900">Red Snapper</span>{" "}
              (Recurring items).
            </p>
            <button className="w-full rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700">
              Restock Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
