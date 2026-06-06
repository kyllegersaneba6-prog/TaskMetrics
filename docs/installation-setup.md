# Installation & Setup

This guide explains how to set up TaskMetrics for local development on your machine.

---

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 18.x or later | JavaScript runtime |
| npm | 9.x or later | Package manager |
| Expo CLI | Latest (included via npx) | Development server |
| Git | Latest | Version control (optional) |
| Android Studio | Latest | Android emulator (optional) |
| Xcode | Latest | iOS simulator (macOS only, optional) |

---

## Quick Start

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd TaskMetrics-master
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- React Native and Expo core
- Expo Router for navigation
- Firebase SDK
- Expo Notifications
- Expo Fonts (Inter)
- React Native community packages (date picker, async storage, etc.)

### Step 3: Configure Firebase (Optional)

By default, the project includes a sample Firebase configuration. The app will work in **demo mode** without Firebase configuration, with tasks stored in memory.

**To use Firebase:**

1. Open `src/firebase/config.js`
2. Replace the Firebase config object with your own project credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.firebasestorage.app",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```
3. If the `projectId` is not `"YOUR_PROJECT_ID"`, Firebase will initialize automatically.

### Step 4: Start the Development Server

```bash
npx expo start
```

This starts the Expo development server. You will see a QR code in the terminal.

### Step 5: Run on a Device or Emulator

| Platform | Command / Method |
|----------|-----------------|
| **Web** | Press `w` in the terminal, or visit `http://localhost:8081` |
| **Android Emulator** | Press `a` in the terminal (requires Android Studio) |
| **iOS Simulator** | Press `i` in the terminal (macOS only, requires Xcode) |
| **Physical Device** | Install Expo Go app, scan QR code with your phone camera |

---

## Environment Configuration

### Environment Variables

Currently, the project does not use `.env` files. All configuration is in `src/firebase/config.js`. To add environment variable support:

1. Install `expo-constants` (already included)
2. Use `expo-constants` `extra` field in `app.json`
3. Or install `react-native-dotenv` for `.env` file support

### App Configuration (`app.json`)

Key configurable values in `app.json`:

| Field | Description |
|-------|-------------|
| `expo.name` | App display name |
| `expo.version` | App version |
| `expo.ios.bundleIdentifier` | iOS bundle ID |
| `expo.android.package` | Android package name (TODO: currently not set) |
| `expo.splash.image` | Splash screen image path |
| `expo.splash.backgroundColor` | Splash screen background color |

---

## Running on Android

### Using Android Emulator

1. Install Android Studio
2. Create a virtual device (AVD) from the Device Manager
3. Start the emulator
4. Run `npx expo start` and press `a`

### Using Physical Android Device

1. Install **Expo Go** from the Google Play Store
2. Connect your device to the same network as your computer
3. Scan the QR code from the Expo developer console
4. Alternatively, use `npx expo start --tunnel` for remote connections

---

## Running on iOS

### Using iOS Simulator (macOS Only)

1. Install Xcode from the Mac App Store
2. Run `npx expo start` and press `i`

### Using Physical iOS Device (macOS Only)

1. Install **Expo Go** from the App Store
2. Connect your device to the same network as your computer
3. Scan the QR code from the Expo developer console

---

## Running on Web

```bash
npx expo start --web
```

Or press `w` after starting the dev server. The web version runs in your browser and supports most features except:
- Push notifications (Expo Go limitation on web)
- Native date/time pickers (uses web-native date inputs)

---

## Production Build

### Android APK/AAB

```bash
npx eas build --platform android --profile production
```

### iOS IPA

```bash
npx eas build --platform ios --profile production
```

> Note: EAS Build requires an Expo account and additional configuration. See [Expo EAS Build docs](https://docs.expo.dev/build/introduction/) for details.

---

## Troubleshooting Setup

| Issue | Solution |
|-------|----------|
| `expo` command not found | Run `npx expo` instead, or install globally: `npm install -g expo-cli` |
| Firebase initialization error | The app runs in demo mode without Firebase; this is expected |
| Date picker not working on web | Web uses fallback date inputs; this is a known limitation |
| Notification permissions denied | Grant notification access in device settings |
| Fonts not loading | Check internet connection (fonts load from Google Fonts CDN) |
| Metro bundler errors | Clear cache: `npx expo start --clear` |
