import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { formatGBP, theme, type Address } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Button } from "../components/Button";
import type { RootStackParamList } from "../navigation/types";

const DELIVERY_FEE_CENTS = 299;

export function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { api } = useAuth();
  const { lines, subtotalCents, clear } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [label, setLabel] = useState("Home");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.listAddresses();
        setAddresses(list);
        if (list.length > 0) setSelectedAddressId(list[0].id);
        else setShowNewAddress(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load addresses");
      } finally {
        setLoadingAddresses(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveAddress = async () => {
    setError(null);
    try {
      const created = await api.createAddress({
        label,
        line1,
        city,
        state,
        postalCode,
      });
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.id);
      setShowNewAddress(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save address");
    }
  };

  const placeOrder = async () => {
    if (!selectedAddressId) {
      setError("Please choose a delivery address");
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      const order = await api.createOrder({
        addressId: selectedAddressId,
        items: lines.map((l) => ({
          menuItemId: l.item.id,
          quantity: l.quantity,
          notes: l.notes || undefined,
        })),
      });
      clear();
      navigation.replace("OrderTracking", { orderId: order.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loadingAddresses) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing(5) }}>
      <Text style={styles.sectionTitle}>Delivery address</Text>

      {addresses.map((addr) => (
        <Pressable
          key={addr.id}
          style={[styles.addressCard, selectedAddressId === addr.id && styles.addressCardSelected]}
          onPress={() => setSelectedAddressId(addr.id)}
        >
          <Text style={styles.addressLabel}>{addr.label}</Text>
          <Text style={styles.addressLine}>
            {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}
          </Text>
        </Pressable>
      ))}

      {!showNewAddress && (
        <Pressable onPress={() => setShowNewAddress(true)}>
          <Text style={styles.addNew}>+ Add a new address</Text>
        </Pressable>
      )}

      {showNewAddress && (
        <View style={styles.newAddressForm}>
          <TextInput style={styles.input} placeholder="Label (e.g. Home)" value={label} onChangeText={setLabel} />
          <TextInput style={styles.input} placeholder="Street address" value={line1} onChangeText={setLine1} />
          <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
          <TextInput style={styles.input} placeholder="State" value={state} onChangeText={setState} />
          <TextInput
            style={styles.input}
            placeholder="Postal code"
            value={postalCode}
            onChangeText={setPostalCode}
          />
          <Button title="Save address" variant="secondary" onPress={saveAddress} />
        </View>
      )}

      <Text style={styles.sectionTitle}>Order summary</Text>
      {lines.map((l) => (
        <View key={l.item.id} style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            {l.quantity} × {l.item.name}
          </Text>
          <Text style={styles.summaryValue}>
            {formatGBP(l.item.priceCents * l.quantity)}
          </Text>
        </View>
      ))}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>{formatGBP(subtotalCents)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Delivery fee</Text>
        <Text style={styles.summaryValue}>{formatGBP(DELIVERY_FEE_CENTS)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
          {formatGBP(subtotalCents + DELIVERY_FEE_CENTS)}
        </Text>
      </View>

      <Text style={styles.paymentNote}>
        Payment: cash / pay-on-delivery for this MVP. Card payment (Stripe) can be wired in once a
        merchant account is set up.
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        title="Place order"
        onPress={placeOrder}
        loading={placing}
        disabled={lines.length === 0}
        style={{ marginTop: theme.spacing(4), marginBottom: theme.spacing(8) }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(3),
  },
  addressCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  addressCardSelected: { borderColor: theme.colors.primary, borderWidth: 2 },
  addressLabel: { fontWeight: "700", color: theme.colors.text },
  addressLine: { color: theme.colors.textMuted, marginTop: 2, fontSize: 13 },
  addNew: { color: theme.colors.primary, fontWeight: "600", marginTop: theme.spacing(1) },
  newAddressForm: { marginTop: theme.spacing(3) },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    fontSize: 15,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: theme.spacing(2) },
  summaryLabel: { color: theme.colors.textMuted },
  summaryValue: { color: theme.colors.text, fontWeight: "600" },
  totalLabel: { fontSize: 16, fontWeight: "800", color: theme.colors.text },
  totalValue: { fontSize: 16, fontWeight: "800", color: theme.colors.primary },
  paymentNote: { fontSize: 12, color: theme.colors.textMuted, marginTop: theme.spacing(4) },
  error: { color: theme.colors.danger, marginTop: theme.spacing(3) },
});
