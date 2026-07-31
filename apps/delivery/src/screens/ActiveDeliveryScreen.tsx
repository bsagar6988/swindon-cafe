import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppHeader, formatGBP, formatUKDateTime, theme } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import { useOrderTracking } from "../hooks/useOrderTracking";
import { StatusStepper } from "../components/StatusStepper";
import { RouteProgress } from "../components/RouteProgress";
import { Button } from "../components/Button";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ActiveDelivery">;

// Seeded delivery address is around (39.78, -89.65). There's no Google Maps
// API key configured yet, so we can't do real GPS/map tracking here (same
// constraint noted in RouteProgress.tsx) — these buttons are a manual
// stand-in that nudges a point near that seed location instead.
const BASE_LAT = 39.78;
const BASE_LNG = -89.65;

function nudge(base: number, amount: number) {
  return base + (Math.random() - 0.5) * amount;
}

export function ActiveDeliveryScreen({ route }: Props) {
  const { api } = useAuth();
  const { order, error, setOrder } = useOrderTracking(route.params.orderId);
  const [marking, setMarking] = useState(false);
  const [sendingLocation, setSendingLocation] = useState(false);
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const onMarkDelivered = async () => {
    if (!order) return;
    setActionError(null);
    setMarking(true);
    try {
      const updated = await api.updateOrderStatus(order.id, "DELIVERED");
      setOrder(updated);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to mark delivered");
    } finally {
      setMarking(false);
    }
  };

  const sendLocation = async (kind: "en-route" | "arrived") => {
    if (!order) return;
    setActionError(null);
    setSendingLocation(true);
    try {
      const lat = kind === "en-route" ? nudge(BASE_LAT, 0.02) : BASE_LAT + 0.0015;
      const lng = kind === "en-route" ? nudge(BASE_LNG, 0.02) : BASE_LNG + 0.0015;
      await api.updateRiderLocation(order.id, lat, lng);
      setLastLocation({ lat, lng });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to update location");
    } finally {
      setSendingLocation(false);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Delivery" />
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Delivery" />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </View>
    );
  }

  const isActive = order.status === "OUT_FOR_DELIVERY";

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing(5) }}>
      <AppHeader subtitle="Delivery" />
      <Text style={styles.orderNumber}>Order #{order.id.slice(-6).toUpperCase()}</Text>
      <Text style={styles.restaurantName}>{order.restaurantName}</Text>
      <Text style={styles.placedTime}>Placed {formatUKDateTime(order.createdAt)} UK</Text>
      <RouteProgress status={order.status} />

      <Text style={styles.customerNote}>Customer: {order.customerName}</Text>

      <View style={styles.stepperCard}>
        <StatusStepper status={order.status} events={order.statusEvents} />
      </View>

      <Text style={styles.sectionTitle}>Items</Text>
      {order.items.map((i) => (
        <View key={i.id} style={styles.itemRow}>
          <Text style={styles.itemName}>
            {i.quantity} × {i.name}
          </Text>
          <Text style={styles.itemPrice}>{formatGBP(i.priceCents * i.quantity)}</Text>
        </View>
      ))}
      <View style={styles.itemRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatGBP(order.totalCents)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Deliver to</Text>
      <Text style={styles.address}>
        {order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
        {order.deliveryAddress.postalCode}
      </Text>

      {isActive && (
        <>
          <Text style={styles.sectionTitle}>Update location</Text>
          <Text style={styles.hint}>
            No Google Maps API key is configured yet, so there's no live GPS/map here — these
            buttons send a manual stand-in position near the delivery address (same constraint
            as the customer app's route view).
          </Text>
          <View style={styles.locationRow}>
            <Button
              title="Update location (en route)"
              variant="outline"
              onPress={() => sendLocation("en-route")}
              loading={sendingLocation}
              style={styles.locationButton}
            />
            <Button
              title="Update location (arrived)"
              variant="outline"
              onPress={() => sendLocation("arrived")}
              loading={sendingLocation}
              style={styles.locationButton}
            />
          </View>
          {lastLocation && (
            <Text style={styles.hint}>
              Last sent: {lastLocation.lat.toFixed(4)}, {lastLocation.lng.toFixed(4)}
            </Text>
          )}

          {actionError && <Text style={styles.error}>{actionError}</Text>}

          <Button
            title="Mark delivered"
            onPress={onMarkDelivered}
            loading={marking}
            style={styles.markButton}
          />
        </>
      )}

      {order.status === "DELIVERED" && (
        <Text style={styles.deliveredNote}>This order has been delivered.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: theme.colors.danger, marginTop: theme.spacing(2) },
  orderNumber: { fontSize: 20, fontWeight: "800", color: theme.colors.text },
  restaurantName: { fontSize: 14, color: theme.colors.primary, fontWeight: "700", marginTop: 4 },
  placedTime: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  customerNote: {
    textAlign: "center",
    color: theme.colors.text,
    fontWeight: "600",
    marginTop: theme.spacing(2),
  },
  stepperCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2),
  },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: theme.spacing(2) },
  itemName: { color: theme.colors.text },
  itemPrice: { color: theme.colors.textMuted, fontWeight: "600" },
  totalLabel: { fontWeight: "800", color: theme.colors.text },
  totalValue: { fontWeight: "800", color: theme.colors.primary },
  address: { color: theme.colors.textMuted },
  hint: { fontSize: 12, color: theme.colors.textMuted, marginBottom: theme.spacing(3) },
  locationRow: { flexDirection: "row", gap: theme.spacing(2), flexWrap: "wrap" },
  locationButton: { flexGrow: 1 },
  markButton: { marginTop: theme.spacing(5) },
  deliveredNote: {
    marginTop: theme.spacing(5),
    textAlign: "center",
    color: theme.colors.secondary,
    fontWeight: "700",
  },
});
