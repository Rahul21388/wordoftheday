import React, { useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WordCard from "../components/WordCard";
import BannerAdPlaceholder from "../components/BannerAdPlaceholder";
import { WORDS } from "../data/words";
import {
  getWordIndexForToday,
  formatDate,
} from "../utils/dateUtils";
import { shareWord } from "../utils/share";
import { maybeShowInterstitial } from "../utils/ads";
import { usePurchase } from "../storage/PurchaseContext";
import { useColors } from "../storage/ThemeContext";

export default function HomeScreen() {
  const colors = useColors();
  const { removeAds } = usePurchase();
  const [refreshKey] = useState(0);

  const todayWord = useMemo(() => {
    const idx = getWordIndexForToday();
    return WORDS[idx];
  }, [refreshKey]);

  const dateLabel = useMemo(() => formatDate(new Date()), [refreshKey]);

  const onShare = async () => {
    await shareWord(todayWord);
    await maybeShowInterstitial({ removeAds });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text
          style={{
            color: colors.muted,
            fontSize: 12,
            letterSpacing: 2,
            fontWeight: "700",
            textTransform: "uppercase",
          }}
        >
          Word of the Day
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: 22,
            fontWeight: "800",
            marginTop: 2,
          }}
        >
          {dateLabel}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <WordCard word={todayWord} onShare={onShare} />
      </ScrollView>

      <BannerAdPlaceholder hidden={removeAds} />
    </SafeAreaView>
  );
}
