import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar        from './components/layout/Navbar';
import Sidebar       from './components/layout/Sidebar';
import SearchModal   from './components/layout/SearchModal';
import HomePage      from './pages/HomePage';
import AllChaptersPage from './pages/AllChaptersPage';
import CheatsheetPage  from './pages/CheatsheetPage';
import DashboardPage   from './pages/DashboardPage';
import SkillTreePage   from './pages/SkillTreePage';
import CertificationPage from './pages/CertificationPage';
import IDEPage         from './pages/IDEPage';
import ChapterView   from './components/chapter/ChapterView';
import { useReadingProgress, useKeyboard } from './hooks';
import './styles/global.css';

function AppInner() {
  const {
    view, setView,
    goNext, goPrev, goHome,
    setSidebarOpen, setSearchOpen,
    toggleTheme,
    chapterKey, navDirection,
    toasts, completedCount,
  } = useApp();

  const readingProgress = useReadingProgress();

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
    'd':      () => setView('dashboard'),
    'm':      () => setView('skill-tree'),
    'i':      () => setView('ide'),   // ← NEW: press I to open IDE
  });

  useEffect(() => {
    // Don't scroll on IDE view — it manages its own full-screen layout
    if (view !== 'ide') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view]);

  // IDE gets full screen — no Navbar/Sidebar/grid
  if (view === 'ide') {
    return <IDEPage />;
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', position:'relative' }}>
      <div className="bg-grid" aria-hidden="true" />
      <Navbar readingProgress={readingProgress} />
      <Sidebar />
      <SearchModal />

      <main style={{ position:'relative', zIndex:1 }}>
        {view === 'home'          && <HomePage />}
        {view === 'all-chapters'  && <AllChaptersPage />}
        {view === 'cheatsheet'    && <CheatsheetPage />}
        {view === 'dashboard'     && <DashboardPage />}
        {view === 'skill-tree'    && <SkillTreePage />}
        {view === 'certification' && <CertificationPage />}
        {view === 'chapter'       && <ChapterView key={chapterKey} navDirection={navDirection} />}
      </main>

      <KeyboardLegend />

      {/* Global toast notifications */}
      <div style={{ position:'fixed', bottom:72, left:'50%', transform:'translateX(-50%)', zIndex:9999, display:'flex', flexDirection:'column-reverse', gap:8, alignItems:'center', pointerEvents:'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background:'var(--bg-elevated)', border:`1px solid ${t.color}55`, borderRadius:40, padding:'9px 22px', display:'flex', gap:10, alignItems:'center', boxShadow:`0 4px 24px ${t.color}30`, animation:'toastPop 0.35s cubic-bezier(0.22,1,0.36,1) both', whiteSpace:'nowrap' }}>
            <span style={{ fontSize:16 }}>{t.icon}</span>
            <span style={{ color:t.color, fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700 }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KeyboardLegend() {
  const [visible, setVisible] = React.useState(false);
  const shortcuts = [
    { key:'/',      label:'Search' },
    { key:'J / K',  label:'Prev / Next chapter' },
    { key:'H',      label:'Home' },
    { key:'D',      label:'Dashboard' },
    { key:'M',      label:'Skill Map' },
    { key:'C',      label:'All chapters' },
    { key:'S',      label:'Cheatsheet' },
    { key:'I',      label:'IDE Simulator' },
    { key:'T',      label:'Toggle theme' },
    { key:'P',      label:'Print chapter' },
    { key:'Esc',    label:'Close modal' },
  ];
  return (
    <div className="no-print" style={{ position:'fixed', bottom:20, right:20, zIndex:50, userSelect:'none' }}>
      <button onClick={() => setVisible(v => !v)} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:8, padding:'6px 12px', fontFamily:'var(--font-mono)', fontSize:11, cursor:'pointer', boxShadow:'var(--shadow-sm)' }}>
        ⌨ shortcuts
      </button>
      {visible && (
        <div style={{ position:'absolute', bottom:'110%', right:0, background:'var(--bg-elevated)', border:'1px solid var(--border-bright)', borderRadius:10, padding:'14px 16px', boxShadow:'var(--shadow-md)', minWidth:220, animation:'fadeInUp 0.2s ease' }}>
          <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Keyboard Shortcuts</div>
          {shortcuts.map(s => (
            <div key={s.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, marginBottom:7 }}>
              <kbd style={{ background:'var(--bg-card)', border:'1px solid var(--border-bright)', borderRadius:4, padding:'2px 7px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--green)', whiteSpace:'nowrap' }}>{s.key}</kbd>
              <span style={{ color:'var(--text-muted)', fontSize:12 }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return <AppProvider><AppInner /></AppProvider>;
}