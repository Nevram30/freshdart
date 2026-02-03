"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import {
  Search,
  Filter,
  Package,
  Eye,
  Fish,
  ImageIcon,
  ArrowUpDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type ProductStatus =
  | "DRAFT"
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED"
  | "OUT_OF_STOCK"
  | "DISCONTINUED";

const statusConfig: Record<
  ProductStatus,
  { label: string; color: string; bgColor: string }
> = {
  DRAFT: { label: "Draft", color: "text-gray-700", bgColor: "bg-gray-100" },
  ACTIVE: { label: "Active", color: "text-green-700", bgColor: "bg-green-100" },
  INACTIVE: { label: "Inactive", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  ARCHIVED: { label: "Archived", color: "text-blue-700", bgColor: "bg-blue-100" },
  OUT_OF_STOCK: { label: "Out of Stock", color: "text-red-700", bgColor: "bg-red-100" },
  DISCONTINUED: { label: "Discontinued", color: "text-red-700", bgColor: "bg-red-50" },
};

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "">("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [cursors, setCursors] = useState<string[]>([]);
  const ITEMS_PER_PAGE = 10;

  const currentCursor = cursors[cursors.length - 1];
  const currentPage = cursors.length + 1;

  const utils = api.useUtils();
  const { data: statsData } = api.admin.getProductStats.useQuery();

  const { data, isLoading } = api.admin.getProducts.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    limit: ITEMS_PER_PAGE,
    cursor: currentCursor,
  });

  const deleteProductMutation = api.admin.deleteProduct.useMutation({
    onSuccess: () => {
      void utils.admin.getProducts.invalidate();
      void utils.admin.getProductStats.invalidate();
      setDeleteConfirm(null);
      setSelectedProduct(null);
    },
  });

  const deleteProductsMutation = api.admin.deleteProducts.useMutation({
    onSuccess: () => {
      void utils.admin.getProducts.invalidate();
      void utils.admin.getProductStats.invalidate();
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
    },
  });

  const allSelected =
    (data?.products?.length ?? 0) > 0 &&
    data?.products?.every((p) => selectedIds.has(p.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!data?.products) return;
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        data.products.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        data.products.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const stats = [
    { label: "Total Products", value: statsData?.total ?? 0, color: "bg-gray-50 text-gray-700" },
    { label: "Active", value: statsData?.active ?? 0, color: "bg-green-50 text-green-700" },
    { label: "Draft", value: statsData?.draft ?? 0, color: "bg-gray-50 text-gray-600" },
    { label: "Out of Stock", value: statsData?.outOfStock ?? 0, color: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="mt-1 text-gray-600">
          View all products created by producers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border border-gray-200 p-4 ${stat.color}`}
          >
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, species, or local name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCursors([]); }}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete ({selectedIds.size})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ProductStatus | "");
              setCursors([]);
            }}
            className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="INACTIVE">Inactive</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="ARCHIVED">Archived</option>
            <option value="DISCONTINUED">Discontinued</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          </div>
        ) : !data?.products?.length ? (
          <div className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Producer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <span className="flex items-center gap-1">
                      Price
                      <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.products.map((product) => {
                  const status =
                    statusConfig[product.status as ProductStatus] ??
                    statusConfig.DRAFT;

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            {product.image?.url ? (
                              <img
                                src={product.image.url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {product.sku && (
                                <span>SKU: {product.sku}</span>
                              )}
                              {product.localName && (
                                <span className="italic">
                                  {product.localName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Producer */}
                      <td className="px-6 py-4">
                        {product.merchant ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {product.merchant.businessName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.merchant.user?.name ?? product.merchant.user?.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No producer
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                          <Fish className="h-3 w-3" />
                          {product.category.name}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          ₱{Number(product.price).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          per {product.stockUnit}
                        </p>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {Number(product.stockQuantity).toLocaleString()}{" "}
                          {product.stockUnit}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bgColor} ${status.color}`}
                        >
                          {status.label}
                        </span>
                        {product.featured && (
                          <span className="ml-1 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                            Featured
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setSelectedProduct(
                                selectedProduct === product.id
                                  ? null
                                  : product.id
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({ id: product.id, name: product.name })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data?.products && data.products.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
            <p className="text-sm text-gray-500">
              Page {currentPage}
              {statsData?.total != null && (
                <span className="ml-1 text-gray-400">
                  &middot; {statsData.total} total products
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCursors((prev) => prev.slice(0, -1))}
                disabled={cursors.length === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => {
                  if (data.nextCursor) {
                    setCursors((prev) => [...prev, data.nextCursor!]);
                  }
                }}
                disabled={!data.nextCursor}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && data?.products && (() => {
        const product = data.products.find((p) => p.id === selectedProduct);
        if (!product) return null;
        const status =
          statusConfig[product.status as ProductStatus] ?? statusConfig.DRAFT;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-start justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Product Details
                </h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product Image */}
              <div className="mb-4 flex h-48 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {product.image?.url ? (
                  <img
                    src={product.image.url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-300" />
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  {product.localName && (
                    <p className="text-sm italic text-gray-500">
                      {product.localName}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bgColor} ${status.color}`}
                  >
                    {status.label}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                    <Fish className="h-3 w-3" />
                    {product.category.name}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    {product.productType}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                    {product.seafoodType}
                  </span>
                  {product.featured && (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      Featured
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ₱{Number(product.price).toFixed(2)} / {product.stockUnit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Stock</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {Number(product.stockQuantity).toLocaleString()}{" "}
                      {product.stockUnit}
                    </p>
                  </div>
                  {product.sku && (
                    <div>
                      <p className="text-xs text-gray-500">SKU</p>
                      <p className="text-sm font-medium text-gray-900">
                        {product.sku}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Producer Info */}
                {product.merchant && (
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                      Producer
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {product.merchant.businessName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.merchant.user?.name} &middot;{" "}
                      {product.merchant.user?.email}
                    </p>
                    <span
                      className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.merchant.verificationStatus === "VERIFIED"
                          ? "bg-green-100 text-green-700"
                          : product.merchant.verificationStatus === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.merchant.verificationStatus}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() =>
                    setDeleteConfirm({ id: product.id, name: product.name })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteConfirm.name}</span>? This
              action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteProductMutation.isPending}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteProductMutation.mutate({ productId: deleteConfirm.id })
                }
                disabled={deleteProductMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete Products</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedIds.size} product{selectedIds.size > 1 ? "s" : ""}</span>? This
              action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                disabled={deleteProductsMutation.isPending}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteProductsMutation.mutate({ productIds: Array.from(selectedIds) })
                }
                disabled={deleteProductsMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleteProductsMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
