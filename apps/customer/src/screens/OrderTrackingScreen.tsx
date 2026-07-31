import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppHeader, formatGBP, formatUKDateTime, theme } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import { useOrderTracking } from "../hooks/useOrderTracking";
import { StatusStepper } from "../components/StatusStepper";
import { RouteProgress } from "../components/RouteProgress";
import { StarRating } from "../components/StarRating";
import { Button } from "../components/Button";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "OrderTracking">;

export function OrderTrackingScreen({ route }: Props) {
  const { api } = useAuth();
  const { order, error } = useOrderTracking(route.params.orderId);
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const cancelOrder = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await api.updateOrderStatus(route.params.orderId, "CANCELLED");
      // the order's status updates via the live socket subscription above
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const submitReview = async () => {
    if (draftRating === 0) {
      setReviewError("Please select a star rating");
      return;
    }
    setReviewError(null);
    setSubmitting(true);
    try {
      await api.createReview(route.params.orderId, draftRating, draftComment.trim() || undefined);
      // the order's review field updates via the live socket subscription above
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Order tracking" />
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Order tracking" />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing(5) }}>
      <AppHeader subtitle="Order tracking" />
      <Text style={styles.orderNumber}>Order #{order.id.slice(-6).toUpperCase()}</Text>
      <Text style={styles.restaurantName}>{order.restaurantName}</Text>
      <Text style={styles.placedTime}>Placed {formatUKDateTime(order.createdAt)} UK</Text>
      <RouteProgress status={order.status} />

      {order.assignment && order.status === "OUT_FOR_DELIVERY" && (
        <Text style={styles.riderNote}>Your rider {order.assignment.riderName} is on the way.</Text>
      )}
      {order.assignment && order.status === "DELIVERED" && (
        <Text style={styles.riderNote}>Delivered by {order.assignment.riderName}.</Text>
      )}

      <View style={styles.stepperCard}>
        <StatusStepper status={order.status} events={order.statusEvents} />
      </View>

      {order.status === "PLACED" && (
        <View>
          {cancelError && <Text style={styles.error}>{cancelError}</Text>}
          <Button
            title="Cancel order"
            variant="danger"
            loading={cancelling}
            onPress={cancelOrder}
            style={styles.cancelButton}
          />
        </View>
      )}

      <Text style={styles.sectionTitle}>Items</Text>
      {order.items.map((i) => (
        <View key={i.id} style={styles.itemRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>
              {i.quantity} × {i.name}
            </Text>
            {i.notes ? <Text style={styles.itemNotes}>Note: {i.notes}</Text> : null}
          </View>
          <Text style={styles.itemPrice}>{formatGBP(i.priceCents * i.quantity)}</Text>
        </View>
      ))}

      <View style={styles.itemRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatGBP(order.totalCents)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Delivering to</Text>
      <Text style={styles.address}>
        {order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
        {order.deliveryAddress.postalCode}
      </Text>

      {order.status === "DELIVERED" && (
        <View style={styles.reviewCard}>
          <Text style={styles.sectionTitle}>Your review</Text>
          {order.review ? (
            <View>
              <StarRating rating={order.review.rating} />
              {order.review.comment ? (
                <Text style={styles.reviewComment}>{order.review.comment}</Text>
              ) : null}
            </View>
          ) : (
            <View>
              <Text style={styles.reviewPrompt}>How was your order?</Text>
              <StarRating rating={draftRating} onChange={setDraftRating} />
              <TextInput
                style={styles.reviewInput}
                placeholder="Add a comment (optional)"
                multiline
                value={draftComment}
                onChangeText={setDraftComment}
              />
              {reviewError && <Text style={styles.error}>{reviewError}</Text>}
              <Button
                title="Submit review"
                onPress={submitReview}
                loading={submitting}
                style={styles.reviewButton}
              />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: theme.colors.danger },
  orderNumber: { fontSize: 20, fontWeight: "800", color: theme.colors.text },
  restaurantName: { fontSize: 14, color: theme.colors.primary, fontWeight: "700", marginTop: 4 },
  placedTime: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
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
  reviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
    marginTop: theme.spacing(5),
  },
  reviewPrompt: { color: theme.colors.textMuted, marginBottom: theme.spacing(2) },
  reviewComment: { color: theme.colors.text, marginTop: theme.spacing(2) },
  reviewInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    minHeight: 70,
    textAlignVertical: "top",
    backgroundColor: theme.colors.background,
  },
  reviewButton: { marginTop: theme.spacing(3) },
  cancelButton: { marginTop: theme.spacing(4) },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: theme.spacing(2) },
  itemName: { color: theme.colors.text },
  itemNotes: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2, fontStyle: "italic" },
  itemPrice: { color: theme.colors.textMuted, fontWeight: "600" },
  totalLabel: { fontWeight: "800", color: theme.colors.text },
  totalValue: { fontWeight: "800", color: theme.colors.primary },
  address: { color: theme.colors.textMuted },
});
