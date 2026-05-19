import * as Updates from "expo-updates";
import { Alert } from "react-native";

// Returns { available: boolean, info?: any }
export async function checkForUpdates() {
  if (__DEV__) {
    return { available: false, devMode: true };
  }
  try {
    const result = await Updates.checkForUpdateAsync();
    if (result.isAvailable) {
      await Updates.fetchUpdateAsync();
      return { available: true, info: result };
    }
    return { available: false };
  } catch (e) {
    return { available: false, error: e?.message };
  }
}

export async function applyUpdate() {
  try {
    await Updates.reloadAsync();
  } catch (e) {
    Alert.alert("Update", "Unable to restart the app right now.");
  }
}
