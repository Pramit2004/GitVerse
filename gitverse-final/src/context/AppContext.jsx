import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CHAPTERS } from '../data/chapters';

const AppContext = createContext(null);

/* ── XP thresholds per level ───────────────────────────── */
export const LEVELS = [
  { level:1, title:'Git Rookie',      min:0,    color:'#8899bb' },
  { level:2, title:'Committer',       min:200,  color:'#51cf66' },
  { level:3, title:'Branch Master',   min:600,  color:'#4dabf7' },
  { level:4, title:'Merge Wizard',    min:1400, color:'#cc5de8' },
  { level:5, title:'Git Engineer',    min:3000, color:'#ffb347' },
  { level:6, title:'Git Architect',   min:5500, color:'#ff6b6b' },
  { level:7, title:'Git Legend',      min:9000, color:'#00ff88' },
];

export const XP_REWARDS = {
  sectionRead:    5,
  quizAnswer:    10,
  quizCorrect:   20,
  quizPerfect:   75,
  chapterDone:  100,
  partDone:     350,
  streakBonus:   50,
  simulatorUsed: 15,
};

export const ACHIEVEMENTS = [
  { id:'first_commit',   icon:'🌱', title:'First Blood',       desc:'Complete your first chapter',        xp:50  },
  { id:'streak_3',       icon:'🔥', title:'On Fire',           desc:'3-day learning streak',              xp:100 },
  { id:'streak_7',       icon:'⚡', title:'Week Warrior',      desc:'7-day learning streak',              xp:300 },
  { id:'perfect_quiz',   icon:'🎯', title:'Sharpshooter',      desc:'Get a perfect quiz score',           xp:75  },
  { id:'part_1_done',    icon:'🏅', title:'Foundations Laid',  desc:'Complete Part 1',                   xp:200 },
  { id:'part_4_done',    icon:'🤝', title:'Collaborator',      desc:'Complete GitHub part',               xp:200 },
  { id:'all_chapters',   icon:'🏆', title:'Git Legend',        desc:'Complete all 22 chapters',           xp:1000},
  { id:'certified',      icon:'🎓', title:'Certified',         desc:'Pass the final exam',               xp:500 },
  { id:'time_traveler',  icon:'⏳', title:'Time Traveler',     desc:'Use the Snapshot Time Machine',      xp:30  },
  { id:'branch_garden',  icon:'🌿', title:'Garden Keeper',     desc:'Grow 5 branches in Branch Garden',  xp:30  },
  { id:'speed_run',      icon:'🚀', title:'Speed Runner',      desc:'Complete a chapter in under 2 min',  xp:50  },
  { id:'night_owl',      icon:'🦉', title:'Night Owl',         desc:'Study after midnight',              xp:25  },
];

function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

function getNextLevel(xp) {
  const cur = getLevel(xp);
  return LEVELS.find(l => l.min > cur.min) || null;
}

/* ── Spaced repetition: schedule next review ─────────── */
function nextReviewDate(correct, streak) {
  // Intervals in days: 1, 3, 7, 14, 30, 90
  const intervals = [1, 3, 7, 14, 30, 90];
  const idx = Math.min(streak, intervals.length - 1);
  const days = correct ? intervals[idx] : 1;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function AppProvider({ children }) {
  /* ── Navigation ─────────────────────────────────── */
  const [view, setView]               = useState('home');
  const [activeChapter, setActiveChapter] = useState(null);
  const [chapterKey, setChapterKey]   = useState(0);
  const [navDirection, setNavDirection] = useState('enter');

  /* ── Progress ───────────────────────────────────── */
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gitverse-progress-v2') || '{}'); } catch { return {}; }
  });

  /* ── XP & Gamification ─────────────────────────── */
  const [xp, setXp] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gitverse-xp') || '0'); } catch { return 0; }
  });
  const [achievements, setAchievements] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gitverse-achievements') || '[]'); } catch { return []; }
  });
  const [xpLog, setXpLog] = useState([]); // recent XP events for toast

  /* ── Streak ─────────────────────────────────────── */
  const [streak, setStreak] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gitverse-streak') || '{"count":0,"lastDay":""}'); } catch { return {count:0,lastDay:''}; }
  });

  /* ── Spaced repetition ─────────────────────────── */
  // { conceptId: { correct:n, wrong:n, streak:n, nextReview: ISO } }
  const [srData, setSrData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gitverse-sr') || '{}'); } catch { return {}; }
  });

  /* ── Theme ──────────────────────────────────────── */
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('gitverse-theme') || 'dark'; } catch { return 'dark'; }
  });

  /* ── UI ─────────────────────────────────────────── */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts]           = useState([]);

  /* ── Theme effect ───────────────────────────────── */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('gitverse-theme', theme); } catch {}
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  /* ── Derived ────────────────────────────────────── */
  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPct    = Math.round((completedCount / CHAPTERS.length) * 100);
  const currentLevel   = getLevel(xp);
  const nextLevel      = getNextLevel(xp);
  const xpToNext       = nextLevel ? nextLevel.min - xp : 0;

  /* ── Toast helper ───────────────────────────────── */
  const addToast = useCallback((msg, icon = '⚡', color = '#00ff88') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, icon, color }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  /* ── Earn XP ────────────────────────────────────── */
  const earnXP = useCallback((amount, reason = '') => {
    setXp(prev => {
      const next = prev + amount;
      const wasLevel = getLevel(prev);
      const nowLevel = getLevel(next);
      if (nowLevel.level > wasLevel.level) {
        setTimeout(() => addToast(`Level Up! You are now ${nowLevel.title}`, '🎉', nowLevel.color), 400);
      }
      try { localStorage.setItem('gitverse-xp', JSON.stringify(next)); } catch {}
      return next;
    });
    setXpLog(l => [{ amount, reason, id: Date.now() }, ...l].slice(0, 10));
    if (amount > 0 && reason) addToast(`+${amount} XP — ${reason}`, '⚡', '#00ff88');
  }, [addToast]);

  /* ── Unlock achievement ─────────────────────────── */
  const unlockAchievement = useCallback((id) => {
    setAchievements(prev => {
      if (prev.includes(id)) return prev;
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        setTimeout(() => addToast(`Achievement: ${ach.title}!`, ach.icon, '#ffb347'), 600);
        earnXP(ach.xp, `Achievement: ${ach.title}`);
      }
      const next = [...prev, id];
      try { localStorage.setItem('gitverse-achievements', JSON.stringify(next)); } catch {}
      return next;
    });
  }, [addToast, earnXP]);

  /* ── Update streak ──────────────────────────────── */
  const touchStreak = useCallback(() => {
    const today = todayStr();
    setStreak(prev => {
      if (prev.lastDay === today) return prev;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = prev.lastDay === yesterday.toISOString().slice(0,10);
      const newCount = wasYesterday ? prev.count + 1 : 1;
      const next = { count: newCount, lastDay: today };
      try { localStorage.setItem('gitverse-streak', JSON.stringify(next)); } catch {}
      if (newCount >= 3)  unlockAchievement('streak_3');
      if (newCount >= 7)  unlockAchievement('streak_7');
      if (newCount > prev.count) earnXP(XP_REWARDS.streakBonus, `${newCount}-day streak!`);
      return next;
    });
    // Night owl
    if (new Date().getHours() >= 0 && new Date().getHours() < 4) unlockAchievement('night_owl');
  }, [unlockAchievement, earnXP]);

  /* ── Record quiz answer (spaced repetition) ─────── */
  const recordAnswer = useCallback((conceptId, correct) => {
    setSrData(prev => {
      const existing = prev[conceptId] || { correct:0, wrong:0, streak:0 };
      const newStreak = correct ? existing.streak + 1 : 0;
      const updated = {
        ...existing,
        correct: existing.correct + (correct ? 1 : 0),
        wrong:   existing.wrong  + (correct ? 0 : 1),
        streak:  newStreak,
        lastSeen: new Date().toISOString(),
        nextReview: nextReviewDate(correct, newStreak),
      };
      const next = { ...prev, [conceptId]: updated };
      try { localStorage.setItem('gitverse-sr', JSON.stringify(next)); } catch {}
      return next;
    });
    earnXP(correct ? XP_REWARDS.quizCorrect : XP_REWARDS.quizAnswer,
           correct ? 'Correct answer' : 'Quiz attempt');
  }, [earnXP]);

  /* ── Get due review questions ───────────────────── */
  const getDueReviews = useCallback(() => {
    const now = new Date().toISOString();
    return Object.entries(srData)
      .filter(([, v]) => v.nextReview <= now)
      .sort((a, b) => a[1].nextReview.localeCompare(b[1].nextReview))
      .slice(0, 10);
  }, [srData]);

  /* ── Navigation ─────────────────────────────────── */
  const openChapter = useCallback((chapter, direction = 'enter') => {
    setNavDirection(direction);
    setChapterKey(k => k + 1);
    setActiveChapter(chapter);
    setView('chapter');
    setSidebarOpen(false);
    setSearchOpen(false);
    touchStreak();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [touchStreak]);

  const completeChapter = useCallback((id) => {
    setProgress(prev => {
      if (prev[id]) return prev;
      const next = { ...prev, [id]: true };
      try { localStorage.setItem('gitverse-progress-v2', JSON.stringify(next)); } catch {}
      earnXP(XP_REWARDS.chapterDone, 'Chapter completed!');
      unlockAchievement('first_commit');
      const done = Object.keys(next).length;
      if (done >= CHAPTERS.length) unlockAchievement('all_chapters');
      // Check part completion
      const PARTS_MAP = { 1:[1,2,3], 2:[4,5,6,7], 3:[8,9,10], 4:[11,12,13] };
      Object.entries(PARTS_MAP).forEach(([part, chs]) => {
        if (chs.every(c => next[c])) {
          earnXP(XP_REWARDS.partDone, `Part ${part} complete!`);
          if (part === '4') unlockAchievement('part_4_done');
          if (part === '1') unlockAchievement('part_1_done');
        }
      });
      return next;
    });
  }, [earnXP, unlockAchievement]);

  const resetProgress = useCallback(() => {
    setProgress({});
    try { localStorage.removeItem('gitverse-progress-v2'); } catch {}
  }, []);

  const goNext = useCallback(() => {
    if (!activeChapter) return;
    const next = CHAPTERS.find(c => c.id === activeChapter.id + 1);
    if (next) openChapter(next, 'next');
  }, [activeChapter, openChapter]);

  const goPrev = useCallback(() => {
    if (!activeChapter) return;
    const prev = CHAPTERS.find(c => c.id === activeChapter.id - 1);
    if (prev) openChapter(prev, 'prev');
  }, [activeChapter, openChapter]);

  const goHome = useCallback(() => {
    setView('home');
    setSidebarOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <AppContext.Provider value={{
      view, setView, activeChapter, openChapter, goNext, goPrev, goHome,
      progress, completedCount, progressPct, completeChapter, resetProgress,
      sidebarOpen, setSidebarOpen, searchOpen, setSearchOpen,
      searchQuery, setSearchQuery,
      theme, toggleTheme,
      chapterKey, navDirection,
      xp, currentLevel, nextLevel, xpToNext, xpLog,
      earnXP, achievements, unlockAchievement,
      streak, srData, recordAnswer, getDueReviews,
      toasts, addToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
