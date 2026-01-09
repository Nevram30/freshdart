"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Leaf,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { FreshnessBadge } from "~/components/products/freshness-badge";
import { QuantitySelector } from "~/components/products/quantity-selector";
import { useCartStore } from "~/stores/cart-store";
import { formatPrice, formatWeight } from "~/lib/utils";
import type { Product } from "~/types";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const { data: productData, isLoading, isError } = api.product.getBySlug.useQuery({
    slug: params.slug,
  });

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !productData) {
    notFound();
  }

  // Transform to Product type
  const product: Product = {
    ...productData,
    price: Number(productData.price),
    compareAtPrice: productData.compareAtPrice
      ? Number(productData.compareAtPrice)
      : null,
    stockQuantity: Number(productData.stockQuantity),
    minOrderQty: Number(productData.minOrderQty),
    maxOrderQty: productData.maxOrderQty
      ? Number(productData.maxOrderQty)
      : null,
    weightKg: Number(productData.weightKg),
  };

  const price = product.price as number;
  const compareAtPrice = product.compareAtPrice as number | null;
  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const minQty = product.minOrderQty as number;
  const maxQty = product.maxOrderQty as number | undefined;
  const step = product.stockType === "WEIGHT" ? 0.1 : 1;

  const selectedImage = product.images[selectedImageIndex] ?? product.images[0];
  const isOutOfStock = product.status === "OUT_OF_STOCK";

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addItem(product, quantity);
      openCart();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-green-600"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
              {selectedImage ? (
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.alt ?? product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-8xl">🥬</span>
                </div>
              )}

              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-sm font-semibold text-white">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      index === selectedImageIndex
                        ? "border-green-500"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt ?? `${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category & Tags */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-sm font-medium uppercase tracking-wider text-green-600 hover:underline"
              >
                {product.category.name}
              </Link>
              {product.featured && <Badge variant="info">Featured</Badge>}
            </div>

            {/* Name */}
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            {/* Freshness Badge */}
            <div className="mb-6">
              <FreshnessBadge bestBefore={product.bestBefore} />
            </div>

            {/* Price */}
            <div className="mb-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(price)}
              </span>
              {compareAtPrice && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(compareAtPrice)}
                </span>
              )}
              <span className="text-gray-500">/ {product.stockUnit}</span>
            </div>

            {/* Description */}
            {product.shortDescription && (
              <p className="mb-6 text-gray-600">{product.shortDescription}</p>
            )}

            {/* Stock Info */}
            <div className="mb-6 flex items-center gap-4 text-sm">
              {product.stockType === "WEIGHT" && (
                <span className="text-gray-500">
                  Weight: {formatWeight(product.weightKg as number)} per unit
                </span>
              )}
              {!isOutOfStock && (
                <span className="text-green-600">
                  ✓ In Stock ({Number(product.stockQuantity)} available)
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <QuantitySelector
                quantity={quantity}
                onChange={setQuantity}
                min={minQty}
                max={maxQty}
                step={step}
                unit={product.stockUnit}
                size="lg"
              />
            </div>

            {/* Total Price */}
            <div className="mb-6 rounded-xl bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(price * quantity)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-8 flex gap-3">
              <Button
                variant="primary"
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="h-5 w-5" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid gap-4 border-t border-gray-100 pt-8 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Fast Delivery</p>
                  <p className="text-sm text-gray-500">1-3 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Quality Assured</p>
                  <p className="text-sm text-gray-500">Freshness guaranteed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Farm Fresh</p>
                  <p className="text-sm text-gray-500">Direct from source</p>
                </div>
              </div>
            </div>

            {/* Full Description */}
            {product.description && (
              <div className="mt-8 border-t border-gray-100 pt-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Product Details
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600">{product.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 h-5 w-32 animate-pulse rounded bg-gray-100" />

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-gray-100" />

          <div className="space-y-6">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-8 w-32 animate-pulse rounded-full bg-gray-100" />
            <div className="h-10 w-40 animate-pulse rounded bg-gray-100" />
            <div className="h-20 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100" />
            <div className="h-14 w-full animate-pulse rounded-xl bg-gray-100" />
            <div className="flex gap-3">
              <div className="h-12 flex-1 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
