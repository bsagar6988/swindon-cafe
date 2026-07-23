import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { theme, type OrderStatus } from "@restaurant/shared";

const PROGRESS_BY_STATUS: Record<OrderStatus, number> = {
  PLACED: 0,
  ACCEPTED: 0.1,
  PREPARING: 0.25,
  READY_FOR_PICKUP: 0.45,
  OUT_FOR_DELIVERY: 0.8,
  DELIVERED: 1,
  CANCELLED: 0,
};

/**
 * A stylized progress line between restaurant and home, not a real map.
 * Real-time GPS tracking on an actual map needs a Google Maps API key
 * (see plan's open items) — swap this for MapView once that's available.
 * Mirrors the customer app's component so the visual language matches.
 */
export function RouteProgress({ status }: { status: OrderStatus }) {
  const progress = PROGRESS_BY_STATUS[status];
  const width = 280;
  const y = 20;
  const pinX = 20 + progress * (width - 40);

  return (
    <View style={styles.container}>
      <Svg width={width} height={40}>
        <Line x1={20} y1={y} x2={width - 20} y2={y} stroke={theme.colors.border} strokeWidth={4} />
        <Line x1={20} y1={y} x2={pinX} y2={y} stroke={theme.colors.primary} strokeWidth={4} />
        <Circle cx={20} cy={y} r={7} fill={theme.colors.secondary} />
        <Circle cx={width - 20} cy={y} r={7} fill={theme.colors.text} />
        <Circle cx={pinX} cy={y} r={9} fill={theme.colors.primary} stroke="#fff" strokeWidth={2} />
      </Svg>
      <View style={styles.labels}>
        <Text style={styles.label}>Restaurant</Text>
        <Text style={styles.label}>Customer</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginVertical: theme.spacing(3) },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 280,
    marginTop: 4,
  },
  label: { fontSize: 12, color: theme.colors.textMuted },
});
