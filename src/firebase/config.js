import { Platform } from "react-native";
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
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

    if (Platform.OS === "web") {
      const { getAuth, browserLocalPersistence, setPersistence } = require("firebase/auth");
      auth = getAuth(app);
      setPersistence(auth, browserLocalPersistence).catch(() => {});
    } else {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }

    db = getFirestore(app);
    firebaseAvailable = true;
  }
} catch (e) {
  console.warn("Firebase init failed:", e);
}

export { auth, db, firebaseAvailable };
