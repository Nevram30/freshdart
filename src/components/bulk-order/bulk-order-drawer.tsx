"use client";

import { useEffect } from "react";
import { X, ShoppingCart, Trash2, FileText, Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { BulkOrderItem } from "./bulk-order-item";
import { BulkOrderSummary } from "./bulk-order-summary";
import { useBulkOrderStore } from "~/stores/bulk-order-store";
import { cn } from "~/lib/utils";

export function BulkOrderDrawer() {
  const isOpen = useBulkOrderStore((state) => state.isOpen);
  const closeDrawer = useBulkOrderStore((state) => state.closeDrawer);
  const items = useBulkOrderStore((state) => state.items);
  const clearOrder = useBulkOrderStore((state) => state.clearOrder);
  const getItemCount = useBulkOrderStore((state) => state.getItemCount);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmitOrder = () => {
    // TODO: Implement order submission
    alert("Your bulk order request has been submitted! Our team will contact you shortly to confirm details and pricing.");
    clearOrder();
    closeDrawer();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-teal-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Bulk Order</h2>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
              {getItemCount()} products
            </span>
          </div>
          <button
            onClick={closeDrawer}
            className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close bulk order"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
              <ShoppingCart className="h-10 w-10 text-teal-300" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No items yet
            </h3>
            <p className="mb-6 max-w-xs text-center text-sm text-gray-500">
              Browse our sourcing market and add products to your bulk order. We offer competitive wholesale pricing for merchants.
            </p>
            <Button onClick={closeDrawer} variant="primary" className="bg-teal-600 hover:bg-teal-700">
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            {/* Clear All Button */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-2">
              <p className="text-sm text-gray-600">Review your bulk order</p>
              <button
                onClick={clearOrder}
                className="flex items-center gap-1.5 text-sm text-red-600 transition-colors hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <BulkOrderItem key={item.productId} item={item} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <BulkOrderSummary />

              <div className="mt-4 space-y-2">
                <button
                  onClick={handleSubmitOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                >
                  <Send className="h-4 w-4" />
                  Submit Bulk Order Request
                </button>
                <button
                  onClick={() => {
                    // TODO: Generate quote PDF
                    alert("Quote generation coming soon!");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4" />
                  Request Quote
                </button>
                <button
                  onClick={closeDrawer}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
