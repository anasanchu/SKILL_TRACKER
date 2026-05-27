import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, Check, TrendingUp, Filter, ExternalLink, ChevronDown, BookOpen, Pencil, X } from "lucide-react";
import { useData } from "../contexts/DataContext";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function Skills() {
  const { skills, setSkills, addToast, addActivityEvent, setCelebrationSkill } = useData();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [openLockers, setOpenLockers] = useState({});
  const [resourceInputs, setResourceInputs] = useState({});
  const [pulseSkill, setPulseSkill] = useState({});
  const prevLevels = useRef({});
  
  // Form State
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("Beginner"); // Beginner, Intermediate, Expert
  const [editingSkillId, setEditingSkillId] = useState(null);
  
  const levels = {
    Beginner: 33,
    Intermediate: 66,
    Expert: 100
  };

  const getLevelFromProgress = (progress) => {
    if (progress >= 100) return "Expert";
    if (progress >= 66) return "Intermediate";
    return "Beginner";
  };

  const categories = ["All", ...new Set(skills.map(s => s.category).filter(Boolean))];

  const categoryPalette = [
    { bg: "bg-cyan-50 dark:bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
    { bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
    { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
    { bg: "bg-lime-50 dark:bg-lime-500/10", text: "text-lime-600 dark:text-lime-400" },
    { bg: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-600 dark:text-violet-400" },
    { bg: "bg-sky-50 dark:bg-sky-500/10", text: "text-sky-600 dark:text-sky-400" },
    { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    { bg: "bg-fuchsia-50 dark:bg-fuchsia-500/10", text: "text-fuchsia-600 dark:text-fuchsia-400" },
    { bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
    { bg: "bg-teal-50 dark:bg-teal-500/10", text: "text-teal-600 dark:text-teal-400" },
  ];

  const getCategoryTheme = (cat = "") => {
    if (!cat) return categoryPalette[0];
    const hash = [...cat].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return categoryPalette[hash % categoryPalette.length];
  };

  const filteredSkills = useMemo(() => {
    return skills.filter(sk => {
      const ms = sk.name.toLowerCase().includes(search.toLowerCase());
      const mc = activeFilter === "All" || sk.category === activeFilter;
      return ms && mc;
    }).sort((a,b) => b.progress - a.progress);
  }, [search, skills, activeFilter]);

  useEffect(() => {
    const nextPulse = {};
    skills.forEach(skill => {
      const prevLevel = prevLevels.current[skill.id] || skill.level;
      if (skill.level > prevLevel) {
        nextPulse[skill.id] = true;
        window.setTimeout(() => setPulseSkill(prev => {
          const { [skill.id]: _, ...rest } = prev;
          return rest;
        }), 1400);
      }
      prevLevels.current[skill.id] = skill.level;
    });
    if (Object.keys(nextPulse).length) {
      setPulseSkill(prev => ({ ...prev, ...nextPulse }));
    }
  }, [skills]);

  const addSkill = (e) => {
    e.preventDefault();
    if (!skillName.trim() || !category.trim()) {
      addToast("Name and Category required", "warn");
      return;
    }
    const initialProgress = levels[level];

    if (editingSkillId) {
      setSkills(prev => prev.map(s => {
        if (s.id === editingSkillId) {
          const progressChanged = s.progress !== initialProgress;
          const historyEntry = progressChanged 
            ? { date: new Date().toISOString(), progress: initialProgress, note: `Level updated to ${level} during edit` }
            : null;
          
          return {
            ...s,
            name: skillName.trim(),
            category: category.trim(),
            progress: initialProgress,
            xp: initialProgress,
            history: historyEntry ? [historyEntry, ...(s.history || [])] : (s.history || [])
          };
        }
        return s;
      }));
      addActivityEvent({ type: "skill", skillId: editingSkillId, skillName: skillName.trim(), label: `Edited skill and set level to ${level}` });
      setEditingSkillId(null);
      setSkillName(""); setCategory(""); setLevel("Beginner");
      addToast(`"${skillName.trim()}" updated!`, "success");
      if (initialProgress === 100) {
        setCelebrationSkill({ name: skillName.trim(), category: category.trim() });
      }
    } else {
      const newSkill = {
        id: Date.now(),
        name: skillName.trim(),
        category: category.trim(),
        xp: initialProgress,
        level: level === "Expert" ? 3 : (level === "Intermediate" ? 2 : 1),
        progress: initialProgress,
        history: [{ date: new Date().toISOString(), progress: initialProgress, note: `Initial level set to ${level}` }],
        resources: []
      };
      setSkills(p => [newSkill, ...p]);
      addActivityEvent({ type: "skill", skillId: newSkill.id, skillName: newSkill.name, label: `Added ${level} skill` });
      setSkillName(""); setCategory(""); setLevel("Beginner");
      addToast(`"${newSkill.name}" added!`, "success");
      if (initialProgress === 100) {
        setCelebrationSkill({ name: newSkill.name, category: newSkill.category });
      }
    }
  };

  const startEditSkill = (skill) => {
    setEditingSkillId(skill.id);
    setSkillName(skill.name);
    setCategory(skill.category);
    setLevel(getLevelFromProgress(skill.progress));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditSkill = () => {
    setEditingSkillId(null);
    setSkillName("");
    setCategory("");
    setLevel("Beginner");
  };

  const deleteSkill = (id, name) => {
    setSkills(p => p.filter(s => s.id !== id));
    addToast(`"${name}" removed`, "info");
  };

  const addResource = (skillId) => {
    const input = resourceInputs[skillId] || { title: "", url: "" };
    const title = input.title?.trim();
    const url = input.url?.trim();
    if (!title || !url) {
      addToast("Enter both a title and a link", "warn");
      return;
    }
    setSkills(p => p.map(skill => {
      if (skill.id !== skillId) return skill;
      const resources = [...(skill.resources || []), { id: Date.now(), title, url }];
      return { ...skill, resources };
    }));
    const linkedSkill = skills.find(skill => skill.id === skillId);
    addActivityEvent({ type: "resource", skillId, skillName: linkedSkill?.name, label: title });
    setResourceInputs(prev => ({ ...prev, [skillId]: { title: "", url: "" } }));
    addToast("Resource added", "success");
  };

  const removeResource = (skillId, resourceId) => {
    setSkills(p => p.map(skill => {
      if (skill.id !== skillId) return skill;
      return { ...skill, resources: (skill.resources || []).filter(r => r.id !== resourceId) };
    }));
    addToast("Resource removed", "info");
  };

  const toggleLocker = (skillId) => {
    setOpenLockers(prev => ({ ...prev, [skillId]: !prev[skillId] }));
  };

  const updateResourceInput = (skillId, field, value) => {
    setResourceInputs(prev => ({ ...prev, [skillId]: { ...prev[skillId], [field]: value } }));
  };

  const updateLevel = (id, newLevelName) => {
    setSkills(p => p.map(s => {
      if (s.id !== id) return s;
      const np = levels[newLevelName];
      const xpGain = np - (s.xp || s.progress || 0);
      if (np === 100 && s.progress < 100) {
        addToast("Skill mastered! Well done!", "success");
        setCelebrationSkill({ name: s.name, category: s.category });
      }
      addActivityEvent({ type: "skill", skillId: id, skillName: s.name, label: `Set level to ${newLevelName}` });
      return {
        ...s,
        xp: np,
        level: s.level || 1,
        progress: np,
        history: [{ date: new Date().toISOString(), progress: np, note: `Level set to ${newLevelName}` }, ...(s.history || [])]
      };
    }));
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6 sm:space-y-8">
      <div className="mt-2">
        <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-zinc-900 dark:text-zinc-50">My Skills</h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Track what you're learning and mastering.</p>
      </div>

      {/* Add Skill Form */}
      <div className="p-6 sm:p-8 rounded-[2rem] glass-card border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-500 pointer-events-none" />
        
        <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2 text-zinc-900 dark:text-white">
          <BookOpen size={20} className="text-brand-500" /> {editingSkillId ? "Edit Skill" : "Add New Skill"}
        </h2>
        <form onSubmit={addSkill} className="grid grid-cols-1 sm:grid-cols-12 gap-4 relative z-10">
          <div className={`${editingSkillId ? "sm:col-span-3" : "sm:col-span-4"}`}>
            <input placeholder="Skill name (e.g. React)" value={skillName} onChange={e=>setSkillName(e.target.value)} 
              className="w-full px-4 py-3.5 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50" />
          </div>
          <div className="sm:col-span-3">
            <input placeholder="Category" list="categories-list" value={category} onChange={e=>setCategory(e.target.value)} 
              className="w-full px-4 py-3.5 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50" />
            <datalist id="categories-list">{categories.filter(c => c !== "All").map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <div className={`${editingSkillId ? "sm:col-span-2" : "sm:col-span-3"}`}>
            <select value={level} onChange={e=>setLevel(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-brand-500/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[position:right_1rem_center]">
              {Object.keys(levels).map(l => <option key={l} value={l} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{l}</option>)}
            </select>
          </div>
          {editingSkillId ? (
            <>
              <div className="sm:col-span-2">
                <button type="button" onClick={cancelEditSkill} className="w-full h-full min-h-[48px] rounded-xl text-zinc-700 dark:text-zinc-300 font-semibold text-sm border border-zinc-200 dark:border-zinc-800 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/80 flex items-center justify-center gap-1.5">
                  <X size={18} /> Cancel
                </button>
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="w-full h-full min-h-[48px] rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-1.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 shadow-brand-500/25">
                  <Check size={18} /> Update
                </button>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <button type="submit" className="w-full h-full min-h-[48px] rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 shadow-brand-500/25 hover:shadow-brand-500/40">
                <Plus size={18} /> Add
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-500 transition-colors" />
          <input placeholder="Search skills..." value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 items-center">
          {categories.map(c => {
            const isActive = activeFilter === c;
            
            return (
              <button key={c} onClick={() => setActiveFilter(c)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${
                  isActive 
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-md"
                  : "bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80"
                }`}>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredSkills.length === 0 ? (
            <motion.div variants={fadeUp} className="col-span-full py-16 text-center border-2 border-dashed rounded-[2rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
              <BookOpen size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Add your first skill to start tracking progress.</p>
            </motion.div>
          ) : (
            filteredSkills.map(s => (
              <motion.div key={s.id} variants={fadeUp} layout initial="hidden" animate="visible" exit="exit"
                className="p-6 rounded-[1.5rem] glass-card border border-zinc-200/80 dark:border-zinc-800/80 group relative overflow-hidden flex flex-col justify-between h-full hover:shadow-lg transition-all duration-300 hover:border-brand-500/30">
                
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="space-y-4 w-full">
                    <div className="flex items-start justify-between">
                       <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-white tracking-tight">{s.name}</h3>
                       <div className="flex items-center gap-1 -mr-2 -mt-2 z-10">
                         <button onClick={() => startEditSkill(s)} className="p-2 rounded-xl text-zinc-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors" title="Edit Skill">
                           <Pencil size={16} />
                         </button>
                         <button onClick={() => deleteSkill(s.id, s.name)} className="p-2 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Delete Skill">
                           <Trash2 size={16} />
                         </button>
                       </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${getCategoryTheme(s.category).bg} ${getCategoryTheme(s.category).text}`}>
                        {s.category || "Uncategorized"}
                      </span>
                      <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50">
                        Lv {s.level || 1}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-medium mb-2">
                        <span className="text-zinc-500 dark:text-zinc-400">Progress</span>
                        <span className="text-zinc-900 dark:text-zinc-100">{s.progress || 0}% / {s.xp || 0} XP</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-inner">
                        <div className={`h-full rounded-full transition-all duration-500 ease-out relative ${pulseSkill[s.id] ? "bg-brand-400 scale-y-110" : "bg-gradient-to-r from-brand-500 to-brand-600"}`} style={{ width: `${Math.min(100, s.progress || 0)}%` }}>
                            <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 -skew-x-12 animate-shimmer" />
                        </div>
                      </div>
                    </div>
                    <button type="button" onClick={() => toggleLocker(s.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 w-fit">
                      <Filter size={16} />
                      <span>{openLockers[s.id] ? "Hide" : "Show"} Resource Locker</span>
                      <ChevronDown size={16} className={`${openLockers[s.id] ? "rotate-180" : "rotate-0"} transition-transform`} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {openLockers[s.id] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-5">
                      <div className="mb-4">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">Resource Locker</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Save links, tutorials, and docs for this skill.</p>
                      </div>

                      {(s.resources || []).length > 0 ? (
                        <div className="space-y-2 mb-5">
                          {(s.resources || []).map(resource => (
                            <div key={resource.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 transition hover:border-brand-500/30">
                              <a href={resource.url} target="_blank" rel="noreferrer noopener" className="flex items-center gap-3 min-w-0 group/link">
                                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover/link:bg-brand-50 dark:group-hover/link:bg-brand-500/10 group-hover/link:text-brand-500 transition-colors">
                                   <ExternalLink size={16} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate group-hover/link:text-brand-600 dark:group-hover/link:text-brand-400 transition-colors">{resource.title}</p>
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{resource.url}</p>
                                </div>
                              </a>
                              <button type="button" onClick={() => removeResource(s.id, resource.id)}
                                className="rounded-lg p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-5 p-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-center">
                           <p className="text-sm text-zinc-500 dark:text-zinc-400">No resources added yet.</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input placeholder="Resource title"
                          value={(resourceInputs[s.id]?.title) || ""}
                          onChange={e => updateResourceInput(s.id, "title", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50" />
                        <input placeholder="Resource URL"
                          value={(resourceInputs[s.id]?.url) || ""}
                          onChange={e => updateResourceInput(s.id, "url", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50" />
                      </div>
                      <button type="button" onClick={() => addResource(s.id)}
                        className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-3 text-sm font-semibold transition hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-md">
                        <Plus size={16} /> Add Resource
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Level Selector */}
                <div className="mt-auto pt-5 border-t border-zinc-200/50 dark:border-zinc-800/50">
                  <p className="text-xs mb-3 font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Set Skill Level</p>
                  <div className="flex gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50">
                    {["Beginner", "Intermediate", "Expert"].map(l => {
                      const isActive = getLevelFromProgress(s.progress) === l;
                      return (
                        <button key={l} onClick={() => updateLevel(s.id, l)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                             isActive 
                             ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                             : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5"
                          }`}>
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
