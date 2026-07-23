import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { theme } from "@restaurant/shared";

interface MenuItemThumbnailProps {
  imageUrl?: string | null;
  name: string;
  size: number;
  rounded?: number;
}

export function MenuItemThumbnail({ imageUrl, name, size, rounded }: MenuItemThumbnailProps) {
  const radius = rounded ?? theme.radius.md;
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: size, height: size, borderRadius: radius }]}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}>
      <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>{name[0]?.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: theme.colors.surface },
  fallback: {
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: { fontWeight: "800", color: theme.colors.primary },
});
