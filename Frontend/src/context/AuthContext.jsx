// AuthContext — Real Firebase authentication
// MOCK_USER = null means real Firebase is used
// Change to "teacher" or "student" only for UI preview without Firebase

const MOCK_USER = null;

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext(null);

const MOCK_PROFILES = {
  teacher: { name: "Mr. Ahmed", email: "teacher@demo.com", role: "teacher" },
  student: { name: "Ali Khan", email: "student@demo.com", role: "student" },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(MOCK_USER ? { uid: "mock" } : null);
  const [userProfile, setUserProfile] = useState(MOCK_USER ? MOCK_PROFILES[MOCK_USER] : null);
  const [loading, setLoading] = useState(!MOCK_USER);

  // Sign up: create Firebase user + save profile to Firestore
  async function signup(name, email, password, role) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), { name, email, role });
    return cred;
  }

  // Login: Firebase email/password auth
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Logout
  function logout() {
    return signOut(auth);
  }

  // Listen to auth state — loads Firestore profile on login
  useEffect(() => {
    if (MOCK_USER) return;
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        setUserProfile(snap.exists() ? snap.data() : null);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, signup, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
