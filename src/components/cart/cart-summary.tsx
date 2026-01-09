"use client";

import { Package, Truck } from "lucide-react";
import { formatPrice, formatWeight } from "~/lib/utils";
import { useCartStore } from "~/stores/cart-store";

interface CartSummaryProps {
  shippingType?: "standard" | "express";
}

export function CartSummary({ shippingType = "standard" }: CartSummaryProps) {
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotalWeight = useCartStore((state) => state.getTotalWeight);
  const getShippingCost = useCartStore((state) => state.getShippingCost);
  const getTotal = useCartStore((state) => state.getTotal);

  const subtotal = getSubtotal();
  const totalWeight = getTotalWeight();
  const shipping = getShippingCost(shippingType);
  const total = getTotal(shippingType);

  return (
    <div className="space-y-3 border-t border-gray-100 pt-4">
      {/* Weight Summary */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Package className="h-4 w-4" />
        <span>Total weight: {formatWeight(totalWeight)}</span>
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
      </div>

      {/* Shipping */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{shipping.rateName}</span>
        </div>
        <span className="font-medium text-gray-900">
          {formatPrice(shipping.cost)}
        </span>
      </div>

      {/* Estimated Delivery */}
      <div className="text-xs text-gray-400">
        Estimated delivery in {shipping.estimatedDays} day
        {shipping.estimatedDays !== 1 ? "s" : ""}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-base font-semibold text-gray-900">Total</span>
        <span className="text-xl font-bold text-gray-900">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}
