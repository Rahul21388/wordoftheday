import React, { useState } from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { getBannerAdUnitId } from "../utils/ads";

export default function BannerAdPlaceholder({ hidden }) {
  const [adHeight, setAdHeight] = useState(0);

  if (hidden) return null;

  const unitId = getBannerAdUnitId();
  if (!unitId) return null;

  return (
    <View
      style={{
        alignItems: "center",
        height: adHeight > 0 ? adHeight : undefined,
        marginBottom: 10,
      }}
    >
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={(e) => setAdHeight(e?.height ?? 50)}
        onAdFailedToLoad={() => setAdHeight(0)}
      />
    </View>
  );
}
