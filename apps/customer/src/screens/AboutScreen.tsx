import React from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, Logo, theme } from "@restaurant/shared";

const SOCIAL_LINKS: { icon: keyof typeof Ionicons.glyphMap; url: string; label: string }[] = [
  { icon: "logo-facebook", url: "https://facebook.com/swindoneats", label: "Facebook" },
  { icon: "logo-instagram", url: "https://instagram.com/swindoneats", label: "Instagram" },
  { icon: "logo-twitter", url: "https://twitter.com/swindoneats", label: "Twitter / X" },
  { icon: "logo-tiktok", url: "https://tiktok.com/@swindoneats", label: "TikTok" },
];

export function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing(5) }}>
      <AppHeader subtitle="About us" />

      <View style={styles.logoWrap}>
        <Logo size={88} />
      </View>

      <Text style={styles.title}>About Swindon Eats</Text>
      <Text style={styles.paragraph}>
        Swindon Eats connects hungry locals with the best independent restaurants across Swindon,
        all in one app — browse menus, order in a couple of taps, and track your delivery in real
        time.
      </Text>

      <Text style={styles.sectionTitle}>Our Vision</Text>
      <Text style={styles.paragraph}>
        To become Swindon's most loved way to discover and enjoy great food — supporting local
        restaurants to grow, and getting every order to our customers fast, fresh, and with care.
      </Text>

      <Text style={styles.sectionTitle}>Our address</Text>
      <Text style={styles.paragraph}>
        Swindon Eats{"\n"}
        14 Havelock Square{"\n"}
        Swindon, Wiltshire{"\n"}
        SN1 1HG{"\n"}
        United Kingdom
      </Text>

      <Text style={styles.sectionTitle}>Get in touch</Text>
      <Text style={styles.paragraph}>
        hello@swindoneats.example{"\n"}
        +44 1793 000000
      </Text>

      <Text style={styles.sectionTitle}>Follow us</Text>
      <View style={styles.socialRow}>
        {SOCIAL_LINKS.map((link) => (
          <Pressable
            key={link.label}
            style={styles.socialIcon}
            onPress={() => Linking.openURL(link.url)}
            accessibilityLabel={link.label}
          >
            <Ionicons name={link.icon} size={26} color={theme.colors.primary} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  logoWrap: { alignItems: "center", marginVertical: theme.spacing(4) },
  title: { fontSize: 22, fontWeight: "800", color: theme.colors.text, textAlign: "center" },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2),
  },
  paragraph: { fontSize: 14, lineHeight: 21, color: theme.colors.text, marginTop: theme.spacing(2) },
  socialRow: { flexDirection: "row", gap: theme.spacing(4), marginTop: theme.spacing(1) },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
