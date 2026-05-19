import { Platform } from "react-native";
import Constants from "expo-constants";
import mobileAds, {
  InterstitialAd,
  AdEventType,
  MaxAdContentRating,
} from "react-native-google-mobile-ads";

const extra = Constants.expoConfig?.extra ?? {};

export function getBannerAdUnitId() {
  return Platform.OS === "ios"
    ? extra.admobIosBannerId
    : extra.admobAndroidBannerId;
}

export function getInterstitialAdUnitId() {
  return Platform.OS === "ios"
    ? extra.admobIosInterstitialId
    : extra.admobAndroidInterstitialId;
}

// ---------- Initialisation ----------

export async function initializeAds() {
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    await mobileAds().initialize();
    _loadInterstitial();
  } catch (e) {}
}

// ---------- Interstitial singleton ----------

let _interstitial = null;
let _interstitialLoaded = false;

function _loadInterstitial() {
  const unitId = getInterstitialAdUnitId();
  if (!unitId) return;

  _interstitial = InterstitialAd.createForAdRequest(unitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  _interstitial.addAdEventListener(AdEventType.LOADED, () => {
    _interstitialLoaded = true;
  });

  _interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    _interstitialLoaded = false;
    // Preload the next one immediately after dismissal
    _loadInterstitial();
  });

  _interstitial.addAdEventListener(AdEventType.ERROR, () => {
    _interstitialLoaded = false;
  });

  _interstitial.load();
}

// 50% probability gate — called from the Share action on Home.
export async function maybeShowInterstitial({ removeAds }) {
  if (removeAds) return false;
  if (Math.random() >= 0.5) return false;
  if (!_interstitial || !_interstitialLoaded) return false;
  try {
    await _interstitial.show();
    return true;
  } catch (e) {
    return false;
  }
}
