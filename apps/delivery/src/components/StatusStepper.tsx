import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ORDER_STATUS_FLOW, theme, type OrderStatus } from "@restaurant/shared";

const LABELS: Record<OrderStatus, string> = {
  PLACED: "Order placed",
  ACCEPTED: "Accepted by restaurant",
  PREPARING: "Preparing food",
  READY_FOR_PICKUP: "Ready for pickup",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function StatusStepper({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <View style={styles.cancelledBox}>
        <Text style={styles.cancelledText}>This order was cancelled</Text>
      </View>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <View>
      {ORDER_STATUS_FLOW.map((step, index) => {
        const done = index <= currentIndex;
        const isLast = index === ORDER_STATUS_FLOW.length - 1;
        return (
          <View key={step} style={styles.row}>
            <View style={styles.markerColumn}>
              <View style={[styles.dot, done && styles.dotDone]} />
              {!isLast && <View style={[styles.line, done && styles.lineDone]} />}
            </View>
            <Text style={[styles.label, done && styles.labelDone]}>{LABELS[step]}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start" },
  markerColumn: { alignItems: "center", width: 24 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.border,
  },
  dotDone: { backgroundColor: theme.colors.primary },
  line: { width: 2, flex: 1, minHeight: 24, backgroundColor: theme.colors.border },
  lineDone: { backgroundColor: theme.colors.primary },
  label: {
    marginLeft: theme.spacing(3),
    marginBottom: theme.spacing(5),
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  labelDone: { color: theme.colors.text, fontWeight: "600" },
  cancelledBox: {
    backgroundColor: "#FBEBEB",
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
  },
  cancelledText: { color: theme.colors.danger, fontWeight: "600" },
});
