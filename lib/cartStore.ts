import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string | number;
  product_id: string | number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  thumbnail: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string | number, size: string, color: string) => void;
  updateQuantity: (productId: string | number, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  lastAddedItem: CartItem | null;
  setLastAddedItem: (item: CartItem | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      lastAddedItem: null,
      setLastAddedItem: (lastAddedItem) => set({ lastAddedItem }),
      
      addItem: (item, quantity = 1) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (i) => i.product_id === item.product_id && i.size === item.size && i.color === item.color
        );

        let finalItem: CartItem;
        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += quantity;
          finalItem = updatedItems[existingItemIndex];
          set({ items: updatedItems, lastAddedItem: finalItem });
        } else {
          finalItem = { ...item, quantity };
          set({
            items: [
              ...currentItems,
              finalItem,
            ],
            lastAddedItem: finalItem,
          });
        }
      },

      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (i) => !(i.product_id === productId && i.size === size && i.color === color)
          ),
        });
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.product_id === productId && i.size === size && i.color === color
              ? { ...i, quantity }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getCartSubtotal: () => {
        return get().items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
      },
    }),
    {
      name: "dripego-cart-storage",
      // Exclude lastAddedItem and isOpen from storage so reloading page doesn't pop up old toast/drawer
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
