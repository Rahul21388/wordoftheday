import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  configurePurchases,
  checkEntitlement,
  purchaseRemoveAds,
  restorePurchases,
  getProductPrice,
} from "../utils/purchase";

const STORAGE_KEY = "@wod/purchase/remove_ads/v1";

const PurchaseContext = createContext({
  removeAds: false,
  ready: false,
  price: null,
  buyRemoveAds: async () => {},
  restore: async () => {},
});

export function PurchaseProvider({ children }) {
  const [removeAds, setRemoveAds] = useState(false);
  const [ready, setReady] = useState(false);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Show cached entitlement immediately while we refresh from the store.
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw === "1") setRemoveAds(true);

        await configurePurchases();

        // Fetch entitlement + product price in parallel.
        const [entitled, productPrice] = await Promise.all([
          checkEntitlement(),
          getProductPrice(),
        ]);

        setRemoveAds(entitled);
        setPrice(productPrice);
        await AsyncStorage.setItem(STORAGE_KEY, entitled ? "1" : "0");
      } catch {}
      setReady(true);
    })();
  }, []);

  const persist = useCallback(async (value) => {
    setRemoveAds(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {}
  }, []);

  const buyRemoveAds = useCallback(async () => {
    const r = await purchaseRemoveAds();
    if (r.purchased) await persist(true);
    return r;
  }, [persist]);

  const restore = useCallback(async () => {
    const r = await restorePurchases();
    if (r.purchased) await persist(true);
    return r;
  }, [persist]);

  const value = useMemo(
    () => ({ removeAds, ready, price, buyRemoveAds, restore }),
    [removeAds, ready, price, buyRemoveAds, restore]
  );

  return (
    <PurchaseContext.Provider value={value}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  return useContext(PurchaseContext);
}
