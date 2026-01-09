import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product, CartItem } from "~/types";
import { calculateShippingCost } from "~/lib/shipping";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed values (implemented as functions)
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotalWeight: () => number;
  getShippingCost: (type?: "standard" | "express") => {
    cost: number;
    estimatedDays: number;
    rateName: string;
  };
  getTotal: (shippingType?: "standard" | "express") => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === product.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { productId: product.id, product, quantity }],
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

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getItemCount: () => {
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

      getShippingCost: (type = "standard") => {
        const totalWeight = get().getTotalWeight();
        return calculateShippingCost(totalWeight, type);
      },

      getTotal: (shippingType = "standard") => {
        const subtotal = get().getSubtotal();
        const { cost: shippingCost } = get().getShippingCost(shippingType);
        return subtotal + shippingCost;
      },
    }),
    {
      name: "freshdart-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
