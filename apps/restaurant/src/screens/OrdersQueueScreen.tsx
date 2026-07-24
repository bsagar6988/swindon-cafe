import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  AppHeader,
  formatGBP,
  formatUKTime,
  isTodayUK,
  theme,
  type Order,
  type OrderStatus,
} from "@restaurant/shared";
import { useOrders } from "../context/OrdersContext";
import { Button } from "../components/Button";
import { actionsFor, NON_TERMINAL_STATUSES, STATUS_COLOR, STATUS_LABEL } from "../statusActions";
import type { RootStackParamList } from "../navigation/types";

export function OrdersQueueScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { orders, loading, error, refresh, updateStatus } = useOrders();
  const [busyId, setBusyId] = useState<string | null>(null);

  const queue = orders
    .filter((o) => NON_TERMINAL_STATUSES.includes(o.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const processedToday = orders
    .filter((o) => !NON_TERMINAL_STATUSES.includes(o.status) && isTodayUK(o.createdAt))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const onAction = async (order: Order, next: OrderStatus) => {
    setBusyId(order.id);
    try {
      await updateStatus(order.id, next);
    } catch (e) {
      // swallow — a stale/rejected transition will simply not change the row
    } finally {
      setBusyId(null);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable onPress={refresh}>
          <Text style={styles.retry}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  const renderOrderCard = (item: Order) => {
    const actions = actionsFor(item.status);
    return (
      <Pressable
        key={item.id}
        style={styles.card}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderNumber}>
              #{item.id.slice(-6).toUpperCase()} · {item.customerName}
            </Text>
            <Text style={styles.itemsSummary} numberOfLines={2}>
              {item.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.status, { color: STATUS_COLOR[item.status] }]}>
              {STATUS_LABEL[item.status]}
            </Text>
            <Text style={styles.total}>{formatGBP(item.totalCents)}</Text>
            <Text style={styles.placedTime}>{formatUKTime(item.createdAt)} UK</Text>
          </View>
        </View>

        {actions.length > 0 && (
          <View style={styles.actionsRow}>
            {actions.map((a) => (
              <Button
                key={a.next}
                title={a.label}
                variant={a.variant}
                loading={busyId === item.id}
                onPress={() => onAction(item, a.next)}
                style={styles.actionButton}
              />
            ))}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: theme.spacing(5) }}
      data={queue}
      keyExtractor={(o) => o.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      ListHeaderComponent={
        <View>
          <AppHeader subtitle="Kitchen" />
          <View style={styles.header}>
            <Text style={styles.title}>Incoming orders</Text>
            <Text style={styles.subtitle}>
              {queue.length} active order{queue.length === 1 ? "" : "s"}
            </Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No active orders right now</Text>
        </View>
      }
      renderItem={({ item }) => renderOrderCard(item)}
      ListFooterComponent={
        <View style={styles.processedSection}>
          <Text style={styles.title}>Processed today</Text>
          <Text style={styles.subtitle}>
            {processedToday.length} order{processedToday.length === 1 ? "" : "s"} completed or
            cancelled today
          </Text>
          {processedToday.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Nothing processed yet today</Text>
            </View>
          ) : (
            processedToday.map((item) => renderOrderCard(item))
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing(8) },
  header: { marginBottom: theme.spacing(2) },
  title: { fontSize: 26, fontWeight: "800", color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4, marginBottom: theme.spacing(2) },
  emptyTitle: { fontSize: 15, color: theme.colors.textMuted },
  emptyBox: { paddingVertical: theme.spacing(4) },
  processedSection: {
    marginTop: theme.spacing(6),
    paddingTop: theme.spacing(4),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  error: { color: theme.colors.danger, marginBottom: theme.spacing(2) },
  retry: { color: theme.colors.primary, fontWeight: "600" },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
    backgroundColor: theme.colors.surface,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  orderNumber: { fontWeight: "700", color: theme.colors.text },
  itemsSummary: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4, maxWidth: 220 },
  status: { fontWeight: "700", fontSize: 13 },
  total: { color: theme.colors.text, marginTop: 4, fontWeight: "600" },
  placedTime: { color: theme.colors.textMuted, marginTop: 2, fontSize: 11 },
  actionsRow: { flexDirection: "row", marginTop: theme.spacing(3), gap: theme.spacing(2) },
  actionButton: { flex: 1, paddingVertical: theme.spacing(2) },
});
