import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import type { Order, OrderStatus } from "@restaurant/shared";
import { API_BASE_URL } from "../config";
import { useAuth } from "./AuthContext";

interface OrdersContextValue {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  getById: (id: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { api, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const upsert = useCallback((incoming: Order) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === incoming.id);
      if (idx === -1) return [incoming, ...prev];
      const next = prev.slice();
      next[idx] = incoming;
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listOrders();
      setOrders(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!user) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(API_BASE_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("subscribe:restaurant");
    });
    socket.on("order:created", (order: Order) => upsert(order));
    socket.on("order:updated", (order: Order) => upsert(order));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, upsert]);

  const updateStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      const updated = await api.updateOrderStatus(id, status);
      upsert(updated);
    },
    [api, upsert]
  );

  const getById = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  const value = useMemo(
    () => ({ orders, loading, error, refresh, updateStatus, getById }),
    [orders, loading, error, refresh, updateStatus, getById]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
