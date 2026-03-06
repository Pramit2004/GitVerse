import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressRing } from '../ui';
import { useIsMobile } from '../../hooks';

export default function Navbar({ readingProgress = 0 }) {
  const {
    activeChapter, view,
    goHome, setView,
    sidebarOpen, setSidebarOpen,
    setSearchOpen,
    completedCount, progressPct,
    theme, toggleTheme,
    xp, currentLevel, streak,
  } = useApp();

  const isMobile      = useIsMobile();
  const isChapterView = view === 'chapter' && activeChapter;

  const navBtn = (label, viewName, icon) => (
    <button
      onClick={() => setView(viewName)}
      style={{
        background: view===viewName ? 'var(--bg-card)' : 'transparent',
        border: `1px solid ${view===viewName ? 'var(--border-bright)' : 'var(--border)'}`,
        color: view===viewName ? 'var(--text-primary)' : 'var(--text-secondary)',
        borderRadius:'var(--radius-md)', padding:'6px 12px',
        cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:11,
        whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5,
        transition:'all 0.15s',
      }}>
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {isChapterView && readingProgress > 0 && (
        <div style={{ position:'fixed', top:0, left:0, right:0, height:3, zIndex:201, background:'var(--border)' }}>
          <div style={{ height:'100%', width:`${readingProgress}%`, background:`linear-gradient(90deg,${activeChapter.color},var(--blue))`, transition:'width 0.1s linear', boxShadow:`0 0 8px ${activeChapter.color}60` }} />
        </div>
      )}

      <nav style={{ position:'sticky', top:0, zIndex:100, background: theme==='dark' ? 'rgba(10,14,26,0.96)' : 'rgba(237,240,249,0.97)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderBottom:'1px solid var(--border)', padding:'0 clamp(12px,3vw,24px)' }}>
        <div style={{ maxWidth:'var(--page-max)', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:'var(--nav-height)', gap:8 }}>

          {/* Logo */}
          <button onClick={goHome} aria-label="GitVerse home" style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <span style={{ fontSize:20 }}>⚡</span>
            <span style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:900, color:'var(--green)', letterSpacing:-0.5 }}>GitVerse</span>
          </button>

          {/* Breadcrumb in chapter view */}
          {isChapterView && !isMobile && (
            <div style={{ display:'flex', alignItems:'center', gap:8, overflow:'hidden', flex:1, minWidth:0 }}>
              <span style={{ color:'var(--text-muted)', fontSize:13 }}>›</span>
              <span style={{ color:activeChapter.color, fontFamily:'var(--font-mono)', fontSize:11, background:activeChapter.color+'20', padding:'2px 8px', borderRadius:20, flexShrink:0 }}>Ch.{activeChapter.id}</span>
              <span style={{ color:'var(--text-secondary)', fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{activeChapter.title}</span>
            </div>
          )}

          {/* Right controls */}
          <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>

            {/* Search */}
            <button onClick={() => setSearchOpen(true)} aria-label="Search" style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:'var(--radius-md)', padding: isMobile ? '6px 10px' : '6px 12px', fontFamily:'var(--font-mono)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
              <span>🔍</span>
              {!isMobile && <><span style={{ color:'var(--text-secondary)' }}>Search</span><span style={{ background:'var(--bg-card)', border:'1px solid var(--border-bright)', borderRadius:4, padding:'0 5px', fontSize:10, color:'var(--text-muted)' }}>/</span></>}
            </button>

            {/* Nav links — desktop */}
            {!isMobile && (
              <>
                {navBtn('Chapters',   'all-chapters', '📚')}
                {navBtn('Map',        'skill-tree',   '🗺️')}
                {navBtn('Dashboard',  'dashboard',    '📊')}
                {navBtn('Cheatsheet', 'cheatsheet',   '📋')}
                {navBtn('Exam 🎓', 'certification', '🏆')}
              </>
            )}

            {/* XP Badge — desktop */}
            {!isMobile && xp > 0 && (
              <div style={{ background:`${currentLevel.color}15`, border:`1px solid ${currentLevel.color}40`, borderRadius:20, padding:'4px 10px', display:'flex', alignItems:'center', gap:6, flexShrink:0 }} title={`${currentLevel.title} · ${xp} XP`}>
                <span style={{ color:currentLevel.color, fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700 }}>Lv.{currentLevel.level}</span>
                <span style={{ color:currentLevel.color, fontFamily:'var(--font-mono)', fontSize:10 }}>{xp.toLocaleString()} XP</span>
                {streak.count > 1 && <span style={{ fontSize:11 }}>🔥{streak.count}</span>}
              </div>
            )}

            {/* Theme toggle */}
            <button onClick={toggleTheme} title={theme==='dark'?'Light mode (T)':'Dark mode (T)'} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'6px 9px', cursor:'pointer', fontSize:14, lineHeight:1 }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Print — chapter view desktop */}
            {isChapterView && !isMobile && (
              <button onClick={() => window.print()} title="Print chapter" className="no-print" style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:'var(--radius-md)', padding:'6px 9px', cursor:'pointer', fontSize:13, lineHeight:1 }}>🖨️</button>
            )}

            {/* Progress ring */}
            <div onClick={() => setView('dashboard')} title={`${completedCount}/22 chapters · Click for dashboard`} style={{ cursor:'pointer', display:'flex', alignItems:'center' }}>
              <ProgressRing progress={progressPct} size={32} />
            </div>

            {/* Chapter sidebar toggle */}
            {isChapterView && (
              <button onClick={() => setSidebarOpen(v => !v)} aria-label="Chapter list" style={{ background: sidebarOpen?'var(--green-glow)':'var(--bg-elevated)', border:`1px solid ${sidebarOpen?'rgba(0,255,136,0.3)':'var(--border)'}`, color: sidebarOpen?'var(--green)':'var(--text-secondary)', borderRadius:'var(--radius-md)', padding:'6px 11px', cursor:'pointer', fontSize:13 }}>
                ☰
              </button>
            )}

            {/* Mobile hamburger */}
            {!isChapterView && isMobile && (
              <button onClick={() => setView('all-chapters')} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)', borderRadius:'var(--radius-md)', padding:'6px 11px', cursor:'pointer', fontSize:14 }}>☰</button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
