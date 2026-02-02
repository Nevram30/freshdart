"use client";

import { api } from "~/trpc/react";
import { Users, UserCheck, Clock, XCircle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = api.admin.getVerificationStats.useQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Manage producer verifications and system settings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Producers</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : stats?.total ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : stats?.pending ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : stats?.verified ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : stats?.rejected ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/producers"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <UserCheck className="h-5 w-5 text-teal-600" />
            <div>
              <p className="font-medium text-gray-900">Review Producers</p>
              <p className="text-sm text-gray-500">
                Verify and manage producer profiles
              </p>
            </div>
          </Link>

          <Link
            href="/admin/producers?status=PENDING"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-gray-900">Pending Approvals</p>
              <p className="text-sm text-gray-500">
                {stats?.pending ?? 0} producers awaiting review
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
