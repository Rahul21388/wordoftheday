import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Linking } from "react-native";
import {
  scheduleDailyWordReminders,
  cancelDailyReminder,
  requestPermission,
  getPermissionStatus,
  startBackgroundRefresh,
  stopBackgroundRefresh,
} from "../utils/notifications";

const STORAGE_KEY = "@wod/reminder/v1";
const DEFAULT_HOUR = 9;
const DEFAULT_MINUTE = 0;

const ReminderContext = createContext({
  enabled: false,
  hour: DEFAULT_HOUR,
  minute: DEFAULT_MINUTE,
  ready: false,
  toggle: async () => {},
  setTime: async () => {},
});

export function ReminderProvider({ children }) {
  const [state, setState] = useState({
    enabled: false,
    hour: DEFAULT_HOUR,
    minute: DEFAULT_MINUTE,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            const next = {
              enabled: !!parsed.enabled,
              hour: Number.isInteger(parsed.hour) ? parsed.hour : DEFAULT_HOUR,
              minute: Number.isInteger(parsed.minute)
                ? parsed.minute
                : DEFAULT_MINUTE,
            };
            setState(next);
            // Re-arm reminders + background refresh on every cold launch so
            // the rolling 14-day queue stays current with today's words.
            if (next.enabled) {
              const status = await getPermissionStatus();
              if (status === "granted") {
                await scheduleDailyWordReminders({
                  hour: next.hour,
                  minute: next.minute,
                });
                await startBackgroundRefresh();
              }
            }
          }
        }
      } catch (e) {}
      setReady(true);
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {}
  }, []);

  const toggle = useCallback(async () => {
    if (state.enabled) {
      await cancelDailyReminder();
      await stopBackgroundRefresh();
      await persist({ ...state, enabled: false });
      return { enabled: false };
    }
    const status = await requestPermission();
    if (status !== "granted") {
      Alert.alert(
        "Notifications disabled",
        "Enable notifications for Word of the Day in your device settings to receive daily reminders.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open settings", onPress: () => Linking.openSettings() },
        ]
      );
      return { enabled: false, denied: true };
    }
    await scheduleDailyWordReminders({ hour: state.hour, minute: state.minute });
    await startBackgroundRefresh();
    await persist({ ...state, enabled: true });
    return { enabled: true };
  }, [state, persist]);

  const setTime = useCallback(
    async (hour, minute) => {
      const safeHour = Math.max(0, Math.min(23, hour));
      const safeMinute = Math.max(0, Math.min(59, minute));
      const next = { ...state, hour: safeHour, minute: safeMinute };
      await persist(next);
      if (state.enabled) {
        await scheduleDailyWordReminders({
          hour: safeHour,
          minute: safeMinute,
        });
      }
    },
    [state, persist]
  );

  const value = useMemo(
    () => ({ ...state, ready, toggle, setTime }),
    [state, ready, toggle, setTime]
  );

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminder() {
  return useContext(ReminderContext);
}
