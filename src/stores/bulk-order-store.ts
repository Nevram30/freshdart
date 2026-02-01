import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Type for numeric values that could be Prisma Decimal, number, or string
type NumericValue = number | string | { toString(): string };

// Sourcing product type matching the API response (flexible to handle Prisma Decimal)
export interface SourcingProduct {
  id: string;
  name: string;
  localName: string | null;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: NumericValue;
  compareAtPrice: NumericValue | null;
  stockQuantity: NumericValue;
  stockUnit: string;
  minOrderQty: NumericValue;
  maxOrderQty: NumericValue | null;
  weightKg: NumericValue;
  productType: string;
  seafoodType: string;
  requiresColdChain: boolean;
  shelfLifeDays: number | null;
  featured: boolean;
  speciesName: string | null;
  tags: string[];
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    isPrimary: boolean;
  }>;
  category: {
    id: string;
    name: string;
    slug: string;
    [key: string]: unknown; // Allow additional fields from Prisma
  } | null;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: NumericValue;
    stockQuantity: number;
    weightValue: NumericValue;
    [key: string]: unknown; // Allow additional fields from Prisma
  }>;
  [key: string]: unknown; // Allow additional fields from Prisma
}

export interface BulkOrderItem {
  productId: string;
  product: SourcingProduct;
  quantity: number;
  variantId?: string;
}

interface BulkOrderStore {
  items: BulkOrderItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: SourcingProduct, quantity: number, variantId?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearOrder: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Computed values
  getItemCount: () => number;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalWeight: () => number;
}

export const useBulkOrderStore = create<BulkOrderStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity, variantId) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === product.id && item.variantId === variantId
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id && item.variantId === variantId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { productId: product.id, product, quantity, variantId }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearOrder: () => {
        set({ items: [] });
      },

      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),

      getItemCount: () => {
        return get().items.length;
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price =
            typeof item.product.price === "number"
              ? item.product.price
              : parseFloat(item.product.price.toString());
          return total + price * item.quantity;
        }, 0);
      },

      getTotalWeight: () => {
        return get().items.reduce((total, item) => {
          const weight =
            typeof item.product.weightKg === "number"
              ? item.product.weightKg
              : parseFloat(item.product.weightKg.toString());
          return total + weight * item.quantity;
        }, 0);
      },
    }),
    {
      name: "freshdart-bulk-order",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
