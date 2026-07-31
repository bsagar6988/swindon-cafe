import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppHeader, formatGBP, formatUKDateTime, theme, type Order } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Button } from "../components/Button";
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
  const { restaurantId: cartRestaurantId, addItem, clear } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState<string | null>(null);

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

  const orderAgain = async (order: Order) => {
    if (cartRestaurantId && cartRestaurantId !== order.restaurantId) {
      const message = `Your cart has items from another restaurant. Start a new order from ${order.restaurantName} and clear it?`;
      const confirmed =
        Platform.OS === "web" ? window.confirm(message) : await confirmNative(message);
      if (!confirmed) return;
      clear();
    }

    setReordering(order.id);
    try {
      const menu = await api.getMenu(order.restaurantId);
      let addedCount = 0;
      const skippedNames: string[] = [];

      for (const orderItem of order.items) {
        const menuItem = menu.items.find((m) => m.id === orderItem.menuItemId);
        if (!menuItem || !menuItem.isAvailable) {
          skippedNames.push(orderItem.name);
          continue;
        }
        for (let i = 0; i < orderItem.quantity; i++) {
          addItem(menuItem, order.restaurantId);
        }
        addedCount += 1;
      }

      if (skippedNames.length > 0) {
        const message = `Added ${addedCount} of ${order.items.length} items — ${skippedNames.join(
          ", "
        )} ${skippedNames.length === 1 ? "is" : "are"} no longer available`;
        if (Platform.OS === "web") {
          window.alert(message);
        } else {
          Alert.alert("Some items were skipped", message);
        }
      }

      navigation.navigate("MainTabs", { screen: "CartTab" });
    } finally {
      setReordering(null);
    }
  };

  const confirmNative = (message: string) =>
    new Promise<boolean>((resolve) => {
      Alert.alert("Start a new order?", message, [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        { text: "Clear cart", style: "destructive", onPress: () => resolve(true) },
      ]);
    });

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Order history" />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Order history" />
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No orders yet</Text>
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
      ListHeaderComponent={<AppHeader subtitle="Order history" />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Pressable
            style={styles.cardMain}
            onPress={() => navigation.navigate("OrderTracking", { orderId: item.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.orderNumber}>Order #{item.id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.restaurantName}>{item.restaurantName}</Text>
              <Text style={styles.placedTime}>{formatUKDateTime(item.createdAt)} UK</Text>
              <Text style={styles.itemsSummary}>
                {item.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.status}>{STATUS_LABEL[item.status] ?? item.status}</Text>
              <Text style={styles.total}>{formatGBP(item.totalCents)}</Text>
            </View>
          </Pressable>
          <Button
            title="Order again"
            variant="outline"
            loading={reordering === item.id}
            onPress={() => orderAgain(item)}
            style={styles.orderAgainButton}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 16, color: theme.colors.textMuted },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
  },
  cardMain: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderAgainButton: { marginTop: theme.spacing(3) },
  orderNumber: { fontWeight: "700", color: theme.colors.text },
  restaurantName: { fontSize: 12, color: theme.colors.primary, fontWeight: "700", marginTop: 2 },
  placedTime: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  itemsSummary: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4, maxWidth: 220 },
  status: { fontWeight: "700", color: theme.colors.secondary, fontSize: 13 },
  total: { color: theme.colors.text, marginTop: 4, fontWeight: "600" },
});
