"use client";

import { useState } from "react";
import {
  User,
  Building2,
  FileText,
  Mail,
  Phone,
  Edit2,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Shield,
  Star,
  Package,
  Loader2,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";

type BusinessType = "MSME" | "FISHERY" | "AQUACULTURE" | "PROCESSOR";
type BusinessSize = "MICRO" | "SMALL" | "MEDIUM";

const businessTypeLabels: Record<BusinessType, string> = {
  MSME: "MSME",
  FISHERY: "Fishery",
  AQUACULTURE: "Aquaculture",
  PROCESSOR: "Processor",
};

const businessSizeLabels: Record<BusinessSize, string> = {
  MICRO: "Micro",
  SMALL: "Small",
  MEDIUM: "Medium",
};

const documentTypeLabels: Record<string, string> = {
  BUSINESS_PERMIT: "Business Permit",
  FDA_LICENSE: "FDA License",
  BFAR_REGISTRATION: "BFAR Registration",
  SANITARY_PERMIT: "Sanitary Permit",
};

const documentStatusConfig: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info"; icon: typeof CheckCircle }> = {
  APPROVED: { label: "Approved", variant: "success", icon: CheckCircle },
  PENDING: { label: "Pending", variant: "warning", icon: Clock },
  REJECTED: { label: "Rejected", variant: "danger", icon: XCircle },
  EXPIRED: { label: "Expired", variant: "danger", icon: AlertCircle },
};

const verificationStatusConfig: Record<string, { label: string; variant: "success" | "warning" | "danger"; icon: typeof CheckCircle }> = {
  VERIFIED: { label: "Verified", variant: "success", icon: CheckCircle },
  PENDING: { label: "Pending Verification", variant: "warning", icon: Clock },
  REJECTED: { label: "Rejected", variant: "danger", icon: XCircle },
};

export default function ProducerProfilePage() {
  const utils = api.useUtils();
  const { data: profile, isLoading } = api.profile.getProfile.useQuery();

  // Edit states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    name: "",
    phone: "",
  });

  const [businessForm, setBusinessForm] = useState({
    businessName: "",
    businessType: "MSME" as BusinessType,
    businessSize: "MICRO" as BusinessSize,
    description: "",
  });

  // Mutations
  const updatePersonalInfo = api.profile.updatePersonalInfo.useMutation({
    onSuccess: () => {
      void utils.profile.getProfile.invalidate();
      setIsEditingPersonal(false);
    },
  });

  const updateBusinessInfo = api.profile.updateBusinessInfo.useMutation({
    onSuccess: () => {
      void utils.profile.getProfile.invalidate();
      setIsEditingBusiness(false);
    },
  });

  // Handlers
  const handleEditPersonal = () => {
    if (profile) {
      setPersonalForm({
        name: profile.name ?? "",
        phone: profile.phone ?? "",
      });
      setIsEditingPersonal(true);
    }
  };

  const handleSavePersonal = () => {
    updatePersonalInfo.mutate({
      name: personalForm.name,
      phone: personalForm.phone || null,
    });
  };

  const handleEditBusiness = () => {
    if (profile?.merchant) {
      setBusinessForm({
        businessName: profile.merchant.businessName,
        businessType: profile.merchant.businessType as BusinessType,
        businessSize: profile.merchant.businessSize as BusinessSize,
        description: profile.merchant.description ?? "",
      });
      setIsEditingBusiness(true);
    }
  };

  const handleSaveBusiness = () => {
    updateBusinessInfo.mutate({
      businessName: businessForm.businessName,
      businessType: businessForm.businessType,
      businessSize: businessForm.businessSize,
      description: businessForm.description || null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  const verificationStatus = profile.merchant?.verificationStatus ?? "PENDING";
  const verificationConfig = verificationStatusConfig[verificationStatus] ?? verificationStatusConfig.PENDING!;
  const VerificationIcon = verificationConfig?.icon ?? Clock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-gray-600">
          Manage your personal and business information
        </p>
      </div>

      {/* Verification Status Banner */}
      {profile.merchant && (
        <div
          className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
            verificationStatus === "VERIFIED"
              ? "bg-green-50 text-green-800"
              : verificationStatus === "PENDING"
              ? "bg-amber-50 text-amber-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          <VerificationIcon className="h-5 w-5" />
          <div className="flex-1">
            <p className="font-medium">{verificationConfig?.label ?? "Pending Verification"}</p>
            {verificationStatus === "PENDING" && (
              <p className="text-sm opacity-80">
                Your account is under review. This usually takes 1-2 business days.
              </p>
            )}
            {verificationStatus === "REJECTED" && (
              <p className="text-sm opacity-80">
                Please review your documents and contact support for assistance.
              </p>
            )}
          </div>
          {profile.merchant.isFeatured && (
            <div className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-700">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">Featured Producer</span>
            </div>
          )}
        </div>
      )}

      {/* Stats Overview */}
      {profile.merchant && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                <Package className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.merchant.productCount}
                </p>
                <p className="text-sm text-gray-500">Products</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Number(profile.merchant.ratingAverage).toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.merchant.totalSales}
                </p>
                <p className="text-sm text-gray-500">Total Sales</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Personal Information</h2>
            </div>
            {!isEditingPersonal && (
              <button
                onClick={handleEditPersonal}
                className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>
          <div className="p-6">
            {isEditingPersonal ? (
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  id="name"
                  value={personalForm.name}
                  onChange={(e) =>
                    setPersonalForm({ ...personalForm, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                />
                <Input
                  label="Phone Number"
                  id="phone"
                  value={personalForm.phone}
                  onChange={(e) =>
                    setPersonalForm({ ...personalForm, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                />
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSavePersonal}
                    isLoading={updatePersonalInfo.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingPersonal(false)}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">
                      {profile.name ?? "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900">
                      {profile.email ?? "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Phone className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">
                      {profile.phone ?? "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Business Information */}
        {profile.merchant && (
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Business Information</h2>
              </div>
              {!isEditingBusiness && (
                <button
                  onClick={handleEditBusiness}
                  className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>
            <div className="p-6">
              {isEditingBusiness ? (
                <div className="space-y-4">
                  <Input
                    label="Business Name"
                    id="businessName"
                    value={businessForm.businessName}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, businessName: e.target.value })
                    }
                    placeholder="Enter business name"
                  />
                  <div>
                    <label
                      htmlFor="businessType"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Business Type
                    </label>
                    <select
                      id="businessType"
                      value={businessForm.businessType}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          businessType: e.target.value as BusinessType,
                        })
                      }
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    >
                      {Object.entries(businessTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="businessSize"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Business Size
                    </label>
                    <select
                      id="businessSize"
                      value={businessForm.businessSize}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          businessSize: e.target.value as BusinessSize,
                        })
                      }
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    >
                      {Object.entries(businessSizeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Business Description
                    </label>
                    <textarea
                      id="description"
                      value={businessForm.description}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, description: e.target.value })
                      }
                      rows={3}
                      placeholder="Describe your business..."
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSaveBusiness}
                      isLoading={updateBusinessInfo.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingBusiness(false)}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Business Name</p>
                    <p className="font-medium text-gray-900">
                      {profile.merchant.businessName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration Number</p>
                    <p className="font-medium text-gray-900">
                      {profile.merchant.businessRegistrationNumber}
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Business Type</p>
                      <Badge variant="info">
                        {businessTypeLabels[profile.merchant.businessType as BusinessType]}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Business Size</p>
                      <Badge>
                        {businessSizeLabels[profile.merchant.businessSize as BusinessSize]}
                      </Badge>
                    </div>
                  </div>
                  {profile.merchant.description && (
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-gray-700">{profile.merchant.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Documents Section */}
      {profile.merchant && profile.merchant.documents.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
            <FileText className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Documents</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {profile.merchant.documents.map((doc) => {
              const statusConfig = documentStatusConfig[doc.status] ?? documentStatusConfig.PENDING!;
              const StatusIcon = statusConfig?.icon ?? Clock;
              const isExpired = new Date(doc.expiryDate) < new Date();

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <FileText className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {documentTypeLabels[doc.documentType] ?? doc.documentType}
                      </p>
                      <p className="text-sm text-gray-500">
                        {doc.documentNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Expires</p>
                      <p
                        className={`text-sm font-medium ${
                          isExpired ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {new Date(doc.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={isExpired ? "danger" : (statusConfig?.variant ?? "warning")}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {isExpired ? "Expired" : (statusConfig?.label ?? "Pending")}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Account Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          Member since{" "}
          <span className="font-medium text-gray-700">
            {new Date(profile.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </p>
      </div>
    </div>
  );
}
