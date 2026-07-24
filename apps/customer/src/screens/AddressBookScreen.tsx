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
import { theme, type Address } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";

type EditForm = {
  label: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
};

function toForm(addr: Address): EditForm {
  return {
    label: addr.label,
    line1: addr.line1,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
  };
}

export function AddressBookScreen() {
  const { api } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listAddresses();
      setAddresses(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load addresses");
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

  const startEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm(toForm(addr));
    setSaveError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(null);
    setSaveError(null);
  };

  const saveEdit = async () => {
    if (!editingId || !form) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await api.updateAddress(editingId, form);
      setAddresses((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
      setEditingId(null);
      setForm(null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (addr: Address) => {
    setDeletingId(addr.id);
    setDeleteError(null);
    try {
      await api.deleteAddress(addr.id);
      setAddresses((prev) => prev.filter((a) => a.id !== addr.id));
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (addr: Address) => {
    const message = `Delete the "${addr.label}" address?`;
    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        deleteAddress(addr);
      }
      return;
    }
    Alert.alert("Delete address", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteAddress(addr) },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing(5) }}>
      <Text style={styles.title}>Saved addresses</Text>

      {error && <Text style={styles.error}>{error}</Text>}
      {deleteError && <Text style={styles.error}>{deleteError}</Text>}

      {addresses.length === 0 && !error && (
        <Text style={styles.emptyText}>No saved addresses yet.</Text>
      )}

      {addresses.map((addr) => {
        const isEditing = editingId === addr.id;
        return (
          <View key={addr.id} style={styles.card}>
            {isEditing && form ? (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Label (e.g. Home)"
                  value={form.label}
                  onChangeText={(v) => setForm({ ...form, label: v })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Street address"
                  value={form.line1}
                  onChangeText={(v) => setForm({ ...form, line1: v })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={form.city}
                  onChangeText={(v) => setForm({ ...form, city: v })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  value={form.state}
                  onChangeText={(v) => setForm({ ...form, state: v })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Postal code"
                  value={form.postalCode}
                  onChangeText={(v) => setForm({ ...form, postalCode: v })}
                />
                {saveError && <Text style={styles.error}>{saveError}</Text>}
                <View style={styles.rowButtons}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={cancelEdit}
                    style={styles.rowButton}
                  />
                  <Button
                    title="Save"
                    onPress={saveEdit}
                    loading={saving}
                    style={styles.rowButton}
                  />
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.addressLabel}>{addr.label}</Text>
                <Text style={styles.addressLine}>
                  {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}
                </Text>
                <View style={styles.rowButtons}>
                  <Button
                    title="Edit"
                    variant="outline"
                    onPress={() => startEdit(addr)}
                    style={styles.rowButton}
                  />
                  <Button
                    title="Delete"
                    variant="danger"
                    loading={deletingId === addr.id}
                    onPress={() => confirmDelete(addr)}
                    style={styles.rowButton}
                  />
                </View>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: theme.spacing(4),
  },
  emptyText: { color: theme.colors.textMuted },
  error: { color: theme.colors.danger, marginBottom: theme.spacing(2) },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
  },
  addressLabel: { fontWeight: "700", color: theme.colors.text, fontSize: 16 },
  addressLine: { color: theme.colors.textMuted, marginTop: 4, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    fontSize: 15,
  },
  rowButtons: {
    flexDirection: "row",
    marginTop: theme.spacing(3),
  },
  rowButton: { flex: 1, marginRight: theme.spacing(2) },
});
