# API & Backend

TaskMetrics uses **Firebase** as its backend service. This document covers the Firebase integration, authentication flows, Firestore operations, and the notification service.

---

## Firebase Configuration

### Initialization

**File:** `src/firebase/config.js`

The Firebase SDK is initialized with project credentials. If the `projectId` equals `"YOUR_PROJECT_ID"` (the placeholder), Firebase initialization is skipped and the app runs in **demo mode**.

```javascript
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCb32scEAlxLMHOV0uWvE4zAre1bgjs0Wg",
  authDomain: "sample-app-9d53f.firebaseapp.com",
  projectId: "sample-app-9d53f",
  storageBucket: "sample-app-9d53f.firebasestorage.app",
  messagingSenderId: "590155103289",
  appId: "1:590155103289:web:a5a22f5c6aa338ba82e1e8",
};
```

**Exports:**

| Export | Type | Description |
|--------|------|-------------|
| `auth` | `FirebaseAuth` | Firebase Authentication instance (or null in demo mode) |
| `db` | `Firestore` | Firestore database instance (or null in demo mode) |
| `firebaseAvailable` | `boolean` | Whether Firebase is initialized and usable |

---

## Authentication API

**File:** `src/context/AuthContext.js`

### `login(email, password)`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Authenticate a user with email and password |
| **Input** | `email` (string), `password` (string) |
| **Firebase Mode** | Calls `signInWithEmailAndPassword(auth, email, password)` |
| **Demo Mode** | Creates a demo user object with `uid: "demo_" + Date.now()`, `email`, `displayName: email.split("@")[0]` |
| **Error Handling** | Maps Firebase error codes to user-friendly messages |
| **Output** | Sets `user` state; on error sets `error` state |

### `register(email, password, displayName)`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Create a new user account |
| **Input** | `email` (string), `password` (string), `displayName` (string) |
| **Firebase Mode** | Calls `createUserWithEmailAndPassword(auth, email, password)`, then creates a user document in Firestore `users/{uid}` with `{ displayName, email, createdAt: serverTimestamp() }` |
| **Demo Mode** | Creates a demo user object (same as login) |
| **Error Handling** | Maps Firebase error codes to user-friendly messages |
| **Output** | Sets `user` state; on error sets `error` state |

### `logout()`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Sign out the current user |
| **Firebase Mode** | Calls `signOut(auth)` |
| **Demo Mode** | Sets `user` to `null` |
| **Output** | Clears `user` state |

### `clearError()`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Reset the error state to `null` |

### Firebase Error Codes Mapped

| Firebase Error Code | User Message |
|---------------------|-------------|
| `auth/invalid-email` | "Invalid email address." |
| `auth/user-disabled` | "This account has been disabled." |
| `auth/user-not-found` | "No account found with this email." |
| `auth/wrong-password` | "Incorrect password." |
| `auth/email-already-in-use` | "An account with this email already exists." |
| `auth/weak-password` | "Password should be at least 6 characters." |
| `auth/too-many-requests` | "Too many attempts. Please try again later." |
| `auth/network-request-failed` | "Network error. Please check your connection." |
| `auth/operation-not-allowed` | "This sign-in method is not enabled." |

### Auth State Persistence

**File:** `src/firebase/config.js`

- **Native:** Uses `getReactNativePersistence(AsyncStorage)` for persistent auth state across app restarts
- **Web:** Uses `browserLocalPersistence` for session persistence

---

## Firestore Operations

**File:** `src/context/TasksContext.js`

### Real-Time Listener

```javascript
const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
const unsub = onSnapshot(q, (snapshot) => {
  const list = snapshot.docs.map(mapDoc);
  setTasks(list);
});
```

| Aspect | Detail |
|--------|--------|
| **Collection** | `tasks` |
| **Query** | Filter by `userId` |
| **Listener** | `onSnapshot` — real-time updates |
| **Map Function** | `mapDoc()` converts Firestore Timestamps to ISO strings |

### `addTask(taskData)`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Create a new task |
| **Input** | `taskData` object with `title`, `description`, `category`, `status`, `deadline`, `reminderAt`, `soundName` |
| **Firebase** | `addDoc(collection(db, "tasks"), { ...fields })` |
| **Demo** | Creates task in memory via `makeTask()` and prepends to state array |
| **Side Effects** | Schedules reminder notification if `reminderAt` is set |
| **Returns** | Task `id` string |

**Firebase Write Payload:**

```javascript
{
  userId: user.uid,
  title: string,
  description: string,
  category: string,
  status: string,
  deadline: Date | null,        // Firestore Timestamp
  reminderAt: Date | null,       // Firestore Timestamp
  notificationId: string | null,
  soundName: string,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}
```

### `updateTask(id, taskData)`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Update an existing task |
| **Input** | `id` (string), `taskData` (partial task object) |
| **Firebase** | `updateDoc(doc(db, "tasks", id), { ...fields })` |
| **Demo** | Maps over state array, replaces matching task |
| **Side Effects** | Cancels old notification + schedules new one if `reminderAt` changed |
| **Returns** | Nothing (void) |

### `deleteTask(id)`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Delete a task |
| **Input** | `id` (string) |
| **Firebase** | `deleteDoc(doc(db, "tasks", id))` |
| **Demo** | Filters task out of state array |
| **Side Effects** | Cancels scheduled notification if `notificationId` exists |
| **Returns** | Nothing (void) |

### `toggleComplete(id, currentStatus)`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Toggle task between pending and completed |
| **Input** | `id` (string), `currentStatus` (string) |
| **Firebase** | `updateDoc(doc(db, "tasks", id), { status, notificationId, updatedAt })` |
| **Demo** | Maps over state array, updates matching task |
| **Side Effects** | Cancels reminder if marking as completed |

---

## Notification Service

**File:** `src/services/notifications.js`

### `requestPermissions()`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Request notification permissions and create Android channels |
| **Input** | None |
| **Process** | 1. Check existing permission → request if not granted → return false if denied |
| | 2. Create Android notification channel `task-reminders-default` (HIGH importance) |
| | 3. Create Android notification channel `task-reminders-alarm` (MAX importance) |
| | 4. Register notification category `task-reminder` with "Stop" action |
| **Returns** | `boolean` — `true` if permissions granted |

### `scheduleTaskReminder(task)`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Schedule a local notification for a task reminder |
| **Input** | `task` object with `reminderAt`, `title`, `id`, `soundName` |
| **Validation** | Returns `null` if `reminderAt` is in the past |
| **Process** | 1. Select Android channel based on `soundName` (default vs alarm) |
| | 2. Call `Notifications.scheduleNotificationAsync()` with date trigger |
| **Returns** | Notification ID string, or `null` on failure |

**Notification Content:**

```javascript
{
  title: "Task Reminder",
  body: '"Task Title" is due soon',
  data: { taskId: task.id },
  sound: "default",
  categoryIdentifier: "task-reminder",
  // Android only:
  channelId: "task-reminders-default" | "task-reminders-alarm",
}
```

### `cancelTaskReminder(notificationId)`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Cancel a scheduled notification |
| **Input** | `notificationId` (string) |
| **Process** | Calls `Notifications.cancelScheduledNotificationAsync(notificationId)` |
| **Returns** | Nothing (void) |

### `addNotificationResponseListener(callback)`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Listen for user interaction with notifications |
| **Input** | `callback` function |
| **Callback Data** | `{ taskId, actionId, notificationId }` |
| **Returns** | Unsubscribe function |

---

## Global Event System

### `highlightRef.js`

| Function | Purpose |
|----------|---------|
| `setHighlightId(id)` | Store a task ID to highlight (called from Dashboard when navigating) |
| `consumeHighlight()` | Retrieve and clear the stored highlight ID (called from Tasks screen on mount) |

### `sheetRef.js`

| Function | Purpose |
|----------|---------|
| `setSheetOpen(bool)` | Set sheet open state and notify subscribers |
| `isSheetOpen()` | Check if any sheet is currently open |
| `subscribe(fn)` | Subscribe to sheet open state changes (used by tab layout to hide tab bar) |

### `taskOpenRef.js`

| Function | Purpose |
|----------|---------|
| `emitTaskOpen(taskId)` | Emit a task open event (called from notification listener) |
| `consumePendingTaskId()` | Retrieve any pending task ID from notification tap (called on mount) |
| `subscribe(fn)` | Subscribe to task open events (used by Tasks screen) |
