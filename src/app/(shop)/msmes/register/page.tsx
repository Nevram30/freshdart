"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  ChevronDown,
  CircleDollarSign,
  Users,
  FileText,
  CheckCircle2,
  User,
} from "lucide-react";

const steps = [
  { id: 1, name: "BUSINESS INFO", icon: Building2 },
  { id: 2, name: "VERIFICATION", icon: ShieldCheck },
  { id: 3, name: "ACCOUNT SETUP", icon: User },
];

const businessTypes = [
  "Restaurant",
  "Hotel",
  "Resort",
  "Catering Service",
  "Food Retailer",
  "Supermarket",
  "Seafood Distributor",
  "Food Processing",
  "Other",
];

const benefits = [
  {
    icon: CircleDollarSign,
    title: "Wholesale Pricing",
    description:
      "Access volume discounts and tiered pricing exclusive to registered MSMEs.",
  },
  {
    icon: Users,
    title: "Direct Producer Access",
    description:
      "Cut out middleman costs and buy directly from verified coastal producers.",
  },
  {
    icon: FileText,
    title: "Digital Paperwork",
    description:
      "Automated tax-ready invoicing and transparent procurement history.",
  },
];

export default function MSMERegisterPage() {
  const [currentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    taxId: "",
    businessAddress: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusinessTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, businessType: type }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission - navigate to verification step
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600">
              PARTNER PORTAL
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Need help?</span>
            <Link
              href="/msmes/contact"
              className="font-semibold text-[#0B3D4C] hover:underline"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-10 flex items-center justify-center">
          <div className="flex items-center gap-0">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      step.id === currentStep
                        ? "bg-[#0B3D4C] text-white"
                        : step.id < currentStep
                          ? "bg-teal-500 text-white"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      step.id === currentStep
                        ? "text-[#0B3D4C]"
                        : "text-gray-400"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 mb-6 h-0.5 w-24 ${
                      step.id < currentStep ? "bg-teal-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
          {/* Form Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              Business Information
            </h1>
            <p className="mt-2 text-gray-600">
              Tell us more about your establishment to help us tailor your
              experience.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Legal Business Name */}
              <div>
                <label
                  htmlFor="businessName"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Legal Business Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="e.g. Ocean Blue Bistro"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Business Type & Tax ID Row */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Business Type Dropdown */}
                <div>
                  <label
                    htmlFor="businessType"
                    className="mb-2 block text-sm font-medium text-gray-900"
                  >
                    Business Type
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    >
                      <span
                        className={
                          formData.businessType
                            ? "text-gray-900"
                            : "text-gray-400"
                        }
                      >
                        {formData.businessType || "Select Type"}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        {businessTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleBusinessTypeSelect(type)}
                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tax ID */}
                <div>
                  <label
                    htmlFor="taxId"
                    className="mb-2 block text-sm font-medium text-gray-900"
                  >
                    Tax ID / Registration Number
                  </label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="e.g. 12-3456789"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              {/* Business Address */}
              <div>
                <label
                  htmlFor="businessAddress"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Business Address
                </label>
                <textarea
                  id="businessAddress"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  placeholder="Street, City, Province, Postal Code"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0B3D4C] px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[#0D4A5A]"
              >
                Continue to Verification
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Why Register Card */}
            <div className="rounded-2xl bg-[#0B3D4C] p-6 text-white">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20">
                  <CheckCircle2 className="h-4 w-4 text-teal-400" />
                </div>
                <h2 className="text-lg font-semibold">Why Register?</h2>
              </div>

              <div className="space-y-6">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-500/20">
                      <benefit.icon className="h-5 w-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-gray-300">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="flex items-center gap-2 text-sm text-teal-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Trust & Transparency Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Testimonial Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <p className="italic text-gray-600">
                &ldquo;Joining SeaMarket helped us reduce our seafood sourcing
                costs by 18% in the first quarter.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                  <User className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Marina Grand Hotel
                  </p>
                  <p className="text-xs text-gray-500">Procurement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SeaMarket MSME Solutions. Trust &
            Transparency in Seafood Sourcing.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms/b2b"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Platform Terms
            </Link>
            <Link
              href="/compliance"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Compliance Standards
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
