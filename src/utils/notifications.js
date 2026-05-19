import * as Notifications from "expo-notifications";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";
import { WORDS } from "../data/words";
import { getWordIndexForOffset } from "./dateUtils";

const REMINDER_PREFIX = "wod-reminder-";
const CHANNEL_ID = "daily-reminder-v2"; // v2: HIGH importance for heads-up banners
const REFRESH_TASK = "wod-reminder-refresh";
const HORIZON_DAYS = 14; // notifications queued ahead

// Foreground display behaviour — show as a banner with sound.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Daily reminder",
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: "#14b8a6",
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  } catch (e) {}
}

export async function getPermissionStatus() {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return settings.status; // 'granted' | 'denied' | 'undetermined'
  } catch (e) {
    return "unsupported";
  }
}

export async function requestPermission() {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return "granted";
    const next = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return next.granted ? "granted" : "denied";
  } catch (e) {
    return "unsupported";
  }
}

function wordForOffsetDays(daysAhead) {
  // dateUtils.getWordIndexForOffset(daysAgo) — passing a negative offset
  // gives us the index for `daysAhead` days into the future.
  return WORDS[getWordIndexForOffset(-daysAhead)];
}

async function cancelOurReminders() {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      all
        .filter((n) => (n.identifier || "").startsWith(REMINDER_PREFIX))
        .map((n) =>
          Notifications.cancelScheduledNotificationAsync(n.identifier).catch(
            () => {}
          )
        )
    );
  } catch (e) {}
}

// Schedules HORIZON_DAYS one-off notifications, each personalised with the
// specific word that will be active on that day. Idempotent — cancels any
// previously-queued reminders first.
export async function scheduleDailyWordReminders({ hour = 9, minute = 0 } = {}) {
  await ensureAndroidChannel();
  await cancelOurReminders();

  const now = Date.now();
  for (let i = 0; i < HORIZON_DAYS; i++) {
    const fire = new Date();
    fire.setDate(fire.getDate() + i);
    fire.setHours(hour, minute, 0, 0);
    if (fire.getTime() <= now) continue; // skip times already passed today

    const word = wordForOffsetDays(i);
    if (!word) continue;

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: `${REMINDER_PREFIX}${i}`,
        content: {
          title: `Today's word: ${word.word}`,
          body: word.definition,
          sound: "default",
          data: { wordId: word.id, type: "daily-reminder" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fire,
          channelId: CHANNEL_ID,
        },
      });
    } catch (e) {}
  }
}

// Fires a test notification in 5 seconds — use to verify the pipeline works.
export async function sendTestNotification() {
  await ensureAndroidChannel();
  const fire = new Date(Date.now() + 5000);
  await Notifications.scheduleNotificationAsync({
    identifier: "wod-test",
    content: {
      title: "Test notification",
      body: "If you see this, notifications are working!",
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fire,
      channelId: CHANNEL_ID,
    },
  });
}

export async function cancelDailyReminder() {
  await cancelOurReminders();
  await stopBackgroundRefresh();
}

export async function getScheduledReminders() {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    return all.filter((n) => (n.identifier || "").startsWith(REMINDER_PREFIX));
  } catch (e) {
    return [];
  }
}

// --------------------------------------------------------------------------
// Background refresh: keeps the rolling 14-day reminder queue topped up for
// users who don't open the app every day. Best-effort — the OS decides how
// often to actually run the task.
// --------------------------------------------------------------------------

if (!TaskManager.isTaskDefined(REFRESH_TASK)) {
  TaskManager.defineTask(REFRESH_TASK, async () => {
    try {
      const all = await Notifications.getAllScheduledNotificationsAsync();
      const ours = all.filter((n) =>
        (n.identifier || "").startsWith(REMINDER_PREFIX)
      );
      // If we still have a healthy queue, no-op.
      if (ours.length >= Math.floor(HORIZON_DAYS / 2)) {
        return;
      }
      // Otherwise we need the user's chosen time — read directly from
      // AsyncStorage to avoid touching React state from the task.
      const AsyncStorage = (
        await import("@react-native-async-storage/async-storage")
      ).default;
      const raw = await AsyncStorage.getItem("@wod/reminder/v1");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.enabled) return;
      await scheduleDailyWordReminders({
        hour: parsed.hour ?? 9,
        minute: parsed.minute ?? 0,
      });
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch (e) {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

export async function startBackgroundRefresh() {
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status === BackgroundTask.BackgroundTaskStatus.Restricted) return;
    await BackgroundTask.registerTaskAsync(REFRESH_TASK, {
      minimumInterval: 6 * 60, // 6 hours in minutes
    });
  } catch (e) {}
}

export async function stopBackgroundRefresh() {
  try {
    const registered = await TaskManager.isTaskRegisteredAsync(REFRESH_TASK);
    if (registered) await BackgroundTask.unregisterTaskAsync(REFRESH_TASK);
  } catch (e) {}
}
