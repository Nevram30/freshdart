"use client";

import { useState } from "react";
import {
  Download,
  Search,
  Calendar,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Headphones,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

type OrderStatus = "SHIPPED" | "PENDING" | "DELIVERED" | "CANCELLED";

interface Order {
  id: string;
  producer: string;
  producerIcon: string;
  orderDate: string;
  totalAmount: string;
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { variant: "info" | "warning" | "success" | "danger"; label: string }> = {
  SHIPPED: { variant: "info", label: "SHIPPED" },
  PENDING: { variant: "warning", label: "PENDING" },
  DELIVERED: { variant: "success", label: "DELIVERED" },
  CANCELLED: { variant: "danger", label: "CANCELLED" },
};

const producerIcons: Record<string, string> = {
  "Blue Ocean Fisheries": "🐟",
  "Arctic Harvest Co.": "❄️",
  "Bay Side Farmers": "🦐",
  "Sustainable Shells": "🦪",
  "Coral Reef Imports": "🪸",
};

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "shipped" | "delivered" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Sample orders data
  const allOrders: Order[] = [
    {
      id: "#ORD-8821",
      producer: "Blue Ocean Fisheries",
      producerIcon: "🐟",
      orderDate: "Oct 23, 2023",
      totalAmount: "$1,240.00",
      status: "SHIPPED",
    },
    {
      id: "#ORD-8819",
      producer: "Arctic Harvest Co.",
      producerIcon: "❄️",
      orderDate: "Oct 23, 2023",
      totalAmount: "$850.50",
      status: "PENDING",
    },
    {
      id: "#ORD-8790",
      producer: "Bay Side Farmers",
      producerIcon: "🦐",
      orderDate: "Oct 21, 2023",
      totalAmount: "$2,100.00",
      status: "DELIVERED",
    },
    {
      id: "#ORD-8772",
      producer: "Sustainable Shells",
      producerIcon: "🦪",
      orderDate: "Oct 20, 2023",
      totalAmount: "$425.00",
      status: "DELIVERED",
    },
    {
      id: "#ORD-8701",
      producer: "Coral Reef Imports",
      producerIcon: "🪸",
      orderDate: "Oct 18, 2023",
      totalAmount: "$1,890.00",
      status: "CANCELLED",
    },
  ];

  const tabs = [
    { key: "all" as const, label: "All Orders", count: 48 },
    { key: "pending" as const, label: "Pending", count: 5 },
    { key: "shipped" as const, label: "Shipped", count: 12 },
    { key: "delivered" as const, label: "Delivered", count: 28 },
    { key: "cancelled" as const, label: "Cancelled", count: 3 },
  ];

  const filteredOrders = allOrders.filter((order) => {
    if (activeTab !== "all" && order.status.toLowerCase() !== activeTab) {
      return false;
    }
    if (searchQuery) {
      return (
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.producer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const totalPages = Math.ceil(48 / 5); // Simulating 48 total orders

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">
            Track and manage your seafood sourcing history.
          </p>
        </div>
        <Button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800">
          <Download className="h-4 w-4" />
          Export Orders
        </Button>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 px-6" aria-label="Order status tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-900 text-blue-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 border-b border-gray-200 px-6 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Producer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <Calendar className="h-4 w-4" />
            Select Date Range
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <SlidersHorizontal className="h-4 w-4" />
            More Filters
          </button>
        </div>

        {/* Orders Table */}
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
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {order.id}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-lg">
                        {order.producerIcon}
                      </div>
                      <span className="text-sm text-gray-900">
                        {order.producer}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {order.orderDate}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                    {order.totalAmount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge
                      variant={statusConfig[order.status].variant}
                      className="text-xs font-semibold uppercase"
                    >
                      {statusConfig[order.status].label}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <button className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            Showing 1 to 5 of 48 orders
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-blue-900 text-white"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-blue-50 p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <Headphones className="h-6 w-6 text-blue-900" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Need assistance with an order?
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Our support team is available 24/7 to help with logistics or
                disputes.
              </p>
            </div>
          </div>
          <Button className="bg-white text-blue-900 hover:bg-gray-50">
            Contact Support
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6 text-sm text-gray-600">
        <div className="flex gap-6">
          <button className="transition-colors hover:text-gray-900">
            Market Trends
          </button>
          <button className="transition-colors hover:text-gray-900">
            Order Guidelines
          </button>
          <button className="transition-colors hover:text-gray-900">
            Support
          </button>
        </div>
        <div className="text-gray-500">
          © 2024 AquaConnect B2B. Empowering MSME Merchants.
        </div>
      </div>
    </div>
  );
}
