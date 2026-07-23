import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme } from "@restaurant/shared";
import { useOrderTracking } from "../hooks/useOrderTracking";
import { StatusStepper } from "../components/StatusStepper";
import { RouteProgress } from "../components/RouteProgress";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "OrderTracking">;

export function OrderTrackingScreen({ route }: Props) {
  const { order, error } = useOrderTracking(route.params.orderId);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing(5) }}>
      <Text style={styles.orderNumber}>Order #{order.id.slice(-6).toUpperCase()}</Text>
      <RouteProgress status={order.status} />

      {order.assignment && order.status === "OUT_FOR_DELIVERY" && (
        <Text style={styles.riderNote}>Your rider {order.assignment.riderName} is on the way.</Text>
      )}
      {order.assignment && order.status === "DELIVERED" && (
        <Text style={styles.riderNote}>Delivered by {order.assignment.riderName}.</Text>
      )}

      <View style={styles.stepperCard}>
        <StatusStepper status={order.status} />
      </View>

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
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${(order.totalCents / 100).toFixed(2)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Delivering to</Text>
      <Text style={styles.address}>
        {order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
        {order.deliveryAddress.postalCode}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: theme.colors.danger },
  orderNumber: { fontSize: 20, fontWeight: "800", color: theme.colors.text },
  riderNote: {
    textAlign: "center",
    color: theme.colors.secondary,
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
});
