import Link from "next/link";
import { ArrowRight, Leaf, Truck, Shield, Clock } from "lucide-react";
import { HydrateClient, api } from "~/trpc/server";
import { ProductGrid } from "~/components/products/product-grid";
import { Header } from "~/components/layout/header";
import { CartDrawer } from "~/components/cart/cart-drawer";
import type { Product } from "~/types";

export default async function Home() {
  // Fetch featured products on the server
  const featuredProducts = await api.product.getFeatured({ limit: 8 });

  // Transform products
  const products: Product[] = featuredProducts.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    stockQuantity: Number(p.stockQuantity),
    minOrderQty: Number(p.minOrderQty),
    maxOrderQty: p.maxOrderQty ? Number(p.maxOrderQty) : null,
    weightKg: Number(p.weightKg),
  }));

  return (
    <HydrateClient>
      <Header />
      <CartDrawer />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                <Leaf className="h-4 w-4" />
                Farm Fresh, Delivered Daily
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Fresh & Quality Food
                <span className="block text-green-600">At Your Doorstep</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Discover premium fresh produce and quality processed foods.
                From farm to table, we ensure every item meets our strict
                quality standards.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-green-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-700 hover:shadow-xl hover:shadow-green-500/40"
                >
                  Shop Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/products?category=fresh-produce"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:border-green-500 hover:text-green-600"
                >
                  Fresh Produce
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-y border-gray-100 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">100% Fresh</h3>
                  <p className="text-sm text-gray-500">
                    Farm-fresh quality guaranteed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Fast Delivery</h3>
                  <p className="text-sm text-gray-500">Same day & next day</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Quality Assured
                  </h3>
                  <p className="text-sm text-gray-500">Strict quality checks</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Freshness Tracking
                  </h3>
                  <p className="text-sm text-gray-500">
                    Know your food&apos;s freshness
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="bg-gray-50/50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                  Featured Products
                </h2>
                <p className="mt-2 text-gray-500">
                  Hand-picked fresh items just for you
                </p>
              </div>
              <Link
                href="/products?featured=true"
                className="hidden items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 sm:flex"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {products.length > 0 ? (
              <ProductGrid products={products} columns={4} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 text-6xl">🌱</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Coming Soon
                </h3>
                <p className="text-gray-500">
                  We&apos;re preparing fresh products for you. Check back soon!
                </p>
              </div>
            )}

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/products?featured=true"
                className="inline-flex items-center gap-1 text-sm font-semibold text-green-600"
              >
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Shop by Category
              </h2>
              <p className="mt-2 text-gray-500">
                Browse our wide selection of products
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/products?category=fresh-produce"
                className="group relative overflow-hidden rounded-2xl bg-green-50 p-8 transition-all hover:shadow-xl"
              >
                <div className="relative z-10">
                  <span className="text-5xl">🥬</span>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">
                    Fresh Produce
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Vegetables, fruits, and leafy greens
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:gap-2">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>

              <Link
                href="/products?category=meat-seafood"
                className="group relative overflow-hidden rounded-2xl bg-red-50 p-8 transition-all hover:shadow-xl"
              >
                <div className="relative z-10">
                  <span className="text-5xl">🥩</span>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">
                    Meat & Seafood
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Premium cuts and fresh catches
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-red-600 group-hover:gap-2">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>

              <Link
                href="/products?category=dairy-eggs"
                className="group relative overflow-hidden rounded-2xl bg-yellow-50 p-8 transition-all hover:shadow-xl"
              >
                <div className="relative z-10">
                  <span className="text-5xl">🥛</span>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">
                    Dairy & Eggs
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Milk, cheese, and farm eggs
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-yellow-600 group-hover:gap-2">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>

              <Link
                href="/products?category=pantry"
                className="group relative overflow-hidden rounded-2xl bg-amber-50 p-8 transition-all hover:shadow-xl"
              >
                <div className="relative z-10">
                  <span className="text-5xl">🫙</span>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">
                    Pantry Essentials
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Canned goods, sauces, and spices
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-600 group-hover:gap-2">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>

              <Link
                href="/products?category=beverages"
                className="group relative overflow-hidden rounded-2xl bg-blue-50 p-8 transition-all hover:shadow-xl"
              >
                <div className="relative z-10">
                  <span className="text-5xl">🧃</span>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">
                    Beverages
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Juices, water, and soft drinks
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>

              <Link
                href="/products?category=frozen"
                className="group relative overflow-hidden rounded-2xl bg-cyan-50 p-8 transition-all hover:shadow-xl"
              >
                <div className="relative z-10">
                  <span className="text-5xl">🧊</span>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">
                    Frozen Foods
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Ice cream, frozen meals & more
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-600 group-hover:gap-2">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-green-600 py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to eat fresh?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-green-100">
              Join thousands of happy customers who trust FreshDart for their
              daily groceries.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-green-600 shadow-lg transition-all hover:bg-gray-50"
            >
              Start Shopping
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 text-white">
                  <Leaf className="h-5 w-5" />
                </div>
                FreshDart
              </div>
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} FreshDart. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </HydrateClient>
  );
}
