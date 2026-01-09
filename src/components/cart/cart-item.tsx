"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { formatPrice } from "~/lib/utils";
import { QuantitySelector } from "~/components/products/quantity-selector";
import { useCartStore } from "~/stores/cart-store";
import type { CartItem as CartItemType } from "~/types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

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

  const step = product.stockType === "WEIGHT" ? 0.1 : 1;
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];

  return (
    <div className="flex gap-4 py-4">
      {/* Image */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-2xl">🥬</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="line-clamp-1 text-sm font-medium text-gray-900">
              {product.name}
            </h4>
            <p className="text-xs text-gray-500">
              {formatPrice(price)} / {product.stockUnit}
            </p>
          </div>
          <button
            onClick={() => removeItem(product.id)}
            className="text-gray-400 transition-colors hover:text-red-500"
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
            max={maxQty}
            step={step}
            unit={product.stockUnit}
            size="sm"
          />
          <span className="font-semibold text-gray-900">
            {formatPrice(price * quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
