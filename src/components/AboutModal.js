import React from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "../storage/ThemeContext";
import { RADIUS } from "../utils/theme";

export default function AboutModal({ visible, onClose, version }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.75)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 24,
            paddingBottom: 24 + insets.bottom,
            maxHeight: "85%",
            borderWidth: 1,
            borderColor: colors.divider,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 22,
                fontWeight: "800",
              }}
            >
              About
            </Text>
            <Pressable
              testID="about-modal-close-button"
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Icon name="x" size={24} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text
              style={{
                color: colors.teal,
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Word of the Day · v{version}
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                lineHeight: 24,
                marginBottom: 16,
              }}
            >
              A daily vocabulary companion. Every day a new word arrives —
              complete with pronunciation, an everyday example and a glimpse of
              its etymology. Save your favourites, browse the last 30 days from
              the archive, and share the words you love.
            </Text>

            <Text
              style={{
                color: colors.muted,
                fontSize: 14,
                lineHeight: 22,
                marginBottom: 16,
              }}
            >
              Built with React Native + Expo. Words rotate deterministically by
              device date, so you always know what to learn next.
            </Text>

            <Text
              style={{
                color: colors.muted,
                fontSize: 12,
                lineHeight: 18,
              }}
            >
              © {new Date().getFullYear()} Word of the Day. All rights
              reserved.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
