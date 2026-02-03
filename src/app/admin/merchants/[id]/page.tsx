"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Store,
  ShoppingBag,
  Package,
} from "lucide-react";
import Link from "next/link";

type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

const statusConfig: Record<
  VerificationStatus,
  { label: string; color: string; bgColor: string; icon: typeof CheckCircle }
> = {
  PENDING: {
    label: "Pending Review",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: Clock,
  },
  VERIFIED: {
    label: "Verified",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
};

export default function AdminMerchantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const merchantId = params.id as string;

  const { data: merchant, isLoading, refetch } = api.admin.getMerchantDetails.useQuery({
    merchantId,
  });

  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (merchant) {
      setIsVerified(merchant.verificationStatus === "VERIFIED");
    }
  }, [merchant]);

  const updateStatusMutation = api.admin.updateMerchantVerificationStatus.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleVerificationChange = (checked: boolean) => {
    setIsVerified(checked);
    updateStatusMutation.mutate({
      merchantId,
      verificationStatus: checked ? "VERIFIED" : "PENDING",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Merchant not found</h2>
        <p className="mt-2 text-gray-600">The merchant you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/admin/merchants"
          className="mt-4 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to merchants
        </Link>
      </div>
    );
  }

  const status = statusConfig[merchant.verificationStatus as VerificationStatus];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{merchant.businessName}</h1>
          <p className="text-gray-600">Merchant Profile</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${status.bgColor} ${status.color}`}
        >
          <StatusIcon className="h-4 w-4" />
          {status.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Business Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500">Business Name</label>
                <p className="mt-1 text-gray-900">{merchant.businessName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Registration Number</label>
                <p className="mt-1 text-gray-900">{merchant.businessRegistrationNumber ?? "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Business Type</label>
                <p className="mt-1 text-gray-900">{merchant.businessType ?? "Not specified"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Business Size</label>
                <p className="mt-1 text-gray-900">{merchant.businessSize ?? "Not specified"}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-gray-900">
                  {merchant.description ?? "No description provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">{merchant.user.name ?? "No name"}</span>
              </div>
              {merchant.user.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a
                    href={`mailto:${merchant.user.email}`}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    {merchant.user.email}
                  </a>
                </div>
              )}
              {merchant.user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{merchant.user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">
                  Registered on {new Date(merchant.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            {merchant.documents.length === 0 ? (
              <p className="mt-4 text-gray-500">No documents uploaded</p>
            ) : (
              <div className="mt-4 space-y-3">
                {merchant.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {doc.documentType.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-gray-500">
                          #{doc.documentNumber} | Expires:{" "}
                          {new Date(doc.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        doc.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : doc.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : doc.status === "EXPIRED"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Verification Status</h2>

            {/* Verification Checkbox */}
            <div className="mt-4">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => handleVerificationChange(e.target.checked)}
                  disabled={updateStatusMutation.isPending}
                  className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 disabled:opacity-50"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">Verify this merchant</span>
                  <p className="text-sm text-gray-500">
                    Check to approve this merchant
                  </p>
                </div>
              </label>
            </div>

            {updateStatusMutation.isPending && (
              <p className="mt-2 text-sm text-gray-500">Updating status...</p>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {merchant.verificationStatus !== "VERIFIED" && (
                <button
                  onClick={() => handleVerificationChange(true)}
                  disabled={updateStatusMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve Merchant
                </button>
              )}

              {merchant.verificationStatus !== "REJECTED" && (
                <button
                  onClick={() => {
                    setIsVerified(false);
                    updateStatusMutation.mutate({
                      merchantId,
                      verificationStatus: "REJECTED",
                    });
                  }}
                  disabled={updateStatusMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reject Merchant
                </button>
              )}

              {merchant.verificationStatus === "REJECTED" && (
                <button
                  onClick={() => {
                    updateStatusMutation.mutate({
                      merchantId,
                      verificationStatus: "PENDING",
                    });
                  }}
                  disabled={updateStatusMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-yellow-300 bg-white px-4 py-2.5 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-50 disabled:opacity-50"
                >
                  <Clock className="h-4 w-4" />
                  Move to Pending
                </button>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Orders</span>
                </div>
                <span className="font-medium text-gray-900">{merchant.orderCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Bulk Orders</span>
                </div>
                <span className="font-medium text-gray-900">{merchant.bulkOrderCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Sales</span>
                <span className="font-medium text-gray-900">{merchant.totalSales}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rating</span>
                <span className="font-medium text-gray-900">
                  {Number(merchant.ratingAverage).toFixed(1)} / 5.0
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Featured</span>
                <span className="font-medium text-gray-900">
                  {merchant.isFeatured ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
