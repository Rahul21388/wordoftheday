import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Animated,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { Swipeable } from "react-native-gesture-handler";
import { useFavourites } from "../storage/FavouritesContext";
import { WORDS } from "../data/words";
import WordCard from "../components/WordCard";
import { shareWord } from "../utils/share";
import { RADIUS } from "../utils/theme";
import { useColors } from "../storage/ThemeContext";

export default function FavouritesScreen() {
  const COLORS = useColors();
  const { ids, remove } = useFavourites();
  const [selected, setSelected] = useState(null);

  const items = useMemo(() => {
    const byId = new Map(WORDS.map((w) => [w.id, w]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  }, [ids]);

  if (items.length === 0) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, backgroundColor: COLORS.bg }}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <Text
            style={{ color: COLORS.text, fontSize: 28, fontWeight: "800" }}
          >
            Favourites
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: "rgba(20,184,166,0.12)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Icon name="heart" size={32} color={COLORS.teal} />
          </View>
          <Text
            style={{
              color: COLORS.text,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 6,
            }}
          >
            No favourites yet
          </Text>
          <Text
            style={{
              color: COLORS.muted,
              fontSize: 14,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Tap the heart on any word to save it here. Swipe left on a saved
            word to remove it.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
        <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: "800" }}>
          Favourites
        </Text>
        <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>
          {items.length} saved {items.length === 1 ? "word" : "words"}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(w) => `fav-${w.id}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <FavouriteRow
            word={item}
            onPress={() => setSelected(item)}
            onRemove={() => remove(item.id)}
          />
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
                testID="favourites-modal-close"
                onPress={() => setSelected(null)}
                hitSlop={12}
              >
                <Icon name="x" size={24} color={COLORS.muted} />
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

function FavouriteRow({ word, onPress, onRemove }) {
  const COLORS = useColors();
  const swipeRef = useRef(null);

  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.7],
      extrapolate: "clamp",
    });
    return (
      <Pressable
        testID={`favourites-remove-${word.id}`}
        onPress={() => {
          swipeRef.current?.close();
          onRemove();
        }}
        style={{
          width: 90,
          marginLeft: 8,
          borderRadius: RADIUS.md,
          backgroundColor: "rgba(239,68,68,0.18)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{ alignItems: "center", transform: [{ scale }] }}
        >
          <Icon name="trash-2" size={20} color="#ef4444" />
          <Text
            style={{
              color: "#ef4444",
              marginTop: 4,
              fontWeight: "700",
              fontSize: 12,
            }}
          >
            Remove
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
    >
      <Pressable
        testID={`favourite-row-${word.id}`}
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: pressed ? COLORS.surfaceAlt : COLORS.surface,
          borderColor: COLORS.divider,
          borderWidth: 1,
          borderRadius: RADIUS.md,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
        })}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: "rgba(239,68,68,0.15)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Icon name="heart" size={16} color="#ef4444" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: COLORS.text,
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            {word.word}
          </Text>
          <Text
            numberOfLines={2}
            style={{
              color: COLORS.muted,
              fontSize: 13,
              marginTop: 3,
              lineHeight: 18,
            }}
          >
            {word.definition}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}
