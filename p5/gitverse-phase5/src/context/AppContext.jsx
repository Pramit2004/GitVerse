import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CHAPTERS } from '../data/chapters';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Navigation
  const [view, setView] = useState('home');
  const [activeChapter, setActiveChapter] = useState(null);

  // Progress
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('gitverse-progress-v2');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme ─────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('gitverse-theme') || 'dark'; } catch { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('gitverse-theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  // Animation key + direction ─────────────────────────────
  const [chapterKey,    setChapterKey]    = useState(0);
  const [navDirection,  setNavDirection]  = useState('enter');

  // Derived
  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPct    = Math.round((completedCount / CHAPTERS.length) * 100);

  // Actions
  const openChapter = useCallback((chapter, direction = 'enter') => {
    setNavDirection(direction);
    setChapterKey(k => k + 1);
    setActiveChapter(chapter);
    setView('chapter');
    setSidebarOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const completeChapter = useCallback((id) => {
    setProgress(prev => {
      const next = { ...prev, [id]: true };
      try { localStorage.setItem('gitverse-progress-v2', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

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
      view, setView,
      activeChapter,
      openChapter, goNext, goPrev, goHome,
      progress, completedCount, progressPct,
      completeChapter, resetProgress,
      sidebarOpen, setSidebarOpen,
      searchOpen,  setSearchOpen,
      searchQuery, setSearchQuery,
      theme, toggleTheme,
      chapterKey, navDirection,
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
