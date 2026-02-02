"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import {
  Search,
  Filter,
  Mail,
  Phone,
  Shield,
  ShoppingBag,
  Store,
  Fish,
  User,
  MoreVertical,
  CheckCircle,
} from "lucide-react";

type UserRole = "CUSTOMER" | "MERCHANT" | "PRODUCER" | "ADMIN";

const roleConfig: Record<
  UserRole,
  { label: string; color: string; bgColor: string; icon: typeof User }
> = {
  CUSTOMER: {
    label: "Customer",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: ShoppingBag,
  },
  MERCHANT: {
    label: "Merchant",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: Store,
  },
  PRODUCER: {
    label: "Producer",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: Fish,
  },
  ADMIN: {
    label: "Admin",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: Shield,
  },
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showRoleMenu, setShowRoleMenu] = useState<string | null>(null);

  const { data, isLoading, refetch } = api.admin.getUsers.useQuery({
    search: search || undefined,
    role: roleFilter || undefined,
    limit: 50,
  });

  const { data: stats } = api.admin.getUserStats.useQuery();

  const updateRoleMutation = api.admin.updateUserRole.useMutation({
    onSuccess: () => {
      void refetch();
      setShowRoleMenu(null);
    },
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-gray-600">View and manage all users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-xl font-bold text-gray-900">{stats?.total ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Customers</p>
              <p className="text-xl font-bold text-gray-900">{stats?.customers ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Store className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Merchants</p>
              <p className="text-xl font-bold text-gray-900">{stats?.merchants ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Fish className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Producers</p>
              <p className="text-xl font-bold text-gray-900">{stats?.producers ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-xl font-bold text-gray-900">{stats?.admins ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
            className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="MERCHANT">Merchants</option>
            <option value="PRODUCER">Producers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          </div>
        ) : !data?.users?.length ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.users.map((user) => {
                  const role = roleConfig[user.role as UserRole];
                  const RoleIcon = role.icon;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name ?? ""}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name ?? "No name"}
                            </p>
                            <p className="text-sm text-gray-500">{user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="space-y-1">
                          {user.email && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Mail className="h-3.5 w-3.5" />
                              {user.email}
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Phone className="h-3.5 w-3.5" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${role.bgColor} ${role.color}`}
                        >
                          <RoleIcon className="h-3.5 w-3.5" />
                          {role.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.merchant ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.merchant.businessName}
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 text-xs ${
                                user.merchant.verificationStatus === "VERIFIED"
                                  ? "text-green-600"
                                  : user.merchant.verificationStatus === "REJECTED"
                                    ? "text-red-600"
                                    : "text-yellow-600"
                              }`}
                            >
                              <CheckCircle className="h-3 w-3" />
                              {user.merchant.verificationStatus}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-gray-900">{user.orderCount}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowRoleMenu(showRoleMenu === user.id ? null : user.id)
                            }
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {showRoleMenu === user.id && (
                            <div className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                              <p className="px-3 py-2 text-xs font-medium text-gray-500">
                                Change Role
                              </p>
                              {(
                                ["CUSTOMER", "MERCHANT", "PRODUCER", "ADMIN"] as UserRole[]
                              ).map((r) => (
                                <button
                                  key={r}
                                  onClick={() => handleRoleChange(user.id, r)}
                                  disabled={
                                    user.role === r || updateRoleMutation.isPending
                                  }
                                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 disabled:opacity-50 ${
                                    user.role === r
                                      ? "bg-gray-50 text-gray-400"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {roleConfig[r].label}
                                  {user.role === r && (
                                    <CheckCircle className="ml-auto h-4 w-4 text-teal-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
