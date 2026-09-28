import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string | number;
  product_id: string | number;
  name: string;
  slug: string;
  price: number;
  thumbnail: string;
  gender?: string;
  availability?: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string | number) => void;
  hasItem: (productId: string | number) => boolean;
  toggleItem: (item: WishlistItem) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items;
        if (!currentItems.some((i) => i.product_id === item.product_id)) {
          set({ items: [...currentItems, item] });
        }
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((i) => i.product_id !== productId),
        });
      },
      hasItem: (productId) => {
        return get().items.some((i) => i.product_id === productId);
      },
      toggleItem: (item) => {
        if (get().hasItem(item.product_id)) {
          get().removeItem(item.product_id);
        } else {
          get().addItem(item);
        }
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "dripego-wishlist-storage",
    }
  )
);
