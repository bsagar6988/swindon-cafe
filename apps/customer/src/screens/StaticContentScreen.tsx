import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppHeader, theme } from "@restaurant/shared";
import { LEGAL_PAGES } from "../legalContent";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "StaticContent">;

export function StaticContentScreen({ route }: Props) {
  const page = LEGAL_PAGES[route.params.pageKey];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing(5) }}>
      <AppHeader subtitle={page.title} />
      <Text style={styles.title}>{page.title}</Text>
      {page.body.map((paragraph, i) => (
        <Text key={i} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: theme.spacing(4),
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.text,
    marginBottom: theme.spacing(4),
  },
});
