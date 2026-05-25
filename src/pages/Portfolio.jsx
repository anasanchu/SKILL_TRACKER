import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, ExternalLink, Plus, Camera, Video, GitBranch, Globe, Trash2 } from "lucide-react";
import { useData } from "../contexts/DataContext";

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

export default function Portfolio() {
  const { projects, setProjects, skills, addToast, addActivityEvent } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const fileRef = useRef(null);
  const attachmentRef = useRef(null);

  const [draft, setDraft] = useState({ name: "", desc: "", link: "", github: "", coverImage: "", attachments: [], skillIds: [] });

  const handleCoverImage = e => {
    const file = e.target.files[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { addToast("Cover must be an image.", "warn"); return; }
    if (file.size > 3 * 1024 * 1024) { addToast("Cover image must be under 3 MB", "warn"); return; }
    const reader = new FileReader();
    reader.onload = ev => setDraft(p => ({ ...p, coverImage: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleAttachment = e => {
    const file = e.target.files[0]; if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 10 * 1024 * 1024 : 3 * 1024 * 1024;
    if (file.size > maxSize) {
      addToast(isVideo ? "Video must be under 10 MB" : "Image must be under 3 MB", "warn");
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => setDraft(p => ({
      ...p,
      attachments: [...p.attachments, { id: Date.now(), src: ev.target.result, type: isVideo ? "video" : "image" }]
    }));
    reader.readAsDataURL(file);
  };

  const addProject = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) { addToast("Project name is required", "warn"); return; }
    const linkedSkills = skills.filter(skill => draft.skillIds.includes(skill.id)).map(skill => skill.name);
    const newProject = { id: Date.now(), ...draft, skills: linkedSkills };
    setProjects(p => [newProject, ...p]);
    linkedSkills.forEach(skillName => {
      const linkedSkill = skills.find(skill => skill.name === skillName);
      addActivityEvent({ type: "project", skillId: linkedSkill?.id, skillName, projectId: newProject.id, projectName: newProject.name, label: "Portfolio project" });
    });
    if (!linkedSkills.length) {
      addActivityEvent({ type: "project", projectId: newProject.id, projectName: newProject.name, label: "Portfolio project" });
    }
    setDraft({ name: "", desc: "", link: "", github: "", coverImage: "", attachments: [], skillIds: [] });
    setShowAdd(false);
    addToast(`Project "${draft.name}" added`, "success");
  };

  const deleteProject = (id) => {
    setProjects(p => p.filter(x => x.id !== id));
    addToast("Project removed", "info");
  };

  const toggleDraftSkill = (skillId) => {
    setDraft(prev => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter(id => id !== skillId)
        : [...prev.skillIds, skillId]
    }));
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mt-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Project Portfolio</h1>
          <p className="text-base text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Showcase how you've applied your skills.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 shadow-brand-500/25">
          <Plus size={18} /> <span>Add Project</span>
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={addProject} className="p-6 sm:p-8 rounded-[2rem] glass-card border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm relative overflow-hidden mb-8">
               <div className="absolute inset-x-0 top-0 h-1 bg-brand-500 pointer-events-none" />
               <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                <div className="md:col-span-4 flex flex-col gap-3">
                  <div className="w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50 relative overflow-hidden border-zinc-300 dark:border-zinc-700 hover:border-brand-500 dark:hover:border-brand-500"
                    onClick={() => fileRef.current.click()}>
                    {draft.coverImage ? (
                      <img src={draft.coverImage} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                    ) : (
                      <>
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-3 text-zinc-400">
                          <Camera size={24} />
                        </div>
                        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Add cover image</span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">16:9 recommended</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleCoverImage} />
                </div>
                
                <div className="md:col-span-8 space-y-4">
                  <input placeholder="Project Name" value={draft.name} onChange={e => setDraft(p => ({...p, name: e.target.value}))}
                    className="w-full px-4 py-3.5 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50 font-bold" />
                  <textarea placeholder="Short description of what you built and the skills used" value={draft.desc} onChange={e => setDraft(p => ({...p, desc: e.target.value}))}
                    className="w-full px-4 py-3.5 rounded-xl text-sm resize-none glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50" rows="3" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative group">
                      <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-500 transition-colors" />
                      <input placeholder="Live URL" value={draft.link} onChange={e => setDraft(p => ({...p, link: e.target.value}))}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50" />
                    </div>
                    <div className="relative group">
                      <GitBranch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-500 transition-colors" />
                      <input placeholder="GitHub URL" value={draft.github} onChange={e => setDraft(p => ({...p, github: e.target.value}))}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50" />
                    </div>
                  </div>
                  {skills.length > 0 && (
                    <div className="pt-2">
                      <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Skills demonstrated</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map(skill => {
                          const selected = draft.skillIds.includes(skill.id);
                          return (
                            <button key={skill.id} type="button" onClick={() => toggleDraftSkill(skill.id)}
                              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                                selected
                                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                                  : "border-zinc-200 bg-white text-zinc-600 hover:border-brand-500/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                              }`}>
                              {skill.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-4 pt-2">
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Media Gallery</span>
                       <button type="button" onClick={() => attachmentRef.current.click()}
                         className="flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-200 dark:hover:bg-zinc-700">
                         <Plus size={14} /> Add Media
                       </button>
                    </div>
                    {draft.attachments.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {draft.attachments.map(att => (
                          <div key={att.id} className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative group aspect-video">
                            {att.type === "video" ? (
                              <video src={att.src} className="w-full h-full object-cover" />
                            ) : (
                              <img src={att.src} alt="Attachment" className="w-full h-full object-cover" />
                            )}
                            <button type="button" onClick={() => setDraft(p => ({...p, attachments: p.attachments.filter(x => x.id !== att.id)}))}
                               className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-60 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-white">
                               <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input type="file" accept="image/*,video/*" ref={attachmentRef} className="hidden" onChange={handleAttachment} />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                    <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] bg-brand-500 hover:bg-brand-600 shadow-brand-500/25">Save Project</button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.length === 0 && !showAdd && (
          <div className="col-span-full py-16 text-center border-2 border-dashed rounded-[2rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
            <Briefcase size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Add a project to show applied skill growth.</p>
            <button onClick={() => setShowAdd(true)} className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors">
               Add First Project
            </button>
          </div>
        )}
        {projects.map(p => (
          <motion.div key={p.id} variants={fadeUp} className="rounded-[1.5rem] glass-card border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden flex flex-col group relative hover:shadow-lg transition-all duration-300 hover:border-brand-500/30">
            
            <button onClick={() => deleteProject(p.id)} className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-black/50 backdrop-blur-md text-white opacity-60 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-500">
              <Trash2 size={16} />
            </button>

            <div className="h-48 relative bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden border-b border-zinc-200/50 dark:border-zinc-800/50">
              {p.coverImage ? (
                <img src={p.coverImage} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <Briefcase size={40} className="text-zinc-300 dark:text-zinc-700" />
              )}
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-display font-bold text-xl mb-2 text-zinc-900 dark:text-white tracking-tight line-clamp-1">{p.name}</h3>
              <p className="text-[15px] flex-1 text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">{p.desc || "No description provided."}</p>
              {(p.skills || []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.skills.map(skill => (
                    <span key={skill} className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors">
                    <ExternalLink size={16}/> Live Demo
                  </a>
                )}
                {p.github && (
                  <a href={p.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <GitBranch size={16}/> Source
                  </a>
                )}
              </div>
              {p.attachments && p.attachments.length > 0 && (
                <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {p.attachments.map(att => (
                    <div key={att.id} className="w-16 h-12 shrink-0 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                      {att.type === "video" ? (
                        <video src={att.src} className="w-full h-full object-cover" />
                      ) : (
                        <img src={att.src} alt="Attachment" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
