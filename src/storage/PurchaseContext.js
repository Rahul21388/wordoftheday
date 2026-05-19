import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { purchaseRemoveAds, restorePurchases } from "../utils/purchase";

const STORAGE_KEY = "@wod/purchase/remove_ads/v1";

const PurchaseContext = createContext({
  removeAds: false,
  ready: false,
  buyRemoveAds: async () => {},
  restore: async () => {},
});

export function PurchaseProvider({ children }) {
  const [removeAds, setRemoveAds] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw === "1") setRemoveAds(true);
      } catch (e) {}
      setReady(true);
    })();
  }, []);

  const persist = useCallback(async (value) => {
    setRemoveAds(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch (e) {}
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
    () => ({ removeAds, ready, buyRemoveAds, restore }),
    [removeAds, ready, buyRemoveAds, restore]
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
