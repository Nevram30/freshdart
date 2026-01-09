"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { QuantitySelector } from "~/components/products/quantity-selector";
import { CartSummary } from "~/components/cart/cart-summary";
import { useCartStore } from "~/stores/cart-store";
import { formatPrice } from "~/lib/utils";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="mb-4 text-6xl">🛒</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Your cart is empty
        </h1>
        <p className="mb-6 text-gray-500">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/products">
          <Button variant="primary">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Shopping Cart
            </h1>
            <p className="mt-1 text-gray-500">
              {items.length} item{items.length !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          <Button variant="ghost" onClick={clearCart} className="text-red-600">
            Clear Cart
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white shadow-sm">
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
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
                  const primaryImage =
                    product.images.find((img) => img.isPrimary) ??
                    product.images[0];

                  return (
                    <div key={item.productId} className="flex gap-6 p-6">
                      {/* Image */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-32 sm:w-32"
                      >
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl">
                            🥬
                          </div>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              href={`/products/${product.slug}`}
                              className="font-semibold text-gray-900 hover:text-green-600"
                            >
                              {product.name}
                            </Link>
                            <p className="mt-1 text-sm text-gray-500">
                              {product.category.name}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {formatPrice(price)} / {product.stockUnit}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(product.id)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-4">
                          <QuantitySelector
                            quantity={quantity}
                            onChange={(newQty) =>
                              updateQuantity(product.id, newQty)
                            }
                            min={minQty}
                            max={maxQty}
                            step={step}
                            unit={product.stockUnit}
                            size="md"
                          />
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(price * quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
              >
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Order Summary
              </h2>

              <CartSummary />

              <Link href="/checkout" className="mt-6 block">
                <Button variant="primary" size="lg" className="w-full gap-2">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
