import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCb32scEAlxLMHOV0uWvE4zAre1bgjs0Wg",
  authDomain: "sample-app-9d53f.firebaseapp.com",
  projectId: "sample-app-9d53f",
  storageBucket: "sample-app-9d53f.firebasestorage.app",
  messagingSenderId: "590155103289",
  appId: "1:590155103289:web:a5a22f5c6aa338ba82e1e8",
};

let auth = null;
let db = null;
let firebaseAvailable = false;

try {
  if (firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
    const app = initializeApp(firebaseConfig);
    const appStorage = createAsyncStorage("app");
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(appStorage),
    });
    db = getFirestore(app);
    firebaseAvailable = true;
  }
} catch (e) {
  console.warn("Firebase init failed:", e);
}

export { auth, db, firebaseAvailable };
