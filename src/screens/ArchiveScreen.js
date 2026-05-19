import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { WORDS } from "../data/words";
import {
  getWordIndexForOffset,
  getDateForOffset,
  formatShortDate,
} from "../utils/dateUtils";
import WordCard from "../components/WordCard";
import { shareWord } from "../utils/share";
import { RADIUS } from "../utils/theme";
import { useColors } from "../storage/ThemeContext";

const DAYS = 30;

export default function ArchiveScreen() {
  const COLORS = useColors();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const data = useMemo(() => {
    const items = [];
    for (let i = 0; i < DAYS; i++) {
      const idx = getWordIndexForOffset(i);
      const w = WORDS[idx];
      const date = getDateForOffset(i);
      items.push({
        key: `${i}-${w.id}`,
        offset: i,
        word: w,
        dateLabel: i === 0 ? "Today" : i === 1 ? "Yesterday" : formatShortDate(date),
        date,
      });
    }
    return items;
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.trim().toLowerCase();
    return data.filter(
      (item) =>
        item.word.word.toLowerCase().includes(q) ||
        item.word.definition.toLowerCase().includes(q)
    );
  }, [data, query]);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: COLORS.bg }}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <Text
          style={{
            color: COLORS.text,
            fontSize: 28,
            fontWeight: "800",
            marginBottom: 4,
          }}
        >
          Archive
        </Text>
        <Text style={{ color: COLORS.muted, fontSize: 13 }}>
          The last {DAYS} days of words
        </Text>

        <View
          style={{
            marginTop: 14,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: COLORS.surface,
            borderColor: COLORS.divider,
            borderWidth: 1,
            borderRadius: 14,
            paddingHorizontal: 12,
          }}
        >
          <Icon name="search" size={18} color={COLORS.muted} />
          <TextInput
            testID="archive-search-input"
            placeholder="Search words or definitions"
            placeholderTextColor={COLORS.muted}
            value={query}
            onChangeText={setQuery}
            style={{
              flex: 1,
              color: COLORS.text,
              paddingVertical: 12,
              paddingHorizontal: 10,
              fontSize: 14,
            }}
          />
          {query.length > 0 && (
            <Pressable
              testID="archive-search-clear"
              onPress={() => setQuery("")}
              hitSlop={10}
            >
              <Icon name="x" size={18} color={COLORS.muted} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 32,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Icon name="inbox" size={40} color={COLORS.muted} />
            <Text style={{ color: COLORS.muted, marginTop: 12 }}>
              No words match &ldquo;{query}&rdquo;
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            testID={`archive-item-${item.word.id}`}
            onPress={() => {
              setSelected(item.word);
              setSelectedDate(
                item.date.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              );
            }}
            style={({ pressed }) => ({
              backgroundColor: pressed ? COLORS.surfaceAlt : COLORS.surface,
              borderColor: COLORS.divider,
              borderWidth: 1,
              borderRadius: RADIUS.md,
              padding: 14,
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
              <Text
                style={{
                  color: COLORS.text,
                  fontSize: 17,
                  fontWeight: "700",
                  marginRight: 8,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {item.word.word}
              </Text>
              <Text style={{ color: COLORS.teal, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 }}>
                {item.dateLabel.toUpperCase()}
              </Text>
            </View>
            <Text
              numberOfLines={2}
              style={{
                color: COLORS.muted,
                fontSize: 13,
                lineHeight: 18,
              }}
            >
              {item.word.definition}
            </Text>
          </Pressable>
        )}
      />

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
              backgroundColor: COLORS.bg,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              maxHeight: "90%",
              padding: 16,
              borderWidth: 1,
              borderColor: COLORS.divider,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginBottom: 8,
              }}
            >
              <Pressable
                testID="archive-modal-close"
                onPress={() => setSelected(null)}
                hitSlop={12}
              >
                <Icon name="x" size={24} color={COLORS.muted} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <WordCard
                word={selected}
                date={selectedDate}
                onShare={() => shareWord(selected)}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
