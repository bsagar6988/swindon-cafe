import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AppHeader, theme, type RestaurantAdminSummary } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";

export function ManageRestaurantsScreen() {
  const { api } = useAuth();
  const [restaurants, setRestaurants] = useState<RestaurantAdminSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listRestaurantsAdmin();
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

  const onSubmitNewRestaurant = async () => {
    setFormError(null);
    if (!name.trim() || !adminName.trim() || !adminEmail.trim() || adminPassword.length < 6) {
      setFormError(
        "Restaurant name, admin name, admin email, and a password of at least 6 characters are required"
      );
      return;
    }
    setSaving(true);
    try {
      const { restaurant, admin } = await api.createRestaurant({
        name: name.trim(),
        address: address.trim() || null,
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),
        adminPassword,
      });
      setRestaurants((prev) => [{ ...restaurant, adminEmail: admin.email }, ...prev]);
      setName("");
      setAddress("");
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
      setShowForm(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to add restaurant");
    } finally {
      setSaving(false);
    }
  };

  if (loading && restaurants.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Restaurants" />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing(5) }}>
      <AppHeader subtitle="Restaurants" />
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Restaurants</Text>
          <Text style={styles.subtitle}>Every restaurant on the platform</Text>
        </View>
        <Button
          title={showForm ? "Close" : "Add restaurant"}
          variant={showForm ? "outline" : "primary"}
          onPress={() => setShowForm((s) => !s)}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formLabel}>Restaurant name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Golden Wok" />

          <Text style={styles.formLabel}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Street, Swindon, postcode"
          />

          <Text style={styles.formLabel}>Admin name</Text>
          <TextInput
            style={styles.input}
            value={adminName}
            onChangeText={setAdminName}
            placeholder="e.g. Jordan Owner"
          />

          <Text style={styles.formLabel}>Admin email</Text>
          <TextInput
            style={styles.input}
            value={adminEmail}
            onChangeText={setAdminEmail}
            placeholder="owner@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.formLabel}>Admin password</Text>
          <TextInput
            style={styles.input}
            value={adminPassword}
            onChangeText={setAdminPassword}
            placeholder="Min 6 characters"
            secureTextEntry
          />

          {formError && <Text style={styles.error}>{formError}</Text>}

          <Button
            title="Add restaurant"
            onPress={onSubmitNewRestaurant}
            loading={saving}
            style={{ marginTop: theme.spacing(3) }}
          />
        </View>
      )}

      {restaurants.length === 0 ? (
        <Text style={styles.emptyText}>No restaurants yet. Add one to get started.</Text>
      ) : (
        restaurants.map((restaurant) => (
          <View key={restaurant.id} style={styles.restaurantRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              {restaurant.address && (
                <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
              )}
              {restaurant.adminEmail && (
                <Text style={styles.restaurantAdmin}>Admin: {restaurant.adminEmail}</Text>
              )}
            </View>
            <Text style={[styles.badge, restaurant.isOpen ? styles.badgeOpen : styles.badgeClosed]}>
              {restaurant.isOpen ? "Open" : "Closed"}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(3),
  },
  title: { fontSize: 24, fontWeight: "800", color: theme.colors.text },
  subtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  error: { color: theme.colors.danger, marginBottom: theme.spacing(2) },
  emptyText: { color: theme.colors.textMuted, marginTop: theme.spacing(4) },
  form: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textMuted,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing(3),
    fontSize: 15,
    backgroundColor: theme.colors.background,
  },
  restaurantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  restaurantName: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
  restaurantAddress: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  restaurantAdmin: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  badge: { fontSize: 12, fontWeight: "700", marginLeft: theme.spacing(3) },
  badgeOpen: { color: theme.colors.success },
  badgeClosed: { color: theme.colors.danger },
});
