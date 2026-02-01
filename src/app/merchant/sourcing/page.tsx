"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  Info,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "~/lib/utils";

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  producer: string;
  moq: string;
  stock: "IN STOCK" | "LOW STOCK";
  directFromProducer: boolean;
  sustainability?: "A" | "B";
}

// Sample data
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Atlantic Salmon",
    price: 18.5,
    unit: "kg",
    image: "/images/salmon.jpg",
    producer: "North Sea Fisheries Ltd.",
    moq: "50KG",
    stock: "IN STOCK",
    directFromProducer: true,
    sustainability: "A",
  },
  {
    id: "2",
    name: "Tiger Prawns (Jumbo)",
    price: 22.0,
    unit: "kg",
    image: "/images/prawns.jpg",
    producer: "Delta Aquaculture",
    moq: "25KG",
    stock: "IN STOCK",
    directFromProducer: true,
  },
  {
    id: "3",
    name: "Mediterranean Sea Bass",
    price: 16.2,
    unit: "kg",
    image: "/images/seabass.jpg",
    producer: "Azure Coast Farms",
    moq: "100KG",
    stock: "IN STOCK",
    directFromProducer: true,
    sustainability: "B",
  },
  {
    id: "4",
    name: "Wild Blue Mussels",
    price: 9.8,
    unit: "kg",
    image: "/images/mussels.jpg",
    producer: "Atlantic Shells Co.",
    moq: "200KG",
    stock: "LOW STOCK",
    directFromProducer: true,
  },
  {
    id: "5",
    name: "Yellowfin Tuna (AAA)",
    price: 32.5,
    unit: "kg",
    image: "/images/tuna.jpg",
    producer: "Pacific Deep Sea",
    moq: "15KG",
    stock: "IN STOCK",
    directFromProducer: true,
  },
  {
    id: "6",
    name: "King Crab Legs",
    price: 45.0,
    unit: "kg",
    image: "/images/crab.jpg",
    producer: "Alaskan Harvest Co.",
    moq: "10KG",
    stock: "IN STOCK",
    directFromProducer: true,
  },
];

const categories = [
  "All Items",
  "Fresh Catch",
  "Processed",
  "Live Seafood",
  "Bulk Dry Goods",
];

export default function SourcingMarketPage() {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    sustainability: [] as string[],
    origin: "All Regions",
    processingDate: "",
    deliveryLeadTime: 7,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for wholesale seafood, producers, or origins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
                  activeCategory === category
                    ? "bg-blue-900 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleProducts.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
                  <div className="flex h-full items-center justify-center">
                    <span className="text-6xl">🐟</span>
                  </div>

                  {/* Direct from Producer Badge */}
                  {product.directFromProducer && (
                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-md">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-900">
                        Direct from Producer
                      </span>
                    </div>
                  )}

                  {/* Sustainability Badge */}
                  {product.sustainability && (
                    <div className="absolute right-3 top-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full font-bold text-white shadow-md",
                          product.sustainability === "A"
                            ? "bg-green-500"
                            : "bg-orange-500"
                        )}
                      >
                        {product.sustainability}
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      By {product.producer}
                    </p>
                  </div>

                  {/* Price and Stock */}
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">/{product.unit}</span>
                  </div>

                  <div className="mb-4 flex items-center gap-3 text-xs">
                    <span className="font-medium text-gray-600">
                      MOQ: {product.moq}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-semibold",
                        product.stock === "IN STOCK"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {product.stock}
                    </span>
                  </div>

                  {/* Add to Bulk Order Button */}
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Bulk Order
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 font-semibold text-white">
              1
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              2
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              3
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Advanced Filters Sidebar */}
        <div className="w-80">
          <div className="sticky top-6 space-y-6">
            {/* Filters Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Advanced Filters
              </h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Reset
              </button>
            </div>

            {/* Sustainability Rating */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Sustainability Rating
              </h3>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500/20"
                  />
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700">
                      A - High Sustainability
                    </span>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-500/20"
                  />
                  <span className="text-sm text-gray-700">
                    B - Reliable Practices
                  </span>
                </label>
              </div>
            </div>

            {/* Origin */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Origin
              </h3>
              <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>All Regions</option>
                <option>North Atlantic</option>
                <option>Mediterranean</option>
                <option>Pacific</option>
                <option>Arctic</option>
              </select>
            </div>

            {/* Processing Date */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Processing Date
              </h3>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="processingDate"
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-sm text-gray-700">Last 24 Hours</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="processingDate"
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-sm text-gray-700">Last 3 Days</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="processingDate"
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-sm text-gray-700">Within a Week</span>
                </label>
              </div>
            </div>

            {/* Delivery Lead Time */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Delivery Lead Time
              </h3>
              <input
                type="range"
                min="1"
                max="14"
                value={filters.deliveryLeadTime}
                onChange={(e) =>
                  setFilters({ ...filters, deliveryLeadTime: +e.target.value })
                }
                className="mb-2 w-full accent-blue-900"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Next Day</span>
                <span className="font-medium text-gray-900">
                  {filters.deliveryLeadTime} Days
                </span>
                <span>14 Days</span>
              </div>
            </div>

            {/* Apply Filters Button */}
            <button className="w-full rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800">
              Apply Filters
            </button>

            {/* Bulk Sourcing Help */}
            <div className="rounded-xl bg-blue-900 p-6 text-white">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-5 w-5" />
                <h3 className="font-bold">Bulk Sourcing Help</h3>
              </div>
              <p className="mb-4 text-sm text-blue-100">
                Need a customized quote or recurring order? Our sourcing agents
                can help you negotiate better terms.
              </p>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-blue-900 transition-colors hover:bg-blue-50">
                <MessageCircle className="h-4 w-4" />
                Talk to an Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
