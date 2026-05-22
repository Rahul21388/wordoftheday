import { Platform } from "react-native";
import mobileAds, {
  InterstitialAd,
  AdEventType,
  MaxAdContentRating,
  TestIds,
} from "react-native-google-mobile-ads";

// Production ad unit IDs — hardcoded so they are always available regardless
// of whether Constants.expoConfig is populated in the EAS build environment.
// (Reading them from app.json extra at runtime can silently return undefined
//  in certain EAS configurations, causing BannerAdPlaceholder to return null.)
const PROD_IDS = {
  android: {
    banner: "ca-app-pub-9942161594730475/3437215532",
    interstitial: "ca-app-pub-9942161594730475/6499631210",
  },
  ios: {
    banner: "ca-app-pub-3940256099942544/2934735716",
    interstitial: "ca-app-pub-3940256099942544/4411468910",
  },
};

// Use the library's official test IDs in dev builds — real IDs are
// blocked by Google in debug APKs to prevent invalid traffic.
export function getBannerAdUnitId() {
  if (__DEV__) return TestIds.ADAPTIVE_BANNER;
  return Platform.OS === "ios" ? PROD_IDS.ios.banner : PROD_IDS.android.banner;
}

export function getInterstitialAdUnitId() {
  if (__DEV__) return TestIds.INTERSTITIAL;
  return Platform.OS === "ios"
    ? PROD_IDS.ios.interstitial
    : PROD_IDS.android.interstitial;
}

// ---------- Initialisation ----------

export async function initializeAds() {
  // Bug fix: separate try/catch blocks so a config/init failure
  // does NOT prevent _loadInterstitial() from being called.
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    await mobileAds().initialize();
  } catch (e) {
    if (__DEV__) console.warn("[Ads] initializeAds failed:", e?.message ?? e);
  }
  // Always attempt to preload the interstitial regardless of init result.
  _loadInterstitial();
}

// ---------- Interstitial singleton ----------

let _interstitial = null;
let _interstitialLoaded = false;
let _retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

function _loadInterstitial() {
  const unitId = getInterstitialAdUnitId();
  if (!unitId) return;

  _interstitialLoaded = false;
  _interstitial = InterstitialAd.createForAdRequest(unitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  _interstitial.addAdEventListener(AdEventType.LOADED, () => {
    _interstitialLoaded = true;
    _retryCount = 0;
    if (__DEV__) console.log("[Ads] Interstitial loaded and ready.");
  });

  _interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    _interstitialLoaded = false;
    _retryCount = 0;
    // Preload the next one immediately after dismissal.
    _loadInterstitial();
  });

  _interstitial.addAdEventListener(AdEventType.ERROR, (e) => {
    _interstitialLoaded = false;
    if (__DEV__) console.warn("[Ads] Interstitial load error:", e?.message ?? e);
    // Bug fix: retry on failure so one failed load doesn't kill
    // the interstitial for the whole session.
    if (_retryCount < MAX_RETRIES) {
      _retryCount++;
      setTimeout(_loadInterstitial, RETRY_DELAY_MS);
    }
  });

  _interstitial.load();
}

// Called from the Share action on HomeScreen.
// 50% probability gate — intentionally skips every other tap.
export async function maybeShowInterstitial({ removeAds }) {
  if (removeAds) return false;
  if (Math.random() >= 0.5) return false;
  if (!_interstitial || !_interstitialLoaded) {
    if (__DEV__) console.log("[Ads] Interstitial skipped — not loaded yet.");
    return false;
  }
  try {
    await _interstitial.show();
    return true;
  } catch (e) {
    if (__DEV__) console.warn("[Ads] Interstitial show error:", e?.message ?? e);
    return false;
  }
}
