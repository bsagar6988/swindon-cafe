import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppHeader, theme, type Restaurant } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/types";

export function RestaurantListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { api } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listRestaurants();
      setRestaurants(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load restaurants");
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

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: theme.spacing(5) }}
      data={restaurants}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={
        <View>
          <AppHeader />
          <View style={styles.header}>
            <Text style={styles.title}>Restaurants near you</Text>
            <Text style={styles.subtitle}>Pick a restaurant to see its menu</Text>
          </View>
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No restaurants available yet</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate("RestaurantMenu", { restaurantId: item.id })}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            {item.address && (
              <Text style={styles.address} numberOfLines={1}>
                {item.address}
              </Text>
            )}
          </View>
          <Text style={[styles.badge, item.isOpen ? styles.badgeOpen : styles.badgeClosed]}>
            {item.isOpen ? "Open" : "Closed"}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing(6) },
  header: { paddingHorizontal: theme.spacing(5), marginBottom: theme.spacing(2) },
  title: { fontSize: 26, fontWeight: "800", color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  error: { color: theme.colors.danger, paddingHorizontal: theme.spacing(5) },
  emptyBox: { paddingVertical: theme.spacing(8), alignItems: "center" },
  emptyTitle: { fontSize: 15, color: theme.colors.textMuted },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
  },
  name: { fontSize: 17, fontWeight: "700", color: theme.colors.text },
  address: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 },
  badge: { fontSize: 12, fontWeight: "700", marginLeft: theme.spacing(3) },
  badgeOpen: { color: theme.colors.success },
  badgeClosed: { color: theme.colors.danger },
});
