"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Fish,
  FileCheck,
  Landmark,
  MapPin,
  CircleDollarSign,
  Globe,
  BarChart3,
  CheckCircle2,
  Shield,
  Lock,
  User,
} from "lucide-react";

const steps = [
  { id: 1, name: "FISHERY DETAILS", icon: Fish },
  { id: 2, name: "LICENSING & CERTS", icon: FileCheck },
  { id: 3, name: "BANKING SETUP", icon: Landmark },
];

const productionTypes = [
  "Wild Catch - Deep Sea",
  "Wild Catch - Coastal",
  "Aquaculture - Fish Farm",
  "Aquaculture - Shellfish",
  "Aquaculture - Seaweed",
  "Mixed Operations",
];

const speciesOptions = [
  { id: "tuna", label: "Tuna" },
  { id: "shrimp", label: "Shrimp" },
  { id: "salmon", label: "Salmon" },
  { id: "mackerel", label: "Mackerel" },
  { id: "crab", label: "Crab" },
];

const benefits = [
  {
    icon: CircleDollarSign,
    title: "Guaranteed Fast Payments",
    description: "Receive settlements within 48 hours of delivery confirmation.",
  },
  {
    icon: Globe,
    title: "Wider Market Reach",
    description: "Connect directly with over 5,000+ MSMEs and retail partners.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Access market trends and pricing insights to optimize your harvest.",
  },
];

export default function ProducerRegisterPage() {
  const [currentStep] = useState(1);
  const [formData, setFormData] = useState({
    vesselName: "",
    productionType: "",
    operationalBase: "",
    primarySpecies: [] as string[],
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductionTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, productionType: type }));
    setIsDropdownOpen(false);
  };

  const handleSpeciesToggle = (speciesId: string) => {
    setFormData((prev) => ({
      ...prev,
      primarySpecies: prev.primarySpecies.includes(speciesId)
        ? prev.primarySpecies.filter((s) => s !== speciesId)
        : [...prev.primarySpecies, speciesId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission - navigate to licensing step
    console.log("Form submitted:", formData);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header>
        <div className="mx-auto flex max-w-7xl items-center justify-end px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Need help?</span>
              <Link
                href="/producers/contact"
                className="font-semibold text-[#0B3D4C] hover:underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-10 flex items-center justify-center">
          <div className="flex items-center gap-0">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold ${
                      step.id === currentStep
                        ? "bg-[#0B3D4C] text-white"
                        : step.id < currentStep
                          ? "bg-teal-500 text-white"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step.id}
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
              Fishery Information
            </h1>
            <p className="mt-2 text-gray-600">
              Please provide the basic details of your vessel or aquaculture
              facility to start the verification process.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Vessel or Farm Name */}
              <div>
                <label
                  htmlFor="vesselName"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Vessel or Farm Name
                </label>
                <input
                  type="text"
                  id="vesselName"
                  name="vesselName"
                  value={formData.vesselName}
                  onChange={handleInputChange}
                  placeholder="e.g. Northern Star Fisheries"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Production Type & Operational Base Row */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Production Type Dropdown */}
                <div>
                  <label
                    htmlFor="productionType"
                    className="mb-2 block text-sm font-medium text-gray-900"
                  >
                    Production Type
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    >
                      <span
                        className={
                          formData.productionType
                            ? "text-gray-900"
                            : "text-gray-400"
                        }
                      >
                        {formData.productionType || "Select production type"}
                      </span>
                      <svg
                        className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        {productionTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleProductionTypeSelect(type)}
                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Operational Base */}
                <div>
                  <label
                    htmlFor="operationalBase"
                    className="mb-2 block text-sm font-medium text-gray-900"
                  >
                    Operational Base (Port/City)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="operationalBase"
                      name="operationalBase"
                      value={formData.operationalBase}
                      onChange={handleInputChange}
                      placeholder="Search port or city"
                      className="w-full rounded-lg border border-gray-200 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Species */}
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-900">
                  Primary Species (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {speciesOptions.map((species) => (
                    <button
                      key={species.id}
                      type="button"
                      onClick={() => handleSpeciesToggle(species.id)}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                        formData.primarySpecies.includes(species.id)
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          formData.primarySpecies.includes(species.id)
                            ? "border-teal-500 bg-teal-500"
                            : "border-gray-300"
                        }`}
                      >
                        {formData.primarySpecies.includes(species.id) && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 12 12"
                          >
                            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                          </svg>
                        )}
                      </div>
                      {species.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-3 text-teal-600 hover:text-teal-700"
                  >
                    <span className="text-lg">+</span>
                    Add More
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B3D4C] px-6 py-4 font-semibold text-white transition-colors hover:bg-[#0D4A5A]"
              >
                Continue to Verification
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Step Indicator */}
              <p className="text-center text-sm text-gray-500">
                Step 1 of 3: Company Basics
              </p>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Why Join Card */}
            <div className="rounded-2xl bg-[#0B3D4C] p-6 text-white">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20">
                  <CheckCircle2 className="h-4 w-4 text-teal-400" />
                </div>
                <h2 className="text-lg font-semibold">Why Join?</h2>
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

              {/* Testimonial */}
              <div className="mt-6 border-t border-white/10 pt-6">
                <p className="text-sm italic text-gray-300">
                  &ldquo;SeaMarket has completely changed how we sell our tuna
                  catch.&rdquo;
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/30">
                    <User className="h-5 w-5 text-teal-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-teal-400">
                      — CARLOS, DEEP SEA FLEET
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust & Safety Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Trust & Safety
              </h3>
              <div className="mt-4 space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                    <Shield className="h-4 w-4 text-teal-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    All producers undergo a rigorous 3-step verification process
                    to ensure sustainability.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                    <Lock className="h-4 w-4 text-teal-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Your data is encrypted and handled with bank-grade security
                    protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SeaMarket Marketplace. Licensed
              by International Maritime Trade Organization.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Terms of Service
              </Link>
              <Link
                href="/help"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
