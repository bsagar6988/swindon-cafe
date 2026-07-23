import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@restaurant/shared";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
}

export function StarRating({ rating, onChange, size = 28 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.row}>
      {stars.map((n) => {
        const filled = n <= rating;
        const star = (
          <Text style={[styles.star, { fontSize: size, color: filled ? theme.colors.warning : theme.colors.border }]}>
            ★
          </Text>
        );
        if (!onChange) return <View key={n}>{star}</View>;
        return (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={6}>
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 4 },
  star: { fontWeight: "700" },
});
