import React, { createContext, useContext, useMemo, useState } from "react";
import type { MenuItem } from "@restaurant/shared";

export interface CartLine {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

interface CartContextValue {
  lines: CartLine[];
  // The restaurant the current cart's items belong to (null when empty).
  // Callers are expected to confirm with the user and call clear() first if
  // they're about to add an item from a different restaurant — see
  // ItemDetailScreen's "switch restaurants?" prompt.
  restaurantId: string | null;
  addItem: (item: MenuItem, restaurantId: string) => void;
  decrementItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  setNotes: (itemId: string, notes: string) => void;
  clear: () => void;
  subtotalCents: number;
  totalQuantity: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const addItem = (item: MenuItem, itemRestaurantId: string) => {
    setRestaurantId((prev) => prev ?? itemRestaurantId);
    setLines((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        return prev.map((l) =>
          l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const decrementItem = (itemId: string) => {
    setLines((prev) => {
      const next = prev
        .map((l) => (l.item.id === itemId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0);
      if (next.length === 0) setRestaurantId(null);
      return next;
    });
  };

  const removeItem = (itemId: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.item.id !== itemId);
      if (next.length === 0) setRestaurantId(null);
      return next;
    });
  };

  const setNotes = (itemId: string, notes: string) => {
    setLines((prev) =>
      prev.map((l) => (l.item.id === itemId ? { ...l, notes } : l))
    );
  };

  const clear = () => {
    setLines([]);
    setRestaurantId(null);
  };

  const subtotalCents = useMemo(
    () => lines.reduce((sum, l) => sum + l.item.priceCents * l.quantity, 0),
    [lines]
  );
  const totalQuantity = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );

  const value = useMemo(
    () => ({
      lines,
      restaurantId,
      addItem,
      decrementItem,
      removeItem,
      setNotes,
      clear,
      subtotalCents,
      totalQuantity,
    }),
    [lines, restaurantId, subtotalCents, totalQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
