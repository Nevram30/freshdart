"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  ShoppingCart,
  Heart,
  Clock,
  Thermometer,
  Scale,
  MapPin,
  Truck,
  CheckCircle2,
  Fish,
  Star,
  ChefHat,
  Utensils,
  Anchor,
} from "lucide-react";
import { api } from "~/trpc/react";
import { QuantitySelector } from "~/components/products/quantity-selector";
import { useCartStore } from "~/stores/cart-store";
import { formatPrice } from "~/lib/utils";
import type { Product } from "~/types";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showBulkPricing, setShowBulkPricing] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const {
    data: productData,
    isLoading,
    isError,
  } = api.product.getBySlug.useQuery({
    slug: params.slug,
  });

  if (isLoading) {
    return (
      <>
        <ProductDetailSkeleton />
      </>
    );
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

  // Generate placeholder bulk pricing
  const bulkPricing = [
    { range: "10-25 kg", price: price * 0.95, selected: false },
    { range: "26-50 kg", price: price * 0.88, selected: false },
    { range: "51+ kg", price: price * 0.8, selected: false },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="text-gray-500 transition-colors hover:text-teal-600"
              >
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-gray-500 transition-colors hover:text-teal-600"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm">
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
                  <div className="flex h-full w-full items-center justify-center bg-gray-100">
                    <Fish className="h-32 w-32 text-gray-300" />
                  </div>
                )}

                {/* Fresh Catch Badge */}
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-teal-500 px-3 py-1.5 text-sm font-semibold text-white">
                  <CheckCircle2 className="h-4 w-4" />
                  FRESH CATCH
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.length > 0 ? (
                  product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        index === selectedImageIndex
                          ? "border-teal-500"
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
                  ))
                ) : (
                  // Placeholder thumbnails
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-gray-100 ${
                          i === 1 ? "border-teal-500" : "border-transparent"
                        }`}
                      >
                        <div className="flex h-full w-full items-center justify-center">
                          <Fish className="h-8 w-8 text-gray-300" />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Badges & SKU */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                    <CheckCircle2 className="h-3 w-3" />
                    DIRECT FROM PRODUCER
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  SKU: {product.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(price)}
                </span>
                <span className="text-lg text-gray-500">
                  / {product.stockUnit}
                </span>
              </div>

              {/* MSME Bulk Pricing */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                    <span className="font-semibold text-gray-900">
                      MSME Bulk Pricing
                    </span>
                  </div>
                  <button
                    onClick={() => setShowBulkPricing(!showBulkPricing)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      showBulkPricing ? "bg-teal-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        showBulkPricing ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                {showBulkPricing && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {bulkPricing.map((tier, index) => (
                      <button
                        key={index}
                        className={`rounded-lg border-2 p-3 text-center transition-colors ${
                          index === 0
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200 hover:border-teal-300"
                        }`}
                      >
                        <div className="text-xs text-gray-500">{tier.range}</div>
                        <div
                          className={`text-lg font-bold ${
                            index === 0 ? "text-teal-600" : "text-gray-900"
                          }`}
                        >
                          {formatPrice(tier.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Specs */}
              <div className="flex gap-4">
                <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4 text-center">
                  <Clock className="mx-auto h-5 w-5 text-teal-600" />
                  <div className="mt-2 text-xs uppercase text-gray-500">
                    Caught
                  </div>
                  <div className="font-semibold text-gray-900">6 hours ago</div>
                </div>
                <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4 text-center">
                  <Thermometer className="mx-auto h-5 w-5 text-blue-600" />
                  <div className="mt-2 text-xs uppercase text-gray-500">
                    Storage
                  </div>
                  <div className="font-semibold text-gray-900">0-2°C</div>
                </div>
                <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4 text-center">
                  <Scale className="mx-auto h-5 w-5 text-amber-600" />
                  <div className="mt-2 text-xs uppercase text-gray-500">
                    Weight
                  </div>
                  <div className="font-semibold text-gray-900">
                    {product.weightKg
                      ? `${Number(product.weightKg)}kg / ${product.stockUnit}`
                      : "2-4kg / fish"}
                  </div>
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4">
                <QuantitySelector
                  quantity={quantity}
                  onChange={setQuantity}
                  min={minQty}
                  max={maxQty}
                  step={step}
                  unit={product.stockUnit}
                  size="lg"
                />
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0B3D4C] px-6 py-4 font-semibold text-white transition-colors hover:bg-[#0D4A5A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
                <button className="flex h-14 w-14 items-center justify-center rounded-lg bg-pink-100 text-pink-500 transition-colors hover:bg-pink-200">
                  <Heart className="h-6 w-6" />
                </button>
              </div>

              {/* Sustainability & Traceability */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Sustainability & Traceability
                  </h3>
                </div>

                <div className="relative ml-4 space-y-6 border-l-2 border-teal-200 pl-6">
                  {/* Origin */}
                  <div className="relative">
                    <div className="absolute -left-8 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                      <MapPin className="h-2.5 w-2.5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      Lofoten Islands, Norway
                    </h4>
                    <p className="text-sm text-gray-500">
                      Caught using low-impact gillnets at 04:30 AM
                    </p>
                  </div>

                  {/* Cold Chain */}
                  <div className="relative">
                    <div className="absolute -left-8 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                      <Truck className="h-2.5 w-2.5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      Cold-Chain Transit
                    </h4>
                    <p className="text-sm text-gray-500">
                      Monitored temperature (1.2°C) via IoT sensors
                    </p>
                  </div>

                  {/* Fulfillment */}
                  <div className="relative">
                    <div className="absolute -left-8 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500">
                      <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      SeaMarket Fulfillment Hub
                    </h4>
                    <p className="text-sm text-gray-500">
                      Quality inspection and vacuum packaging complete
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Producer & Cooking Section */}
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {/* Producer Information */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                  <Fish className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Producer Information
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <Anchor className="h-7 w-7 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Nordic Oceans Ltd.
                  </h4>
                  <p className="text-sm text-gray-500">
                    Certified Sustainable Producer
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                A family-run fishery based in Northern Norway specializing in
                premium Atlantic Salmon. ASC certified since 2018.
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-teal-500" />
                  <span className="text-gray-700">Official Partner Store</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-gray-700">4.9/5 Producer Rating</span>
                </div>
              </div>

              <button className="mt-6 w-full rounded-lg border-2 border-gray-200 py-3 font-semibold text-gray-700 transition-colors hover:border-teal-500 hover:text-teal-600">
                View Producer Profile
              </button>
            </div>

            {/* Cooking Suggestions */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <ChefHat className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Cooking Suggestions
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Utensils className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Miso-Glazed Salmon
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Pan-seared for 4 minutes each side.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        15 min
                      </span>
                      <span className="rounded bg-teal-100 px-2 py-0.5 text-xs text-teal-700">
                        Easy
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Utensils className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Lemon Herb Roasted
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Slow-roasted with fresh dill and lemon.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        25 min
                      </span>
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        Intermediate
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filleting CTA */}
              <div className="mt-6 rounded-xl bg-[#0B3D4C] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      Need it filleted?
                    </h4>
                    <p className="mt-2 text-sm text-gray-300">
                      Our on-site master butchers can process your whole salmon
                      to your specifications at no extra cost.
                    </p>
                    <button className="mt-4 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600">
                      Add Preparation Instructions
                    </button>
                  </div>
                  <div className="hidden sm:block">
                    <Utensils className="h-16 w-16 text-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 bg-[#0B3D4C] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-xl font-bold text-white"
                >
                  <Anchor className="h-6 w-6" />
                  SEAMARKET
                </Link>
                <p className="mt-4 text-sm text-gray-400">
                  Connecting sustainable local producers with businesses and
                  consumers through transparent digital commerce.
                </p>
              </div>

              {/* Marketplace Links */}
              <div>
                <h3 className="font-semibold text-white">Marketplace</h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <Link
                      href="/products"
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      Consumer Store
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/msmes"
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      MSME Bulk Deals
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products?fresh=true"
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      Fresh Arrivals
                    </Link>
                  </li>
                </ul>
              </div>

              {/* For Partners */}
              <div>
                <h3 className="font-semibold text-white">For Partners</h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <Link
                      href="/become-producer"
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      Become a Producer
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/wholesale"
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      Wholesale Program
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/logistics"
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      Logistics Partners
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-semibold text-white">Contact</h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    support@seamarket.com
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    +1 (800) SEA-FRESH
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-12 border-t border-gray-700 pt-8 text-center">
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} SeaMarket Marketplace. All
                rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="h-5 w-64 animate-pulse rounded bg-gray-100" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-square animate-pulse rounded-2xl bg-gray-200" />
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-20 w-20 animate-pulse rounded-lg bg-gray-200"
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-gray-200" />
            <div className="flex gap-4">
              <div className="h-24 flex-1 animate-pulse rounded-xl bg-gray-200" />
              <div className="h-24 flex-1 animate-pulse rounded-xl bg-gray-200" />
              <div className="h-24 flex-1 animate-pulse rounded-xl bg-gray-200" />
            </div>
            <div className="flex gap-4">
              <div className="h-14 w-32 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-14 flex-1 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-14 w-14 animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div className="h-48 w-full animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
