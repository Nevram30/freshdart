import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Fish,
  Snowflake,
  Building2,
  Truck,
  CheckCircle2,
  Users,
  ShieldCheck,
  Network,
  Heart,
  ShoppingCart,
  Anchor,
} from "lucide-react";
import { HydrateClient, api } from "~/trpc/server";
import { ProductGrid } from "~/components/products/product-grid";
import { Header } from "~/components/layout/header";
import { CartDrawer } from "~/components/cart/cart-drawer";
import type { Product } from "~/types";

export default async function Home() {
  // Fetch featured products on the server
  const featuredProducts = await api.product.getFeatured({ limit: 4 });

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

  const categories = [
    {
      icon: Fish,
      title: "Fresh Catch",
      description: "Direct from boats",
      href: "/products?category=fresh-catch",
      color: "bg-teal-50 text-teal-600",
    },
    {
      icon: Snowflake,
      title: "Processed",
      description: "Frozen & Dried",
      href: "/products?category=processed",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: Building2,
      title: "Bulk MSME",
      description: "Wholesale pricing",
      href: "/merchants",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Truck,
      title: "Logistics",
      description: "Cold chain tracking",
      href: "/logistics",
      color: "bg-cyan-50 text-cyan-600",
    },
  ];

  return (
    <HydrateClient>
      <Header />
      <CartDrawer />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0B3D4C] via-[#0D4A5A] to-[#0B3D4C]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="text-white">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Freshness First,
                  <span className="block text-teal-300">
                    From Ocean to Table.
                  </span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                  Connecting sustainable local producers with businesses and
                  consumers. Quality guaranteed through transparent cold-chain
                  logistics.
                </p>

                {/* Search Bar */}
                <div className="mt-8 flex max-w-lg">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for fresh catch, MSME deals..."
                      className="w-full rounded-l-lg border-0 bg-white py-4 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <button className="rounded-r-lg bg-teal-500 px-6 font-semibold text-white transition-colors hover:bg-teal-600">
                    Find Freshness
                  </button>
                </div>

                {/* Badges */}
                <div className="mt-6 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-teal-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verified Producers</span>
                  </div>
                  <div className="flex items-center gap-2 text-teal-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Same-day Delivery</span>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1510130387422-82bed34b37e9?q=80&w=1200"
                    alt="Fresh fish on ice"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B3D4C]/90 to-transparent p-6">
                    <p className="text-center text-sm text-gray-300">
                      &quot;Supporting local fishing communities since 2024.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Cards */}
        <section className="bg-white py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.title}
                  href={category.href}
                  className="group flex flex-col items-center rounded-xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-lg hover:border-teal-200"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${category.color}`}
                  >
                    <category.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">
                    {category.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {category.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Available Today - Featured Products */}
        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
                  Top Marketplace Picks
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Available Today
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 sm:flex"
              >
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {products.length > 0 ? (
              <ProductGrid products={products} columns={4} />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
                {/* Sample Product Cards */}
                {[
                  {
                    name: "Atlantic Salmon",
                    slug: "atlantic-salmon",
                    description: "Direct from Norway cold waters, delivered within 24 hours.",
                    price: "$24.00",
                    unit: "/kg",
                    badge: "FRESH CATCH",
                    badgeColor: "bg-teal-500",
                  },
                  {
                    name: "Tiger Prawns XL",
                    slug: "tiger-prawns-xl",
                    description: "Premium grade prawns for restaurants and MSMEs.",
                    price: "$32.50",
                    unit: "/box",
                    badge: "LIMITED STOCK",
                    badgeColor: "bg-amber-500",
                  },
                  {
                    name: "Wild Seabass",
                    slug: "wild-seabass",
                    description: "Sustainably line-caught. Perfect for gourmet grilling.",
                    price: "$18.90",
                    unit: "/pc",
                    badge: "FRESH CATCH",
                    badgeColor: "bg-teal-500",
                  },
                  {
                    name: "Lobster Tails",
                    slug: "lobster-tails",
                    description: "Frozen at sea to lock in premium quality and sweetness.",
                    price: "$45.00",
                    unit: "/pack",
                    badge: "PROCESSING",
                    badgeColor: "bg-blue-500",
                  },
                ].map((product, index) => (
                  <Link
                    key={index}
                    href={`/products/${product.slug}`}
                    className="group overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-lg cursor-pointer"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Fish className="h-16 w-16 text-gray-300 transition-transform group-hover:scale-110" />
                      </div>
                      <span
                        className={`absolute left-3 top-3 rounded px-2 py-1 text-xs font-semibold text-white ${product.badgeColor}`}
                      >
                        {product.badge}
                      </span>
                      <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 transition-colors hover:bg-white hover:text-red-500">
                        <Heart className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-teal-600">
                            {product.price}
                          </span>
                          <span className="text-sm text-gray-500">
                            {product.unit}
                          </span>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B3D4C] text-white transition-colors group-hover:bg-[#0D4A5A]">
                          <ShoppingCart className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600"
              >
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* B2B Solutions Section */}
        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left Side - Feature Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <Users className="h-8 w-8 text-teal-600" />
                  <h3 className="mt-4 font-semibold text-gray-900">Producers</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Direct channel to reach thousands of customers without
                    middlemen.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <ShieldCheck className="h-8 w-8 text-teal-600" />
                  <h3 className="mt-4 font-semibold text-gray-900">
                    Quality Check
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Rigorous inspection at every point of the supply chain.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <Building2 className="h-8 w-8 text-amber-500" />
                  <h3 className="mt-4 font-semibold text-gray-900">MSMEs</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Access wholesale prices and recurring supply schedules.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <Network className="h-8 w-8 text-blue-600" />
                  <h3 className="mt-4 font-semibold text-gray-900">
                    Full Network
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    End-to-end connectivity between ocean and table.
                  </p>
                </div>
              </div>

              {/* Right Side - Content */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
                  B2B Solutions
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Empowering Local Fishing Ecosystems
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  We don&apos;t just sell seafood; we build the infrastructure
                  for sustainable trade. Our platform provides the digital tools
                  needed for local producers to compete globally.
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    <span className="text-gray-700">
                      Direct-from-source wholesale rates
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    <span className="text-gray-700">
                      Integrated cold-chain logistics management
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    <span className="text-gray-700">
                      Traceability and sustainability certifications
                    </span>
                  </li>
                </ul>
                <Link
                  href="/register-business"
                  className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#0B3D4C] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0D4A5A]"
                >
                  Register as Business
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#0B3D4C] py-12 sm:py-16">
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
                  Leading the transition to digital seafood marketplaces. Our
                  mission is to ensure every fish on your plate is fresh,
                  sustainable, and ethically sourced.
                </p>
                <div className="mt-6 flex gap-4">
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  </button>
                </div>
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
                      href="/merchants"
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
                  <li>
                    <Link
                      href="/sustainable"
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      Sustainable Sources
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
                      href="/logistics-partnership"
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      Logistics Partnership
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
                      href="/quality-standards"
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      Quality Standards
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h3 className="font-semibold text-white">Newsletter</h3>
                <p className="mt-4 text-sm text-gray-400">
                  Get notified about the latest catch and exclusive bulk deals.
                </p>
                <div className="mt-4">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full rounded-lg border border-gray-600 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button className="mt-3 w-full rounded-lg bg-teal-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600">
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-700 pt-8 sm:flex-row">
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} SeaMarket Marketplace. All
                rights reserved.
              </p>
              <div className="flex gap-6">
                <Link
                  href="/privacy"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookies"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Cookie Settings
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </HydrateClient>
  );
}
