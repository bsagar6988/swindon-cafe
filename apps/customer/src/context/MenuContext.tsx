import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { MenuCategory, MenuItem } from "@restaurant/shared";
import { useAuth } from "./AuthContext";

interface MenuContextValue {
  categories: MenuCategory[];
  items: MenuItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const { api } = useAuth();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const menu = await api.getMenu();
      setCategories(menu.categories);
      setItems(menu.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ categories, items, loading, error, refresh }),
    [categories, items, loading, error]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
}
