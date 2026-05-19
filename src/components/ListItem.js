import React from "react";
import { Pressable, View, Text } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useColors } from "../storage/ThemeContext";
import { RADIUS } from "../utils/theme";

export default function ListItem({
  icon,
  iconColor,
  label,
  description,
  rightLabel,
  rightElement,
  showChevron = false,
  onPress,
  disabled = false,
  testID,
}) {
  const colors = useColors();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: pressed ? colors.surfaceAlt : colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: RADIUS.md,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.divider,
        opacity: disabled ? 0.5 : 1,
      })}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: "rgba(20,184,166,0.12)",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <Icon name={icon} size={18} color={iconColor || colors.teal} />
      </View>

      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 15,
            fontWeight: "600",
          }}
        >
          {label}
        </Text>
        {!!description && (
          <Text
            numberOfLines={2}
            style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}
          >
            {description}
          </Text>
        )}
      </View>

      {!!rightLabel && (
        <Text
          style={{
            color: colors.muted,
            fontSize: 13,
            marginRight: showChevron ? 6 : 0,
          }}
        >
          {rightLabel}
        </Text>
      )}
      {rightElement}
      {showChevron && (
        <Icon name="chevron-right" size={18} color={colors.muted} />
      )}
    </Pressable>
  );
}
