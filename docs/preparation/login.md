# Login

This page explains how the login process works in TaskMetrics.

---

## Login Form

The login screen (`app/(auth)/login.js`) contains:

- **Email field** — text input with `email-address` keyboard type
- **Password field** — text input with `secureTextEntry` (hides characters); has a toggle button to show/hide the password
- **Sign In button** — triggers the login process; shows "Signing in..." while loading
- **"Create Account" link** — navigates to the registration screen

---

## Credential Check

### Step-by-step flow:

1. User taps **Sign In**
2. Front-end checks that email and password are not empty
   - If email is empty: shows "Email is required"
   - If password is empty: shows "Password is required"
3. If validation passes, the `login()` function from **AuthContext** (`src/context/AuthContext.js`) is called with the email and password

### Firebase Authentication (when available):

- The app uses Firebase Authentication's `signInWithEmailAndPassword()` function
- Firebase checks if the email exists and if the password matches
- If credentials are wrong, Firebase returns an error code like `auth/user-not-found`, `auth/wrong-password`, or `auth/invalid-credential`
- These error codes are mapped to user-friendly messages (e.g., "No account found with this email", "Incorrect password")

### Demo Mode (when Firebase is unavailable):

- If Firebase is not configured or fails to initialize, the app enters **demo mode**
- In demo mode, `login()` creates a **local demo user object** with `uid: "demo_<timestamp>"` and the provided email
- No real authentication happens — the user is logged in immediately
- Tasks are stored in memory only and lost when the app restarts

---

## After Successful Login

1. Firebase Authentication returns a user object
2. `onAuthStateChanged` listener in AuthContext detects the user and updates state
3. The root layout (`app/index.js`) sees that `user` is not null and redirects to `/(tabs)/dashboard`
4. The user sees the Dashboard screen with their tasks

---

## After Failed Login

1. Firebase throws an error with a specific error code
2. AuthContext maps the code to a user-friendly message (e.g., "Invalid email or password")
3. The error is stored in AuthContext's `error` state
4. The login screen displays the error in a red animated box that auto-hides after 2 seconds
5. The loading state is reset so the user can try again
