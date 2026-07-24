import React, { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppHeader, formatUKTime, theme } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import { useAvailableDeliveries } from "../hooks/useAvailableDeliveries";
import { Button } from "../components/Button";
import type { RootStackParamList } from "../navigation/types";

export function AvailableDeliveriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { api } = useAuth();
  const { deliveries, loading, error, reload } = useAvailableDeliveries();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const onAccept = async (orderId: string) => {
    setAcceptError(null);
    setAcceptingId(orderId);
    try {
      await api.acceptDelivery(orderId);
      navigation.navigate("ActiveDelivery", { orderId });
    } catch (e) {
      setAcceptError(e instanceof Error ? e.message : "Failed to accept delivery");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Rider" />
      {acceptError && <Text style={[styles.error, { paddingHorizontal: theme.spacing(5) }]}>{acceptError}</Text>}
      {deliveries.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No deliveries available right now</Text>
          <Text style={styles.emptySubtitle}>New orders ready for pickup will show up here automatically.</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: theme.spacing(5) }}
          data={deliveries}
          keyExtractor={(o) => o.id}
          onRefresh={reload}
          refreshing={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderNumber}>Order #{item.id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.total}>${(item.totalCents / 100).toFixed(2)}</Text>
              </View>
              <Text style={styles.customer}>{item.customerName}</Text>
              <Text style={styles.addressSummary}>
                {item.deliveryAddress.line1}, {item.deliveryAddress.city}
              </Text>
              <Text style={styles.meta}>
                {item.items.length} item{item.items.length === 1 ? "" : "s"} · placed{" "}
                {formatUKTime(item.createdAt)} UK
              </Text>
              <Button
                title="Accept delivery"
                onPress={() => onAccept(item.id)}
                loading={acceptingId === item.id}
                style={styles.acceptButton}
              />
            </View>
          )}
        />
      )}
    </View>
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
  error: { color: theme.colors.danger, marginBottom: theme.spacing(2) },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
    backgroundColor: theme.colors.surface,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderNumber: { fontWeight: "700", color: theme.colors.text, fontSize: 15 },
  total: { fontWeight: "800", color: theme.colors.primary, fontSize: 15 },
  customer: { color: theme.colors.text, marginTop: theme.spacing(2), fontWeight: "600" },
  addressSummary: { color: theme.colors.textMuted, marginTop: 2, fontSize: 13 },
  meta: { color: theme.colors.textMuted, marginTop: theme.spacing(1), fontSize: 12 },
  acceptButton: { marginTop: theme.spacing(3) },
});
