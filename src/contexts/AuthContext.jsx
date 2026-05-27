import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [demoActive, setDemoActive] = useState(() => {
    try { return localStorage.getItem("demo-mode") === "true"; } catch { return false; }
  });
  const [loading, setLoading] = useState(true);

  const demoUser = {
    uid: "demo-user",
    email: "demo@skilltracker.local",
    displayName: "Demo Learner",
    isDemo: true,
  };
  const isMock = demoActive;

  useEffect(() => {
    if (demoActive) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [demoActive]);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential;
  };

  const loginDemo = () => {
    localStorage.setItem("demo-mode", "true");
    setDemoActive(true);
    setUser(null);
    setLoading(false);
  };

  const logout = async () => {
    if (demoActive) {
      localStorage.removeItem("demo-mode");
      setDemoActive(false);
      setUser(null);
      return;
    }
    return signOut(auth);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      return await signInWithPopup(auth, provider);
    } catch (err) {
      if (err.code === "auth/popup-blocked") {
        console.warn("Popup blocked, falling back to signInWithRedirect");
        return await signInWithRedirect(auth, provider);
      }
      throw err;
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      const ev = new CustomEvent("show-toast", { detail: { msg: "📩 Password reset link sent! Check your inbox or spam folder.", type: "success" } });
      window.dispatchEvent(ev);
    } catch (err) {
      let errorMsg = err.message || "Failed to send reset link.";
      if (err.code === "auth/user-not-found") {
        errorMsg = "This email address is not registered.";
      } else if (err.code === "auth/invalid-email") {
        errorMsg = "Please enter a valid email address.";
      } else if (err.code === "auth/missing-email") {
        errorMsg = "Please enter an email address.";
      }
      const ev = new CustomEvent("show-toast", { detail: { msg: errorMsg, type: "error" } });
      window.dispatchEvent(ev);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user: demoActive ? demoUser : user, login, signup, loginDemo, logout, signInWithGoogle, handleForgotPassword, isMock, loading }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
          <div className="text-center">
            <div className="mb-3 animate-pulse text-2xl">Loading your dashboard...</div>
            <div className="h-2.5 w-32 mx-auto rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
