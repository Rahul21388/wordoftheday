import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from "react-native";
import TimePicker from "../components/TimePicker";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import * as Application from "expo-application";
import SectionHeader from "../components/SectionHeader";
import ListItem from "../components/ListItem";
import AboutModal from "../components/AboutModal";
import { UpdateModal } from "../components/UpdateGate";
import { usePurchase } from "../storage/PurchaseContext";
import { useReminder } from "../storage/ReminderContext";
import { useColors, useTheme } from "../storage/ThemeContext";
import { checkForUpdates, applyUpdate } from "../utils/updates";
import {
  openRatePage,
  openFeedbackEmail,
  shareApp,
  openPrivacyPolicy,
} from "../utils/share";

function formatTime(hour, minute) {
  const h12 = ((hour + 11) % 12) + 1;
  const ampm = hour >= 12 ? "PM" : "AM";
  const mm = String(minute).padStart(2, "0");
  return `${h12}:${mm} ${ampm}`;
}

export default function SettingsScreen() {
  const colors = useColors();
  const { isDark, toggleTheme } = useTheme();
  const { removeAds, buyRemoveAds, restore } = usePurchase();
  const reminder = useReminder();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const version =
    Application.nativeApplicationVersion ||
    Constants.expoConfig?.version ||
    "1.0.0";

  const onCheckUpdates = async () => {
    if (checking) return;
    setChecking(true);
    const r = await checkForUpdates();
    setChecking(false);
    if (r.devMode) {
      Alert.alert(
        "Updates",
        "OTA updates only run in production builds. You are in development mode."
      );
      return;
    }
    if (r.available) {
      setUpdateOpen(true);
    } else {
      Alert.alert("Up to date", "You are running the latest version.");
    }
  };

  const onBuyRemoveAds = async () => {
    if (removeAds) {
      Alert.alert("Remove Ads", "You already have ad-free access. Thank you!");
      return;
    }
    const r = await buyRemoveAds();
    if (r.purchased) {
      Alert.alert("Success", "Ads have been removed. Enjoy!");
    }
  };

  const onChangeTime = () => setTimePickerOpen(true);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800" }}>
          Settings
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Reminders" />
        <ListItem
          testID="settings-daily-reminder-toggle"
          icon="bell"
          label="Daily reminder"
          description={
            reminder.enabled
              ? `You'll be nudged every day at ${formatTime(reminder.hour, reminder.minute)}.`
              : "Get a friendly nudge each day to learn the new word."
          }
          rightElement={
            <Switch
              testID="settings-daily-reminder-switch"
              value={reminder.enabled}
              onValueChange={reminder.toggle}
              thumbColor={Platform.OS === "android" ? colors.text : undefined}
              trackColor={{ false: colors.surfaceAlt, true: colors.teal }}
              ios_backgroundColor={colors.surfaceAlt}
              style={{ marginRight: 6 }}
            />
          }
          showChevron={false}
        />
        {reminder.enabled && (
          <ListItem
            testID="settings-daily-reminder-time"
            icon="clock"
            label="Reminder time"
            description="Tap to choose any time."
            rightLabel={formatTime(reminder.hour, reminder.minute)}
            onPress={onChangeTime}
          />
        )}

        <SectionHeader title="Appearance" />
        <ListItem
          icon={isDark ? "moon" : "sun"}
          label={isDark ? "Dark Mode" : "Light Mode"}
          description="Toggle the app's colour scheme."
          showChevron={false}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              thumbColor={Platform.OS === "android" ? colors.text : undefined}
              trackColor={{ false: colors.surfaceAlt, true: colors.teal }}
              ios_backgroundColor={colors.surfaceAlt}
              style={{ marginRight: 6 }}
            />
          }
        />

        <SectionHeader title="Purchases" />
        <ListItem
          testID="settings-remove-ads"
          icon="shield"
          label={removeAds ? "Purchased — Ads Removed" : "Remove Ads"}
          description={
            removeAds
              ? "Thank you for supporting the app."
              : "One-time purchase to hide all banner and interstitial ads."
          }
          rightLabel={removeAds ? "Active" : undefined}
          showChevron={!removeAds}
          onPress={onBuyRemoveAds}
        />
        {!removeAds && (
          <ListItem
            testID="settings-restore-purchases"
            icon="refresh-cw"
            label="Restore Purchases"
            description="Already paid on another device? Restore here."
            onPress={restore}
          />
        )}

        <SectionHeader title="App Updates" />
        <ListItem
          testID="settings-check-updates"
          icon="download-cloud"
          label="Check for Updates"
          description="Look for the latest over-the-air update."
          rightElement={
            checking ? (
              <ActivityIndicator
                size="small"
                color={colors.teal}
                style={{ marginRight: 6 }}
              />
            ) : null
          }
          showChevron={false}
          onPress={onCheckUpdates}
        />

        <SectionHeader title="Discovery" />
        <ListItem
          testID="settings-rate-app"
          icon="star"
          label="Rate This App"
          description="Tell others what you think on the store."
          showChevron={false}
          onPress={openRatePage}
        />
        <ListItem
          testID="settings-send-feedback"
          icon="mail"
          label="Send Feedback"
          description="Email us — device info will be pre-filled."
          showChevron={false}
          onPress={openFeedbackEmail}
        />
        <ListItem
          testID="settings-share-friends"
          icon="share-2"
          label="Share with Friends"
          description="Send the app link to anyone you know."
          showChevron={false}
          onPress={shareApp}
        />

        <SectionHeader title="Info" />
        <ListItem
          testID="settings-about"
          icon="info"
          label="About"
          description="What this app is and who built it."
          showChevron={false}
          onPress={() => setAboutOpen(true)}
        />
        <ListItem
          testID="settings-privacy"
          icon="lock"
          label="Privacy Policy"
          description="Read how your data is handled."
          showChevron={false}
          onPress={openPrivacyPolicy}
        />
        <ListItem
          testID="settings-version"
          icon="tag"
          label="Version"
          rightLabel={`v${version}`}
          showChevron={false}
        />
      </ScrollView>

      <TimePicker
        visible={timePickerOpen}
        hour={reminder.hour}
        minute={reminder.minute}
        onConfirm={(h, m) => {
          reminder.setTime(h, m);
          setTimePickerOpen(false);
        }}
        onCancel={() => setTimePickerOpen(false)}
      />
      <AboutModal
        visible={aboutOpen}
        onClose={() => setAboutOpen(false)}
        version={version}
      />
      <UpdateModal
        visible={updateOpen}
        onDismiss={() => setUpdateOpen(false)}
        onRestart={async () => {
          setUpdateOpen(false);
          await applyUpdate();
        }}
      />
    </SafeAreaView>
  );
}
