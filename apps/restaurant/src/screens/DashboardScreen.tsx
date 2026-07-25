import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AppHeader, formatGBP, theme, type AnalyticsSummary } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";

export function DashboardScreen() {
  const { api } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAnalytics(14);
      setSummary(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && !summary) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Dashboard" />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </View>
    );
  }

  const revenueLabel = `${formatGBP(summary?.revenueTotalCents ?? 0)} total revenue`;

  const ordersPerDay = summary?.ordersPerDay ?? [];
  const maxOrders = Math.max(1, ...ordersPerDay.map((d) => d.orders));
  const hasAnyOrders = ordersPerDay.some((d) => d.orders > 0);

  const bestSellers = summary?.bestSellers ?? [];
  const maxBestSeller = Math.max(1, ...bestSellers.map((b) => b.quantity));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing(5) }}>
      <AppHeader subtitle="Dashboard" />
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Sales performance at a glance</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Revenue</Text>
        <Text style={styles.statValue}>{revenueLabel}</Text>
      </View>

      <Text style={styles.sectionHeader}>Orders — last 14 days</Text>
      {ordersPerDay.length === 0 ? (
        <Text style={styles.emptyText}>No order activity yet.</Text>
      ) : (
        <>
          {!hasAnyOrders && (
            <Text style={styles.emptyText}>No orders placed in this window yet.</Text>
          )}
          <View style={styles.dayList}>
            {ordersPerDay.map((day) => {
              const pct = Math.round((day.orders / maxOrders) * 100);
              return (
                <View key={day.date} style={styles.dayRow}>
                  <Text style={styles.dayDate}>{day.date.slice(5)}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.dayCount}>{day.orders}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      <Text style={styles.sectionHeader}>Best sellers</Text>
      {bestSellers.length === 0 ? (
        <Text style={styles.emptyText}>No items sold yet.</Text>
      ) : (
        bestSellers.map((item, idx) => {
          const pct = Math.round((item.quantity / maxBestSeller) * 100);
          return (
            <View key={`${item.name}-${idx}`} style={styles.bestSellerRow}>
              <Text style={styles.bestSellerRank}>{idx + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.bestSellerName}>{item.name}</Text>
                <View style={styles.barTrackSmall}>
                  <View style={[styles.barFillSecondary, { width: `${pct}%` }]} />
                </View>
              </View>
              <Text style={styles.bestSellerQty}>{item.quantity} sold</Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: theme.colors.text },
  subtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2, marginBottom: theme.spacing(3) },
  error: { color: theme.colors.danger, marginBottom: theme.spacing(2) },
  emptyText: { color: theme.colors.textMuted, marginBottom: theme.spacing(2) },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(5),
    marginBottom: theme.spacing(5),
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginBottom: theme.spacing(1),
  },
  statValue: { fontSize: 26, fontWeight: "800", color: theme.colors.primary },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2),
  },
  dayList: { marginBottom: theme.spacing(2) },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing(1.5),
  },
  dayDate: { width: 44, fontSize: 12, color: theme.colors.textMuted },
  barTrack: {
    flex: 1,
    height: 14,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing(2),
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
    minWidth: 2,
  },
  dayCount: { width: 28, fontSize: 12, fontWeight: "700", color: theme.colors.text, textAlign: "right" },
  bestSellerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing(2.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing(2),
  },
  bestSellerRank: {
    width: 20,
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.textMuted,
  },
  bestSellerName: { fontSize: 14, fontWeight: "600", color: theme.colors.text, marginBottom: 4 },
  barTrackSmall: {
    height: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  barFillSecondary: {
    height: "100%",
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.secondary,
    minWidth: 2,
  },
  bestSellerQty: { fontSize: 12, fontWeight: "700", color: theme.colors.textMuted },
});
