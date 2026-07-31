import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppHeader, theme } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import type { RootStackParamList } from "../navigation/types";

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Profile" />
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0] ?? "?"}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <Button
          title="Manage addresses"
          variant="secondary"
          onPress={() => navigation.navigate("AddressBook")}
          style={styles.button}
        />
        <Button
          title="About Swindon Eats"
          variant="outline"
          onPress={() => navigation.navigate("About")}
          style={[styles.button, { marginTop: theme.spacing(3) }]}
        />
        <Button
          title="Legal & Help"
          variant="outline"
          onPress={() => navigation.navigate("LegalHelp")}
          style={[styles.button, { marginTop: theme.spacing(3) }]}
        />
        <Button
          title="Log out"
          variant="outline"
          onPress={logout}
          style={[styles.button, { marginTop: theme.spacing(3) }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: theme.spacing(8),
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
  button: { marginTop: theme.spacing(8), width: 200 },
});
