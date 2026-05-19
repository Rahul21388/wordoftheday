import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const DARK_COLORS = {
  bg: "#1a1a1a",
  surface: "#222222",
  surfaceAlt: "#2a2a2a",
  divider: "#2f2f2f",
  text: "#ffffff",
  muted: "#9ca3af",
  teal: "#14b8a6",
  tealSoft: "#0f766e",
  danger: "#ef4444",
  warn: "#f59e0b",
  success: "#22c55e",
};

export const LIGHT_COLORS = {
  bg: "#f5f5f5",
  surface: "#ffffff",
  surfaceAlt: "#ebebeb",
  divider: "#e0e0e0",
  text: "#111827",
  muted: "#6b7280",
  teal: "#0d9488",
  tealSoft: "#0f766e",
  danger: "#ef4444",
  warn: "#f59e0b",
  success: "#22c55e",
};

const STORAGE_KEY = "@wod/theme/v1";

const ThemeCtx = createContext({
  colors: DARK_COLORS,
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val !== null) setIsDark(val !== "light");
    });
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  }, [isDark]);

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const value = useMemo(
    () => ({ colors, isDark, toggleTheme }),
    [colors, isDark, toggleTheme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
export const useColors = () => useContext(ThemeCtx).colors;
