"use client";

import {
  Package,
  AlertTriangle,
  DollarSign,
  Download,
  Plus,
  Search,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface InventoryItem {
  id: string;
  name: string;
  origin?: string;
  image: string;
  sku: string;
  category: string;
  categoryColor: string;
  currentQty: number;
  unit: string;
  lastRestocked: string;
  autoReplenish: boolean;
  lowStock?: boolean;
  stockStatus?: string;
}

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);

  const inventoryItems: InventoryItem[] = [
    {
      id: "1",
      name: "Atlantic Salmon",
      origin: "Norway Origin",
      image: "/placeholder-salmon.png",
      sku: "SAL-NOR-001",
      category: "FRESH FISH",
      categoryColor: "bg-blue-100 text-blue-700",
      currentQty: 120.0,
      unit: "kg",
      lastRestocked: "Oct 24, 2023",
      autoReplenish: true,
    },
    {
      id: "2",
      name: "Tiger Prawns (Jumbo)",
      image: "/placeholder-prawns.png",
      sku: "PRW-TIG-042",
      category: "CRUSTACEANS",
      categoryColor: "bg-orange-100 text-orange-700",
      currentQty: 8.5,
      unit: "kg",
      lastRestocked: "Oct 15, 2023",
      autoReplenish: false,
      lowStock: true,
      stockStatus: "LOW STOCK WARNING",
    },
    {
      id: "3",
      name: "Wild Blue Mussels",
      origin: "In-Shell",
      image: "/placeholder-mussels.png",
      sku: "MSL-BLU-108",
      category: "SHELLFISH",
      categoryColor: "bg-purple-100 text-purple-700",
      currentQty: 12.0,
      unit: "kg",
      lastRestocked: "Oct 20, 2023",
      autoReplenish: true,
    },
    {
      id: "4",
      name: "Yellowfin Tuna (AAA)",
      origin: "Frozen Saku",
      image: "/placeholder-tuna.png",
      sku: "TUN-YEL-500",
      category: "FRESH FISH",
      categoryColor: "bg-blue-100 text-blue-700",
      currentQty: 45.0,
      unit: "kg",
      lastRestocked: "Oct 22, 2023",
      autoReplenish: true,
    },
    {
      id: "5",
      name: "King Crab Legs",
      origin: "Cooked",
      image: "/placeholder-crab.png",
      sku: "CRB-KIN-101",
      category: "CRUSTACEANS",
      categoryColor: "bg-orange-100 text-orange-700",
      currentQty: 25.0,
      unit: "crate",
      lastRestocked: "Oct 26, 2023",
      autoReplenish: false,
    },
  ];

  const totalItems = 24;
  const lowStockCount = 5;
  const estimatedValue = 12450.8;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage your restaurant&apos;s seafood supplies.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-800">
            <Plus className="h-4 w-4" />
            Log New Stock
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Items in Stock */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Items in Stock
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mb-1 text-4xl font-bold text-gray-900">
            {totalItems}
          </div>
          <div className="text-sm text-gray-600">Active Categories</div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-orange-700">
              Low Stock Alerts
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-200">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="mb-1 text-4xl font-bold text-orange-600">
            {String(lowStockCount).padStart(2, "0")}
          </div>
          <div className="text-sm text-orange-700">Require Attention</div>
        </div>

        {/* Estimated Stock Value */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Estimated Stock Value
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mb-1 text-4xl font-bold text-gray-900">
            ${estimatedValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-600">Current Valuation</div>
        </div>
      </div>

      {/* Current Inventory Section */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Section Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Current Inventory
          </h2>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              {selectedCategory}
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Current Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Last Restocked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Auto-Replenish
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {inventoryItems.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-colors hover:bg-gray-50 ${
                    item.lowStock ? "bg-orange-50" : ""
                  }`}
                >
                  {/* Product Name */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {/* Placeholder for product image */}
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-xs text-blue-600">
                          IMG
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        {item.origin && (
                          <div className="text-xs text-gray-500">
                            {item.origin}
                          </div>
                        )}
                        {item.lowStock && (
                          <div className="mt-1">
                            <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                              {item.stockStatus}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {item.sku}
                  </td>

                  {/* Category */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${item.categoryColor}`}
                    >
                      {item.category}
                    </span>
                  </td>

                  {/* Current Qty */}
                  <td
                    className={`whitespace-nowrap px-6 py-4 text-sm font-semibold ${
                      item.lowStock ? "text-orange-600" : "text-gray-900"
                    }`}
                  >
                    {item.currentQty}
                  </td>

                  {/* Unit */}
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {item.unit}
                  </td>

                  {/* Last Restocked */}
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {item.lastRestocked}
                  </td>

                  {/* Auto-Replenish Toggle */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        item.autoReplenish ? "bg-teal-600" : "bg-gray-300"
                      }`}
                      onClick={() => {
                        // Toggle auto-replenish
                      }}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          item.autoReplenish ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <button className="text-xs text-blue-600 hover:text-blue-700">
                        Adjust Stock
                      </button>
                      <button className="rounded-md bg-blue-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-800">
                        Reorder Now
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <div className="text-sm text-gray-600">
            Showing 5 of {totalItems} items
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <button className="rounded-lg bg-blue-900 px-3 py-1.5 text-sm font-medium text-white">
              1
            </button>
            <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              2
            </button>
            <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              3
            </button>
            <button
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
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
          © 2024 AquaConnect B2B. Empowering MSME Merchants.
        </span>
      </footer>
    </div>
  );
}
