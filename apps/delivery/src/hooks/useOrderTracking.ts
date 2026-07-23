import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { Order } from "@restaurant/shared";
import { API_BASE_URL } from "../config";
import { useAuth } from "../context/AuthContext";

export function useOrderTracking(orderId: string) {
  const { api } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let socket: Socket | null = null;
    let cancelled = false;

    (async () => {
      try {
        const initial = await api.getOrder(orderId);
        if (!cancelled) setOrder(initial);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load order");
      }
    })();

    socket = io(API_BASE_URL, { transports: ["websocket"] });
    socket.on("connect", () => {
      socket?.emit("subscribe:order", orderId);
    });
    socket.on("order:updated", (updated: Order) => {
      if (updated.id === orderId) setOrder(updated);
    });

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [orderId, api]);

  return { order, error, setOrder };
}
