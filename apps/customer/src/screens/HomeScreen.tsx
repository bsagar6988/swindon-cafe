import React from "react";
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppHeader, theme } from "@restaurant/shared";
import { useMenu } from "../context/MenuContext";
import type { RootStackParamList } from "../navigation/types";

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { categories, items, loading, error, refresh } = useMenu();

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
        <Pressable onPress={refresh}>
          <Text style={styles.retry}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  const sections = categories
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((cat) => ({
      title: cat.name,
      data: items.filter((i) => i.categoryId === cat.id),
    }))
    .filter((s) => s.data.length > 0);

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <AppHeader />
          <View style={styles.header}>
            <Text style={styles.title}>Our Menu</Text>
            <Text style={styles.subtitle}>Delivered fresh to your door</Text>
          </View>
        </View>
      }
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <Pressable
          style={styles.itemRow}
          onPress={() => navigation.navigate("ItemDetail", { itemId: item.id })}
        >
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <Text style={styles.itemPrice}>${(item.priceCents / 100).toFixed(2)}</Text>
          </View>
          {!item.isAvailable && <Text style={styles.unavailable}>Sold out</Text>}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing(6) },
  header: { padding: theme.spacing(5) },
  title: { fontSize: 28, fontWeight: "800", color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing(5),
    paddingVertical: theme.spacing(2),
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing(5),
    paddingVertical: theme.spacing(4),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemInfo: { flex: 1, marginRight: theme.spacing(3) },
  itemName: { fontSize: 16, fontWeight: "600", color: theme.colors.text },
  itemDescription: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "700", color: theme.colors.primary, marginTop: 6 },
  unavailable: { fontSize: 12, color: theme.colors.danger, fontWeight: "600" },
  error: { color: theme.colors.danger, marginBottom: theme.spacing(2) },
  retry: { color: theme.colors.primary, fontWeight: "600" },
});
