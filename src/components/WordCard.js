import React, { useEffect, useRef } from "react";
import { Animated, View, Text, Pressable } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useColors } from "../storage/ThemeContext";
import { RADIUS } from "../utils/theme";
import { useFavourites } from "../storage/FavouritesContext";

export default function WordCard({ word, date, onShare, compact = false }) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(20)).current;
  const { isFavourite, toggleFavourite } = useFavourites();

  useEffect(() => {
    opacity.setValue(0);
    translate.setValue(20);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [word?.id]);

  if (!word) return null;
  const fav = isFavourite(word.id);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY: translate }],
        backgroundColor: colors.surface,
        borderRadius: RADIUS.xl,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.divider,
      }}
    >
      {!!date && (
        <Text
          style={{
            color: colors.teal,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          {date}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: compact ? 32 : 40,
            fontWeight: "800",
            letterSpacing: -0.5,
          }}
        >
          {word.word}
        </Text>
        <View
          style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: 999,
            paddingVertical: 4,
            paddingHorizontal: 10,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: colors.muted,
              fontSize: 12,
              fontWeight: "600",
              letterSpacing: 0.5,
            }}
          >
            {word.category}
          </Text>
        </View>
      </View>

      <Text
        style={{
          color: colors.muted,
          fontSize: 14,
          marginTop: 6,
          fontFamily: "serif",
        }}
      >
        {word.pronunciation}
      </Text>

      <View
        style={{ height: 1, backgroundColor: colors.divider, marginVertical: 18 }}
      />

      <SectionLabel text="Definition" color={colors.teal} />
      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          lineHeight: 24,
          marginBottom: 16,
        }}
      >
        {word.definition}
      </Text>

      <SectionLabel text="Example" color={colors.teal} />
      <Text
        style={{
          color: colors.text,
          fontSize: 15,
          lineHeight: 23,
          fontStyle: "italic",
          marginBottom: 16,
        }}
      >
        &ldquo;{word.example}&rdquo;
      </Text>

      <SectionLabel text="Etymology" color={colors.teal} />
      <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 22 }}>
        {word.etymology}
      </Text>

      {!compact && (
        <View style={{ flexDirection: "row", marginTop: 24, gap: 12 }}>
          <Pressable
            onPress={onShare}
            testID="word-card-share-button"
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: colors.teal,
              opacity: pressed ? 0.8 : 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              borderRadius: RADIUS.md,
              gap: 8,
            })}
          >
            <Icon name="upload" color="#ffffff" size={18} />
            <Text style={{ color: "#ffffff", fontWeight: "800", fontSize: 15 }}>
              Share
            </Text>
          </Pressable>

          <Pressable
            testID="word-card-favourite-button"
            onPress={() => toggleFavourite(word.id)}
            style={({ pressed }) => ({
              width: 56,
              opacity: pressed ? 0.7 : 1,
              backgroundColor: fav ? "rgba(239,68,68,0.12)" : colors.surfaceAlt,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: RADIUS.md,
              borderWidth: 1,
              borderColor: fav ? "rgba(239,68,68,0.4)" : colors.divider,
            })}
          >
            <Icon name="heart" size={22} color={fav ? "#ef4444" : colors.muted} />
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

function SectionLabel({ text, color }) {
  return (
    <Text
      style={{
        color,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginBottom: 6,
      }}
    >
      {text}
    </Text>
  );
}
