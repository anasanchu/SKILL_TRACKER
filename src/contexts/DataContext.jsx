import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase";

const DataContext = createContext({});
export const useData = () => useContext(DataContext);

const defaultProfile = {
  name: "",
  title: "",
  bio: "",
  github: "",
  website: "",
  twitter: "",
  photo: null,
};

const createDemoData = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, 15);
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 10);
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 5);

  const isoDay = (date) => date.toISOString().slice(0, 10);

  return {
    profile: {
      name: "Anas Learner",
      title: "Frontend Developer",
      bio: "Frontend developer building focused learning systems, project portfolios, and practical skill growth habits.",
      github: "https://github.com/example",
      website: "https://example.com",
      twitter: "",
      photo: null,
    },
    skills: [
      {
        id: 101,
        name: "React",
        category: "Frontend",
        xp: 82,
        level: 3,
        progress: 82,
        history: [
          { date: today.toISOString(), progress: 82, note: "Built reusable components and dashboard flows" },
          { date: oneMonthAgo.toISOString(), progress: 66, note: "Learned context patterns and custom hooks" },
          { date: twoMonthsAgo.toISOString(), progress: 33, note: "Started React fundamentals study" }
        ],
        resources: [{ id: 1001, title: "React Docs", url: "https://react.dev" }],
      },
      {
        id: 102,
        name: "Tailwind CSS",
        category: "Design Systems",
        xp: 74,
        level: 2,
        progress: 74,
        history: [
          { date: yesterday.toISOString(), progress: 74, note: "Created responsive layouts and dark mode UI" },
          { date: twoMonthsAgo.toISOString(), progress: 40, note: "Learned core utility classes and grid systems" }
        ],
        resources: [{ id: 1002, title: "Tailwind Docs", url: "https://tailwindcss.com/docs" }],
      },
      {
        id: 103,
        name: "Firebase",
        category: "Backend",
        xp: 100,
        level: 3,
        progress: 100, // Seeded as Mastered!
        history: [
          { date: yesterday.toISOString(), progress: 100, note: "Connected auth and Firestore persistence" },
          { date: oneMonthAgo.toISOString(), progress: 58, note: "Setup project configs and security rules" }
        ],
        resources: [],
      },
    ],
    projects: [
      {
        id: twoMonthsAgo.getTime(), // Added 2 months ago
        name: "SkillTracker Dashboard",
        desc: "A learning dashboard with weekly goals, journal logs, skill resources, and resume export.",
        link: "https://example.com",
        github: "https://github.com/example/skilltracker",
        coverImage: "",
        attachments: [],
        skillIds: [101, 102, 103],
        skills: ["React", "Tailwind CSS", "Firebase"],
      },
      {
        id: oneMonthAgo.getTime(), // Added 1 month ago
        name: "Portfolio Case Study",
        desc: "A project card system that connects shipped work to demonstrated skills.",
        link: "",
        github: "https://github.com/example/portfolio",
        coverImage: "",
        attachments: [],
        skillIds: [101, 102],
        skills: ["React", "Tailwind CSS"],
      },
    ],
    notes: [
      { id: 501, date: isoDay(today), content: "Refined the dashboard layout and connected weekly goals to skill growth.", skillId: 101, skillName: "React" },
      { id: 502, date: isoDay(yesterday), content: "Reviewed React component structure and improved portfolio presentation.", skillId: 102, skillName: "Tailwind CSS" },
      { id: 503, date: isoDay(oneMonthAgo), content: "Configured Firebase collections, read rules, and hooked up listeners.", skillId: 103, skillName: "Firebase" },
      { id: 504, date: isoDay(twoMonthsAgo), content: "Sketched the dashboard grid layout using Tailwind.", skillId: 102, skillName: "Tailwind CSS" },
      { id: 505, date: isoDay(threeMonthsAgo), content: "Created basic HTML wireframes and research files.", skillId: 101, skillName: "React" }
    ],
    weeklyGoals: [
      { id: 301, text: "Finish resume export polish", completed: true, status: "completed", createdAt: yesterday.toISOString(), skillId: 101, skillName: "React" },
      { id: 302, text: "Add one portfolio project", completed: false, status: "active", createdAt: today.toISOString(), skillId: 102, skillName: "Tailwind CSS" },
    ],
    pastWeeklyGoals: [
      { id: 303, text: "Configure Firebase routing and auth", completed: true, status: "completed", createdAt: oneMonthAgo.toISOString(), completedAt: oneMonthAgo.toISOString(), skillId: 103, skillName: "Firebase" },
      { id: 304, text: "Design landing page styling", completed: true, status: "completed", createdAt: twoMonthsAgo.toISOString(), completedAt: twoMonthsAgo.toISOString(), skillId: 102, skillName: "Tailwind CSS" },
    ],
    weeklyGoalsLastRoll: today.toISOString(),
    activityLog: [
      { id: 401, type: "skill", skillId: 101, skillName: "React", goalId: null, noteDate: null, projectId: null, projectName: null, label: "Updated React progress", timestamp: today.toISOString() },
      { id: 402, type: "journal", skillId: 101, skillName: "React", goalId: null, noteDate: isoDay(today), projectId: null, projectName: null, label: null, timestamp: today.toISOString() },
      { id: 403, type: "project", skillId: 102, skillName: "Tailwind CSS", goalId: null, noteDate: null, projectId: 201, projectName: "SkillTracker Dashboard", label: "Portfolio project", timestamp: yesterday.toISOString() },
      { id: 404, type: "goal", skillId: 101, skillName: "React", goalId: 301, noteDate: null, projectId: null, projectName: null, label: "Completed: Finish resume export polish", timestamp: today.toISOString() },
    ],
  };
};

const demoStorageKey = "skill-tracker-demo-data";

const normalizeNotes = (loadedNotes) => {
  if (Array.isArray(loadedNotes)) return loadedNotes;
  if (loadedNotes && typeof loadedNotes === 'object') {
    return Object.entries(loadedNotes).map(([date, content], idx) => ({
      id: `legacy-${date}-${idx}`,
      date,
      content: typeof content === 'string' ? content : (content?.content || ""),
      skillId: "",
      skillName: ""
    }));
  }
  return [];
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();

  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState(defaultProfile);
  const [notes, setNotes] = useState([]);
  const [weeklyGoals, setWeeklyGoals] = useState([]);
  const [pastWeeklyGoals, setPastWeeklyGoals] = useState([]);
  const [weeklyGoalsLastRoll, setWeeklyGoalsLastRoll] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const rolloverApplied = useRef(false);

  // Global mastery celebration overlay state
  const [celebrationSkill, setCelebrationSkill] = useState(null);

  useEffect(() => {
    if (!user) {
      setSkills([]);
      setProjects([]);
      setProfile(defaultProfile);
      setNotes([]);
      setHasFetchedData(false);
      return;
    }

    if (user.isDemo) {
      let demoData = createDemoData();
      try {
        const saved = localStorage.getItem(demoStorageKey);
        if (saved) demoData = { ...demoData, ...JSON.parse(saved) };
      } catch {}

      setSkills(demoData.skills || []);
      setProjects(demoData.projects || []);
      setProfile(demoData.profile || defaultProfile);
      setNotes(normalizeNotes(demoData.notes));
      setWeeklyGoals(demoData.weeklyGoals || []);
      setPastWeeklyGoals(demoData.pastWeeklyGoals || []);
      setActivityLog(demoData.activityLog || []);
      setWeeklyGoalsLastRoll(demoData.weeklyGoalsLastRoll || null);
      setHasFetchedData(true);
      return;
    }

    setHasFetchedData(false);
    const userDoc = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDoc, (snapshot) => {
      if (!snapshot.exists()) {
        setSkills([]);
        setProjects([]);
        setProfile({
          ...defaultProfile,
          name: user.displayName || "",
          photo: user.photoURL || null,
        });
        setNotes([]);
        setHasFetchedData(true);
        return;
      }

      const data = snapshot.data();
      const normalizedSkills = (data.skills || []).map(skill => ({
        progress: typeof skill.progress === "number" ? skill.progress : 0,
        xp: typeof skill.xp === "number" ? skill.xp : (typeof skill.progress === "number" ? skill.progress : 0),
        level: typeof skill.level === "number" ? skill.level : 1,
        ...skill,
      }));
      setSkills(normalizedSkills);
      setProjects(data.projects || []);
      setProfile(data.profile || defaultProfile);
      setNotes(normalizeNotes(data.notes));
      setWeeklyGoals(data.weeklyGoals || []);
      setPastWeeklyGoals(data.pastWeeklyGoals || []);
      setActivityLog(data.activityLog || []);
      setWeeklyGoalsLastRoll(data.weeklyGoalsLastRoll || null);
      setHasFetchedData(true);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !hasFetchedData || user.isDemo) return;
    setDoc(doc(db, "users", user.uid), { skills }, { merge: true });
  }, [skills, user, hasFetchedData]);

  useEffect(() => {
    if (!user || !hasFetchedData || user.isDemo) return;
    setDoc(doc(db, "users", user.uid), { projects }, { merge: true });
  }, [projects, user, hasFetchedData]);

  useEffect(() => {
    if (!user || !hasFetchedData || user.isDemo) return;
    setDoc(doc(db, "users", user.uid), { profile }, { merge: true });
  }, [profile, user, hasFetchedData]);

  useEffect(() => {
    if (!user?.isDemo || !hasFetchedData) return;
    localStorage.setItem(demoStorageKey, JSON.stringify({
      skills,
      projects,
      profile,
      notes,
      weeklyGoals,
      pastWeeklyGoals,
      weeklyGoalsLastRoll,
      activityLog,
    }));
  }, [user, hasFetchedData, skills, projects, profile, notes, weeklyGoals, pastWeeklyGoals, weeklyGoalsLastRoll, activityLog]);

  const addToast = (msg, type = "info") => {
    const ev = new CustomEvent("show-toast", { detail: { msg, type } });
    window.dispatchEvent(ev);
  };

  const awardSkillXp = (skillId, amount) => {
    setSkills(prev => prev.map(skill => {
      if (skill.id !== skillId) return skill;
      const oldXp = typeof skill.xp === "number" ? skill.xp : 0;
      const oldLevel = typeof skill.level === "number" ? skill.level : 1;
      let xpTotal = oldXp + amount;
      let newLevel = oldLevel;
      let leveled = false;
      while (xpTotal >= 100) {
        xpTotal -= 100;
        newLevel += 1;
        leveled = true;
      }
      const nextProgress = xpTotal;
      if (leveled) {
        addToast(`${skill.name} just leveled up to Level ${newLevel}!`, "success");
      }
      return {
        ...skill,
        xp: xpTotal,
        level: newLevel,
        progress: nextProgress,
        history: [{ date: new Date().toISOString(), xpGain: amount, xp: xpTotal, level: newLevel }, ...(skill.history || [])]
      };
    }));
  };

  const addActivityEvent = ({ type, skillId, skillName, goalId, noteDate, projectId, projectName, label }) => {
    setActivityLog(prev => [...prev, {
      id: Date.now(),
      type,
      skillId: skillId || null,
      skillName: skillName || null,
      goalId: goalId || null,
      noteDate: noteDate || null,
      projectId: projectId || null,
      projectName: projectName || null,
      label: label || null,
      timestamp: new Date().toISOString()
    }] );
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  };

  useEffect(() => {
    if (!user || !hasFetchedData || user.isDemo) return;
    setDoc(doc(db, "users", user.uid), { notes }, { merge: true });
  }, [notes, user, hasFetchedData]);

  useEffect(() => {
    if (!user || !hasFetchedData || user.isDemo) return;
    setDoc(doc(db, "users", user.uid), { weeklyGoals }, { merge: true });
  }, [weeklyGoals, user, hasFetchedData]);

  useEffect(() => {
    if (!user || !hasFetchedData || user.isDemo) return;
    setDoc(doc(db, "users", user.uid), { pastWeeklyGoals }, { merge: true });
  }, [pastWeeklyGoals, user, hasFetchedData]);

  useEffect(() => {
    if (!user || !hasFetchedData || user.isDemo) return;
    setDoc(doc(db, "users", user.uid), { weeklyGoalsLastRoll }, { merge: true });
  }, [weeklyGoalsLastRoll, user, hasFetchedData]);

  useEffect(() => {
    if (!user || !hasFetchedData || user.isDemo) return;
    setDoc(doc(db, "users", user.uid), { activityLog }, { merge: true });
  }, [activityLog, user, hasFetchedData]);

  useEffect(() => {
    if (!user || !hasFetchedData || rolloverApplied.current) return;

    const currentWeekStart = getWeekStart(new Date());
    const lastWeekStart = weeklyGoalsLastRoll ? new Date(weeklyGoalsLastRoll) : null;
    const hasOldGoals = weeklyGoals.some(goal => {
      if (!goal.createdAt) return false;
      return getWeekStart(new Date(goal.createdAt)).getTime() < currentWeekStart.getTime();
    });

    const shouldRoll = lastWeekStart ? lastWeekStart.getTime() !== currentWeekStart.getTime() : hasOldGoals;
    if (!shouldRoll) {
      if (!weeklyGoalsLastRoll) setWeeklyGoalsLastRoll(currentWeekStart.toISOString());
      rolloverApplied.current = true;
      return;
    }

    const missedGoals = weeklyGoals.filter(goal => !goal.completed);
    const completedCount = weeklyGoals.filter(goal => goal.completed).length;
    const totalCount = weeklyGoals.length;

    const missedArchive = missedGoals.map(goal => ({
      ...goal,
      status: "missed",
      missedAt: new Date().toISOString(),
      archivedWeekStart: lastWeekStart?.toISOString() || null,
    }));

    const activeThisWeek = weeklyGoals.filter(goal => goal.completed).map(goal => ({
      ...goal,
      status: "completed",
    }));

    if (totalCount > 0) {
      addToast(`New week, new focus. You completed ${completedCount} out of ${totalCount} goals last week. Build momentum this week.`, "success");
    }

    setWeeklyGoals(activeThisWeek);
    setPastWeeklyGoals(prev => [...missedArchive, ...prev]);
    setWeeklyGoalsLastRoll(currentWeekStart.toISOString());
    rolloverApplied.current = true;
  }, [user, hasFetchedData, weeklyGoals, weeklyGoalsLastRoll, pastWeeklyGoals]);

  // Enhanced Growth Velocity scoring engine
  const monthlyVelocityData = useMemo(() => {
    const monthlyScores = [];
    const now = new Date();

    // Scan last 6 months rolling
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString("default", { month: "short", year: "2-digit" });
      const year = d.getFullYear();
      const month = d.getMonth();

      const isSameMonth = (dateVal) => {
        if (!dateVal) return false;
        const dateObj = new Date(dateVal);
        return dateObj.getFullYear() === year && dateObj.getMonth() === month;
      };

      // 1. Weekly Goals: +10 points for each completed goal completed/archived in this month
      let completedGoalsCount = 0;
      weeklyGoals.forEach(g => {
        if (g.completed) {
          const compDate = g.completedAt || g.createdAt || g.id;
          if (isSameMonth(compDate)) completedGoalsCount++;
        }
      });
      pastWeeklyGoals.forEach(g => {
        if (g.status === "completed" || g.completed) {
          const compDate = g.completedAt || g.archivedWeekStart || g.createdAt || g.id;
          if (isSameMonth(compDate)) completedGoalsCount++;
        }
      });

      // 2. Skills:
      // - New skills added: +15 points each
      // - Leveled up: +20 points each
      let newSkillsCount = 0;
      let levelUpsCount = 0;
      skills.forEach(s => {
        const addedDate = s.history && s.history.length > 0
          ? s.history[s.history.length - 1].date
          : (s.id > 1000000000000 ? s.id : null);
        if (addedDate && isSameMonth(addedDate)) {
          newSkillsCount++;
        }

        if (s.history && s.history.length > 0) {
          const sortedHistory = [...s.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          let lastLevel = 1;
          sortedHistory.forEach((h) => {
            const hDate = new Date(h.date);
            const isHInMonth = hDate.getFullYear() === year && hDate.getMonth() === month;
            if (h.level !== undefined) {
              if (h.level > lastLevel) {
                if (isHInMonth) levelUpsCount++;
                lastLevel = h.level;
              }
            } else if (h.progress !== undefined) {
              const currentLevelNum = h.progress >= 100 ? 3 : (h.progress >= 66 ? 2 : 1);
              if (currentLevelNum > lastLevel) {
                if (isHInMonth) levelUpsCount++;
                lastLevel = currentLevelNum;
              }
            }
          });
        }
      });

      // 3. Journals: +5 points for each entry in this month
      let journalsCount = 0;
      (notes || []).forEach(note => {
        if (note && note.date && isSameMonth(note.date)) journalsCount++;
      });

      // 4. Projects: +25 points for each project documented in this month
      let projectsCount = 0;
      projects.forEach(p => {
        const docDate = p.id > 1000000000000 ? p.id : null;
        if (docDate && isSameMonth(docDate)) projectsCount++;
      });

      // 5. Mastered Status Multiplier: 1.2x per mastered skill, capped at 2.0x
      let masteredCount = 0;
      skills.forEach(s => {
        if (s.progress >= 100) {
          let masteredDate = null;
          if (s.history && s.history.length > 0) {
            const sortedHistory = [...s.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const firstMasteredItem = sortedHistory.find(h => h.progress >= 100 || h.level >= 3);
            if (firstMasteredItem) {
              masteredDate = new Date(firstMasteredItem.date);
            }
          }
          if (!masteredDate) {
            masteredDate = s.id > 1000000000000 ? new Date(s.id) : new Date();
          }

          if (masteredDate.getFullYear() < year || (masteredDate.getFullYear() === year && masteredDate.getMonth() <= month)) {
            masteredCount++;
          }
        }
      });

      const rawScore = (completedGoalsCount * 10) +
                       (newSkillsCount * 15) +
                       (levelUpsCount * 20) +
                       (journalsCount * 5) +
                       (projectsCount * 25);

      const multiplier = masteredCount > 0 ? Math.min(2.0, 1.2 + (masteredCount - 1) * 0.2) : 1.0;
      const finalScore = rawScore * multiplier;

      monthlyScores.push({
        name: monthLabel,
        improvement: Math.round(finalScore)
      });
    }

    return monthlyScores;
  }, [skills, projects, notes, weeklyGoals, pastWeeklyGoals]);

  return (
    <DataContext.Provider value={{
      skills, setSkills,
      projects, setProjects,
      profile, setProfile,
      notes, setNotes,
      weeklyGoals, setWeeklyGoals,
      pastWeeklyGoals, setPastWeeklyGoals,
      weeklyGoalsLastRoll, setWeeklyGoalsLastRoll,
      activityLog, setActivityLog,
      awardSkillXp,
      addActivityEvent,
      addToast,
      celebrationSkill, setCelebrationSkill,
      monthlyVelocityData,
    }}>
      {children}
    </DataContext.Provider>
  );
};
