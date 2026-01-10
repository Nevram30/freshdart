import Link from "next/link";
import {
  ArrowRight,
  Anchor,
  Snowflake,
  DollarSign,
  MapPin,
  Gavel,
  Truck,
  CreditCard,
  CheckCircle2,
  BadgeCheck,
  Ship,
} from "lucide-react";

export default function ProducersPage() {
  const features = [
    {
      icon: Snowflake,
      title: "Direct Market Access",
      description:
        "Skip the middlemen and connect directly with MSMEs and large scale consumers worldwide.",
      color: "bg-teal-50 text-teal-600",
    },
    {
      icon: MapPin,
      title: "Real-time Logistics Tracking",
      description:
        "Full visibility of your catch through the entire cold chain, from landing to final delivery.",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: DollarSign,
      title: "Fair Pricing & Fast Payments",
      description:
        "Transparent auctioning and automated digital payments ensure you get paid on time, every time.",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const processSteps = [
    {
      icon: Ship,
      title: "List Your Catch",
      description:
        "Log your harvest on our platform while still at sea or at landing.",
    },
    {
      icon: Gavel,
      title: "Instant Bidding",
      description:
        "Verified MSMEs and retailers bid for your harvest at fair market rates.",
    },
    {
      icon: Truck,
      title: "Cold-Chain Pickup",
      description:
        "Our logistics partners handle the refrigerated pickup and processing.",
    },
    {
      icon: CreditCard,
      title: "Rapid Settlement",
      description:
        "Receive payment directly to your account upon delivery confirmation.",
    },
  ];

  const testimonials = [
    {
      quote:
        "Since joining SeaMarket, our revenue has increased by 40%. We no longer worry about finding buyers or middleman fees. The logistics tracking gives our customers peace of mind.",
      author: "Carlos Rodriguez",
      role: "Deep Sea Captain, 15 years experience",
      avatar: "/images/avatar-carlos.jpg",
    },
    {
      quote:
        "The automated payments are a game changer. We get paid within 48 hours of delivery, which helps our cooperative manage cash flow better than ever before.",
      author: "Anita Santoso",
      role: "Aquaculture Cooperative Lead",
      avatar: "/images/avatar-anita.jpg",
    },
  ];

  const footerLinks = {
    forProducers: [
      { label: "Getting Started", href: "/producers/getting-started" },
      { label: "Pricing & Fees", href: "/producers/pricing" },
      { label: "Logistics Partners", href: "/producers/logistics" },
      { label: "Quality Standards", href: "/producers/quality" },
    ],
    marketplace: [
      { label: "MSME Portal", href: "/msmes" },
      { label: "Retail Store", href: "/products" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Traceability", href: "/traceability" },
    ],
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B3D4C]/95 via-[#0D4A5A]/90 to-[#0B3D4C]/95">
          <div className="absolute inset-0 bg-[url('/images/fish-hero.jpg')] bg-cover bg-center mix-blend-overlay opacity-60" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            {/* Tag */}
            <span className="inline-block rounded-full bg-teal-500/20 px-4 py-1.5 text-sm font-medium text-teal-300">
              For Fisheries & Aquaculture
            </span>

            {/* Headline */}
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Empower Your Harvest with{" "}
              <span className="text-teal-400">Technology</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Join the digital revolution in seafood production. Connect
              directly with global buyers, track your logistics in real-time,
              and get paid faster.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/producers/register"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-600"
              >
                Become a Partner
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/producers/demo"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg"
              >
                <div
                  className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.color}`}
                >
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* From Boat to Buyer Process Section */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              From Boat to Buyer
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Our streamlined process ensures your harvest reaches the market at
              peak freshness with maximum profitability.
            </p>
          </div>

          {/* Process Steps */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step) => (
              <div key={step.title} className="text-center">
                {/* Icon Circle */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0B3D4C] text-white">
                  <step.icon className="h-7 w-7" />
                </div>
                {/* Title */}
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                {/* Description */}
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials & Verified Producer Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left - Testimonials */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Trusted by 500+ Local Producers
              </h2>

              <div className="mt-10 space-y-8">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="rounded-xl border-l-4 border-teal-500 bg-gray-50 p-6"
                  >
                    <p className="text-gray-700 italic leading-relaxed">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                        <span className="text-sm font-semibold">
                          {testimonial.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-gray-500">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Verified Producer Card */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#0B3D4C] to-[#0D4A5A] p-8 text-center text-white">
                {/* Check Icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-500">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  Become a Verified Producer
                </h3>
                <p className="mt-3 text-gray-300">
                  Unlock premium benefits including priority bidding, lower
                  platform fees, and the SeaMarket Quality Badge.
                </p>

                {/* Stats */}
                <div className="mt-8 flex justify-center gap-6">
                  <div className="rounded-xl bg-white/10 px-6 py-4 backdrop-blur-sm">
                    <p className="text-3xl font-bold text-teal-400">98%</p>
                    <p className="mt-1 text-sm text-gray-300">Satisfaction</p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-6 py-4 backdrop-blur-sm">
                    <p className="text-3xl font-bold text-teal-400">2.4k+</p>
                    <p className="mt-1 text-sm text-gray-300">Tons Traded</p>
                  </div>
                </div>

                {/* Certification Badge */}
                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-300">
                  <BadgeCheck className="h-5 w-5 text-teal-400" />
                  <span>Certified Sustainable Seafood Partner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#0B3D4C] via-[#0D4A5A] to-[#0B3D4C] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Scale Your Production?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Join the most advanced seafood marketplace today. Registration is
            free and takes less than 5 minutes.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/producers/register"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-8 py-4 font-semibold text-white transition-colors hover:bg-teal-600"
            >
              Register Your Fleet
            </Link>
            <Link
              href="/producers/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-transparent px-8 py-4 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Talk to an Expert
            </Link>
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
                Revolutionizing the seafood industry by connecting sustainable
                producers directly with the world.
              </p>
            </div>

            {/* For Producers */}
            <div>
              <h3 className="font-semibold text-white">For Producers</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.forProducers.map((link) => (
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

            {/* Marketplace */}
            <div>
              <h3 className="font-semibold text-white">Marketplace</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.marketplace.map((link) => (
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

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-white">Contact</h3>
              <p className="mt-4 text-sm text-gray-400">
                Support available 24/7 for our producer partners.
              </p>
              <Link
                href="/producers/support"
                className="mt-4 inline-block rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
              >
                Contact Partner Support
              </Link>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
