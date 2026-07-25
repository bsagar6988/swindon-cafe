import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppHeader, formatGBP, formatUKDateTime, theme, type Order } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/types";

const STATUS_LABEL: Record<string, string> = {
  PLACED: "Placed",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for pickup",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function DeliveryHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { api } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.listOrders();
      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sorted);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Delivery history" />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Delivery history" />
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No deliveries yet</Text>
          <Text style={styles.emptySubtitle}>Accepted and completed deliveries will show up here.</Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: theme.spacing(5) }}
      data={orders}
      keyExtractor={(o) => o.id}
      ListHeaderComponent={<AppHeader subtitle="Delivery history" />}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate("ActiveDelivery", { orderId: item.id })}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.orderNumber}>Order #{item.id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.placedTime}>{formatUKDateTime(item.createdAt)} UK</Text>
            <Text style={styles.customer}>{item.customerName}</Text>
            <Text style={styles.itemsSummary}>
              {item.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={[
                styles.status,
                item.status === "DELIVERED" && styles.statusDelivered,
                item.status === "OUT_FOR_DELIVERY" && styles.statusActive,
              ]}
            >
              {STATUS_LABEL[item.status] ?? item.status}
            </Text>
            <Text style={styles.total}>{formatGBP(item.totalCents)}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing(6) },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.text, textAlign: "center" },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: theme.spacing(2),
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
  },
  orderNumber: { fontWeight: "700", color: theme.colors.text },
  placedTime: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  customer: { fontSize: 12, color: theme.colors.text, marginTop: 2, fontWeight: "600" },
  itemsSummary: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4, maxWidth: 220 },
  status: { fontWeight: "700", color: theme.colors.textMuted, fontSize: 13 },
  statusActive: { color: theme.colors.primary },
  statusDelivered: { color: theme.colors.secondary },
  total: { color: theme.colors.text, marginTop: 4, fontWeight: "600" },
});
