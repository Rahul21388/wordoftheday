import "./global.css";
import React, { useEffect } from "react";
import { LogBox } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";
import { FavouritesProvider } from "./src/storage/FavouritesContext";
import { PurchaseProvider } from "./src/storage/PurchaseContext";
import { ReminderProvider } from "./src/storage/ReminderContext";
import { ThemeProvider, useColors } from "./src/storage/ThemeContext";
import UpdateGate from "./src/components/UpdateGate";
import { initializeAds } from "./src/utils/ads";

LogBox.ignoreLogs([
  "shouldShowAlert is deprecated",
  "react-native-worklets",
  "Bridgeless",
]);

function AppInner() {
  const colors = useColors();

  useEffect(() => {
    initializeAds();
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <PurchaseProvider>
          <FavouritesProvider>
            <ReminderProvider>
              <StatusBar style="auto" />
              <UpdateGate>
                <AppNavigator />
              </UpdateGate>
            </ReminderProvider>
          </FavouritesProvider>
        </PurchaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
