import {
  initConnection,
  getAvailablePurchases,
  requestPurchase,
  finishTransaction,
} from "react-native-iap";

const PRODUCT_ID = "remove_ads";

export async function configurePurchases() {
  try {
    await initConnection();
  } catch {}
}

export async function checkEntitlement() {
  try {
    const purchases = await getAvailablePurchases();
    return purchases.some((p) => p.productId === PRODUCT_ID);
  } catch {
    return false;
  }
}

export async function purchaseRemoveAds() {
  try {
    const purchase = await requestPurchase({ skus: [PRODUCT_ID] });
    if (purchase) {
      await finishTransaction({ purchase, isConsumable: false });
      return { purchased: true };
    }
    return { purchased: false };
  } catch (e) {
    if (e.code === "E_USER_CANCELLED") return { purchased: false, cancelled: true };
    return { purchased: false, error: e.message };
  }
}

export async function restorePurchases() {
  try {
    const purchases = await getAvailablePurchases();
    const purchased = purchases.some((p) => p.productId === PRODUCT_ID);
    return { purchased };
  } catch (e) {
    return { purchased: false, error: e.message };
  }
}
