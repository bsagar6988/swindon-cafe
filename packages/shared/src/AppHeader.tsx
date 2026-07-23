import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Logo } from "./Logo";
import { theme } from "./theme";

export function AppHeader({ subtitle }: { subtitle?: string }) {
  return (
    <View style={styles.row}>
      <Logo size={36} />
      <View style={styles.textCol}>
        <Text style={styles.brand}>Swindon Cafe</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  textCol: { marginLeft: theme.spacing(3) },
  brand: { fontSize: 16, fontWeight: "800", color: theme.colors.text },
  subtitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
});
