"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { cn, formatPrice } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { FreshnessIndicator, FreshnessBadge } from "./freshness-badge";
import { useCartStore } from "~/stores/cart-store";
import type { Product } from "~/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const price =
    typeof product.price === "number"
      ? product.price
      : parseFloat(product.price.toString());

  const compareAtPrice = product.compareAtPrice
    ? typeof product.compareAtPrice === "number"
      ? product.compareAtPrice
      : parseFloat(product.compareAtPrice.toString())
    : null;

  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const isOutOfStock = product.status === "OUT_OF_STOCK";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      const minQty =
        typeof product.minOrderQty === "number"
          ? product.minOrderQty
          : parseFloat(product.minOrderQty.toString());
      addItem(product, minQty);
      openCart();
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300",
        "hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="text-4xl text-gray-300">🥬</span>
          </div>
        )}

        {/* Freshness Indicator */}
        <FreshnessIndicator bestBefore={product.bestBefore} />

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
            -{discount}%
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <span className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Add Button */}
        {!isOutOfStock && (
          <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Button
              onClick={handleAddToCart}
              variant="primary"
              size="sm"
              className="w-full gap-2 shadow-lg"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        <span className="mb-1 text-xs font-medium uppercase tracking-wider text-green-600">
          {product.category.name}
        </span>

        {/* Name */}
        <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-green-600">
          {product.name}
        </h3>

        {/* Freshness Badge */}
        <div className="mb-3">
          <FreshnessBadge bestBefore={product.bestBefore} showDays={false} />
        </div>

        {/* Price & Unit */}
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(price)}
          </span>
          {compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
          <span className="text-sm text-gray-500">
            / {product.stockUnit}
          </span>
        </div>

        {/* Stock Type Indicator */}
        {product.stockType === "WEIGHT" && (
          <span className="mt-1 text-xs text-gray-400">
            Sold by weight
          </span>
        )}
      </div>
    </Link>
  );
}
