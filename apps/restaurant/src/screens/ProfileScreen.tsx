import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { theme } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";

export function ProfileScreen() {
  const { user, logout, api } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [savingOpen, setSavingOpen] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => setIsOpen(s.isOpen))
      .catch((e) => setSettingsError(e instanceof Error ? e.message : "Failed to load settings"));
  }, [api]);

  const onToggleOpen = async () => {
    if (isOpen === null) return;
    const previous = isOpen;
    setSettingsError(null);
    setSavingOpen(true);
    setIsOpen(!previous);
    try {
      const updated = await api.updateSettings(!previous);
      setIsOpen(updated.isOpen);
    } catch (e) {
      setIsOpen(previous);
      setSettingsError(e instanceof Error ? e.message : "Failed to update settings");
    } finally {
      setSavingOpen(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.name?.[0] ?? "?"}</Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>{user?.role}</Text>

      <View style={styles.settingsCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingsLabel}>Store is open for orders</Text>
          <Text style={styles.settingsHint}>
            {isOpen === null
              ? "Loading..."
              : isOpen
              ? "Customers can place new orders"
              : "Customers cannot place new orders"}
          </Text>
        </View>
        <Switch
          value={!!isOpen}
          onValueChange={onToggleOpen}
          disabled={isOpen === null || savingOpen}
          trackColor={{ true: theme.colors.secondary, false: theme.colors.border }}
        />
      </View>
      {settingsError && <Text style={styles.error}>{settingsError}</Text>}

      <Button title="Log out" variant="outline" onPress={logout} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: theme.spacing(10),
    backgroundColor: theme.colors.background,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(4),
  },
  avatarText: { fontSize: 32, fontWeight: "800", color: theme.colors.primary },
  name: { fontSize: 20, fontWeight: "800", color: theme.colors.text },
  email: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  role: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.secondary,
    marginTop: theme.spacing(2),
    textTransform: "uppercase",
  },
  button: { marginTop: theme.spacing(8), width: 200 },
  settingsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
    marginTop: theme.spacing(6),
    width: "100%",
    maxWidth: 360,
  },
  settingsLabel: { fontSize: 14, fontWeight: "700", color: theme.colors.text },
  settingsHint: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
  error: { color: theme.colors.danger, marginTop: theme.spacing(2) },
});
