import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  SectionList,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { WORDS } from "../data/words";
import WordCard from "../components/WordCard";
import { shareWord } from "../utils/share";
import { lookupWord } from "../utils/claudeDictionary";
import { RADIUS } from "../utils/theme";
import { useColors, useTheme } from "../storage/ThemeContext";

// ── Static data (computed once at module load) ────────────────────────────────

const ALL_SORTED = [...WORDS].sort((a, b) => a.word.localeCompare(b.word));

// Set of lowercase words for instant O(1) exact-match check
const WORD_SET = new Set(ALL_SORTED.map((w) => w.word.toLowerCase()));

// Alphabetical sections: [{ title: 'A', data: [word, …] }, …]
const SECTIONS = (() => {
  const map = new Map();
  for (const word of ALL_SORTED) {
    const letter = word.word[0].toUpperCase();
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter).push(word);
  }
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
})();

// ─────────────────────────────────────────────────────────────────────────────

export default function DictionaryScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  // Claude lookup state
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  // null  → show alphabetical sections
  // array → show search results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return ALL_SORTED.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q)
    );
  }, [query]);

  const onLookup = async () => {
    const q = query.trim();
    if (!q || lookupLoading) return;
    setLookupLoading(true);
    setLookupError(null);
    try {
      const entry = await lookupWord(q);
      setSelected(entry);
    } catch (e) {
      setLookupError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  };

  // Header rendered above every search result list
  const SearchHeader = () => {
    const q = query.trim();
    if (!q || q.length < 2) return null;
    return (
      <AiLookupRow
        query={q}
        loading={lookupLoading}
        error={lookupError}
        onPress={onLookup}
        colors={colors}
        isDark={isDark}
      />
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800", marginBottom: 2 }}>
          Dictionary
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>
          {WORDS.length} curated words · any word via Claude AI
        </Text>

        {/* Search bar */}
        <View
          style={{
            marginTop: 14,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderColor: colors.divider,
            borderWidth: 1,
            borderRadius: 14,
            paddingHorizontal: 12,
          }}
        >
          <Icon name="search" size={18} color={colors.muted} />
          <TextInput
            testID="dictionary-search-input"
            placeholder="Search any English word…"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setLookupError(null);
            }}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={onLookup}
            style={{
              flex: 1,
              color: colors.text,
              paddingVertical: 12,
              paddingHorizontal: 10,
              fontSize: 14,
            }}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => { setQuery(""); setLookupError(null); }}
              hitSlop={10}
              testID="dictionary-search-clear"
            >
              <Icon name="x" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── List ───────────────────────────────────────────────────────────── */}
      {searchResults !== null ? (
        // ── Search results ──
        <FlatList
          data={searchResults}
          keyExtractor={(w) => `dict-search-${w.id}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={<SearchHeader />}
          ListEmptyComponent={() => (
            // Only shown if there are no curated results — the AI row still appears
            // above this via ListHeaderComponent.
            <View style={{ alignItems: "center", marginTop: 24 }}>
              <Text style={{ color: colors.muted, fontSize: 13 }}>
                No curated matches — try the Claude AI lookup above.
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <WordRow word={item} onPress={() => setSelected(item)} />
          )}
        />
      ) : (
        // ── Alphabetical browse ──
        <SectionList
          sections={SECTIONS}
          keyExtractor={(w) => `dict-${w.id}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderSectionHeader={({ section: { title, data } }) => (
            <View style={{ paddingTop: 22, paddingBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
                <Text style={{ color: colors.teal, fontSize: 20, fontWeight: "800", letterSpacing: 0.5 }}>
                  {title}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {data.length} {data.length === 1 ? "word" : "words"}
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: colors.divider, marginTop: 8 }} />
            </View>
          )}
          renderItem={({ item }) => (
            <WordRow word={item} onPress={() => setSelected(item)} />
          )}
        />
      )}

      {/* ── Word detail bottom sheet ────────────────────────────────────────── */}
      <Modal
        visible={!!selected}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
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
              backgroundColor: colors.bg,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              maxHeight: "90%",
              padding: 16,
              borderWidth: 1,
              borderColor: colors.divider,
            }}
          >
            {/* Close + optional AI badge */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              {selected?.id?.startsWith("claude:") ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    backgroundColor: "rgba(20,184,166,0.12)",
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Icon name="zap" size={12} color={colors.teal} />
                  <Text style={{ color: colors.teal, fontSize: 11, fontWeight: "700" }}>
                    Claude AI
                  </Text>
                </View>
              ) : (
                <View />
              )}
              <Pressable
                testID="dictionary-modal-close"
                onPress={() => setSelected(null)}
                hitSlop={12}
              >
                <Icon name="x" size={24} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <WordCard
                word={selected}
                onShare={() => shareWord(selected)}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── AI Lookup Row ─────────────────────────────────────────────────────────────

function AiLookupRow({ query, loading, error, onPress, colors, isDark }) {
  // Don't show if the word is already exactly in the curated list
  // (user can still find it in the results below)
  const alreadyCurated = WORD_SET.has(query.toLowerCase());

  if (error) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: "rgba(239,68,68,0.3)",
          borderWidth: 1,
          borderRadius: RADIUS.md,
          padding: 14,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: "rgba(239,68,68,0.12)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="alert-circle" size={18} color="#ef4444" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#ef4444", fontSize: 13, fontWeight: "600", marginBottom: 2 }}>
            Lookup failed
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 16 }}>
            {error}
          </Text>
        </View>
        <Pressable
          onPress={onPress}
          hitSlop={8}
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Text style={{ color: "#ef4444", fontSize: 12, fontWeight: "700" }}>
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={loading ? undefined : onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.surfaceAlt : colors.surface,
        borderWidth: 1.5,
        borderColor: colors.teal,
        borderRadius: RADIUS.md,
        padding: 14,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        opacity: loading ? 0.8 : 1,
      })}
    >
      {/* Icon */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: "rgba(20,184,166,0.12)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.teal} />
        ) : (
          <Icon name="zap" size={18} color={colors.teal} />
        )}
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700" }}>
          {loading
            ? `Looking up "${query}"…`
            : alreadyCurated
            ? `Full entry for "${query}"`
            : `Look up "${query}"`}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
          {loading
            ? "Asking Claude AI…"
            : "Full dictionary entry via Claude AI"}
        </Text>
      </View>

      {/* Chevron */}
      {!loading && (
        <Icon name="chevron-right" size={18} color={colors.teal} />
      )}
    </Pressable>
  );
}

// ── Curated word row ──────────────────────────────────────────────────────────

function WordRow({ word, onPress }) {
  const colors = useColors();
  return (
    <Pressable
      testID={`dictionary-row-${word.id}`}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.surfaceAlt : colors.surface,
        borderColor: colors.divider,
        borderWidth: 1,
        borderRadius: RADIUS.md,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
      })}
    >
      <View style={{ flex: 1 }}>
        {/* Word + category badge */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
            {word.word}
          </Text>
          <View
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: 999,
              paddingVertical: 2,
              paddingHorizontal: 8,
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600" }}>
              {word.category}
            </Text>
          </View>
        </View>

        {/* IPA pronunciation */}
        <Text style={{ color: colors.muted, fontSize: 12, fontFamily: "serif", marginBottom: 4 }}>
          {word.pronunciation}
        </Text>

        {/* Definition preview */}
        <Text numberOfLines={1} style={{ color: colors.muted, fontSize: 13, lineHeight: 18 }}>
          {word.definition}
        </Text>
      </View>

      <Icon name="chevron-right" size={16} color={colors.muted} style={{ marginLeft: 8 }} />
    </Pressable>
  );
}
