# Testing Word of the Day on a real device

These steps walk you through verifying every feature on a real Android
phone or iPhone. A real device is required for daily reminders,
background refresh, and OTA — emulators / simulators throttle or stub
those APIs.

---

## 0. Prerequisites

| | Android | iOS |
|---|---|---|
| Host OS | macOS, Linux, or Windows | macOS only |
| Toolchain | Android Studio + SDK, JDK 17 | Xcode 16+ |
| Device | Android 8+ with **USB debugging** enabled | iPhone running iOS 15.1+ |
| Cable | USB-C / Lightning that supports **data** (not charge-only) | Same |
| Node / pkg manager | Node 18+ and Yarn 1.22+ | Same |

Verify your device is visible:

```bash
# Android
adb devices
# expected:
# List of devices attached
# RZ8XXXXXXXX    device

# iOS
xcrun xctrace list devices
# look for your iPhone name + UDID
```

---

## 1. First-time build

```bash
cd /path/to/word-of-the-day
yarn install
npx expo prebuild --clean       # regenerates android/ and ios/
```

### Android (cable connected, phone unlocked)
```bash
npx expo run:android --device
# pick your phone from the list if prompted
```
First build takes 5–10 min. The dev client installs as **"Word of the
Day"** on your home screen and the Metro bundler launches automatically.

### iOS (cable connected, phone trusted to your Mac)
```bash
# 1. Open ios/wordoftheday.xcworkspace in Xcode once
# 2. Signing & Capabilities → pick your team, choose a unique bundle id
# 3. Back in the terminal:
npx expo run:ios --device
```
The first run requires you to *Trust* the developer profile under
**Settings → General → VPN & Device Management** on the iPhone.

> Subsequent JS-only changes only need `npx expo start --dev-client` — no
> rebuild.

---

## 2. Smoke test (5 min)

1. **Launch** — splash shows charcoal background with the teal book mark
   and "Word of the Day" wordmark, then the Home tab opens.
2. **Home** — confirm the date label, the word card animates in (fade +
   slide-up), and the **dashed "Ad · banner placeholder"** sits above the
   tab bar.
3. **Tabs** — tap each tab in turn (Home → Archive → Favourites →
   Settings); the active icon turns teal and grows slightly.

---

## 3. Per-screen functional tests

### 3.1 Home
- Tap **Share** — native share sheet opens with text starting *"Word:
  …"*. Cancel or send to a chat.
- Repeat Share 6–10× — roughly half the time you'll see an `Alert`
  saying *"(Placeholder) An interstitial ad would appear here."* (50%
  probability gate).
- Tap the **heart** — outline fills to a red heart.

### 3.2 Archive
- Header shows *"The last 30 days of words"*.
- Scroll the list — first row is labelled **TODAY**, second is
  **YESTERDAY**, the rest show short dates.
- Type a few letters in the search field — list filters live; tap the
  ✕ to clear; type something unmatched and verify the empty state shows
  the inbox icon.
- Tap any row — bottom sheet slides up with the full word card. Close
  with ✕.

### 3.3 Favourites
- From Home, favourite today's word.
- Switch to **Favourites** — see the word listed with a red heart icon
  and the definition preview.
- **Swipe left** on the row — red "Remove" action appears; tap it to
  remove. The list empties and shows the *No favourites yet* state.
- Re-favourite a word, then **kill the app from the recents list and
  re-open it** — the favourite persists (AsyncStorage).

### 3.4 Settings
- **Reminders → Daily reminder switch**: see section 4.
- **Remove Ads** → confirm an Alert appears with **Cancel** and
  **Simulate Purchase**. Tap *Simulate Purchase*; the row updates to
  *Purchased — Ads Removed* with an **Active** label and the banner
  placeholder on Home disappears.
- **Restore Purchases** → Alert confirms "Simulating no previous
  purchases".
- **Check for Updates** → in a dev client this Alerts *"OTA updates only
  run in production builds."* (expected). In a release build, it
  fetches and shows the *Update Available* modal if one is staged.
- **Rate This App** → opens the configured Play Store / App Store URL.
- **Send Feedback** → email composer opens with subject *"Word of the
  Day feedback (v1.0.0)"* and a device-info footer pre-filled.
- **Share with Friends** → native share sheet with the app link.
- **About** → modal slides up from the bottom; close with ✕.
- **Privacy Policy** → opens `https://example.com/privacy` (replace with
  your real URL in `app.json → expo.extra.privacyPolicyUrl`).
- **Version** → reads `1.0.0` (sourced from `expo-application`).

---

## 4. Daily reminder (most important)

### 4.1 Enable

1. Settings → **Reminders → Daily reminder** → flip the switch ON.
2. The OS permission prompt appears. Tap **Allow**.
3. The description should now read *"You'll be nudged every day at 9:00
   AM."*
4. A new row **Reminder time → 9:00 AM** appears. Tap it and choose
   another preset (7 AM / 12 PM / 6 PM / 9 PM); the description updates.

### 4.2 Verify a notification actually fires (fast path)

The easiest way is to **set your device time forward to 8:59 AM the next
day**, wait 60–90 seconds, and watch for the banner. Roll the time back
when done.

> Settings → System → Date & time → toggle Automatic OFF → set the time.

You should see a heads-up notification:

```
Today's word: ⟨word⟩
⟨definition⟩
```

If you tap it, the app launches to Home.

### 4.3 Inspect the scheduled queue (deep verification)

In the Metro terminal that's running `expo start --dev-client`, press
`j` to open Chrome DevTools (or `d` → *Open JS debugger*). In the
DevTools console run:

```js
const Notifications = require("expo-notifications");
Notifications.getAllScheduledNotificationsAsync().then(console.log);
```

You should see **up to 14 entries** with identifiers
`wod-reminder-0` … `wod-reminder-13`, each scheduled for the next 14
calendar days at your chosen hour.

### 4.4 Persistence

1. With reminders ON, **fully kill the app** (swipe away from recents).
2. Re-open it.
3. Settings → Reminders still shows ON and the same time.
4. The queue persists in the OS — verify with the DevTools snippet
   above; entries beyond today are still scheduled.

### 4.5 Permission denial fallback

1. Toggle reminders OFF.
2. Go to OS settings and **revoke** notification permission for the app.
3. Re-open the app, toggle reminders ON.
4. The switch should NOT stick; an Alert prompts you to **Open
   settings**. Tapping it opens the app's permission screen.

### 4.6 Background refresh

This is best-effort (the OS decides when to run it):

#### Android
```bash
# force-run the background task immediately
adb shell cmd jobscheduler run -f com.example.wordoftheday 999
# or:
adb shell am broadcast \
  -a "android.intent.action.BOOT_COMPLETED" \
  -n com.example.wordoftheday/expo.modules.taskManager.TaskExecutionReceiver
```

#### iOS
```objc
// In Xcode, pause the running app then enter in the lldb console:
e -l objc -- (void)[[NSClassFromString(@"BGTaskScheduler") sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"wod-reminder-refresh"]
```

Then re-inspect the schedule (section 4.3) — the queue should still
contain ~14 entries.

---

## 5. OTA update (production-build only)

OTA can't be exercised in a dev build. To test:

```bash
npx expo install --check
npx eas init                    # one-time, free EAS account
eas build --platform android --profile preview
# install the resulting .apk on the device

# Edit any JS file (e.g. change a title text), then:
eas update --branch main --message "Title tweak"
```

Cold-launch the installed APK — the **Update Available** modal should
appear within a few seconds. Tap **Restart Now** and confirm the new
text shows after reload.

---

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| Build error: *Could not find google-services.json* | You don't need it — the Firebase plugins are not enabled in this delivery. If you re-add them, drop the real file at the repo root. |
| Notifications never fire on Android | Disable battery optimisation for the app in OS settings. Some OEMs (Xiaomi, Oppo, Samsung) need *Auto-start* allowed too. |
| Notifications never fire on iOS | Confirm **Notifications → Allow Notifications** is ON for the app, and that *Focus / Do Not Disturb* isn't filtering it. |
| Banner placeholder is missing | You purchased Remove Ads — re-launch and tap **Settings → Remove Ads**. The placeholder shows again if you wire the toggle to "off". |
| Hot-reload no longer works after editing `app.json` | `app.json` changes need a rebuild: `npx expo prebuild --clean && npx expo run:android` (or iOS). |
| "Network request failed" on first launch | Metro can't reach the phone. Make sure phone and dev machine are on the same Wi-Fi, then shake the device → *Reload*. |

---

## 7. What's NOT covered by these tests

The three monetisation placeholders are intentionally not wired:
**Google Mobile Ads**, **RevenueCat**, **Firebase Crashlytics +
Analytics**. The corresponding files (`src/utils/ads.js`,
`src/utils/purchase.js`, `src/components/BannerAdPlaceholder.js`) print
or simulate behaviour only. The integration instructions in
`README.md → Replacing placeholders` explain how to wire them when
you're ready to monetise.
