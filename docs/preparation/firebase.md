# Firebase

This page explains how TaskMetrics uses Firebase for data storage and authentication.

---

## Firebase Services Used

| Service | Purpose |
|---------|---------|
| **Firebase Authentication** | User login and registration (email/password) |
| **Cloud Firestore** | Task and user data storage |

---

## Configuration

Firebase is initialized in `src/firebase/config.js`:

- The app checks if the `projectId` is the placeholder `"YOUR_PROJECT_ID"`
- If it is a real project ID, Firebase is initialized
- On **web**: uses `browserLocalPersistence` for auth
- On **mobile**: uses `getReactNativePersistence` with AsyncStorage
- If initialization fails, `firebaseAvailable` is set to `false` and the app runs in **demo mode** (in-memory data only)

---

## Collection Structure (Firestore)

### `tasks` collection
Contains all task documents. Each document has:

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Owner's Firebase UID |
| `title` | string | Task title |
| `description` | string | Optional description |
| `category` | string | Work, Personal, Study, Health, or Other |
| `status` | string | pending, in_progress, or completed |
| `deadline` | Timestamp | Optional deadline date |
| `reminderAt` | Timestamp | Optional reminder date/time |
| `notificationId` | string | expo-notifications ID for cancel |
| `soundName` | string | Alarm sound ("default" or "alarm") |
| `createdAt` | Timestamp | Creation time |
| `updatedAt` | Timestamp | Last update time |

### `users` collection
Created during registration. Contains basic user profile (`uid`, `email`, `displayName`, `createdAt`).

---

## How Data is Sent to Firebase

### Adding data (`addTask` in TasksContext):
- Uses `addDoc(collection(db, "tasks"), { ... })` to create a new document
- Fields are converted: deadlines and timestamps use `new Date()` → Firestore Timestamp
- Firestore auto-generates the document ID

### Updating data (`updateTask` in TasksContext):
- Uses `updateDoc(doc(db, "tasks", id), { ... })` to update specific fields
- Only changed fields are sent

### Deleting data (`deleteTask` in TasksContext):
- Uses `deleteDoc(doc(db, "tasks", id))` to remove the document

### Authentication:
- Login: `signInWithEmailAndPassword(auth, email, password)`
- Register: `createUserWithEmailAndPassword(auth, email, password)` then `updateProfile()` and `setDoc()` for the users collection
- Logout: `signOut(auth)`

---

## How Data is Retrieved from Firebase

### Real-time listener:
- TasksContext sets up a Firestore `onSnapshot()` query
- Query: `query(collection(db, "tasks"), where("userId", "==", user.uid))`
- This returns only the current user's tasks
- The listener fires on every change (add, update, delete) and updates the local state
- The listener is cleaned up when the user logs out

### Auth state listener:
- `onAuthStateChanged()` in AuthContext listens for auth state changes
- Automatically detects login/logout and token refresh
- No manual refresh needed for auth state
