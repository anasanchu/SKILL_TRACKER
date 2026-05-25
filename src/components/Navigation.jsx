import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, Briefcase, User as UserIcon, LogOut, Sun, Moon, NotebookPen, CircuitBoard } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navigation({ dm, setDm }) {
  const { logout } = useAuth();
  
  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Skills", path: "/skills", icon: BookOpen },
    { name: "Journal", path: "/journal", icon: NotebookPen },
    { name: "Portfolio", path: "/portfolio", icon: Briefcase },
    { name: "Profile", path: "/profile", icon: UserIcon },
  ];

  const handleLogout = async () => {
    try { await logout(); } catch (e) { console.error(e); }
  };

  const navClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium text-sm group relative ${
      isActive 
        ? "text-zinc-950 dark:text-white bg-brand-500 dark:bg-brand-500/20 border border-brand-600/40" 
        : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-950/5 dark:hover:bg-white/5 border border-transparent"
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-50 p-6 no-print glass-panel border-r border-y-0 border-l-0">
        <div className="flex items-center gap-3 mb-10 px-2 mt-2 group cursor-default">
          <div className="p-2 rounded-lg bg-zinc-950 text-brand-500 dark:bg-brand-500 dark:text-zinc-950 border border-zinc-950 dark:border-brand-500">
            <CircuitBoard size={20} />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight text-zinc-900 dark:text-white leading-none">SkillTracker</h1>
            <p className="mechanik-label mt-1">Learning OS</p>
          </div>
        </div>

        <div className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={navClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-zinc-950 dark:bg-brand-500 rounded-r-full animate-scale-in" />
                  )}
                  <item.icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="mt-auto space-y-1 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <button 
            onClick={() => setDm(!dm)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left transition-all text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
          >
            {dm ? <Sun size={18} /> : <Moon size={18} />}
            <span>{dm ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left transition-all text-sm font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center p-2 pb-safe no-print glass-panel border-t border-x-0 border-b-0 rounded-t-lg">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all duration-300 ${isActive ? "text-zinc-950 dark:text-brand-500" : "text-zinc-400 dark:text-zinc-500"}`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-center no-print glass-panel border-b border-x-0 border-t-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-950 text-brand-500 dark:bg-brand-500 dark:text-zinc-950">
            <CircuitBoard size={14} />
          </div>
          <h1 className="font-display font-bold text-sm tracking-tight text-zinc-900 dark:text-white">SkillTracker</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setDm(!dm)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors" aria-label="Toggle theme">
            {dm ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors" aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>
    </>
  );
}
