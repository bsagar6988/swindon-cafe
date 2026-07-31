import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, theme } from "@restaurant/shared";
import { LEGAL_PAGES, type LegalPageKey } from "../legalContent";
import type { RootStackParamList } from "../navigation/types";

const ORDER: LegalPageKey[] = ["terms", "privacy", "allergy", "help", "cookies", "addBusiness"];

export function LegalHelpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing(5) }}>
      <AppHeader subtitle="Legal & Help" />
      {ORDER.map((key) => (
        <Pressable
          key={key}
          style={styles.row}
          onPress={() => navigation.navigate("StaticContent", { pageKey: key })}
        >
          <Text style={styles.rowLabel}>{LEGAL_PAGES[key].title}</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing(4),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
});
