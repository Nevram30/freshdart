"use client";

import { Package, Scale, ShoppingCart } from "lucide-react";
import { formatPrice, formatWeight } from "~/lib/utils";
import { useBulkOrderStore } from "~/stores/bulk-order-store";

export function BulkOrderSummary() {
  const getItemCount = useBulkOrderStore((state) => state.getItemCount);
  const getTotalItems = useBulkOrderStore((state) => state.getTotalItems);
  const getSubtotal = useBulkOrderStore((state) => state.getSubtotal);
  const getTotalWeight = useBulkOrderStore((state) => state.getTotalWeight);

  const itemCount = getItemCount();
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  const totalWeight = getTotalWeight();

  return (
    <div className="space-y-3 border-t border-gray-200 pt-4">
      {/* Order Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-teal-50 p-3">
          <ShoppingCart className="h-4 w-4 text-teal-600" />
          <div>
            <p className="text-xs text-teal-600">Products</p>
            <p className="font-semibold text-teal-700">{itemCount} items</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
          <Package className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Total Units</p>
            <p className="font-semibold text-gray-700">{totalItems}</p>
          </div>
        </div>
      </div>

      {/* Weight */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Scale className="h-4 w-4" />
          <span>Estimated Weight</span>
        </div>
        <span className="font-medium text-gray-900">{formatWeight(totalWeight)}</span>
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
        <span className="text-base font-semibold text-gray-900">Estimated Total</span>
        <span className="text-xl font-bold text-teal-700">
          {formatPrice(subtotal)}
        </span>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-500">
        Final pricing may vary based on actual weight and availability. Our team will confirm your order details.
      </p>
    </div>
  );
}
