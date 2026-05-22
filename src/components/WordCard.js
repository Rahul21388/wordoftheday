import React, { useEffect, useRef, useState } from "react";
import { Animated, View, Text, Pressable } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useColors, useTheme } from "../storage/ThemeContext";
import { RADIUS } from "../utils/theme";
import { useFavourites } from "../storage/FavouritesContext";
import { speakWord, stopSpeech } from "../utils/speech";

export default function WordCard({ word, date, onShare, compact = false }) {
  const colors = useColors();
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(20)).current;
  const { isFavourite, toggleFavourite } = useFavourites();

  // ── Text-to-speech ─────────────────────────────────────────────────────────
  const [speaking, setSpeaking] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  // Pulse the speaker icon while TTS is active.
  useEffect(() => {
    if (speaking) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 650,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseLoop.current = null;
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [speaking]);

  // Stop speech automatically when the displayed word changes.
  useEffect(() => {
    stopSpeech();
    setSpeaking(false);
  }, [word?.id]);

  // Stop speech on unmount (e.g. navigating away).
  useEffect(() => {
    return () => stopSpeech();
  }, []);

  const onSpeak = () => {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speakWord(word.word, {
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
    });
  };
  // ───────────────────────────────────────────────────────────────────────────

  // Card entrance animation.
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

      {/* Pronunciation row with inline speaker button — Google Dictionary style */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 6,
        }}
      >
        <Text
          style={{
            flex: 1,
            color: colors.muted,
            fontSize: 14,
            fontFamily: "serif",
          }}
        >
          {word.pronunciation}
        </Text>

        <Pressable
          testID="word-card-speak-button"
          onPress={onSpeak}
          hitSlop={10}
          style={({ pressed }) => ({
            padding: 6,
            borderRadius: 999,
            backgroundColor: speaking
              ? isDark
                ? "rgba(20,184,166,0.15)"
                : "rgba(20,184,166,0.12)"
              : "transparent",
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Icon
              name={speaking ? "volume-2" : "volume-1"}
              size={18}
              color={speaking ? colors.teal : colors.muted}
            />
          </Animated.View>
        </Pressable>
      </View>

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
              backgroundColor: isDark ? colors.teal : "rgba(20,184,166,0.12)",
              borderWidth: isDark ? 0 : 1.5,
              borderColor: colors.teal,
              opacity: pressed ? 0.7 : 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              borderRadius: RADIUS.md,
              gap: 8,
            })}
          >
            <Icon
              name="upload"
              color={isDark ? "#ffffff" : colors.teal}
              size={18}
            />
            <Text
              style={{
                color: isDark ? "#ffffff" : colors.teal,
                fontWeight: "800",
                fontSize: 15,
              }}
            >
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
