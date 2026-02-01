"use client";

import { Trash2, Fish, Snowflake } from "lucide-react";
import { formatPrice } from "~/lib/utils";
import { QuantitySelector } from "~/components/products/quantity-selector";
import { useBulkOrderStore, type BulkOrderItem as BulkOrderItemType } from "~/stores/bulk-order-store";

interface BulkOrderItemProps {
  item: BulkOrderItemType;
}

export function BulkOrderItem({ item }: BulkOrderItemProps) {
  const updateQuantity = useBulkOrderStore((state) => state.updateQuantity);
  const removeItem = useBulkOrderStore((state) => state.removeItem);

  const { product, quantity } = item;

  const price =
    typeof product.price === "number"
      ? product.price
      : parseFloat(product.price.toString());

  const minQty =
    typeof product.minOrderQty === "number"
      ? product.minOrderQty
      : parseFloat(product.minOrderQty.toString());

  const maxQty = product.maxOrderQty
    ? typeof product.maxOrderQty === "number"
      ? product.maxOrderQty
      : parseFloat(product.maxOrderQty.toString())
    : undefined;

  const stockQty =
    typeof product.stockQuantity === "number"
      ? product.stockQuantity
      : parseFloat(product.stockQuantity.toString());

  const step = 1;
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];

  return (
    <div className="flex gap-4 py-4">
      {/* Image */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-teal-50">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Fish className="h-8 w-8 text-teal-300" />
          </div>
        )}
        {product.requiresColdChain && (
          <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
            <Snowflake className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="line-clamp-1 text-sm font-semibold text-gray-900">
              {product.name}
            </h4>
            {product.localName && (
              <p className="text-xs text-gray-500">({product.localName})</p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {product.productType}
              </span>
              <span className="text-xs text-gray-500">
                {formatPrice(price)} / {product.stockUnit}
              </span>
            </div>
          </div>
          <button
            onClick={() => removeItem(product.id)}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <QuantitySelector
            quantity={quantity}
            onChange={(newQty) => updateQuantity(product.id, newQty)}
            min={minQty}
            max={Math.min(maxQty ?? stockQty, stockQty)}
            step={step}
            unit={product.stockUnit}
            size="sm"
          />
          <span className="text-base font-bold text-gray-900">
            {formatPrice(price * quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
