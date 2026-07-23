import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { Order } from "@restaurant/shared";
import { API_BASE_URL } from "../config";
import { useAuth } from "../context/AuthContext";

/**
 * Loads currently-available (READY_FOR_PICKUP, unassigned) deliveries and
 * keeps the list live by joining the "deliveries" broadcast room over
 * Socket.io and refetching whenever any order changes — simplest way to
 * stay correct without trying to reconstruct diffs client-side.
 */
export function useAvailableDeliveries() {
  const { api } = useAuth();
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await api.listAvailableDeliveries();
      setDeliveries(list);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    let cancelled = false;
    load();

    const socket: Socket = io(API_BASE_URL, { transports: ["websocket"] });
    socket.on("connect", () => {
      socket.emit("subscribe:deliveries");
    });
    socket.on("order:updated", () => {
      if (!cancelled) load();
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, [load]);

  return { deliveries, loading, error, reload: load };
}
