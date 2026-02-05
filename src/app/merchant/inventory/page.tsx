"use client";

import {
  Package,
  AlertTriangle,
  DollarSign,
  Download,
  Search,
  ChevronDown,
  Loader2,
  Eye,
  ShoppingCart,
  XCircle,
  Truck,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { format } from "date-fns";

type BulkOrderStatus =
  | "ORDER_PLACED"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "PREPARING"
  | "READY_FOR_SHIPMENT"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "DISPUTED"
  | "RESOLVED"
  | "CANCELLED";

const statusConfig: Record<
  BulkOrderStatus,
  { color: string; bgColor: string; label: string }
> = {
  ORDER_PLACED: {
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    label: "Order Placed",
  },
  PENDING_CONFIRMATION: {
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    label: "Pending Confirmation",
  },
  CONFIRMED: {
    color: "text-green-700",
    bgColor: "bg-green-100",
    label: "Confirmed",
  },
  AWAITING_PAYMENT: {
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    label: "Awaiting Payment",
  },
  PAID: {
    color: "text-green-700",
    bgColor: "bg-green-100",
    label: "Paid",
  },
  PREPARING: {
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    label: "Preparing",
  },
  READY_FOR_SHIPMENT: {
    color: "text-teal-700",
    bgColor: "bg-teal-100",
    label: "Ready to Ship",
  },
  IN_TRANSIT: {
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    label: "In Transit",
  },
  DELIVERED: {
    color: "text-green-700",
    bgColor: "bg-green-100",
    label: "Delivered",
  },
  COMPLETED: {
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    label: "Completed",
  },
  DISPUTED: {
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    label: "Disputed",
  },
  RESOLVED: {
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    label: "Resolved",
  },
  CANCELLED: {
    color: "text-red-700",
    bgColor: "bg-red-100",
    label: "Cancelled",
  },
};

const statusFilterOptions: { value: BulkOrderStatus | "ALL"; label: string }[] =
  [
    { value: "ALL", label: "All Status" },
    { value: "ORDER_PLACED", label: "Order Placed" },
    { value: "PENDING_CONFIRMATION", label: "Pending Confirmation" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "AWAITING_PAYMENT", label: "Awaiting Payment" },
    { value: "PAID", label: "Paid" },
    { value: "PREPARING", label: "Preparing" },
    { value: "IN_TRANSIT", label: "In Transit" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    BulkOrderStatus | "ALL"
  >("ALL");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const { data, isLoading, isError } =
    api.bulkOrder.getMyBulkOrders.useQuery({
      limit: 50,
      status:
        selectedStatus !== "ALL"
          ? selectedStatus
          : undefined,
    });

  const bulkOrders = data?.bulkOrders ?? [];

  // Filter by search query on order number, contact name, or product names
  const filteredOrders = bulkOrders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesOrderNumber = order.orderNumber.toLowerCase().includes(query);
    const matchesContact = order.contactName?.toLowerCase().includes(query);
    const matchesCompany = order.companyName?.toLowerCase().includes(query);
    const matchesProduct = order.items.some((item) =>
      item.productName.toLowerCase().includes(query),
    );
    return matchesOrderNumber || (matchesContact ?? false) || (matchesCompany ?? false) || matchesProduct;
  });

  // Calculate stats from actual data
  const totalOrders = bulkOrders.length;
  const pendingOrders = bulkOrders.filter(
    (o) => o.status === "ORDER_PLACED" || o.status === "PENDING_CONFIRMATION",
  ).length;
  const totalEstimatedValue = bulkOrders.reduce(
    (sum, order) => sum + Number(order.estimatedTotal),
    0,
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="mt-2 text-gray-600">
            Track and manage your bulk orders and seafood supplies.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Bulk Orders */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Total Bulk Orders
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mb-1 text-4xl font-bold text-gray-900">
            {isLoading ? "..." : totalOrders}
          </div>
          <div className="text-sm text-gray-600">Orders placed</div>
        </div>

        {/* Pending / Reviewing */}
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-orange-700">
              Pending Review
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-200">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="mb-1 text-4xl font-bold text-orange-600">
            {isLoading
              ? "..."
              : String(pendingOrders).padStart(2, "0")}
          </div>
          <div className="text-sm text-orange-700">Awaiting response</div>
        </div>

        {/* Estimated Total Value */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Estimated Total Value
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mb-1 text-4xl font-bold text-gray-900">
            {isLoading
              ? "..."
              : `₱${totalEstimatedValue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
          </div>
          <div className="text-sm text-gray-600">All bulk orders</div>
        </div>
      </div>

      {/* Current Inventory Section */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Section Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Current Inventory
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your bulk orders and purchased stock
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, products, contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              {statusFilterOptions.find((o) => o.value === selectedStatus)
                ?.label ?? "All Status"}
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {statusFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                      selectedStatus === option.value
                        ? "bg-blue-50 font-medium text-blue-700"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      setSelectedStatus(option.value);
                      setShowStatusDropdown(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-sm text-gray-500">
              Loading bulk orders...
            </span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-16">
            <XCircle className="h-10 w-10 text-red-400" />
            <p className="mt-3 text-sm text-gray-600">
              Failed to load bulk orders. Please try again.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-600">
              No bulk orders found
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {searchQuery || selectedStatus !== "ALL"
                ? "Try adjusting your filters"
                : "Place your first bulk order from the sourcing market"}
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && filteredOrders.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Est. Weight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Est. Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredOrders.map((order) => {
                    const status = order.status as BulkOrderStatus;
                    const config = statusConfig[status];
                    return (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        {/* Order Number */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.orderNumber}
                            </div>
                            {order.companyName && (
                              <div className="text-xs text-gray-500">
                                {order.companyName}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Products */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {order.items.slice(0, 2).map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2"
                              >
                                {item.productImage ? (
                                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-gray-100">
                                    <Image
                                      src={item.productImage}
                                      alt={item.productName}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-linear-to-br from-blue-100 to-blue-200 text-[10px] text-blue-600">
                                    IMG
                                  </div>
                                )}
                                <span className="text-sm text-gray-700 truncate max-w-[150px]">
                                  {item.productName}
                                </span>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <span className="text-xs text-gray-400">
                                +{order.items.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Item Count */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </td>

                        {/* Est. Weight */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                          {Number(order.estimatedWeightKg).toFixed(1)} kg
                        </td>

                        {/* Est. Total */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                          ₱
                          {Number(order.estimatedTotal).toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bgColor} ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                          {format(
                            new Date(order.createdAt),
                            "MMM dd, yyyy",
                          )}
                        </td>

                        {/* Actions */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                              <Eye className="h-3 w-3" />
                              View Details
                            </button>
                            {order.trackingNumber && (
                              <button className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700">
                                <Truck className="h-3 w-3" />
                                Track
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Info */}
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <div className="text-sm text-gray-600">
                Showing {filteredOrders.length} of {bulkOrders.length} orders
              </div>
              {data?.nextCursor && (
                <div className="text-sm text-gray-500">
                  More orders available
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 flex items-center justify-center gap-6 border-t border-gray-200 pt-6 text-sm text-gray-500">
        <a href="#" className="hover:text-gray-700">
          Inventory Reports
        </a>
        <a href="#" className="hover:text-gray-700">
          Wholesale Guidelines
        </a>
        <a href="#" className="hover:text-gray-700">
          Support
        </a>
        <span className="text-gray-400">
          © 2024 FreshDart B2B. Empowering MSME Merchants.
        </span>
      </footer>
    </div>
  );
}
