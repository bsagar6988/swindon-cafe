import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme, type Order } from "@restaurant/shared";
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

export function OrderHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { api } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.listOrders();
      setOrders(list);
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
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No orders yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: theme.spacing(5) }}
      data={orders}
      keyExtractor={(o) => o.id}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate("OrderTracking", { orderId: item.id })}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.orderNumber}>Order #{item.id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.itemsSummary}>
              {item.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.status}>{STATUS_LABEL[item.status] ?? item.status}</Text>
            <Text style={styles.total}>${(item.totalCents / 100).toFixed(2)}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 16, color: theme.colors.textMuted },
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
  itemsSummary: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4, maxWidth: 220 },
  status: { fontWeight: "700", color: theme.colors.secondary, fontSize: 13 },
  total: { color: theme.colors.text, marginTop: 4, fontWeight: "600" },
});
