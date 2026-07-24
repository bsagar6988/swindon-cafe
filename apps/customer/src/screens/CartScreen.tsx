import React from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "@restaurant/shared";
import { useCart } from "../context/CartContext";
import { Button } from "../components/Button";
import { MenuItemThumbnail } from "../components/MenuItemThumbnail";
import type { RootStackParamList } from "../navigation/types";

export function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { lines, addItem, decrementItem, removeItem, setNotes, subtotalCents } = useCart();

  if (lines.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add something tasty from the menu</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={lines}
        keyExtractor={(l) => l.item.id}
        contentContainerStyle={{ padding: theme.spacing(5) }}
        renderItem={({ item: line }) => (
          <View style={styles.lineContainer}>
            <View style={styles.row}>
              <MenuItemThumbnail imageUrl={line.item.imageUrl} name={line.item.name} size={52} />
              <View style={{ flex: 1, marginLeft: theme.spacing(3) }}>
                <Text style={styles.name}>{line.item.name}</Text>
                <Text style={styles.price}>
                  ${((line.item.priceCents * line.quantity) / 100).toFixed(2)}
                </Text>
              </View>
              <View style={styles.qtyControls}>
                <Pressable
                  style={styles.qtyButton}
                  onPress={() => decrementItem(line.item.id)}
                >
                  <Text style={styles.qtyButtonText}>−</Text>
                </Pressable>
                <Text style={styles.qty}>{line.quantity}</Text>
                <Pressable style={styles.qtyButton} onPress={() => addItem(line.item)}>
                  <Text style={styles.qtyButtonText}>+</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => removeItem(line.item.id)}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.notesInput}
              placeholder="Add cooking instructions (optional)"
              value={line.notes ?? ""}
              onChangeText={(text) => setNotes(line.item.id, text)}
            />
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalValue}>${(subtotalCents / 100).toFixed(2)}</Text>
        </View>
        <Button title="Checkout" onPress={() => navigation.navigate("Checkout")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing(6) },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.text },
  emptySubtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  lineContainer: {
    paddingVertical: theme.spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  notesInput: {
    marginTop: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2),
    fontSize: 13,
    color: theme.colors.text,
  },
  name: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
  price: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  qtyControls: { flexDirection: "row", alignItems: "center", marginHorizontal: theme.spacing(3) },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: { fontSize: 16, fontWeight: "700", color: theme.colors.primary },
  qty: { marginHorizontal: theme.spacing(2), fontWeight: "700", fontSize: 15 },
  remove: { color: theme.colors.danger, fontSize: 12, fontWeight: "600" },
  footer: {
    padding: theme.spacing(5),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing(3),
  },
  subtotalLabel: { fontSize: 15, color: theme.colors.textMuted },
  subtotalValue: { fontSize: 18, fontWeight: "800", color: theme.colors.text },
});
