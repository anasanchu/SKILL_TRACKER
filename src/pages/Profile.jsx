import React, { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Camera, Pencil, Printer, Download, GitBranch, Globe } from "lucide-react";
import { useData } from "../contexts/DataContext";

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

export default function Profile() {
  const { profile, setProfile, skills, projects, addToast } = useData();
  
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef(null);

  const handlePhoto = e => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 3 * 1024 * 1024) { addToast("Photo must be under 3 MB", "warn"); return; }
    const r = new FileReader(); r.onload = ev => setDraft(p => ({ ...p, photo: ev.target.result })); r.readAsDataURL(file);
  };

  const save = () => {
    if (!draft.name.trim()) { addToast("Name is required", "warn"); return; }
    setProfile(draft); setEditing(false); addToast("Profile saved!", "success");
  };

  const generatePDF = () => {
    window.print();
  };

  const activeProjects = projects.slice(0, 4);
  const topSkills = useMemo(() => {
    return [...skills]
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      .slice(0, 12);
  }, [skills]);

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6 sm:space-y-8">
      <div className="no-print space-y-6">
        <div className="flex justify-between items-end mt-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Profile & Settings</h1>
            <p className="text-base text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Manage your personal info and export your resume.</p>
          </div>
        </div>

        <div className="rounded-[2rem] overflow-hidden glass-card border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm relative">
          <div className="h-40 relative overflow-hidden bg-gradient-to-br from-brand-600 via-cyan-600 to-emerald-800">
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CgkJPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz4KCTwvc3ZnPg==')] opacity-30"></div>
             <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950/25 to-transparent"></div>
          </div>
          
          <div className="px-6 pb-8 sm:px-10 relative z-10">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 -mt-16 mb-8">
              <div className="flex items-end gap-5">
                <div className="relative">
                  <div className="w-32 h-32 rounded-3xl border-4 border-zinc-50 dark:border-zinc-950 overflow-hidden shadow-2xl bg-zinc-100 dark:bg-zinc-800">
                    {(editing ? draft.photo : profile.photo) ? (
                      <img src={editing ? draft.photo : profile.photo} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl font-display font-bold text-zinc-300 dark:text-zinc-600">
                        {profile.name ? profile.name[0].toUpperCase() : <User size={48} />}
                      </div>
                    )}
                  </div>
                  {editing && (
                    <button onClick={() => fileRef.current.click()} className="absolute -bottom-2 -right-2 p-3 rounded-2xl text-white shadow-xl transition-transform hover:scale-110 bg-brand-500 hover:bg-brand-600 group">
                      <Camera size={18} className="group-hover:animate-pulse" />
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </div>

                {!editing && (
                  <div className="pb-2">
                    <h2 className="text-3xl font-bold font-display text-zinc-900 dark:text-white tracking-tight">{profile.name || "Your Name"}</h2>
                    {profile.title && <p className="font-medium text-brand-600 dark:text-brand-400 mt-1">{profile.title}</p>}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                {!editing ? (
                  <>
                    <button onClick={() => { setDraft(profile); setEditing(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-transparent dark:border-zinc-700">
                      <Pencil size={16} /> Edit
                    </button>
                    <button onClick={generatePDF} disabled={generating} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 shadow-brand-500/25">
                      {generating ? <Printer size={16} className="animate-spin" /> : <Download size={16} />} 
                      Export Resume
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setDraft(profile); setEditing(false); }} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700">Cancel</button>
                    <button onClick={save} className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all active:scale-[0.98] bg-brand-500 hover:bg-brand-600 shadow-brand-500/25">Save</button>
                  </>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <input placeholder="Full Name *" value={draft.name} onChange={e=>setDraft(p=>({...p,name:e.target.value}))} className="w-full px-4 py-3.5 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50" />
                  <input placeholder="Title (e.g. Frontend Developer)" value={draft.title} onChange={e=>setDraft(p=>({...p,title:e.target.value}))} className="w-full px-4 py-3.5 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50" />
                  <textarea placeholder="Short Bio" value={draft.bio} onChange={e=>setDraft(p=>({...p,bio:e.target.value}))} rows="4" className="w-full px-4 py-3.5 rounded-xl text-sm resize-none glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50 sm:col-span-2" />
                  
                  <div className="relative group">
                    <GitBranch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-500 transition-colors" />
                    <input placeholder="GitHub URL" value={draft.github} onChange={e=>setDraft(p=>({...p,github:e.target.value}))} className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50" />
                  </div>
                  <div className="relative group">
                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-500 transition-colors" />
                    <input placeholder="Portfolio Website" value={draft.website} onChange={e=>setDraft(p=>({...p,website:e.target.value}))} className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm glass-input outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/50" />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {profile.bio && <p className="text-base leading-relaxed max-w-3xl text-zinc-600 dark:text-zinc-400">{profile.bio}</p>}
                  <div className="flex flex-wrap gap-3 pt-2">
                    {profile.github && <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700"><GitBranch size={16}/> GitHub</a>}
                    {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700"><Globe size={16}/> Website</a>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Print-Only Resume Template */}
      <div className="print-resume w-full">
        <div className="p-10 bg-white text-slate-900 font-sans" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="border-b-4 border-brand-600 pb-6 mb-8 flex justify-between items-start gap-8">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 m-0 tracking-tight">{profile.name || "Your Name"}</h1>
              <h2 className="text-xl font-semibold text-brand-600 mt-2">{profile.title || "Your Title"}</h2>
            </div>
            {(profile.github || profile.website) && (
              <div className="text-right text-sm text-slate-500 space-y-1 font-medium">
                {profile.website && <div>{profile.website}</div>}
                {profile.github && <div>{profile.github}</div>}
              </div>
            )}
          </div>

          {profile.bio && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3 uppercase tracking-wider">Professional Profile</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{profile.bio}</p>
            </div>
          )}

          {topSkills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider">Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {topSkills.map(skill => (
                  <span key={skill.id} className="rounded bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeProjects.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider">Projects</h3>
              <div className="space-y-4">
                {activeProjects.map(project => (
                  <div key={project.id} className="border-b border-slate-100 pb-4">
                    <div className="flex justify-between gap-6">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{project.name}</h4>
                        {project.desc && <p className="text-sm text-slate-600 leading-relaxed mt-1">{project.desc}</p>}
                      </div>
                      {(project.link || project.github) && (
                        <div className="text-right text-xs text-slate-500 shrink-0 space-y-1">
                          {project.link && <div>{project.link}</div>}
                          {project.github && <div>{project.github}</div>}
                        </div>
                      )}
                    </div>
                    {(project.skills || []).length > 0 && (
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        Skills applied: {(project.skills || []).join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
