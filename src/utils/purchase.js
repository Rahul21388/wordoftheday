import {
  initConnection,
  getAvailablePurchases,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
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

// Fetch the store-localised display price (e.g. "₹99" / "$0.99").
// Returns null when the store is unavailable or the product isn't found.
export async function getProductPrice() {
  try {
    const products = await fetchProducts({ skus: [PRODUCT_ID], type: "in-app" });
    const product = products?.find((p) => p.id === PRODUCT_ID);
    // displayPrice is the formatted string guaranteed by the v15 ProductCommon type
    return product?.displayPrice ?? null;
  } catch {
    return null;
  }
}

// react-native-iap v15 is fully event-based: requestPurchase() just *initiates*
// the billing flow; the actual outcome arrives via purchaseUpdatedListener /
// purchaseErrorListener. We wrap both in a Promise so call-sites stay simple.
export function purchaseRemoveAds() {
  return new Promise((resolve) => {
    let settled = false;
    let purchaseSub = null;
    let errorSub = null;

    const settle = (result) => {
      if (settled) return;
      settled = true;
      purchaseSub?.remove();
      errorSub?.remove();
      resolve(result);
    };

    purchaseSub = purchaseUpdatedListener(async (purchase) => {
      if (purchase.productId === PRODUCT_ID) {
        try {
          // Acknowledge / finish the transaction so Google doesn't auto-refund.
          await finishTransaction({ purchase, isConsumable: false });
        } catch {}
        settle({ purchased: true });
      }
    });

    errorSub = purchaseErrorListener((error) => {
      if (error.code === "E_USER_CANCELLED") {
        settle({ purchased: false, cancelled: true });
      } else {
        settle({ purchased: false, error: error.message });
      }
    });

    // Kick off the billing flow. Errors thrown synchronously (e.g. not connected)
    // are caught below; asynchronous errors come through purchaseErrorListener.
    requestPurchase({
      request: {
        apple: { sku: PRODUCT_ID },
        google: { skus: [PRODUCT_ID] },
      },
      type: "in-app",
    }).catch((e) => {
      if (e.code === "E_USER_CANCELLED") {
        settle({ purchased: false, cancelled: true });
      } else {
        settle({ purchased: false, error: e.message });
      }
    });
  });
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
