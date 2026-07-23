import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.name?.[0] ?? "?"}</Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>Delivery rider</Text>

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
  role: { fontSize: 12, color: theme.colors.secondary, marginTop: 6, fontWeight: "700" },
  button: { marginTop: theme.spacing(8), width: 200 },
});
