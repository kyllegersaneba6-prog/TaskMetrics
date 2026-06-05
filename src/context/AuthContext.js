import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseAvailable } from "../firebase/config";

const AuthContext = createContext(null);

function createDemoUser(email, displayName) {
  return {
    uid: "demo_" + Date.now(),
    email,
    displayName: displayName || email.split("@")[0],
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseAvailable) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setError("");
    if (!firebaseAvailable) {
      if (!email || !password) {
        const msg = "Email and password are required";
        setError(msg);
        throw new Error(msg);
      }
      setUser(createDemoUser(email));
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const msg = getErrorMessage(err.code);
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (email, password, displayName) => {
    setError("");
    if (!firebaseAvailable) {
      if (!email || !password) {
        const msg = "Email and password are required";
        setError(msg);
        throw new Error(msg);
      }
      setUser(createDemoUser(email, displayName));
      return;
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email,
        displayName: displayName || email.split("@")[0],
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      const msg = getErrorMessage(err.code);
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setError("");
    if (!firebaseAvailable) {
      setUser(null);
      return;
    }
    try {
      await signOut(auth);
    } catch (err) {
      const msg = getErrorMessage(err.code);
      setError(msg);
      throw new Error(msg);
    }
  };

  const clearError = () => setError("");

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function getErrorMessage(code) {
  const messages = {
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/invalid-credential": "Invalid email or password",
    "auth/email-already-in-use": "An account with this email already exists",
    "auth/weak-password": "Password must be at least 6 characters",
    "auth/invalid-email": "Invalid email address",
    "auth/too-many-requests": "Too many attempts. Try again later",
    "auth/network-request-failed": "Network error. Check your connection",
    "auth/operation-not-allowed": "Email/Password sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method",
  };
  return messages[code] || "Something went wrong. Please try again";
}
