import React from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { getBannerAdUnitId } from "../utils/ads";

export default function BannerAdPlaceholder({ hidden }) {
  if (hidden) return null;

  const unitId = getBannerAdUnitId();
  if (!unitId) return null;

  return (
    // Let the native BannerAd control its own height — don't clip or
    // constrain it with a JS-managed height that can stay at 0 if
    // onAdLoaded fires before the state update is flushed.
    <View style={{ width: "100%", alignItems: "center", marginBottom: 10 }}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          // Allow personalized ads (higher fill rate & revenue).
          // If you add a GDPR consent dialog later, pass
          // requestNonPersonalizedAdsOnly: !userConsented here instead.
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdFailedToLoad={(e) => {
          if (__DEV__) console.warn("[BannerAd] failed to load:", e?.message ?? e);
        }}
      />
    </View>
  );
}
