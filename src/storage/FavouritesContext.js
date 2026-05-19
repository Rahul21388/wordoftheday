import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@wod/favourites/v1";

const FavouritesContext = createContext({
  ids: [],
  isFavourite: () => false,
  toggleFavourite: () => {},
  remove: () => {},
  ready: false,
});

export function FavouritesProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setIds(parsed);
        }
      } catch (e) {}
      setReady(true);
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setIds(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {}
  }, []);

  const isFavourite = useCallback((id) => ids.includes(id), [ids]);

  const toggleFavourite = useCallback(
    (id) => {
      const next = ids.includes(id)
        ? ids.filter((x) => x !== id)
        : [id, ...ids];
      persist(next);
    },
    [ids, persist]
  );

  const remove = useCallback(
    (id) => {
      persist(ids.filter((x) => x !== id));
    },
    [ids, persist]
  );

  const value = useMemo(
    () => ({ ids, isFavourite, toggleFavourite, remove, ready }),
    [ids, isFavourite, toggleFavourite, remove, ready]
  );

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  return useContext(FavouritesContext);
}
