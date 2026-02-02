"use client";

import { useState } from "react";
import {
  Search,
  ShoppingCart,
  Info,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Building2,
  Filter,
} from "lucide-react";
import { cn } from "~/lib/utils";


import { api } from "~/trpc/react";


import { useBulkOrderStore } from "~/stores/bulk-order-store";
import { BulkOrderDrawer } from "~/components/bulk-order";
import { ProducerCard, ProducerProductsModal } from "~/components/sourcing";

type BusinessType = "MSME" | "FISHERY" | "AQUACULTURE" | "PROCESSOR";

const businessTypeFilters = [
  { id: "all", name: "All Producers" },
  { id: "FISHERY", name: "Fisheries" },
  { id: "AQUACULTURE", name: "Aquaculture" },
  { id: "PROCESSOR", name: "Processors" },
  { id: "MSME", name: "MSME" },
];

export default function SourcingMarketPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusinessType, setSelectedBusinessType] = useState("all");
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    verifiedOnly: true,
  });

  // Bulk order store
  const openDrawer = useBulkOrderStore((state) => state.openDrawer);
  const getTotalItems = useBulkOrderStore((state) => state.getTotalItems);
  const getItemCount = useBulkOrderStore((state) => state.getItemCount);

  const totalBulkItems = getTotalItems();
  const bulkItemCount = getItemCount();

  // Fetch producers
  const { data, isLoading, isError } = api.merchant.getProducers.useQuery({
    businessType: selectedBusinessType !== "all" ? (selectedBusinessType as BusinessType) : undefined,
    search: searchQuery.length > 0 ? searchQuery : undefined,
    verifiedOnly: filters.verifiedOnly,
    limit: 20,
  });

  const producers = data?.producers ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sourcing Market</h1>
            <p className="mt-1 text-gray-600">
              Browse verified producers and source premium seafood directly
            </p>
          </div>
          <button
            onClick={openDrawer}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all",
              bulkItemCount > 0
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="font-semibold">
              {bulkItemCount > 0 ? `${totalBulkItems} items in bulk order` : "Bulk Order"}
            </span>
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for producers, business names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Business Type Tabs */}
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
            {businessTypeFilters.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedBusinessType(type.id)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
                  selectedBusinessType === type.id
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                {type.name}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <p className="mt-4 text-gray-500">Loading producers...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <p className="mt-4 text-lg font-medium text-gray-700">Failed to load producers</p>
              <p className="mt-1 text-sm text-gray-500">Please try again later</p>
            </div>
          )}

          {/* Results Count */}
          {!isLoading && !isError && (
            <div className="mb-4 text-sm text-gray-600">
              Showing {producers.length} producers
            </div>
          )}

          {/* Producers Grid */}
          {!isLoading && !isError && (
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {producers.map((producer) => (
                <ProducerCard
                  key={producer.id}
                  producer={producer}
                  onViewProducts={(id) => setSelectedProducerId(id)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && producers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-16 w-16 text-gray-300" />
              <p className="mt-4 text-lg font-medium text-gray-500">No producers found</p>
              <p className="mt-1 text-sm text-gray-400">
                Try adjusting your filters or search query
              </p>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !isError && producers.length > 0 && (
            <div className="flex items-center justify-center gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 font-semibold text-white">
                1
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Filters Sidebar */}
        <div className="w-80 shrink-0">
          <div className="sticky top-6 space-y-6">
            {/* Filters Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              </div>
              <button
                onClick={() =>
                  setFilters({
                    verifiedOnly: true,
                  })
                }
                className="text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                Reset
              </button>
            </div>

            {/* Verification Filter */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Verification</h3>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500/20"
                  />
                  <span className="text-sm text-gray-700">Verified Producers Only</span>
                </label>
              </div>
            </div>

            {/* How It Works */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">How It Works</h3>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                    1
                  </span>
                  <span>Browse verified producers and view their products</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                    2
                  </span>
                  <span>Add items to your bulk order</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                    3
                  </span>
                  <span>Submit your order request for pricing</span>
                </li>
              </ol>
            </div>

            {/* Bulk Sourcing Help */}
            <div className="rounded-xl bg-teal-900 p-6 text-white">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-5 w-5" />
                <h3 className="font-bold">Need Help?</h3>
              </div>
              <p className="mb-4 text-sm text-teal-100">
                Our sourcing agents can help you find the right producers and negotiate better
                terms for bulk orders.
              </p>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-teal-900 transition-colors hover:bg-teal-50">
                <MessageCircle className="h-4 w-4" />
                Talk to an Agent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Producer Products Modal */}
      <ProducerProductsModal
        producerId={selectedProducerId}
        onClose={() => setSelectedProducerId(null)}
      />

      {/* Bulk Order Drawer */}
      <BulkOrderDrawer />
    </div>
  );
}
