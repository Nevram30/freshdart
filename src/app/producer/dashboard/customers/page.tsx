"use client";

import { useState } from "react";
import {
  Search,
  Users,
  TrendingUp,
  UserPlus,
  Repeat,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  Building2,
  Calendar,
  Package,
  ShoppingBag,
  X,
  Loader2,
  XCircle,
  Clock,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format } from "date-fns";

type OrderStatus =
  | "PENDING"
  | "REVIEWING"
  | "QUOTED"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY_FOR_PICKUP"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REJECTED";

const statusConfig: Record<
  OrderStatus,
  { variant: "info" | "warning" | "success" | "danger" | "default"; label: string }
> = {
  PENDING: { variant: "warning", label: "Pending" },
  REVIEWING: { variant: "info", label: "Reviewing" },
  QUOTED: { variant: "info", label: "Quoted" },
  CONFIRMED: { variant: "success", label: "Confirmed" },
  PROCESSING: { variant: "info", label: "Processing" },
  READY_FOR_PICKUP: { variant: "info", label: "Ready" },
  SHIPPED: { variant: "info", label: "Shipped" },
  IN_TRANSIT: { variant: "info", label: "In Transit" },
  OUT_FOR_DELIVERY: { variant: "info", label: "Out for Delivery" },
  DELIVERED: { variant: "success", label: "Delivered" },
  CANCELLED: { variant: "danger", label: "Cancelled" },
  REJECTED: { variant: "danger", label: "Rejected" },
};

// Customer Details Modal Component
function CustomerDetailsModal({
  customerId,
  onClose,
}: {
  customerId: string;
  onClose: () => void;
}) {
  const { data: customer, isLoading, error } = api.customer.getProducerCustomer.useQuery({
    id: customerId,
  });

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(numAmount);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-xl bg-white p-8">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-xl bg-white p-6">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="mt-4 text-gray-600">Failed to load customer details</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-700">
              {(customer.contactName ?? customer.name ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {customer.contactName ?? customer.name ?? "Unknown"}
              </h2>
              {customer.companyName && (
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  <Building2 className="h-3 w-3" />
                  {customer.companyName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Contact Information */}
          <div className="mb-6 rounded-lg border border-gray-200 p-4">
            <h3 className="mb-4 font-semibold text-gray-900">Contact Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">
                    {customer.contactEmail ?? customer.email ?? "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">
                    {customer.contactPhone ?? customer.phone ?? "Not provided"}
                  </p>
                </div>
              </div>
              {customer.shippingAddress && (
                <div className="col-span-2 flex items-start gap-3">
                  <Building2 className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Shipping Address</p>
                    <p className="font-medium text-gray-900">
                      {(customer.shippingAddress as { street?: string }).street && (
                        <>{(customer.shippingAddress as { street: string }).street}, </>
                      )}
                      {(customer.shippingAddress as { city?: string }).city},{" "}
                      {(customer.shippingAddress as { state?: string }).state}{" "}
                      {(customer.shippingAddress as { postalCode?: string }).postalCode}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{customer.totalOrders}</p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-center">
              <p className="text-2xl font-bold text-teal-700">{formatCurrency(customer.totalSpent)}</p>
              <p className="text-sm text-teal-600">Total Spent</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{customer.deliveredOrders}</p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{customer.cancelledOrders}</p>
              <p className="text-sm text-red-600">Cancelled</p>
            </div>
          </div>

          {/* Customer Timeline */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">First Order</p>
                  <p className="font-medium text-gray-900">
                    {customer.firstOrderDate
                      ? format(new Date(customer.firstOrderDate), "MMMM dd, yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Order</p>
                  <p className="font-medium text-gray-900">
                    {customer.lastOrderDate
                      ? format(new Date(customer.lastOrderDate), "MMMM dd, yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          {customer.topProducts && customer.topProducts.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-4 font-semibold text-gray-900">Top Products Ordered</h3>
              <div className="space-y-3">
                {customer.topProducts.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                        {item.product.images?.[0]?.url ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.product.localName && `${item.product.localName} • `}
                          {item.product.productType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{item.count} orders</p>
                      <p className="text-sm text-gray-500">
                        {item.totalQuantity.toFixed(2)} {item.product.stockUnit} total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {customer.recentOrders && customer.recentOrders.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-4 font-semibold text-gray-900">Recent Orders</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Items
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {customer.recentOrders.map((order) => {
                      const orderTotal = order.items.reduce(
                        (sum, item) => sum + Number(item.finalTotalPrice ?? item.totalPrice),
                        0
                      );
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                            #{order.orderNumber.slice(-8).toUpperCase()}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                            {format(new Date(order.createdAt), "MMM dd, yyyy")}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                            {order.items.length} item{order.items.length > 1 ? "s" : ""}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                            {formatCurrency(orderTotal)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <Badge
                              variant={statusConfig[order.status as OrderStatus]?.variant ?? "default"}
                              className="text-xs"
                            >
                              {statusConfig[order.status as OrderStatus]?.label ?? order.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProducerCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { data, isLoading, error } = api.customer.getProducerCustomers.useQuery({
    limit: 10,
    search: searchQuery || undefined,
  });

  const { data: stats } = api.customer.getProducerCustomerStats.useQuery();

  const customers = data?.customers ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / 10);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(numAmount);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="mt-2 text-gray-600">
            View and manage customers who have ordered your products.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Total Customers
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
              <Users className="h-5 w-5 text-teal-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{stats?.totalCustomers ?? 0}</div>
          <div className="text-sm text-gray-600">Unique customers</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              New This Month
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <UserPlus className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{stats?.newCustomersThisMonth ?? 0}</div>
          <div className="text-sm text-gray-600">New customers</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Repeat Customers
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Repeat className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{stats?.repeatCustomers ?? 0}</div>
          <div className="text-sm text-gray-600">Multiple orders</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Avg Order Value
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {formatCurrency(stats?.averageOrderValue ?? 0)}
          </div>
          <div className="text-sm text-gray-600">Per order</div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Customer List</h2>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 border-b border-gray-200 px-6 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <p className="mt-4 text-gray-600">Failed to load customers</p>
              <p className="text-sm text-gray-500">{error.message}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && customers.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600">No customers found</p>
              <p className="text-sm text-gray-500">
                Customers who order your products will appear here.
              </p>
            </div>
          </div>
        )}

        {/* Customers Table */}
        {!isLoading && !error && customers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Last Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                          {(customer.contactName ?? customer.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {customer.contactName ?? customer.name ?? "Unknown"}
                          </p>
                          {customer.companyName && (
                            <p className="text-xs text-gray-500">{customer.companyName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {customer.contactEmail ?? customer.email ?? "N/A"}
                        </p>
                        {(customer.contactPhone ?? customer.phone) && (
                          <p className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {customer.contactPhone ?? customer.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{customer.totalOrders}</span>
                        <span className="text-sm text-gray-500">
                          ({customer.deliveredOrders} completed)
                        </span>
                      </div>
                      {customer.pendingOrders > 0 && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          {customer.pendingOrders} pending
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {customer.lastOrderDate
                        ? format(new Date(customer.lastOrderDate), "MMM dd, yyyy")
                        : "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-teal-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && customers.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * 10 + 1} to{" "}
              {Math.min(currentPage * 10, totalCount)} of {totalCount} customers
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-teal-600 text-white"
                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomerId && (
        <CustomerDetailsModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </div>
  );
}
