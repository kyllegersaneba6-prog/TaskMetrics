# Errors & Troubleshooting

This document lists common errors and issues users or developers may encounter, along with their causes and solutions.

---

## Build & Setup Errors

### Metro Bundler Fails to Start

| Aspect | Detail |
|--------|--------|
| **Symptom** | `npx expo start` fails or Metro bundler crashes |
| **Cause** | Corrupted cache, missing dependencies, or Node.js version mismatch |
| **Solution** | Clear Metro cache: `npx expo start --clear` |
| | Or delete `node_modules` and reinstall: `rm -rf node_modules && npm install` |

### `expo` Command Not Found

| Aspect | Detail |
|--------|--------|
| **Symptom** | `'expo' is not recognized` |
| **Cause** | Expo CLI not installed globally |
| **Solution** | Use `npx expo` instead of `expo`, or install globally: `npm install -g expo-cli` |

### Module Not Found Errors

| Aspect | Detail |
|--------|--------|
| **Symptom** | `Error: Cannot find module 'some-package'` |
| **Cause** | Missing dependency |
| **Solution** | Run `npm install` to install all dependencies |

---

## Runtime Errors

### "Firebase is not initialized"

| Aspect | Detail |
|--------|--------|
| **Symptom** | Firebase operations fail silently, app runs in demo mode |
| **Cause** | The Firebase config contains placeholder credentials or the network is unavailable |
| **Solution** | This is expected behavior. The app falls back to in-memory demo mode. To use Firebase, replace the config in `src/firebase/config.js` with valid credentials. |

### "Android Push notifications ... removed from Expo Go"

| Aspect | Detail |
|--------|--------|
| **Symptom** | Warning message about push notifications on Android |
| **Cause** | Expo Go on Android SDK 53+ does not support remote push notifications |
| **Solution** | This warning is about **remote** push notifications. **Local** (scheduled) notifications still work in Expo Go. For push notifications, use a development build via EAS Build. |

### Notifications Do Not Play Sound

| Aspect | Detail |
|--------|--------|
| **Symptom** | Notification appears but no sound plays |
| **Possible Causes** | 1. Do Not Disturb mode is enabled on the device |
| | 2. Notification channel sound is set to silent in system settings |
| | 3. App is in foreground (check `shouldPlaySound` in notification handler) |
| | 4. Expo Go limitation on certain Android ROMs |
| **Solution** | Check device Settings > Apps > TaskMetrics > Notifications and verify the channel has sound enabled. Test with the device's volume turned up. |

### Notifications Do Not Fire at Scheduled Time

| Aspect | Detail |
|--------|--------|
| **Symptom** | Scheduled notification doesn't appear |
| **Possible Causes** | 1. Device restarted (expo-notifications may not reschedule across reboots in all cases) |
| | 2. Android battery optimization killed the scheduling |
| | 3. Reminder time was in the past when scheduled |
| | 4. App was uninstalled and reinstalled |
| **Solution** | Ensure the app has notification permission. Check the scheduled time is in the future. On Android, disable battery optimization for the app in system settings. |

### "Too many attempts. Please try again later."

| Aspect | Detail |
|--------|--------|
| **Symptom** | Login fails with rate limit error |
| **Cause** | Firebase Authentication rate limiting |
| **Solution** | Wait a few minutes before trying again. This is a Firebase security feature to prevent brute force attacks. |

---

## UI/UX Issues

### Theme Not Applying to All Screens

| Aspect | Detail |
|--------|--------|
| **Symptom** | Some screens show wrong colors after theme change |
| **Cause** | Component uses hardcoded colors instead of `colors` from `useTheme()` |
| **Solution** | Ensure the component imports and uses `colors` from ThemeContext. Check for any inline style using raw `COLORS` constant instead of dynamic `colors`. |

### Animations Are Slow or Janky

| Aspect | Detail |
|--------|--------|
| **Symptom** | Animations stutter or lag |
| **Cause** | `useNativeDriver: false` on animations that could use native driver, or heavy re-renders |
| **Solution** | Set `useNativeDriver: true` for transform and opacity animations. Use `useMemo` and `useCallback` to reduce re-renders. Check for unnecessary state updates. |

### FlatList Performance Issues

| Aspect | Detail |
|--------|--------|
| **Symptom** | Scrolling is slow with many tasks |
| **Cause** | FlatList re-renders entire list on data change |
| **Solution** | Ensure `keyExtractor` returns stable IDs. Use `React.memo` on `TaskCard`. Consider using `getItemLayout` for fixed-height items (not currently implemented). |

---

## Firebase-Specific Issues

### Firestore Permission Denied

| Aspect | Detail |
|--------|--------|
| **Symptom** | Firebase operations fail with "Missing or insufficient permissions" |
| **Cause** | Firestore security rules block the operation |
| **Solution** | Update Firestore security rules in Firebase Console to allow read/write for authenticated users. During development, you can use test mode rules. |

### Auth Operation Fails Silently

| Aspect | Detail |
|--------|--------|
| **Symptom** | Login/register does nothing, no error shown |
| **Cause** | Firebase initialization failed, app is in demo mode |
| **Solution** | Check the Firebase config is correct. Verify `firebaseAvailable` in `src/firebase/config.js`. |

---

## Development Tools

### Debugging with React Native DevTools

1. Start the Expo dev server: `npx expo start`
2. Press `j` to open React Native DevTools in the browser
3. Use the Components tab to inspect component tree and state
4. Use the Profiler tab to identify performance bottlenecks

### Console Logging

All `console.log` statements are visible in:
- **Terminal:** Where the Expo dev server is running
- **Device/Emulator:** Shake the device to open the developer menu, select "Debug Remote JS"

### Network Requests

To debug Firebase network requests:
1. Open Chrome DevTools (press `j` in Expo terminal)
2. Go to the Network tab
3. All Firebase SDK HTTP requests will be visible here

---

## Common Fixes Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| App won't start | `npx expo start --clear` |
| Dependencies broken | `rm -rf node_modules && npm install` |
| Fonts not loading | Check internet connection |
| Date picker not working (web) | Use native device instead |
| Notifications not working | Check permissions in device settings |
| Firebase not connecting | Verify config in `src/firebase/config.js` |
| Theme not updating | Restart the app |
| Task list not updating | Pull to refresh or restart app |
