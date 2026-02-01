"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Anchor,
  User,
  Building2,
  Ship,
  Check,
  Leaf,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  UserCircle,
  FileText,
  Upload,
  Hash,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

type AccountType = "CUSTOMER" | "MERCHANT" | "PRODUCER";
type BusinessType = "MSME" | "FISHERY" | "AQUACULTURE" | "PROCESSOR";
type BusinessSize = "MICRO" | "SMALL" | "MEDIUM";
type DocumentType = "BUSINESS_PERMIT" | "FDA_LICENSE" | "BFAR_REGISTRATION" | "SANITARY_PERMIT";

interface DocumentUpload {
  document_type: DocumentType;
  document_number: string;
  expiry_date: string;
  file: File | null;
}

const accountTypes = [
  {
    id: "CUSTOMER" as AccountType,
    role: "CUSTOMER" as const,
    icon: User,
    title: "Customer",
    description: "For personal seafood buying",
  },
  {
    id: "MERCHANT" as AccountType,
    role: "MERCHANT" as const,
    icon: Building2,
    title: "MSME Merchant",
    description: "For restaurants and retail businesses",
  },
  {
    id: "PRODUCER" as AccountType,
    role: "PRODUCER" as const,
    icon: Ship,
    title: "Producer",
    description: "For fisheries and aquaculture",
  },
];

const businessTypes: { id: BusinessType; label: string }[] = [
  { id: "MSME", label: "MSME" },
  { id: "FISHERY", label: "Fishery" },
  { id: "AQUACULTURE", label: "Aquaculture" },
  { id: "PROCESSOR", label: "Processor" },
];

const businessSizes: { id: BusinessSize; label: string; description: string }[] = [
  { id: "MICRO", label: "Micro", description: "1-9 employees" },
  { id: "SMALL", label: "Small", description: "10-99 employees" },
  { id: "MEDIUM", label: "Medium", description: "100-199 employees" },
];

const documentTypes: { id: DocumentType; label: string; required: boolean }[] = [
  { id: "BUSINESS_PERMIT", label: "Business Permit", required: true },
  { id: "FDA_LICENSE", label: "FDA License", required: false },
  { id: "BFAR_REGISTRATION", label: "BFAR Registration", required: true },
  { id: "SANITARY_PERMIT", label: "Sanitary Permit", required: true },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);

  // Personal info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Business info (for Merchant/Producer)
  const [businessName, setBusinessName] = useState("");
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [businessSize, setBusinessSize] = useState<BusinessSize | null>(null);
  const [businessDescription, setBusinessDescription] = useState("");

  // Documents
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { document_type: "BUSINESS_PERMIT", document_number: "", expiry_date: "", file: null },
  ]);

  const [error, setError] = useState("");

  const registerMutation = api.auth.register.useMutation({
    onSuccess: async () => {
      // Move to welcome step
      setCurrentStep(getSteps().length);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Get steps based on account type
  const getSteps = () => {
    if (selectedType === "CUSTOMER") {
      return [
        { id: 1, name: "Account Type" },
        { id: 2, name: "Your Information" },
        { id: 3, name: "Welcome" },
      ];
    }
    return [
      { id: 1, name: "Account Type" },
      { id: 2, name: "Your Information" },
      { id: 3, name: "Business Info" },
      { id: 4, name: "Documents" },
      { id: 5, name: "Welcome" },
    ];
  };

  const steps = getSteps();
  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep === 1 && selectedType) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedType !== "CUSTOMER") {
      setCurrentStep(3);
    } else if (currentStep === 3 && selectedType !== "CUSTOMER") {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedType) return;

    const role = accountTypes.find((t) => t.id === selectedType)?.role;
    if (!role) return;

    // Build registration payload
    const payload: {
      name: string;
      email: string;
      password: string;
      role: typeof role;
      businessInfo?: {
        businessName: string;
        businessRegistrationNumber: string;
        businessType: BusinessType;
        businessSize: BusinessSize;
        description?: string;
      };
      documents?: {
        documentType: DocumentType;
        documentNumber: string;
        expiryDate: string;
        documentUrl?: string;
      }[];
    } = {
      name,
      email,
      password,
      role,
    };

    // Add business info for merchants/producers
    if ((selectedType === "MERCHANT" || selectedType === "PRODUCER") && businessType && businessSize) {
      payload.businessInfo = {
        businessName,
        businessRegistrationNumber,
        businessType,
        businessSize,
        description: businessDescription || undefined,
      };

      // Add documents
      if (documents.length > 0) {
        payload.documents = documents.map((doc) => ({
          documentType: doc.document_type,
          documentNumber: doc.document_number,
          expiryDate: doc.expiry_date,
          documentUrl: undefined, // File upload would be handled separately
        }));
      }
    }

    registerMutation.mutate(payload);
  };

  const handleGetStarted = async () => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok && selectedType) {
      const redirectPath = {
        CUSTOMER: "/customer/dashboard",
        MERCHANT: "/merchant/dashboard",
        PRODUCER: "/producer/dashboard",
      }[selectedType];
      router.push(redirectPath);
    }
  };

  const addDocument = () => {
    if (documents.length < 4) {
      setDocuments([
        ...documents,
        { document_type: "BUSINESS_PERMIT", document_number: "", expiry_date: "", file: null },
      ]);
    }
  };

  const removeDocument = (index: number) => {
    if (documents.length > 1) {
      setDocuments(documents.filter((_, i) => i !== index));
    }
  };

  const updateDocument = (index: number, field: keyof DocumentUpload, value: string | File | null) => {
    const updated = [...documents];
    updated[index] = { ...updated[index]!, [field]: value };
    setDocuments(updated);
  };

  const canProceedStep3 = businessName && businessRegistrationNumber && businessType && businessSize;
  const canProceedStep4 = documents.every(
    (doc) => doc.document_type && doc.document_number && doc.expiry_date
  );

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="relative hidden w-1/2 lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1498654200943-1088dd4438ae?q=80&w=2070')`,
          }}
        >
          <div className="absolute inset-0 bg-[#0B3D4C]/90" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/20">
              <Anchor className="h-6 w-6 text-teal-400" />
            </div>
            <span className="text-xl font-bold uppercase tracking-wider text-white">
              Katig
            </span>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl font-bold leading-tight text-white">
              Empowering the
              <br />
              <span className="text-teal-400">Blue Economy</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300">
              Join our transparent marketplace connecting sustainable seafood
              producers directly with MSMEs and conscious consumers.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-400">
                <Check className="h-4 w-4 text-[#0B3D4C]" />
              </div>
              <span className="text-sm text-gray-300">Trusted Network</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-400">
                <Leaf className="h-4 w-4 text-[#0B3D4C]" />
              </div>
              <span className="text-sm text-gray-300">Sustainability First</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Flow */}
      <div className="flex w-full flex-col bg-gray-50 lg:w-1/2">
        <div className="flex flex-1 flex-col justify-center overflow-y-auto px-8 py-12 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <Anchor className="h-6 w-6 text-[#0B3D4C]" />
              <span className="text-xl font-bold text-[#0B3D4C]">Katig</span>
            </div>

            {/* Progress Steps */}
            {currentStep < totalSteps && (
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {steps.slice(0, -1).map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                          step.id < currentStep
                            ? "bg-teal-500 text-white"
                            : step.id === currentStep
                              ? "bg-[#0B3D4C] text-white"
                              : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {step.id < currentStep ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      {index < steps.length - 2 && (
                        <div
                          className={`mx-1 h-0.5 w-8 sm:mx-2 sm:w-12 ${
                            step.id < currentStep ? "bg-teal-500" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  {steps.slice(0, -1).map((step) => (
                    <span
                      key={step.id}
                      className={`max-w-[60px] text-center ${
                        step.id === currentStep ? "font-medium text-[#0B3D4C]" : ""
                      }`}
                    >
                      {step.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Account Type Selection */}
            {currentStep === 1 && (
              <div>
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-[#0B3D4C]">Join Katig</h2>
                  <p className="mt-2 text-gray-600">
                    Choose your account type to get started
                  </p>
                </div>

                <div className="mb-8 space-y-4">
                  {accountTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                          isSelected
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-teal-500 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              isSelected ? "text-teal-700" : "text-gray-900"
                            }`}
                          >
                            {type.title}
                          </p>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? "border-teal-500 bg-teal-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && <Check className="h-4 w-4 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedType}
                  className="w-full bg-[#0B3D4C] py-3 text-white hover:bg-[#0a3542] focus:ring-[#0B3D4C] disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="mt-6 text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#0B3D4C] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-[#0B3D4C]">
                    Create Your Account
                  </h2>
                  <p className="mt-1 text-gray-600">
                    Enter your personal information
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={selectedType === "CUSTOMER" ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <UserCircle className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                        minLength={8}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 border-gray-300 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      isLoading={selectedType === "CUSTOMER" && registerMutation.isPending}
                      className="flex-1 bg-[#0B3D4C] py-3 text-white hover:bg-[#0a3542] focus:ring-[#0B3D4C]"
                    >
                      {selectedType === "CUSTOMER" ? "Create Account" : "Continue"}
                      {selectedType !== "CUSTOMER" && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-50 px-4 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => signIn("google")}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => signIn("linkedin")}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5" fill="#0A66C2" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Business Information (Merchant/Producer only) */}
            {currentStep === 3 && selectedType !== "CUSTOMER" && (
              <div>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-[#0B3D4C]">Business Information</h2>
                  <p className="mt-1 text-gray-600">Tell us about your business</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
                  <div>
                    <label htmlFor="businessName" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Business Name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Your Business Name"
                        className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="businessRegNumber" className="mb-1.5 block text-sm font-medium text-gray-700">
                      DTI/SEC Registration Number
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Hash className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="businessRegNumber"
                        type="text"
                        value={businessRegistrationNumber}
                        onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                        placeholder="e.g., 123456789"
                        className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Business Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {businessTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setBusinessType(type.id)}
                          className={`rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                            businessType === type.id
                              ? "border-teal-500 bg-teal-50 text-teal-700"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Business Size</label>
                    <div className="space-y-2">
                      {businessSizes.map((size) => (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setBusinessSize(size.id)}
                          className={`flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-left transition-all ${
                            businessSize === size.id
                              ? "border-teal-500 bg-teal-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div>
                            <p className={`font-medium ${businessSize === size.id ? "text-teal-700" : "text-gray-900"}`}>
                              {size.label}
                            </p>
                            <p className="text-sm text-gray-500">{size.description}</p>
                          </div>
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              businessSize === size.id ? "border-teal-500 bg-teal-500" : "border-gray-300"
                            }`}
                          >
                            {businessSize === size.id && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="businessDescription" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Business Description
                    </label>
                    <textarea
                      id="businessDescription"
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      placeholder="Briefly describe your business..."
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 border-gray-300 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!canProceedStep3}
                      className="flex-1 bg-[#0B3D4C] py-3 text-white hover:bg-[#0a3542] focus:ring-[#0B3D4C] disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 4: Document Upload (Merchant/Producer only) */}
            {currentStep === 4 && selectedType !== "CUSTOMER" && (
              <div>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-[#0B3D4C]">Upload Documents</h2>
                  <p className="mt-1 text-gray-600">
                    Submit your compliance and verification documents
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900">Document {index + 1}</span>
                        </div>
                        {documents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Document Type
                          </label>
                          <select
                            value={doc.document_type}
                            onChange={(e) => updateDocument(index, "document_type", e.target.value as DocumentType)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                          >
                            {documentTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.label} {type.required && "*"}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                              Document Number
                            </label>
                            <input
                              type="text"
                              value={doc.document_number}
                              onChange={(e) => updateDocument(index, "document_number", e.target.value)}
                              placeholder="License #"
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                              required
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                              Expiry Date
                            </label>
                            <div className="relative">
                              <input
                                type="date"
                                value={doc.expiry_date}
                                onChange={(e) => updateDocument(index, "expiry_date", e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Upload Document
                          </label>
                          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 transition-colors hover:border-teal-500 hover:bg-teal-50">
                            <Upload className="h-4 w-4" />
                            {doc.file ? doc.file.name : "Click to upload"}
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                updateDocument(index, "file", file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}

                  {documents.length < 4 && (
                    <button
                      type="button"
                      onClick={addDocument}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-teal-500 hover:text-teal-600"
                    >
                      <FileText className="h-4 w-4" />
                      Add Another Document
                    </button>
                  )}

                  <p className="text-xs text-gray-500">
                    * Required documents. Accepted formats: PDF, JPG, PNG
                  </p>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 border-gray-300 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      isLoading={registerMutation.isPending}
                      disabled={!canProceedStep4}
                      className="flex-1 bg-[#0B3D4C] py-3 text-white hover:bg-[#0a3542] focus:ring-[#0B3D4C] disabled:opacity-50"
                    >
                      Create Account
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Welcome Step */}
            {currentStep === totalSteps && (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100">
                  <Check className="h-10 w-10 text-teal-600" />
                </div>

                <h2 className="text-2xl font-bold text-[#0B3D4C]">Welcome to Katig!</h2>
                <p className="mt-2 text-gray-600">
                  Your account has been created successfully.
                </p>

                <div className="my-8 rounded-xl bg-white p-6 text-left shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                      {selectedType === "CUSTOMER" && <User className="h-5 w-5 text-teal-600" />}
                      {selectedType === "MERCHANT" && <Building2 className="h-5 w-5 text-teal-600" />}
                      {selectedType === "PRODUCER" && <Ship className="h-5 w-5 text-teal-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{name}</p>
                      <p className="text-sm text-gray-500">{email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-gray-50 px-4 py-2">
                      <p className="text-sm text-gray-600">
                        Account Type:{" "}
                        <span className="font-medium text-gray-900">
                          {accountTypes.find((t) => t.id === selectedType)?.title}
                        </span>
                      </p>
                    </div>
                    {selectedType !== "CUSTOMER" && businessName && (
                      <div className="rounded-lg bg-gray-50 px-4 py-2">
                        <p className="text-sm text-gray-600">
                          Business:{" "}
                          <span className="font-medium text-gray-900">{businessName}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedType !== "CUSTOMER" && (
                  <div className="mb-6 rounded-lg bg-amber-50 p-4 text-left">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> Your documents are pending verification. You&apos;ll receive an email once your account is fully verified.
                    </p>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleGetStarted}
                  className="w-full bg-[#0B3D4C] py-3 text-white hover:bg-[#0a3542] focus:ring-[#0B3D4C]"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-8 py-4">
          <div className="mx-auto flex max-w-md justify-center gap-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
              Terms of Service
            </Link>
            <Link href="/help" className="text-sm text-gray-500 hover:text-gray-700">
              Help Center
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
