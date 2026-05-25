import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, AlertCircle, CircuitBoard } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const { login, signup, loginDemo, isMock, signInWithGoogle, handleForgotPassword } = useAuth();
  const { profile, setProfile } = useData();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isForgotPassword) {
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }
      setLoading(true);
      try {
        await handleForgotPassword(email.trim());
        setIsForgotPassword(false);
      } catch (err) {
        setError(err.message || "Failed to send reset link");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isSignUp && !name.trim()) {
      setError("Please enter your name before continuing.");
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError("Please enter both an email and a password.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password, name.trim());
        setProfile((prev) => ({ ...prev, name: name.trim() }));
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    loginDemo();
    navigate("/");
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const u = result?.user;
      if (u) {
        setProfile((prev) => ({ ...prev, name: u.displayName || prev?.name || "", photo: u.photoURL || prev?.photo || null }));
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] p-8 sm:p-10 rounded-[2rem] glass-card relative z-10"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 mb-6 rounded-lg bg-zinc-950 text-brand-500 dark:bg-brand-500 dark:text-zinc-950 flex items-center justify-center border border-zinc-950 dark:border-brand-500">
            <CircuitBoard size={28} />
          </div>
          
          <p className="mechanik-label mb-2">Learning OS</p>
          <h1 className="text-4xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
            SkillTracker
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[280px]">
            {isForgotPassword 
              ? "Enter your email to receive a password reset link." 
              : isSignUp 
                ? "Join the next generation of skill tracking." 
                : "Welcome back. Ready to level up?"}
          </p>

          {isMock && (
            <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-200/50 dark:border-brand-500/20">
              <Zap size={14} /> Offline Mode Active
            </div>
          )}
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-sm font-medium">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="leading-snug">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && !isForgotPassword && (
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
            </div>
          )}

          <div className="relative group">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-500 transition-colors" />
            <input 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </div>

          {!isForgotPassword && (
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-500 transition-colors" />
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isForgotPassword}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
            </div>
          )}

          {!isSignUp && !isForgotPassword && (
            <div className="flex justify-end px-1">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setError("");
                }}
                className="text-xs font-semibold text-zinc-500 hover:text-brand-500 dark:text-zinc-400 dark:hover:text-brand-400 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-2 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:active:scale-100 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 shadow-brand-500/25 hover:shadow-brand-500/40"
          >
            {loading 
              ? (isForgotPassword ? "Sending..." : "Authenticating...") 
              : (isForgotPassword ? "Send Reset Link" : isSignUp ? "Create Account" : "Sign In")}
          </button>

          {!isForgotPassword ? (
            <>
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.995 }}
                onClick={handleGoogle}
                disabled={loading}
                className="w-full mt-3 py-3.5 rounded-xl text-sm font-semibold transition-all bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
              >
                <span className="w-5 h-5 flex items-center justify-center rounded-sm bg-transparent">
                  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </span>
                <span>Sign in with Google</span>
              </motion.button>
              <button
                type="button"
                onClick={handleDemo}
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                Try Demo Workspace
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setError("");
              }}
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              Back to Sign In
            </button>
          )}
        </form>

        {!isForgotPassword && (
          <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <span>{isSignUp ? "Already have an account?" : "New to SkillTracker?"}</span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp((prev) => !prev);
                setError("");
              }}
              className="ml-2 font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
            >
              {isSignUp ? "Sign In" : "Create one"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
