import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Skills from "./pages/Skills";
import Journal from "./pages/Journal";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import { Check, AlertCircle, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random();
      setToasts(p => [...p, { id, ...e.detail }]);
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    };
    window.addEventListener("show-toast", handler);
    return () => window.removeEventListener("show-toast", handler);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id} 
            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl text-sm font-medium w-80 glass-panel"
            style={{
              borderLeft: `4px solid ${t.type === "error" ? "#ef4444" : t.type === "success" ? "#10b981" : t.type === "warn" ? "#f59e0b" : "#6366f1"}`
            }}>
            <div className="mt-0.5 shrink-0">
              {t.type === "success" && <Check size={18} className="text-emerald-500" />}
              {t.type === "error" && <AlertCircle size={18} className="text-red-500" />}
              {t.type === "warn" && <AlertCircle size={18} className="text-amber-500" />}
              {t.type === "info" && <Info size={18} className="text-brand-500" />}
            </div>
            <span className="flex-1 text-zinc-800 dark:text-zinc-100 leading-snug">{t.msg}</span>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [dm, setDm] = useState(() => {
    try { const s = localStorage.getItem("dark-mode"); return s !== null ? s === "true" : true; } catch { return true; }
  });

  useEffect(() => { 
    localStorage.setItem("dark-mode", String(dm)); 
    if (dm) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dm]);

  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <ToastContainer />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<Layout dm={dm} setDm={setDm} />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
