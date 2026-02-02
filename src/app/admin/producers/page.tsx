"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";

type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

const statusConfig: Record<
  VerificationStatus,
  { label: string; color: string; bgColor: string; icon: typeof CheckCircle }
> = {
  PENDING: {
    label: "Pending",
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

export default function AdminProducersPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") as VerificationStatus | null;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "">(
    initialStatus ?? ""
  );

  const { data, isLoading, refetch } = api.admin.getProducers.useQuery({
    search: search || undefined,
    verificationStatus: statusFilter || undefined,
    limit: 50,
  });

  const updateStatusMutation = api.admin.updateVerificationStatus.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleVerify = (merchantId: string) => {
    updateStatusMutation.mutate({
      merchantId,
      verificationStatus: "VERIFIED",
    });
  };

  const handleReject = (merchantId: string) => {
    updateStatusMutation.mutate({
      merchantId,
      verificationStatus: "REJECTED",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Producer Verification</h1>
        <p className="mt-1 text-gray-600">
          Review and verify producer profiles
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VerificationStatus | "")}
            className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Producers List */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          </div>
        ) : !data?.producers?.length ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No producers found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.producers.map((producer) => {
              const status = statusConfig[producer.verificationStatus as VerificationStatus];
              const StatusIcon = status.icon;

              return (
                <div
                  key={producer.id}
                  className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {producer.businessName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bgColor} ${status.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {producer.businessType} - {producer.businessSize}
                      </span>
                      {producer.user.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {producer.user.email}
                        </span>
                      )}
                      {producer.user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {producer.user.phone}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500">
                      {producer.description ?? "No description provided"}
                    </p>

                    <p className="text-xs text-gray-400">
                      Registered: {new Date(producer.createdAt).toLocaleDateString()} |
                      Products: {producer.productCount}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/producers/${producer.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>

                    {producer.verificationStatus === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleVerify(producer.id)}
                          disabled={updateStatusMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Verify
                        </button>
                        <button
                          onClick={() => handleReject(producer.id)}
                          disabled={updateStatusMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}

                    {producer.verificationStatus === "VERIFIED" && (
                      <button
                        onClick={() => handleReject(producer.id)}
                        disabled={updateStatusMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Revoke
                      </button>
                    )}

                    {producer.verificationStatus === "REJECTED" && (
                      <button
                        onClick={() => handleVerify(producer.id)}
                        disabled={updateStatusMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
