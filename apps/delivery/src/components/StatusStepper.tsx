import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  ORDER_STATUS_FLOW,
  formatUKTime,
  theme,
  type OrderStatus,
  type OrderStatusEvent,
} from "@restaurant/shared";

const LABELS: Record<OrderStatus, string> = {
  PLACED: "Order placed",
  ACCEPTED: "Accepted by restaurant",
  PREPARING: "Preparing food",
  READY_FOR_PICKUP: "Ready for pickup",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

interface StatusStepperProps {
  status: OrderStatus;
  events?: OrderStatusEvent[];
}

export function StatusStepper({ status, events }: StatusStepperProps) {
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
        const eventTime = events?.find((e) => e.status === step)?.at;
        return (
          <View key={step} style={styles.row}>
            <View style={styles.markerColumn}>
              <View style={[styles.dot, done && styles.dotDone]} />
              {!isLast && <View style={[styles.line, done && styles.lineDone]} />}
            </View>
            <View style={styles.labelRow}>
              <Text style={[styles.label, done && styles.labelDone]}>{LABELS[step]}</Text>
              {done && eventTime && (
                <Text style={styles.timeLabel}>{formatUKTime(eventTime)} UK</Text>
              )}
            </View>
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
  labelRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: theme.spacing(3),
    marginBottom: theme.spacing(5),
  },
  label: {
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  labelDone: { color: theme.colors.text, fontWeight: "600" },
  timeLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  cancelledBox: {
    backgroundColor: "#FBEBEB",
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
  },
  cancelledText: { color: theme.colors.danger, fontWeight: "600" },
});
