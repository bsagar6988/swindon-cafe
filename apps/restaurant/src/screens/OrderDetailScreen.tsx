import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme, type Order, type OrderStatus } from "@restaurant/shared";
import { useOrders } from "../context/OrdersContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { actionsFor, STATUS_COLOR, STATUS_LABEL } from "../statusActions";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "OrderDetail">;

export function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const { api } = useAuth();
  const { getById, updateStatus } = useOrders();
  const contextOrder = getById(orderId);
  const [fallbackOrder, setFallbackOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerOrderCount, setCustomerOrderCount] = useState<number | null>(null);

  const order = contextOrder ?? fallbackOrder;

  useEffect(() => {
    if (contextOrder) return;
    api
      .getOrder(orderId)
      .then(setFallbackOrder)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load order"));
  }, [contextOrder, orderId, api]);

  // customerOrderCount is only present on the single-order fetch, never on the
  // cached list data in OrdersContext — so fetch it here regardless of whether
  // contextOrder already satisfies the rest of the screen.
  useEffect(() => {
    let cancelled = false;
    setCustomerOrderCount(null);
    api
      .getOrder(orderId)
      .then((o) => {
        if (!cancelled) setCustomerOrderCount(o.customerOrderCount ?? null);
      })
      .catch(() => {
        // non-fatal: leave the count unknown rather than blocking the screen
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, api]);

  if (!order) {
    return (
      <View style={styles.center}>
        {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator color={theme.colors.primary} size="large" />}
      </View>
    );
  }

  const actions = actionsFor(order.status);

  const onAction = async (next: OrderStatus) => {
    setBusy(true);
    setError(null);
    try {
      await updateStatus(order.id, next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing(5) }}>
      <Text style={styles.orderNumber}>Order #{order.id.slice(-6).toUpperCase()}</Text>
      <Text style={[styles.statusBadge, { color: STATUS_COLOR[order.status] }]}>
        {STATUS_LABEL[order.status]}
      </Text>

      <Text style={styles.sectionTitle}>Customer</Text>
      <Text style={styles.value}>
        {order.customerName}
        {customerOrderCount !== null &&
          ` · ${customerOrderCount} order${customerOrderCount === 1 ? "" : "s"} placed`}
      </Text>

      <Text style={styles.sectionTitle}>Delivery address</Text>
      <Text style={styles.value}>
        {order.deliveryAddress.line1}
        {order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ""}, {order.deliveryAddress.city},{" "}
        {order.deliveryAddress.state} {order.deliveryAddress.postalCode}
      </Text>

      <Text style={styles.sectionTitle}>Items</Text>
      {order.items.map((i) => (
        <View key={i.id} style={styles.itemRow}>
          <Text style={styles.itemName}>
            {i.quantity} × {i.name}
          </Text>
          <Text style={styles.itemPrice}>${((i.priceCents * i.quantity) / 100).toFixed(2)}</Text>
        </View>
      ))}

      <View style={styles.itemRow}>
        <Text style={styles.totalLabelSmall}>Subtotal</Text>
        <Text style={styles.itemPrice}>${(order.subtotalCents / 100).toFixed(2)}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.totalLabelSmall}>Delivery fee</Text>
        <Text style={styles.itemPrice}>${(order.deliveryFeeCents / 100).toFixed(2)}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${(order.totalCents / 100).toFixed(2)}</Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {actions.length > 0 && (
        <View style={styles.actionsRow}>
          {actions.map((a) => (
            <Button
              key={a.next}
              title={a.label}
              variant={a.variant}
              loading={busy}
              onPress={() => onAction(a.next)}
              style={styles.actionButton}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing(6) },
  error: { color: theme.colors.danger, marginTop: theme.spacing(3) },
  orderNumber: { fontSize: 20, fontWeight: "800", color: theme.colors.text },
  statusBadge: { fontSize: 15, fontWeight: "700", marginTop: theme.spacing(1) },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2),
  },
  value: { color: theme.colors.text, fontSize: 15 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: theme.spacing(2) },
  itemName: { color: theme.colors.text },
  itemPrice: { color: theme.colors.textMuted, fontWeight: "600" },
  totalLabelSmall: { color: theme.colors.textMuted },
  totalLabel: { fontWeight: "800", color: theme.colors.text },
  totalValue: { fontWeight: "800", color: theme.colors.primary },
  actionsRow: { flexDirection: "row", marginTop: theme.spacing(6), gap: theme.spacing(2) },
  actionButton: { flex: 1 },
});
