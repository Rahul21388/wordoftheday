# Word of the Day

A dark-themed React Native (Expo SDK 54) vocabulary companion.
A new word every day, an archive of the last 30 days, favourites you can
swipe to remove, share / rate / feedback flows and a full Settings screen.

## Features

- **Home** — large word card (word, IPA pronunciation, definition, example,
  etymology), Share + Add-to-Favourites buttons, banner ad placeholder.
- **Archive** — last 30 days of words with a search bar; tap an item to read
  the full card in a sheet.
- **Favourites** — saved words persisted with `AsyncStorage`. Tap to open,
  swipe left to remove.
- **Settings** — Daily reminder toggle (local notification), Remove Ads
  (placeholder IAP), Check for Updates (Expo OTA), Rate / Feedback /
  Share, About modal, Privacy Policy link and version.
- **OTA Updates** — silent check on launch using `expo-updates`, manual
  check from Settings, modal with *Restart Now* / *Later*.
- **Daily reminder** — local notification via `expo-notifications`. Instead
  of a single repeating DAILY trigger, the app pre-schedules a rolling
  14-day queue of one-off notifications, each personalised with the
  specific word for that day (*"Today's word: ⟨word⟩ — ⟨definition⟩"*).
  The queue is refreshed on every app launch and topped up in the
  background every ~6 hours via `expo-background-fetch` + `expo-task-manager`.
- **Dark theme** — charcoal `#1a1a1a` background, teal `#14b8a6` accent.

## Tech stack

- Expo SDK 54 / React Native 0.76
- React Navigation (bottom tabs)
- NativeWind 4 / Tailwind
- `@react-native-async-storage/async-storage`
- `expo-updates`, `expo-application`, `expo-constants`,
  `expo-notifications`, `expo-background-fetch`, `expo-task-manager`
- `react-native-vector-icons` (Feather)
- `react-native-gesture-handler` (swipe-to-remove)

> Production-only modules **Google Mobile Ads**, **RevenueCat**, and
> **Firebase Crashlytics/Analytics** are intentionally kept as placeholder
> integration points in `src/utils/ads.js` and `src/utils/purchase.js`.
> Wire them up with real keys when you build the production binary — see
> *Replacing placeholders* below.

## Get started

```bash
yarn install         # already run by the scaffold; safe to re-run
yarn start           # Expo dev server
yarn android         # build & run the Android dev client
yarn ios             # build & run the iOS dev client
```

> A full native build (`expo run:android` / `expo run:ios`) is required to
> exercise the OTA-update path and to plug in real ad / IAP modules.

## Real-device testing

See [`TESTING.md`](./TESTING.md) for a complete, step-by-step verification
guide covering every screen, the daily reminder, background refresh,
permission denial flow, OTA updates, and common troubleshooting tips.

## Replacing placeholders

| Placeholder | File | Replace with |
|---|---|---|
| Banner ad | `src/components/BannerAdPlaceholder.js` | `BannerAd` from `react-native-google-mobile-ads` |
| Interstitial gate | `src/utils/ads.js` `maybeShowInterstitial` | `InterstitialAd.load()` + `.show()` |
| IAP / Remove Ads | `src/utils/purchase.js` | `react-native-purchases` (RevenueCat) calls |
| Firebase Crashlytics/Analytics | n/a yet | install `@react-native-firebase/app`, `analytics`, `crashlytics` and initialise in `App.js` |

Ad-unit IDs, RevenueCat keys, store URLs, feedback email and privacy URL
are all read from `app.json` → `expo.extra`. Change them there.

## Branding assets

`assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash.png` and
`assets/favicon.png` are programmatically-generated dark-theme placeholders
that already render correctly on a real device. Replace them with your
final artwork at the same paths — no changes needed in `app.json`.

## Word data

`src/data/words.js` exposes `WORDS` and `buildWords()`. The function takes
a curated base list of high-quality vocabulary entries and deterministically
pads it to **500** word objects (`id`, `word`, `pronunciation`, `definition`,
`example`, `etymology`, `category`). The active word for any device date is
chosen by `getWordIndexForToday()` in `src/utils/dateUtils.js`.

## Project structure

```
App.js
app.json
src/
  components/       WordCard, ListItem, UpdateGate, AboutModal, …
  data/words.js     500-word programmatic dataset
  navigation/       bottom-tab navigator
  screens/          Home, Archive, Favourites, Settings
  storage/          AsyncStorage contexts (favourites + purchase)
  utils/            theme, dates, ads, share, updates, purchase
```
