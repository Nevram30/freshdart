import type { Decimal } from "@prisma/client/runtime/library";

// Product types
export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

export type StockType = "WEIGHT" | "UNIT";
export type ProductStatus = "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number | Decimal;
  compareAtPrice: number | Decimal | null;
  stockType: StockType;
  stockQuantity: number | Decimal;
  stockUnit: string;
  minOrderQty: number | Decimal;
  maxOrderQty: number | Decimal | null;
  weightKg: number | Decimal;
  bestBefore: Date | null;
  shelfLifeDays: number | null;
  images: ProductImage[];
  category: Category;
  categoryId: string;
  status: ProductStatus;
  featured: boolean;
  tags: string[];
}

// Cart types
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// Checkout types
export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface DeliveryInfo {
  date: Date;
  timeSlot: string;
  notes?: string;
}

// Freshness indicator types
export type FreshnessLevel = "fresh" | "good" | "expiring-soon" | "expired";

export function getFreshnessLevel(daysUntilExpiry: number | null): FreshnessLevel {
  if (daysUntilExpiry === null) return "fresh";
  if (daysUntilExpiry <= 0) return "expired";
  if (daysUntilExpiry <= 2) return "expiring-soon";
  if (daysUntilExpiry <= 5) return "good";
  return "fresh";
}

export function getFreshnessInfo(level: FreshnessLevel): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (level) {
    case "fresh":
      return {
        label: "Fresh",
        color: "text-green-700",
        bgColor: "bg-green-50 border-green-200",
      };
    case "good":
      return {
        label: "Good",
        color: "text-emerald-700",
        bgColor: "bg-emerald-50 border-emerald-200",
      };
    case "expiring-soon":
      return {
        label: "Use Soon",
        color: "text-amber-700",
        bgColor: "bg-amber-50 border-amber-200",
      };
    case "expired":
      return {
        label: "Expired",
        color: "text-red-700",
        bgColor: "bg-red-50 border-red-200",
      };
  }
}
