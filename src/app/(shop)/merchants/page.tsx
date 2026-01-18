import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Anchor,
  DollarSign,
  CalendarCheck,
  FileText,
  CheckCircle2,
  Snowflake,
  ShieldCheck,
  Phone,
  Share2,
  Linkedin,
} from "lucide-react";

export default function MSMEsPage() {
  const features = [
    {
      icon: DollarSign,
      title: "Wholesale Pricing",
      description:
        "Unlock exclusive B2B rates directly from producers. No middleman markup, just pure profit for your business.",
      color: "bg-teal-50 text-teal-600",
    },
    {
      icon: CalendarCheck,
      title: "Recurring Deliveries",
      description:
        "Set and forget with subscription sourcing. Customized delivery schedules that fit your kitchen's workflow.",
      color: "bg-gray-50 text-gray-600",
    },
    {
      icon: FileText,
      title: "Digital Invoicing",
      description:
        "Tax-ready paperwork automated for every order. Simplified accounting and transparent procurement tracking.",
      color: "bg-gray-50 text-gray-600",
    },
  ];

  const bulkCategories = [
    {
      title: "Bulk Fillets",
      subtitle: "Case sizes: 10kg - 50kg",
      image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?q=80&w=1200",
      features: ["Skin-on & Skinless options", "Precision vacuum sealed"],
      href: "/products?category=fillets",
      buttonText: "Browse Fillets",
    },
    {
      title: "Shellfish Crates",
      subtitle: "Daily harvest, crates available",
      image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=1200",
      features: ["Live & fresh options", "Direct boat delivery"],
      href: "/products?category=shellfish",
      buttonText: "Browse Shellfish",
    },
    {
      title: "Frozen Batches",
      subtitle: "IQF Grade A Inventory",
      image: "https://images.unsplash.com/photo-1498654200943-1088dd4438ae?q=80&w=1200",
      features: ["Flash-frozen at source", "Long-term storage ready"],
      href: "/products?category=frozen",
      buttonText: "Browse Frozen",
    },
  ];

  const footerLinks = {
    forPartners: [
      { label: "Wholesale Program", href: "/merchants/wholesale" },
      { label: "Recurring Deliveries", href: "/merchants/recurring" },
      { label: "Digital Invoicing Help", href: "/merchants/invoicing" },
      { label: "Quality Standards", href: "/merchants/quality" },
    ],
    categories: [
      { label: "Bulk Fillets", href: "/products?category=fillets" },
      { label: "Shellfish Crates", href: "/products?category=shellfish" },
      { label: "Frozen Batches", href: "/products?category=frozen" },
      { label: "Value Added Items", href: "/products?category=value-added" },
    ],
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B3D4C]/90 via-[#0D4A5A]/85 to-[#0B3D4C]/90" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-10">
          <div className="max-w-2xl">
            {/* Tag */}
            <span className="inline-block rounded-full bg-teal-500/20 px-4 py-1.5 text-sm font-medium text-teal-300">
              For Restaurants, Hotels & Retail
            </span>

            {/* Headline */}
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Scale Your Business with{" "}
              <span className="block italic text-teal-400">
                Premium Seafood Sourcing
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg leading-8 text-gray-300">
              The leading B2B marketplace connecting your business directly to
              verified sustainable producers. Streamline your procurement with
              wholesale pricing and guaranteed cold-chain logistics.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/merchants/register"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-600"
              >
                Register as MSME
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Explore Bulk Catalog
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-teal-300">
                <ShieldCheck className="h-5 w-5" />
                <span>Verified Supply Chain</span>
              </div>
              <div className="flex items-center gap-2 text-teal-300">
                <Snowflake className="h-5 w-5" />
                <span>Cold-Chain Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`rounded-2xl p-8 transition-all ${
                  index === 0
                    ? "bg-[#0B3D4C] text-white"
                    : "border border-gray-100 bg-white shadow-sm hover:shadow-lg"
                }`}
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${
                    index === 0
                      ? "bg-teal-500/20 text-teal-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3
                  className={`mt-6 text-xl font-semibold ${
                    index === 0 ? "text-white" : "text-gray-900"
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`mt-3 leading-relaxed ${
                    index === 0 ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bulk Sourcing Section */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
              Bulk Sourcing
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Stock Your Business in Bulk
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Access the world&apos;s finest seafood curated specifically for
              professional volumes and storage capacities.
            </p>
          </div>

          {/* Product Categories */}
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {bulkCategories.map((category) => (
              <div
                key={category.title}
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative aspect-[4/3]">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover"
                  />
                  {/* Overlay with title */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h3 className="text-xl font-bold text-white">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-300">{category.subtitle}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="p-6">
                  <ul className="space-y-2">
                    {category.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <CheckCircle2 className="h-4 w-4 text-teal-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <Link
                    href={category.href}
                    className="mt-6 block w-full rounded-lg border border-gray-200 py-3 text-center font-semibold text-gray-700 transition-colors hover:border-teal-500 hover:text-teal-600"
                  >
                    {category.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Procurement CTA Section */}
      <section className="bg-[#0B3D4C] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#0D4A5A]/50 p-8 sm:p-12">
            <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
              {/* Left Content */}
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Need a Custom Procurement Plan?
                </h2>
                <p className="mt-4 text-gray-300">
                  Our dedicated procurement experts work with hotels, hospital
                  chains, and large restaurant groups to design optimized supply
                  chains that reduce waste and cost.
                </p>
              </div>

              {/* Right CTA */}
              <div className="text-center lg:text-right">
                <Link
                  href="/merchants/contact"
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-8 py-4 font-semibold text-white transition-colors hover:bg-teal-600"
                >
                  <Phone className="h-5 w-5" />
                  Speak to a Procurement Expert
                </Link>
                <p className="mt-3 text-sm text-gray-400">
                  Available Mon-Fri, 8AM - 6PM
                </p>
              </div>
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
                Professional seafood marketplace for the MSME ecosystem.
                Empowering local businesses through digital transformation and
                sustainable sourcing.
              </p>
              {/* Social Icons */}
              <div className="mt-6 flex gap-3">
                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20">
                  <Linkedin className="h-5 w-5" />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* For Partners */}
            <div>
              <h3 className="font-semibold text-white">For Partners</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.forPartners.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-white">Categories</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.categories.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* B2B Newsletter */}
            <div>
              <h3 className="font-semibold text-white">B2B Newsletter</h3>
              <p className="mt-4 text-sm text-gray-400">
                Market reports and seasonal price updates.
              </p>
              <div className="mt-4">
                <input
                  type="email"
                  placeholder="Business email"
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
              &copy; {new Date().getFullYear()} SeaMarket MSME Solutions. All
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
                href="/terms/b2b"
                className="text-sm text-gray-400 transition-colors hover:text-white"
              >
                Terms of B2B Trade
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
    </div>
  );
}
