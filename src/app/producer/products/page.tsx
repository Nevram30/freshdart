"use client";

import { useState } from "react";
import {
  Fish,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  CheckCircle,
  X,
  ImagePlus,
  GripVertical,
  Loader2,
} from "lucide-react";
import { api } from "~/trpc/react";

// Types based on Prisma schema
type ProductType = "FRESH" | "FROZEN" | "PROCESSED" | "DRIED" | "LIVE";
type SeafoodType = "FISH" | "SHELLFISH" | "CRUSTACEAN" | "MOLLUSK" | "SEAWEED";
type StockType = "WEIGHT" | "UNIT";
type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED" | "OUT_OF_STOCK" | "DISCONTINUED";

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  weightValue: number;
  stockQuantity: number;
  lowStockThreshold: number;
}

interface ProductFormData {
  name: string;
  sku: string;
  slug: string;
  description: string;
  shortDescription: string;
  productType: ProductType;
  seafoodType: SeafoodType;
  speciesName: string;
  localName: string;
  price: string;
  compareAtPrice: string;
  costPerItem: string;
  stockType: StockType;
  stockQuantity: string;
  stockUnit: string;
  minOrderQty: string;
  maxOrderQty: string;
  weightKg: string;
  requiresColdChain: boolean;
  shelfLifeDays: string;
  categoryId: string;
  status: ProductStatus;
  featured: boolean;
  tags: string;
  variants: ProductVariant[];
}

const initialFormData: ProductFormData = {
  name: "",
  sku: "",
  slug: "",
  description: "",
  shortDescription: "",
  productType: "FRESH",
  seafoodType: "FISH",
  speciesName: "",
  localName: "",
  price: "",
  compareAtPrice: "",
  costPerItem: "",
  stockType: "WEIGHT",
  stockQuantity: "",
  stockUnit: "kg",
  minOrderQty: "1",
  maxOrderQty: "",
  weightKg: "",
  requiresColdChain: true,
  shelfLifeDays: "",
  categoryId: "",
  status: "DRAFT",
  featured: false,
  tags: "",
  variants: [],
};

const productTypeOptions: { value: ProductType; label: string }[] = [
  { value: "FRESH", label: "Fresh" },
  { value: "FROZEN", label: "Frozen" },
  { value: "PROCESSED", label: "Processed" },
  { value: "DRIED", label: "Dried" },
  { value: "LIVE", label: "Live" },
];

const seafoodTypeOptions: { value: SeafoodType; label: string }[] = [
  { value: "FISH", label: "Fish" },
  { value: "SHELLFISH", label: "Shellfish" },
  { value: "CRUSTACEAN", label: "Crustacean" },
  { value: "MOLLUSK", label: "Mollusk" },
  { value: "SEAWEED", label: "Seaweed" },
];

const stockTypeOptions: { value: StockType; label: string }[] = [
  { value: "WEIGHT", label: "Weight-based (kg/g)" },
  { value: "UNIT", label: "Unit-based (pieces)" },
];

const statusOptions: { value: ProductStatus; label: string; color: string }[] = [
  { value: "DRAFT", label: "Draft", color: "bg-gray-100 text-gray-700" },
  { value: "ACTIVE", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "INACTIVE", label: "Inactive", color: "bg-yellow-100 text-yellow-700" },
  { value: "ARCHIVED", label: "Archived", color: "bg-purple-100 text-purple-700" },
  { value: "OUT_OF_STOCK", label: "Out of Stock", color: "bg-red-100 text-red-700" },
  { value: "DISCONTINUED", label: "Discontinued", color: "bg-gray-100 text-gray-500" },
];

const stockUnitOptions = ["kg", "g", "piece", "pack", "box", "tray"];

export default function ProducerProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "inventory" | "variants">("basic");
  const [viewingProductId, setViewingProductId] = useState<string | null>(null);
  const [deleteConfirmProductId, setDeleteConfirmProductId] = useState<string | null>(null);

  // tRPC queries
  const utils = api.useUtils();

  const { data: productsData, isLoading: isLoadingProducts } = api.product.getForProducer.useQuery({
    search: searchQuery || undefined,
    categoryId: selectedCategory !== "All Categories" ? selectedCategory : undefined,
    status: selectedStatus !== "All Status" ? (selectedStatus as ProductStatus) : undefined,
  });

  const { data: categories, isLoading: isLoadingCategories } = api.category.getAll.useQuery();

  // tRPC mutations
  const createProduct = api.product.create.useMutation({
    onSuccess: () => {
      void utils.product.getForProducer.invalidate();
      handleCloseForm();
    },
  });

  const updateProduct = api.product.update.useMutation({
    onSuccess: () => {
      void utils.product.getForProducer.invalidate();
      handleCloseForm();
    },
  });

  const deleteProduct = api.product.delete.useMutation({
    onSuccess: () => {
      void utils.product.getForProducer.invalidate();
      setDeleteConfirmProductId(null);
    },
  });

  const products = productsData?.products ?? [];

  // Stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "ACTIVE").length;
  const lowStockProducts = products.filter((p) => Number(p.stockQuantity) < 10).length;
  const draftProducts = products.filter((p) => p.status === "DRAFT").length;

  // Find product for viewing/deleting
  const viewingProduct = products.find((p) => p.id === viewingProductId);
  const deleteConfirmProduct = products.find((p) => p.id === deleteConfirmProductId);

  const handleOpenForm = (productId?: string) => {
    if (productId) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setEditingProductId(productId);
        setFormData({
          name: product.name,
          sku: product.sku ?? "",
          slug: product.slug,
          description: product.description ?? "",
          shortDescription: product.shortDescription ?? "",
          productType: product.productType,
          seafoodType: product.seafoodType,
          speciesName: product.speciesName ?? "",
          localName: product.localName ?? "",
          price: String(product.price),
          compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
          costPerItem: product.costPerItem ? String(product.costPerItem) : "",
          stockType: product.stockType,
          stockQuantity: String(product.stockQuantity),
          stockUnit: product.stockUnit,
          minOrderQty: String(product.minOrderQty),
          maxOrderQty: product.maxOrderQty ? String(product.maxOrderQty) : "",
          weightKg: String(product.weightKg),
          requiresColdChain: product.requiresColdChain,
          shelfLifeDays: product.shelfLifeDays ? String(product.shelfLifeDays) : "",
          categoryId: product.categoryId,
          status: product.status,
          featured: product.featured,
          tags: product.tags.join(", "),
          variants: product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            price: Number(v.price),
            weightValue: Number(v.weightValue),
            stockQuantity: v.stockQuantity,
            lowStockThreshold: v.lowStockThreshold,
          })),
        });
      }
    } else {
      setEditingProductId(null);
      setFormData(initialFormData);
    }
    setActiveTab("basic");
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProductId(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      sku: formData.sku || undefined,
      slug: formData.slug || undefined,
      description: formData.description || undefined,
      shortDescription: formData.shortDescription || undefined,
      productType: formData.productType,
      seafoodType: formData.seafoodType,
      speciesName: formData.speciesName || undefined,
      localName: formData.localName || undefined,
      price: parseFloat(formData.price) || 0,
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      costPerItem: formData.costPerItem ? parseFloat(formData.costPerItem) : undefined,
      stockType: formData.stockType,
      stockQuantity: parseFloat(formData.stockQuantity) || 0,
      stockUnit: formData.stockUnit,
      minOrderQty: parseFloat(formData.minOrderQty) || 1,
      maxOrderQty: formData.maxOrderQty ? parseFloat(formData.maxOrderQty) : undefined,
      weightKg: parseFloat(formData.weightKg) || 0,
      requiresColdChain: formData.requiresColdChain,
      shelfLifeDays: formData.shelfLifeDays ? parseInt(formData.shelfLifeDays) : undefined,
      categoryId: formData.categoryId,
      status: formData.status,
      featured: formData.featured,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      variants: formData.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: v.price,
        weightValue: v.weightValue,
        stockQuantity: v.stockQuantity,
        lowStockThreshold: v.lowStockThreshold,
      })),
    };

    if (editingProductId) {
      updateProduct.mutate({ id: editingProductId, ...productData });
    } else {
      createProduct.mutate(productData);
    }
  };

  const handleDeleteClick = (productId: string) => {
    setDeleteConfirmProductId(productId);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmProductId) {
      deleteProduct.mutate({ id: deleteConfirmProductId });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmProductId(null);
  };

  const handleViewProduct = (productId: string) => {
    setViewingProductId(productId);
  };

  const handleCloseView = () => {
    setViewingProductId(null);
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}`,
      name: "",
      sku: "",
      price: 0,
      weightValue: 0,
      stockQuantity: 0,
      lowStockThreshold: 10,
    };
    setFormData({
      ...formData,
      variants: [...formData.variants, newVariant],
    });
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = {
      ...updatedVariants[index]!,
      [field]: value,
    };
    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleRemoveVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const getStatusBadge = (status: ProductStatus) => {
    const statusConfig = statusOptions.find((s) => s.value === status);
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig?.color ?? "bg-gray-100 text-gray-700"}`}>
        {statusConfig?.label ?? status}
      </span>
    );
  };

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">
            Manage your seafood products and inventory.
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Total Products
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
              <Package className="h-5 w-5 text-teal-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{totalProducts}</div>
          <div className="text-sm text-gray-600">In catalog</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Active
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{activeProducts}</div>
          <div className="text-sm text-gray-600">Listed on marketplace</div>
        </div>

        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-orange-700">
              Low Stock
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-200">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-orange-600">{lowStockProducts}</div>
          <div className="text-sm text-orange-700">Need restocking</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Drafts
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Edit2 className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{draftProducts}</div>
          <div className="text-sm text-gray-600">Pending publish</div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Product Catalog</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 px-6 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
          >
            <option>All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
          >
            <option>All Status</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {products.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                        <Fish className="h-6 w-6 text-teal-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          {product.category.name}
                          {product.localName && ` • ${product.localName}`}
                        </div>
                        {product.variants.length > 0 && (
                          <div className="mt-1 text-xs text-teal-600">
                            {product.variants.length} variant{product.variants.length > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {product.sku ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {product.productType}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      ₱{Number(product.price).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">per {product.stockUnit}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className={`font-semibold ${Number(product.stockQuantity) < 10 ? "text-orange-600" : "text-gray-900"}`}>
                      {Number(product.stockQuantity)} {product.stockUnit}
                    </div>
                    {Number(product.stockQuantity) < 10 && (
                      <div className="text-xs text-orange-600">Low stock</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenForm(product.id)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-teal-600"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewProduct(product.id)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product.id)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Fish className="h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">No products found</p>
            <button
              onClick={() => handleOpenForm()}
              className="mt-4 text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              Add your first product
            </button>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-xl">
            <form onSubmit={handleSubmit}>
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProductId ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Error Display */}
              {(createProduct.error ?? updateProduct.error) && (
                <div className="mx-6 mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                  {createProduct.error?.message ?? updateProduct.error?.message}
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-200 bg-gray-50 px-6">
                <nav className="-mb-px flex gap-6">
                  {(["basic", "pricing", "inventory", "variants"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`border-b-2 py-3 text-sm font-medium capitalize transition-colors ${
                        activeTab === tab
                          ? "border-teal-500 text-teal-600"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {/* Basic Info Tab */}
                {activeTab === "basic" && (
                  <div className="space-y-6">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="e.g., Atlantic Salmon"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="e.g., SAL-ATL-001"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Slug
                        </label>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="auto-generated-from-name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Product Type
                        </label>
                        <select
                          value={formData.productType}
                          onChange={(e) => setFormData({ ...formData, productType: e.target.value as ProductType })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          {productTypeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Seafood Type
                        </label>
                        <select
                          value={formData.seafoodType}
                          onChange={(e) => setFormData({ ...formData, seafoodType: e.target.value as SeafoodType })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          {seafoodTypeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Species Name (Scientific)
                        </label>
                        <input
                          type="text"
                          value={formData.speciesName}
                          onChange={(e) => setFormData({ ...formData, speciesName: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="e.g., Salmo salar"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Local Name
                        </label>
                        <input
                          type="text"
                          value={formData.localName}
                          onChange={(e) => setFormData({ ...formData, localName: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="e.g., Bangus, Tilapia"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="">Select a category</option>
                        {categories?.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="Brief product description"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Full Description
                      </label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="Detailed product description..."
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="premium, wild-caught, sustainable (comma-separated)"
                      />
                    </div>

                    {/* Image Upload Placeholder */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Product Images
                      </label>
                      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-teal-400">
                        <div className="text-center">
                          <ImagePlus className="mx-auto h-10 w-10 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            Click or drag images to upload
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG up to 5MB each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Tab */}
                {activeTab === "pricing" && (
                  <div className="space-y-6">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Selling Price (₱) *
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Compare at Price (₱)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.compareAtPrice}
                        onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="Original price for discounts"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Set a higher price to show a discount
                      </p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Cost per Item (₱)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costPerItem}
                        onChange={(e) => setFormData({ ...formData, costPerItem: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="Your cost (for profit calculations)"
                      />
                    </div>

                    {formData.price && formData.costPerItem && (
                      <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm font-medium text-gray-700">Profit Margin</p>
                        <p className="text-2xl font-bold text-teal-600">
                          ₱{(parseFloat(formData.price) - parseFloat(formData.costPerItem)).toFixed(2)}
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            ({(((parseFloat(formData.price) - parseFloat(formData.costPerItem)) / parseFloat(formData.price)) * 100).toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Inventory Tab */}
                {activeTab === "inventory" && (
                  <div className="space-y-6">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Stock Type
                      </label>
                      <select
                        value={formData.stockType}
                        onChange={(e) => setFormData({ ...formData, stockType: e.target.value as StockType })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        {stockTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          step="0.001"
                          min="0"
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Stock Unit
                        </label>
                        <select
                          value={formData.stockUnit}
                          onChange={(e) => setFormData({ ...formData, stockUnit: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          {stockUnitOptions.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Min Order Qty
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.minOrderQty}
                          onChange={(e) => setFormData({ ...formData, minOrderQty: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Max Order Qty
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.maxOrderQty}
                          onChange={(e) => setFormData({ ...formData, maxOrderQty: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="No limit"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Weight per Unit (kg)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={formData.weightKg}
                        onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="For shipping calculations"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Shelf Life (days)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.shelfLifeDays}
                        onChange={(e) => setFormData({ ...formData, shelfLifeDays: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="Product freshness duration"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="requiresColdChain"
                        checked={formData.requiresColdChain}
                        onChange={(e) => setFormData({ ...formData, requiresColdChain: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor="requiresColdChain" className="text-sm text-gray-700">
                        Requires cold chain (temperature-controlled shipping)
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="featured"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <label htmlFor="featured" className="text-sm text-gray-700">
                            Featured product
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Variants Tab */}
                {activeTab === "variants" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Product Variants</h3>
                        <p className="text-sm text-gray-500">
                          Add variants like different sizes or preparations
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="flex items-center gap-2 rounded-lg bg-teal-100 px-3 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-200"
                      >
                        <Plus className="h-4 w-4" />
                        Add Variant
                      </button>
                    </div>

                    {formData.variants.length === 0 ? (
                      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                        <Package className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          No variants yet. Add variants for different sizes or preparations.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.variants.map((variant, index) => (
                          <div
                            key={variant.id}
                            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                          >
                            <div className="mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-gray-700">
                                  Variant {index + 1}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(index)}
                                className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                  Variant Name *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={variant.name}
                                  onChange={(e) => handleUpdateVariant(index, "name", e.target.value)}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  placeholder="e.g., Whole (2-3kg)"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                  SKU *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={variant.sku}
                                  onChange={(e) => handleUpdateVariant(index, "sku", e.target.value)}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  placeholder="e.g., SAL-ATL-001-WH"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                  Price (₱)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={variant.price || ""}
                                  onChange={(e) => handleUpdateVariant(index, "price", parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                  Weight (kg)
                                </label>
                                <input
                                  type="number"
                                  step="0.001"
                                  min="0"
                                  value={variant.weightValue || ""}
                                  onChange={(e) => handleUpdateVariant(index, "weightValue", parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  placeholder="0.000"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                  Stock Qty
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={variant.stockQuantity || ""}
                                  onChange={(e) => handleUpdateVariant(index, "stockQuantity", parseInt(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                  Low Stock Alert
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={variant.lowStockThreshold || ""}
                                  onChange={(e) => handleUpdateVariant(index, "lowStockThreshold", parseInt(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  placeholder="10"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={isSubmitting}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingProductId ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
              <button
                onClick={handleCloseView}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Product Content */}
            <div className="p-6">
              {/* Product Header */}
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-teal-100">
                  <Fish className="h-10 w-10 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-gray-900">{viewingProduct.name}</h3>
                    {viewingProduct.featured && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-gray-500">
                    {viewingProduct.category.name}
                    {viewingProduct.localName && ` • ${viewingProduct.localName}`}
                  </p>
                  <div className="mt-2">{getStatusBadge(viewingProduct.status)}</div>
                </div>
              </div>

              {/* Description */}
              {viewingProduct.shortDescription && (
                <div className="mb-6">
                  <p className="text-gray-700">{viewingProduct.shortDescription}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">SKU</p>
                  <p className="mt-1 font-semibold text-gray-900">{viewingProduct.sku ?? "—"}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Slug</p>
                  <p className="mt-1 font-semibold text-gray-900">{viewingProduct.slug}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Product Type</p>
                  <p className="mt-1 font-semibold text-gray-900">{viewingProduct.productType}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Seafood Type</p>
                  <p className="mt-1 font-semibold text-gray-900">{viewingProduct.seafoodType}</p>
                </div>
              </div>

              {/* Species Info */}
              {(viewingProduct.speciesName !== null || viewingProduct.localName !== null) && (
                <div className="mb-6">
                  <h4 className="mb-3 font-semibold text-gray-900">Species Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {viewingProduct.speciesName && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Scientific Name</p>
                        <p className="mt-1 font-semibold text-gray-900 italic">{viewingProduct.speciesName}</p>
                      </div>
                    )}
                    {viewingProduct.localName && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Local Name</p>
                        <p className="mt-1 font-semibold text-gray-900">{viewingProduct.localName}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing Section */}
              <div className="mb-6">
                <h4 className="mb-3 font-semibold text-gray-900">Pricing</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-teal-600">Selling Price</p>
                    <p className="mt-1 text-xl font-bold text-teal-700">₱{Number(viewingProduct.price).toLocaleString()}</p>
                    <p className="text-xs text-teal-600">per {viewingProduct.stockUnit}</p>
                  </div>
                  {viewingProduct.compareAtPrice && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Compare At</p>
                      <p className="mt-1 text-xl font-bold text-gray-400 line-through">₱{Number(viewingProduct.compareAtPrice).toLocaleString()}</p>
                    </div>
                  )}
                  {viewingProduct.costPerItem && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Cost</p>
                      <p className="mt-1 text-xl font-bold text-gray-700">₱{Number(viewingProduct.costPerItem).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Inventory Section */}
              <div className="mb-6">
                <h4 className="mb-3 font-semibold text-gray-900">Inventory</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-lg border p-4 ${Number(viewingProduct.stockQuantity) < 10 ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-gray-50"}`}>
                    <p className={`text-xs font-medium uppercase tracking-wide ${Number(viewingProduct.stockQuantity) < 10 ? "text-orange-600" : "text-gray-500"}`}>Stock Quantity</p>
                    <p className={`mt-1 text-xl font-bold ${Number(viewingProduct.stockQuantity) < 10 ? "text-orange-600" : "text-gray-900"}`}>
                      {Number(viewingProduct.stockQuantity)} {viewingProduct.stockUnit}
                    </p>
                    {Number(viewingProduct.stockQuantity) < 10 && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-orange-600">
                        <AlertTriangle className="h-3 w-3" />
                        Low stock warning
                      </p>
                    )}
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Stock Type</p>
                    <p className="mt-1 font-semibold text-gray-900">{viewingProduct.stockType === "WEIGHT" ? "Weight-based" : "Unit-based"}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Min Order</p>
                    <p className="mt-1 font-semibold text-gray-900">{Number(viewingProduct.minOrderQty)} {viewingProduct.stockUnit}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Max Order</p>
                    <p className="mt-1 font-semibold text-gray-900">{viewingProduct.maxOrderQty ? `${Number(viewingProduct.maxOrderQty)} ${viewingProduct.stockUnit}` : "No limit"}</p>
                  </div>
                </div>
              </div>

              {/* Shipping & Cold Chain */}
              <div className="mb-6">
                <h4 className="mb-3 font-semibold text-gray-900">Shipping & Storage</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Weight</p>
                    <p className="mt-1 font-semibold text-gray-900">{Number(viewingProduct.weightKg)} kg</p>
                  </div>
                  <div className={`rounded-lg border p-4 ${viewingProduct.requiresColdChain ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"}`}>
                    <p className={`text-xs font-medium uppercase tracking-wide ${viewingProduct.requiresColdChain ? "text-blue-600" : "text-gray-500"}`}>Cold Chain</p>
                    <p className={`mt-1 font-semibold ${viewingProduct.requiresColdChain ? "text-blue-700" : "text-gray-900"}`}>
                      {viewingProduct.requiresColdChain ? "Required" : "Not Required"}
                    </p>
                  </div>
                  {viewingProduct.shelfLifeDays && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Shelf Life</p>
                      <p className="mt-1 font-semibold text-gray-900">{viewingProduct.shelfLifeDays} days</p>
                    </div>
                  )}
                  {viewingProduct.bestBefore && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Best Before</p>
                      <p className="mt-1 font-semibold text-gray-900">{new Date(viewingProduct.bestBefore).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Variants Section */}
              {viewingProduct.variants.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 font-semibold text-gray-900">Variants ({viewingProduct.variants.length})</h4>
                  <div className="space-y-3">
                    {viewingProduct.variants.map((variant) => (
                      <div key={variant.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div>
                          <p className="font-medium text-gray-900">{variant.name}</p>
                          <p className="text-sm text-gray-500">SKU: {variant.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₱{Number(variant.price).toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{variant.stockQuantity} in stock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {viewingProduct.tags.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 font-semibold text-gray-900">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingProduct.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {viewingProduct.description && (
                <div className="mb-6">
                  <h4 className="mb-3 font-semibold text-gray-900">Full Description</h4>
                  <p className="text-gray-700">{viewingProduct.description}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t border-gray-200 pt-4 text-sm text-gray-500">
                <p>Created: {new Date(viewingProduct.createdAt).toLocaleDateString()}</p>
                <p>Last updated: {new Date(viewingProduct.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                onClick={handleCloseView}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleCloseView();
                  handleOpenForm(viewingProduct.id);
                }}
                className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            {/* Alert Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete <span className="font-medium text-gray-900">{deleteConfirmProduct.name}</span>? This action cannot be undone.
              </p>
            </div>

            {/* Product Preview */}
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                <Fish className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{deleteConfirmProduct.name}</p>
                <p className="text-sm text-gray-500">
                  {deleteConfirmProduct.sku ?? "No SKU"} • {deleteConfirmProduct.category.name}
                </p>
              </div>
            </div>

            {/* Error Display */}
            {deleteProduct.error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {deleteProduct.error.message}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleteProduct.isPending}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteProduct.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleteProduct.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 flex items-center justify-center gap-6 border-t border-gray-200 pt-6 text-sm text-gray-500">
        <a href="#" className="hover:text-gray-700">
          Product Guidelines
        </a>
        <a href="#" className="hover:text-gray-700">
          Bulk Upload
        </a>
        <a href="#" className="hover:text-gray-700">
          Support
        </a>
        <span className="text-gray-400">
          © 2024 SeaMarket. Empowering Producers.
        </span>
      </footer>
    </div>
  );
}
