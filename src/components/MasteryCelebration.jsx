import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useData } from "../contexts/DataContext";
import { Award, Sparkles, X } from "lucide-react";

export default function MasteryCelebration() {
  const { celebrationSkill, setCelebrationSkill } = useData();

  useEffect(() => {
    if (celebrationSkill) {
      // Trigger legendary confetti explosion
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // confettis from left side and right side
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      // Center explosion on start
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        zIndex: 10001
      });

      return () => clearInterval(interval);
    }
  }, [celebrationSkill]);

  if (!celebrationSkill) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCelebrationSkill(null)}
          className="absolute inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", damping: 25, stiffness: 200 }
          }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 text-white rounded-[2rem] p-8 md:p-10 shadow-2xl overflow-hidden text-center flex flex-col items-center justify-center"
        >
          {/* Glowing Animated Orbs */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-brand-500/10 blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl animate-pulse pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={() => setCelebrationSkill(null)}
            className="absolute top-6 right-6 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Animated Trophy Icon */}
          <motion.div
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ 
              scale: [1, 1.2, 1], 
              rotate: [0, -10, 10, -5, 5, 0],
              transition: { delay: 0.2, duration: 0.8 }
            }}
            className="p-5 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-3xl text-zinc-950 shadow-xl shadow-amber-500/25 mb-6 relative"
          >
            <Award size={48} className="stroke-[1.5]" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute -top-2 -right-2 text-yellow-300"
            >
              <Sparkles size={18} />
            </motion.div>
          </motion.div>

          {/* Labels & Main Header */}
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-full mb-4">
            Mastery Unlocked
          </span>
          
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-brand-400 drop-shadow-sm select-none">
            🎉 LEGENDARY MASTERY ACHIEVED!
          </h2>

          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-sm mb-8">
            You've officially pushed your skills to the absolute peak! You are now certified as an <span className="text-white font-bold">Expert</span> in:
          </p>

          {/* Skill Title Box */}
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="w-full bg-zinc-800/50 border border-zinc-800 rounded-2xl p-5 mb-8 flex flex-col items-center justify-center gap-1.5"
          >
            <h3 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight">{celebrationSkill.name}</h3>
            {celebrationSkill.category && (
              <span className="text-xs text-brand-400 font-semibold">{celebrationSkill.category}</span>
            )}
          </motion.div>

          {/* Action/Dismiss button */}
          <button
            onClick={() => setCelebrationSkill(null)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-400 hover:to-indigo-400 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-brand-500/25"
          >
            Acknowledge & Continue
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
