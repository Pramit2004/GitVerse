import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import SearchModal from './components/layout/SearchModal';
import HomePage from './pages/HomePage';
import AllChaptersPage from './pages/AllChaptersPage';
import CheatsheetPage from './pages/CheatsheetPage';
import ChapterView from './components/chapter/ChapterView';
import { useReadingProgress, useKeyboard } from './hooks';
import { CHAPTERS } from './data/chapters';
import './styles/global.css';

/* ── Inner app with context access ────────────────────── */
function AppInner() {
  const {
    view, setView,
    openChapter, goNext, goPrev, goHome,
    setSidebarOpen, setSearchOpen,
    activeChapter,
  } = useApp();

  const readingProgress = useReadingProgress();

  // ── Global keyboard shortcuts ───────────────────────────
  useKeyboard({
    '/':       () => setSearchOpen(true),
    'Escape':  () => { setSidebarOpen(false); setSearchOpen(false); },
    'j':       () => { if (view === 'chapter') goNext(); },
    'k':       () => { if (view === 'chapter') goPrev(); },
    'h':       () => goHome(),
    'c':       () => setView('all-chapters'),
    's':       () => setView('cheatsheet'),
  });

  // ── Scroll to top on view change ────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view, activeChapter]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>
      {/* Animated grid background */}
      <div className="bg-grid" aria-hidden="true" />

      {/* Navigation */}
      <Navbar readingProgress={readingProgress} />

      {/* Sidebar drawer */}
      <Sidebar />

      {/* Search modal */}
      <SearchModal />

      {/* Main content */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        {view === 'home'         && <HomePage />}
        {view === 'all-chapters' && <AllChaptersPage />}
        {view === 'cheatsheet'   && <CheatsheetPage />}
        {view === 'chapter'      && <ChapterView />}
      </main>

      {/* Keyboard shortcuts legend (bottom-right) */}
      <KeyboardLegend view={view} />
    </div>
  );
}

/* ── Keyboard shortcuts floating hint ─────────────────── */
function KeyboardLegend({ view }) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20,
      zIndex: 50, userSelect: 'none',
    }}>
      <button
        onClick={() => setVisible(v => !v)}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', borderRadius: 8,
          padding: '6px 12px', fontFamily: 'var(--font-mono)', fontSize: 11,
          cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
        }}>
        ⌨ shortcuts
      </button>

      {visible && (
        <div style={{
          position: 'absolute', bottom: '110%', right: 0,
          background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)',
          borderRadius: 10, padding: '14px 16px',
          boxShadow: 'var(--shadow-md)', minWidth: 200,
          animation: 'fadeInUp 0.2s ease',
        }}>
          {[
            { key: '/', label: 'Search' },
            { key: 'J / K', label: 'Next / Prev chapter' },
            { key: 'H', label: 'Go home' },
            { key: 'C', label: 'All chapters' },
            { key: 'S', label: 'Cheatsheet' },
            { key: 'Esc', label: 'Close modal' },
          ].map(s => (
            <div key={s.key} style={{
              display: 'flex', justifyContent: 'space-between', gap: 16,
              marginBottom: 8, alignItems: 'center',
            }}>
              <kbd style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
                borderRadius: 4, padding: '1px 7px',
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green)',
                whiteSpace: 'nowrap',
              }}>{s.key}</kbd>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Root export ───────────────────────────────────────── */
export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
