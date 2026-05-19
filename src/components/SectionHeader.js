import React from "react";
import { Text, View } from "react-native";
import { useColors } from "../storage/ThemeContext";

export default function SectionHeader({ title }) {
  const colors = useColors();
  return (
    <View style={{ marginTop: 22, marginBottom: 10, paddingHorizontal: 4 }}>
      <Text
        style={{
          color: colors.muted,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>
    </View>
  );
}
