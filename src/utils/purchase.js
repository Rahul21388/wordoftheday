// Placeholder purchase layer.
// Replace this module with `react-native-purchases` (RevenueCat) logic:
//   - Purchases.configure({ apiKey })
//   - Purchases.getOfferings() -> show package
//   - Purchases.purchasePackage(pkg)
//   - Read customerInfo.entitlements.active['remove_ads']

import { Alert } from "react-native";

export async function purchaseRemoveAds() {
  return new Promise((resolve) => {
    Alert.alert(
      "Remove Ads",
      "This is a placeholder for the in-app purchase flow. In a production build this would launch the RevenueCat / Play Billing purchase sheet.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve({ purchased: false, cancelled: true }),
        },
        {
          text: "Simulate Purchase",
          onPress: () => resolve({ purchased: true }),
        },
      ]
    );
  });
}

export async function restorePurchases() {
  return new Promise((resolve) => {
    Alert.alert(
      "Restore Purchases",
      "Placeholder restore flow. Simulating no previous purchases.",
      [{ text: "OK", onPress: () => resolve({ purchased: false }) }]
    );
  });
}
