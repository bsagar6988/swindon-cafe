import React from "react";
import { Alert, Image, Platform, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppHeader, formatGBP, theme } from "@restaurant/shared";
import { useCart } from "../context/CartContext";
import { Button } from "../components/Button";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ItemDetail">;

export function ItemDetailScreen({ route, navigation }: Props) {
  const { item, restaurantId } = route.params;
  const { addItem, restaurantId: cartRestaurantId } = useCart();

  const confirmAndAdd = () => {
    if (cartRestaurantId && cartRestaurantId !== restaurantId) {
      const message =
        "Your cart has items from another restaurant. Starting a new order here will clear it.";
      if (Platform.OS === "web") {
        if (!window.confirm(message)) return;
      } else {
        Alert.alert("Start a new order?", message, [
          { text: "Cancel", style: "cancel" },
          { text: "Clear cart", style: "destructive", onPress: () => doAdd() },
        ]);
        return;
      }
    }
    doAdd();
  };

  const doAdd = () => {
    addItem(item, restaurantId);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Item" />
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>{item.name[0]}</Text>
        </View>
      )}
      <Text style={styles.name}>{item.name}</Text>
      {item.description && <Text style={styles.description}>{item.description}</Text>}
      <Text style={styles.price}>{formatGBP(item.priceCents)}</Text>

      <Button
        title={item.isAvailable ? "Add to cart" : "Currently unavailable"}
        disabled={!item.isAvailable}
        onPress={confirmAndAdd}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing(5), backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: {
    height: 200,
    width: "100%",
    borderRadius: theme.radius.lg,
    backgroundColor: "#FBF6EF",
    marginBottom: theme.spacing(5),
  },
  imagePlaceholder: {
    height: 180,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(5),
  },
  imagePlaceholderText: { fontSize: 48, fontWeight: "800", color: theme.colors.primary },
  name: { fontSize: 24, fontWeight: "800", color: theme.colors.text },
  description: { fontSize: 15, color: theme.colors.textMuted, marginTop: theme.spacing(2) },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.primary,
    marginTop: theme.spacing(4),
  },
  button: { marginTop: theme.spacing(6) },
});
