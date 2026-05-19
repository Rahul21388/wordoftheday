import { Share, Linking, Platform, Alert } from "react-native";
import Constants from "expo-constants";
import * as Application from "expo-application";

const extra = Constants.expoConfig?.extra ?? {};

export async function shareWord(word) {
  if (!word) return;
  const message = `Word: ${word.word}\nDefinition: ${word.definition}\nExample: ${word.example}\n\nLearn a new word every day with Word of the Day.`;
  try {
    await Share.share({ message, title: word.word });
  } catch (e) {
    // user cancelled or share unavailable
  }
}

export async function shareApp() {
  const url =
    Platform.OS === "ios" ? extra.appStoreUrl : extra.playStoreUrl;
  const message = `Expand your vocabulary one word at a time. Download "Word of the Day": ${url ?? ""}`;
  try {
    await Share.share({ message, title: "Word of the Day" });
  } catch (e) {}
}

export async function openRatePage() {
  const url =
    Platform.OS === "ios" ? extra.appStoreUrl : extra.playStoreUrl;
  if (!url) {
    Alert.alert("Rate", "Store link is not configured yet.");
    return;
  }
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) Linking.openURL(url);
    else Alert.alert("Rate", "Could not open the store page.");
  } catch (e) {
    Alert.alert("Rate", "Could not open the store page.");
  }
}

export async function openFeedbackEmail() {
  const to = extra.feedbackEmail || "admin@rahulprakash.co.in";
  const version =
    Application.nativeApplicationVersion ||
    Constants.expoConfig?.version ||
    "1.0.0";
  const subject = encodeURIComponent(
    `Word of the Day feedback (v${version})`
  );
  const body = encodeURIComponent(
    `\n\n---\nApp: Word of the Day\nVersion: ${version}\nPlatform: ${Platform.OS} ${Platform.Version}\nDevice: ${Application.applicationName ?? ""}\n`
  );
  const url = `mailto:${to}?subject=${subject}&body=${body}`;
  try {
    await Linking.openURL(url);
  } catch (e) {
    Alert.alert("Feedback", "No email client is configured on this device.");
  }
}

export async function openPrivacyPolicy() {
  const url = extra.privacyPolicyUrl || "https://example.com/privacy";
  try {
    await Linking.openURL(url);
  } catch (e) {
    Alert.alert("Privacy", "Could not open the privacy policy.");
  }
}
