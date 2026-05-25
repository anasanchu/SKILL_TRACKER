import React, { useMemo, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Zap, Award, TrendingUp, Target, Bell, Plus, CheckCircle2, Trash2, ChevronDown } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function Dashboard() {
  const { dm } = useOutletContext();
  const { skills, notes, profile, weeklyGoals, pastWeeklyGoals, activityLog, setWeeklyGoals, setPastWeeklyGoals, awardSkillXp, addActivityEvent, monthlyVelocityData } = useData();
  const { user } = useAuth();
  const [newGoalText, setNewGoalText] = useState("");
  const [selectedGoalSkill, setSelectedGoalSkill] = useState("");
  const [showCompletedHistory, setShowCompletedHistory] = useState(false);
  const [showMissedArchive, setShowMissedArchive] = useState(false);
  const [heatmapView, setHeatmapView] = useState("1month");

  useEffect(() => {
    if (!selectedGoalSkill && skills.length > 0) {
      setSelectedGoalSkill(skills[0].id);
    }
  }, [skills, selectedGoalSkill]);

  const totalSkills = skills.length;
  const completed = skills.filter(s => s.progress >= 100).length;
  const inProgressCount = skills.filter(s => s.progress > 0 && s.progress < 100).length;
  
  const topCategory = useMemo(() => {
    if (!totalSkills) return "—";
    const freq = {};
    skills.forEach(s => { freq[s.category] = (freq[s.category] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  }, [skills]);

  const categoryData = useMemo(() => {
    const map = {};
    skills.forEach(s => { if (!map[s.category]) map[s.category] = { cat: s.category, count: 0, total: 0 }; map[s.category].count++; map[s.category].total += s.progress; });
    return Object.values(map).map(m => ({ subject: m.cat, avg: Math.round(m.total / m.count) }));
  }, [skills]);

  const barData = useMemo(() => [
    { name: "Beginner", count: skills.filter(s => s.progress <= 33).length, fill: "#818cf8" },
    { name: "Intermediate", count: skills.filter(s => s.progress > 33 && s.progress <= 66).length, fill: "#6366f1" },
    { name: "Expert", count: skills.filter(s => s.progress > 66).length, fill: "#4f46e5" },
  ], [skills]);

  const monthlyData = monthlyVelocityData || [];

  const activeGoals = weeklyGoals.filter(goal => goal.status !== "missed" && !goal.completed);
  const completedGoalItems = weeklyGoals.filter(goal => goal.completed);
  const missedGoals = pastWeeklyGoals.filter(goal => goal.status === "missed");
  const completedCount = completedGoalItems.length;
  const weeklyProgress = weeklyGoals.length ? Math.round((completedCount / weeklyGoals.length) * 100) : 0;
  const weekReminder = activeGoals.length > 0 && weeklyGoals.length > 0;
  
  const weekEndLabel = new Date();
  weekEndLabel.setDate(weekEndLabel.getDate() + (7 - weekEndLabel.getDay()));

  const noteDates = Object.keys(notes || {});
  const noteSet = useMemo(() => new Set(noteDates), [noteDates]);
  let currentDailyStreak = 0;
  for (let offset = 0; ; offset += 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - offset);
    if (noteSet.has(day.toISOString().slice(0, 10))) {
      currentDailyStreak += 1;
    } else break;
  }

  const totalGoalsCompleted = weeklyGoals.filter(goal => goal.completed).length;
  const totalStudySessions = noteDates.length;

  const heatmapCounts = useMemo(() => {
    return (activityLog || []).reduce((map, event) => {
      if (event && event.timestamp) {
        const dayKey = event.timestamp.slice(0, 10);
        map[dayKey] = (map[dayKey] || 0) + 1;
      }
      return map;
    }, {});
  }, [activityLog]);

  const currentMonthDate = new Date();
  
  // Current Month Grid Data
  const monthStart = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
  const monthEnd = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0);
  const monthDays = Array.from({ length: monthStart.getDay() + monthEnd.getDate() + ((7 - ((monthStart.getDay() + monthEnd.getDate()) % 7)) % 7) }, (_, index) => {
    if (index < monthStart.getDay() || index >= monthStart.getDay() + monthEnd.getDate()) {
      return null;
    }
    const day = new Date(monthStart);
    day.setDate(index - monthStart.getDay() + 1);
    return day;
  });
  const currentMonthLabel = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // Previous Month Grid Data
  const prevMonthDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1);
  const prevMonthStart = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
  const prevMonthEnd = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0);
  const prevMonthDays = Array.from({ length: prevMonthStart.getDay() + prevMonthEnd.getDate() + ((7 - ((prevMonthStart.getDay() + prevMonthEnd.getDate()) % 7)) % 7) }, (_, index) => {
    if (index < prevMonthStart.getDay() || index >= prevMonthStart.getDay() + prevMonthEnd.getDate()) {
      return null;
    }
    const day = new Date(prevMonthStart);
    day.setDate(index - prevMonthStart.getDay() + 1);
    return day;
  });
  const prevMonthLabel = prevMonthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  const addWeeklyGoal = () => {
    const text = newGoalText.trim();
    if (!text) return;
    const selectedSkillObj = skills.find(skill => skill.id === selectedGoalSkill);
    const goalId = Date.now();
    setWeeklyGoals(prev => [{
      id: goalId,
      text,
      completed: false,
      status: "active",
      createdAt: new Date().toISOString(),
      skillId: selectedSkillObj?.id || null,
      skillName: selectedSkillObj?.name || null,
    }, ...prev]);
    addActivityEvent({ type: "goal", skillId: selectedSkillObj?.id, skillName: selectedSkillObj?.name, goalId, label: `Created: ${text}` });
    setNewGoalText("");
  };

  const toggleGoalCompletion = (id) => {
    setWeeklyGoals(prev => prev.map(goal => {
      if (goal.id !== id) return goal;
      const completed = !goal.completed;
      if (completed && goal.skillId) {
        awardSkillXp(goal.skillId, 50);
        addActivityEvent({ type: "goal", skillId: goal.skillId, skillName: goal.skillName, goalId: goal.id, label: `Completed: ${goal.text}` });
      } else if (completed) {
        addActivityEvent({ type: "goal", goalId: goal.id, label: `Completed: ${goal.text}` });
      }
      return { ...goal, completed, status: completed ? "completed" : "active", completedAt: completed ? new Date().toISOString() : null };
    }));
  };

  const removeWeeklyGoal = (id) => {
    setWeeklyGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const removePastWeeklyGoal = (id) => {
    setPastWeeklyGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const copyMissedGoal = (missedGoal) => {
    setWeeklyGoals(prev => [{
      id: Date.now(),
      text: missedGoal.text,
      completed: false,
      status: "active",
      createdAt: new Date().toISOString(),
    }, ...prev]);
  };

  const chartTheme = dm ? { text: "#a1a1aa", grid: "rgba(255,255,255,0.05)", tooltipBg: "#18181b", tooltipBorder: "#27272a" } : { text: "#71717a", grid: "rgba(0,0,0,0.05)", tooltipBg: "#ffffff", tooltipBorder: "#e4e4e7" };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6 sm:space-y-8">
      
      {/* Hero Section */}
      <div className="mechanik-panel mt-2 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
          <div className="p-6 sm:p-8">
            <p className="mechanik-label mb-3">SkillTracker / Operating Panel</p>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl leading-snug tracking-tight text-zinc-950 dark:text-white max-w-2xl">
              <span className="block font-extrabold">Build skill</span>
              <span className="block font-extrabold">Track progress</span>
              <span className="block font-extrabold">Stay consistent</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium text-zinc-600 dark:text-zinc-400">
              Welcome back, {profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || "Learner"}. Review your focus, learning activity, and project progress.
            </p>
          
          </div>
          <div className="border-t border-zinc-950/15 p-6 dark:border-white/15 lg:border-l lg:border-t-0">
            <p className="mechanik-label mb-4">This week</p>
            <div className="text-6xl font-black text-brand-600 dark:text-brand-500">{weeklyProgress}%</div>
            <p className="mt-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">weekly goal completion</p>
            <div className="mt-6 h-2 overflow-hidden rounded-none bg-zinc-200 dark:bg-zinc-800">
              <div className="h-full bg-brand-500" style={{ width: `${weeklyProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {weekReminder && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-brand-500/20 bg-brand-50/50 dark:bg-brand-500/10 p-5 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-100 dark:bg-brand-500/20 rounded-xl text-brand-600 dark:text-brand-400">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">Action Required</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                  You have <span className="font-bold text-brand-600 dark:text-brand-400">{activeGoals.length}</span> active goal{activeGoals.length > 1 ? "s" : ""} left before the week ends.
                </p>
              </div>
            </div>
            <button onClick={() => document.getElementById("weekly-goals-card")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">
              Review goals
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Skills", value: totalSkills, icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { label: "In Progress", value: inProgressCount, icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
          { label: "Mastered", value: completed, icon: Award, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Top Category", value: topCategory, icon: Target, color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-500/10" },
        ].map((s, i) => (
          <div key={i} className="p-5 rounded-[1.5rem] glass-card flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${s.bg} ${s.color} transition-transform group-hover:scale-110`}>
                <s.icon size={20} />
              </div>
            </div>
            <div>
              <p className={`${typeof s.value === "string" ? "text-3xl truncate" : "text-4xl"} font-display font-bold text-zinc-900 dark:text-white mb-1`}>{s.value}</p>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Action Area (Goals) */}
        <div className="lg:col-span-2 space-y-6">
          <div id="weekly-goals-card" className="rounded-[1.5rem] p-6 glass-card border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-white">Weekly Focus</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Set micro-goals for the week to keep momentum.</p>
              </div>
              <div className="text-right flex-shrink-0 bg-brand-50 dark:bg-brand-500/10 px-4 py-2 rounded-xl">
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-600 dark:text-brand-400">Progress</p>
                <p className="text-xl font-bold text-brand-700 dark:text-brand-300">{weeklyProgress}%</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 flex gap-3 flex-col sm:flex-row">
                <input value={newGoalText} onChange={e => setNewGoalText(e.target.value)}
                  placeholder="E.g., Complete React forms tutorial"
                  className="flex-1 px-4 py-3 rounded-xl text-sm glass-input text-zinc-900 dark:text-white placeholder:text-zinc-400" />
                <select value={selectedGoalSkill} onChange={e => setSelectedGoalSkill(e.target.value)}
                  className="sm:w-48 px-4 py-3 rounded-xl text-sm glass-input text-zinc-900 dark:text-white">
                  <option value="">No skill linked</option>
                  {skills.map(skill => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
                </select>
              </div>
              <button onClick={addWeeklyGoal}
                className="rounded-xl bg-zinc-900 dark:bg-white px-5 py-3 text-sm font-semibold text-white dark:text-zinc-900 transition hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-md">
                <Plus size={18} className="mx-auto" />
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {activeGoals.map(goal => (
                  <motion.div key={goal.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-3 rounded-xl p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 group transition-colors hover:border-brand-500/30">
                    <button onClick={() => toggleGoalCompletion(goal.id)}
                      className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-transparent hover:border-brand-500 hover:text-brand-500 transition-colors">
                      <CheckCircle2 size={18} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{goal.text}</p>
                      {goal.skillName && <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">{goal.skillName}</p>}
                    </div>
                    <button onClick={() => removeWeeklyGoal(goal.id)}
                      className="opacity-60 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {activeGoals.length === 0 && (
                <div className="py-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">All caught up. Add a goal to keep momentum.</p>
                </div>
              )}
            </div>
            
            {(completedGoalItems.length > 0 || missedGoals.length > 0) && (
              <div className="mt-6 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50 space-y-4">
                {completedGoalItems.length > 0 && (
                  <div className="text-sm">
                    <button onClick={() => setShowCompletedHistory(!showCompletedHistory)} className="flex items-center gap-2 font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 w-full text-left">
                      <ChevronDown size={16} className={`transition-transform ${showCompletedHistory ? "rotate-180" : ""}`} /> 
                      Completed ({completedGoalItems.length})
                    </button>
                    <AnimatePresence>
                      {showCompletedHistory && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3 space-y-2">
                          {completedGoalItems.map(goal => (
                            <div key={goal.id} className="flex items-center gap-3 px-3 py-2">
                              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                              <p className="text-sm text-zinc-500 dark:text-zinc-400 line-through truncate flex-1">{goal.text}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Side Area (Activity & Streaks) */}
        <div className="space-y-6">
          <div className="rounded-[1.5rem] p-6 glass-card">
             <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white mb-6">Engagement</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg"><Zap size={18} /></div>
                    <span className="font-medium text-sm text-zinc-700 dark:text-zinc-300">Daily Streak</span>
                  </div>
                  <span className="font-bold text-lg text-zinc-900 dark:text-white">{currentDailyStreak}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg"><Award size={18} /></div>
                  <span className="font-medium text-sm text-zinc-700 dark:text-zinc-300">Goals Completed</span>
                  </div>
                  <span className="font-bold text-lg text-zinc-900 dark:text-white">{totalGoalsCompleted}</span>
                </div>
             </div>
          </div>

          <div className="rounded-[1.5rem] p-6 glass-card overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white">Activity</h3>
              <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 self-start sm:self-auto">
                <button onClick={() => setHeatmapView("1month")} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${heatmapView === "1month" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}>1 Month</button>
                <button onClick={() => setHeatmapView("2month")} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${heatmapView === "2month" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}>2 Months</button>
              </div>
            </div>

            {(() => {
              const renderMonthGrid = (label, daysList) => (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">{label}</p>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekdayLabels.map((label, index) => (
                      <div key={index} className="text-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">{label}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {daysList.map((day, index) => {
                      if (!day) return <div key={`empty-${index}`} className="aspect-square rounded-md bg-transparent" />;
                      const dayKey = day.toISOString().slice(0, 10);
                      const count = heatmapCounts[dayKey] || 0;
                      const isFuture = day > new Date();
                      
                      let bgClass = "bg-zinc-100 dark:bg-zinc-800/50";
                      if (!isFuture) {
                        if (count === 1) bgClass = "bg-brand-200 dark:bg-brand-900/60";
                        else if (count === 2) bgClass = "bg-brand-400 dark:bg-brand-700";
                        else if (count >= 3) bgClass = "bg-brand-500 dark:bg-brand-500 shadow-sm shadow-brand-500/30";
                      }

                      return (
                        <div key={dayKey} title={`${dayKey}: ${count} actions`}
                          className={`aspect-square rounded-md transition-all duration-300 ${bgClass} ${isFuture ? 'opacity-30' : 'hover:scale-110 hover:ring-2 ring-brand-500/50 cursor-crosshair'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              );

              return (
                <div className={heatmapView === "2month" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6" : "space-y-2"}>
                  {heatmapView === "2month" && renderMonthGrid(prevMonthLabel, prevMonthDays)}
                  {renderMonthGrid(currentMonthLabel, monthDays)}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="rounded-[1.5rem] p-6 glass-card min-w-0 overflow-hidden">
          <h3 className="font-display font-bold text-sm text-zinc-500 dark:text-zinc-400 mb-6 uppercase tracking-widest">Skill Distribution</h3>
          {categoryData.length >= 3 ? (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={categoryData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <PolarGrid stroke={chartTheme.grid} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: chartTheme.text, fontSize: 11, fontWeight: 500 }} />
                <Radar name="Avg Progress" dataKey="avg" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, borderRadius: '12px', color: chartTheme.text, fontSize: '12px' }} formatter={(v) => [`${v}%`, "Avg Progress"]} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
              <Target size={32} className="mb-3 opacity-50" />
              <p className="text-sm font-medium">Add skills in 3+ categories for radar</p>
            </div>
          )}
        </div>

        <div className="rounded-[1.5rem] p-6 glass-card min-w-0 overflow-hidden">
          <h3 className="font-display font-bold text-sm text-zinc-500 dark:text-zinc-400 mb-6 uppercase tracking-widest">Growth Velocity</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: chartTheme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, borderRadius: '12px', color: chartTheme.text, fontSize: '12px' }} formatter={(v) => [`+${v} pts`, "Improvement"]}/>
                <Area type="monotone" dataKey="improvement" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorImp)" activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
              <TrendingUp size={32} className="mb-3 opacity-50"/>
              <p className="text-sm font-medium">Log progress to see growth</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
