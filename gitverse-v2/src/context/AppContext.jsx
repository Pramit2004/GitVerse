import React, { createContext, useContext, useState, useCallback } from 'react';
import { CHAPTERS } from '../data/chapters';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Navigation ─────────────────────────────────────────
  const [view, setView] = useState('home'); // 'home' | 'chapter' | 'all-chapters' | 'search' | 'cheatsheet'
  const [activeChapter, setActiveChapter] = useState(null);

  // ── Progress ────────────────────────────────────────────
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('gitverse-progress-v2');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // ── UI State ─────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Derived ──────────────────────────────────────────────
  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPct = Math.round((completedCount / CHAPTERS.length) * 100);

  // ── Actions ──────────────────────────────────────────────
  const openChapter = useCallback((chapter) => {
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
    if (next) openChapter(next);
  }, [activeChapter, openChapter]);

  const goPrev = useCallback(() => {
    if (!activeChapter) return;
    const prev = CHAPTERS.find(c => c.id === activeChapter.id - 1);
    if (prev) openChapter(prev);
  }, [activeChapter, openChapter]);

  const goHome = useCallback(() => {
    setView('home');
    setSidebarOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <AppContext.Provider value={{
      // Navigation
      view, setView,
      activeChapter,
      openChapter, goNext, goPrev, goHome,

      // Progress
      progress, completedCount, progressPct,
      completeChapter, resetProgress,

      // UI
      sidebarOpen, setSidebarOpen,
      searchOpen, setSearchOpen,
      searchQuery, setSearchQuery,
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
