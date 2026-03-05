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
import './styles/global.css';

/* ── Inner app ─────────────────────────────────────────── */
function AppInner() {
  const {
    view, setView,
    goNext, goPrev, goHome,
    setSidebarOpen, setSearchOpen,
    toggleTheme,
    chapterKey, navDirection,
  } = useApp();

  const readingProgress = useReadingProgress();

  // Global keyboard shortcuts
  useKeyboard({
    '/':      () => setSearchOpen(true),
    'Escape': () => { setSidebarOpen(false); setSearchOpen(false); },
    'j':      () => { if (view === 'chapter') goNext(); },
    'k':      () => { if (view === 'chapter') goPrev(); },
    'h':      () => goHome(),
    'c':      () => setView('all-chapters'),
    's':      () => setView('cheatsheet'),
    't':      () => toggleTheme(),
    'p':      () => { if (view === 'chapter') window.print(); },
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', position:'relative' }}>
      <div className="bg-grid" aria-hidden="true" />

      <Navbar readingProgress={readingProgress} />
      <Sidebar />
      <SearchModal />

      <main style={{ position:'relative', zIndex:1 }}>
        {view === 'home'         && <HomePage />}
        {view === 'all-chapters' && <AllChaptersPage />}
        {view === 'cheatsheet'   && <CheatsheetPage />}
        {view === 'chapter'      && (
          <ChapterView key={chapterKey} navDirection={navDirection} />
        )}
      </main>

      <KeyboardLegend />
    </div>
  );
}

/* ── Keyboard shortcuts legend ─────────────────────────── */
function KeyboardLegend() {
  const [visible, setVisible] = React.useState(false);

  const shortcuts = [
    { key: '/',     label: 'Search'            },
    { key: 'J / K', label: 'Next / Prev chapter' },
    { key: 'H',     label: 'Go home'           },
    { key: 'C',     label: 'All chapters'      },
    { key: 'S',     label: 'Cheatsheet'        },
    { key: 'T',     label: 'Toggle theme'      },
    { key: 'P',     label: 'Print chapter'     },
    { key: 'Esc',   label: 'Close modal'       },
  ];

  return (
    <div className="no-print" style={{ position:'fixed', bottom:20, right:20, zIndex:50, userSelect:'none' }}>
      <button
        onClick={() => setVisible(v => !v)}
        style={{ background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:8, padding:'6px 12px', fontFamily:'var(--font-mono)', fontSize:11, cursor:'pointer', boxShadow:'var(--shadow-sm)' }}>
        ⌨ shortcuts
      </button>

      {visible && (
        <div style={{ position:'absolute', bottom:'110%', right:0, background:'var(--bg-elevated)', border:'1px solid var(--border-bright)', borderRadius:10, padding:'14px 16px', boxShadow:'var(--shadow-md)', minWidth:210, animation:'fadeInUp 0.2s ease' }}>
          <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Keyboard Shortcuts</div>
          {shortcuts.map(s => (
            <div key={s.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, marginBottom:7 }}>
              <kbd style={{ background:'var(--bg-card)', border:'1px solid var(--border-bright)', borderRadius:4, padding:'2px 7px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--green)', whiteSpace:'nowrap' }}>
                {s.key}
              </kbd>
              <span style={{ color:'var(--text-muted)', fontSize:12 }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────── */
export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
