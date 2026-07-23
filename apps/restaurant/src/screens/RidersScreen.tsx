import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { theme, type Rider } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";

export function RidersScreen() {
  const { api } = useAuth();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listRiders();
      setRiders(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load riders");
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

  const onSubmitNewRider = async () => {
    setFormError(null);
    if (!name.trim() || !email.trim() || password.length < 6) {
      setFormError("Name, email, and a password of at least 6 characters are required");
      return;
    }
    setSaving(true);
    try {
      const created = await api.createRider(name.trim(), email.trim(), password);
      setRiders((prev) => [created, ...prev]);
      setName("");
      setEmail("");
      setPassword("");
      setShowForm(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to add rider");
    } finally {
      setSaving(false);
    }
  };

  const deleteRider = async (rider: Rider) => {
    setDeletingId(rider.id);
    setError(null);
    try {
      await api.deleteRider(rider.id);
      setRiders((prev) => prev.filter((r) => r.id !== rider.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove rider");
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (rider: Rider) => {
    if (Platform.OS === "web") {
      if (window.confirm(`Remove ${rider.name} as a rider?`)) {
        deleteRider(rider);
      }
      return;
    }
    Alert.alert("Remove rider", `Remove ${rider.name} as a rider?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => deleteRider(rider) },
    ]);
  };

  if (loading && riders.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing(5) }}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Riders</Text>
          <Text style={styles.subtitle}>Manage who can deliver for you</Text>
        </View>
        <Button
          title={showForm ? "Close" : "Add rider"}
          variant={showForm ? "outline" : "primary"}
          onPress={() => setShowForm((s) => !s)}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formLabel}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Jordan Rider" />

          <Text style={styles.formLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="rider@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.formLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Min 6 characters"
            secureTextEntry
          />

          {formError && <Text style={styles.error}>{formError}</Text>}

          <Button
            title="Add rider"
            onPress={onSubmitNewRider}
            loading={saving}
            style={{ marginTop: theme.spacing(3) }}
          />
        </View>
      )}

      {riders.length === 0 ? (
        <Text style={styles.emptyText}>No riders yet. Add one to start assigning deliveries.</Text>
      ) : (
        riders.map((rider) => (
          <View key={rider.id} style={styles.riderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.riderName}>{rider.name}</Text>
              <Text style={styles.riderEmail}>{rider.email}</Text>
            </View>
            <Button
              title="Remove"
              variant="danger"
              loading={deletingId === rider.id}
              onPress={() => confirmDelete(rider)}
              style={styles.removeButton}
            />
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
  riderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  riderName: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
  riderEmail: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  removeButton: { paddingVertical: theme.spacing(1.5), paddingHorizontal: theme.spacing(3), marginLeft: theme.spacing(3) },
});
