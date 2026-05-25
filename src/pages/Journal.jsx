import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotebookPen, Plus, Calendar, Trash2 } from "lucide-react";
import { useData } from "../contexts/DataContext";

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

export default function Journal() {
  const { notes, setNotes, addToast, skills, awardSkillXp, addActivityEvent } = useData();
  
  const todayDate = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayDate);
  const [content, setContent] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  useEffect(() => {
    if (!selectedSkill && skills.length > 0) {
      setSelectedSkill(skills[0].id);
    }
  }, [skills, selectedSkill]);

  const saveNote = (e) => {
    e.preventDefault();
    if (!content.trim()) { addToast("Note cannot be empty", "warn"); return; }
    
    setNotes(prev => ({
      ...prev,
      [date]: content.trim()
    }));
    
    if (selectedSkill) {
      const linkedSkill = skills.find(skill => skill.id === selectedSkill);
      awardSkillXp(selectedSkill, 10);
      addActivityEvent({ type: "journal", skillId: selectedSkill, skillName: linkedSkill?.name, noteDate: date });
    } else {
      addActivityEvent({ type: "journal", noteDate: date });
    }

    setContent("");
    if (date !== todayDate) setDate(todayDate);
    addToast("Journal entry saved!", "success");
  };

  const deleteNote = (targetDate) => {
    setNotes(prev => {
      const newNotes = { ...prev };
      delete newNotes[targetDate];
      return newNotes;
    });
    addToast("Entry deleted", "info");
  };

  // Sort notes by date descending
  const sortedDates = Object.keys(notes).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end mt-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-zinc-950 text-brand-500 dark:bg-brand-500 dark:text-zinc-950 border border-zinc-950 dark:border-brand-500">
              <NotebookPen size={24} />
            </div>
            Daily Journal
          </h1>
          <p className="text-base text-zinc-500 dark:text-zinc-400 mt-3 font-medium">Document what you learn every day to build a learning streak.</p>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-[2rem] glass-card border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm relative overflow-hidden mb-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-500 pointer-events-none" />
        
        <h2 className="font-display font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-white text-lg">
          <NotebookPen size={18} className="text-brand-500" /> New Entry
        </h2>
        <form onSubmit={saveNote} className="space-y-5 relative z-10">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="relative w-full sm:w-48 shrink-0 group">
              <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-500 transition-colors" />
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50" 
              />
            </div>
            <div className="w-full sm:w-64">
              <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-brand-500/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[position:right_1rem_center]">
                <option value="" className="bg-white dark:bg-zinc-900">Select a skill to earn XP</option>
                {skills.map(skill => <option key={skill.id} value={skill.id} className="bg-white dark:bg-zinc-900">{skill.name}</option>)}
              </select>
            </div>
          </div>
          <div>
             <textarea 
               placeholder="What did you learn or practice today?" 
               value={content} 
               onChange={e => setContent(e.target.value)}
               className="w-full px-5 py-4 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50 resize-none min-h-[120px]" 
             />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 shadow-brand-500/25">
              <Plus size={18} /> Save Entry
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="font-display font-bold text-xl text-zinc-900 dark:text-white">Past Entries</h2>
        
        {sortedDates.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed rounded-[2rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
            <NotebookPen size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Write your first entry to build a learning history.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            <AnimatePresence>
              {sortedDates.map(d => {
                const dateObj = new Date(d);
                const isToday = d === todayDate;
                return (
                  <motion.div key={d} variants={fadeUp} layout initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 rounded-[1.5rem] glass-card border border-zinc-200/80 dark:border-zinc-800/80 group relative hover:border-brand-500/30 transition-all duration-300">
                    
                    <button onClick={() => deleteNote(d)} className="absolute top-4 right-4 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                      <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl font-display shadow-sm ${
                         isToday 
                         ? "bg-brand-500 text-white shadow-brand-500/20" 
                         : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50"
                      }`}>
                        <span className="text-xs font-bold uppercase opacity-80 leading-none mb-1">{dateObj.toLocaleString('en-US', { month: 'short' })}</span>
                        <span className="text-xl font-black leading-none">{dateObj.getDate()}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-white">{dateObj.toLocaleString('en-US', { weekday: 'long' })}, {dateObj.getFullYear()}</h3>
                        {isToday && <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500 mt-0.5 block">Today</span>}
                      </div>
                    </div>
                    
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-zinc-600 dark:text-zinc-400 sm:ml-[4.5rem]">
                      {notes[d]}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
