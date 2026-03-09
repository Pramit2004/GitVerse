import React, { useState } from 'react';
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

  // Mobile menu drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Desktop nav button ──────────────────────────────────────
  const navBtn = (label, viewName, icon) => (
    <button
      onClick={() => setView(viewName)}
      style={{
        background: view === viewName ? 'var(--bg-card)' : 'transparent',
        border: `1px solid ${view === viewName ? 'var(--border-bright)' : 'var(--border)'}`,
        color: view === viewName ? 'var(--text-primary)' : 'var(--text-secondary)',
        borderRadius: 'var(--radius-md)', padding: '6px 12px',
        cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11,
        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
        transition: 'all 0.15s',
      }}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );

  // ── Mobile nav item ─────────────────────────────────────────
  const mobileNavItem = (icon, label, viewName, accent) => {
    const isActive = view === viewName;
    const color = accent || 'var(--text-primary)';
    return (
      <button
        onClick={() => { setView(viewName); setMobileMenuOpen(false); }}
        style={{
          width: '100%', background: isActive ? `${color}12` : 'transparent',
          border: `1px solid ${isActive ? `${color}35` : 'var(--border)'}`,
          borderRadius: 12, padding: '13px 16px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
          transition: 'all 0.15s', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 22, width: 28, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? color : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{label}</div>
        </div>
        {isActive && (
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
        )}
      </button>
    );
  };

  return (
    <>
      {/* ── Reading progress bar ── */}
      {isChapterView && readingProgress > 0 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 201, background: 'var(--border)' }}>
          <div style={{ height: '100%', width: `${readingProgress}%`, background: `linear-gradient(90deg,${activeChapter.color},var(--blue))`, transition: 'width 0.1s linear', boxShadow: `0 0 8px ${activeChapter.color}60` }} />
        </div>
      )}

      {/* ── Main navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: theme === 'dark' ? 'rgba(10,14,26,0.96)' : 'rgba(237,240,249,0.97)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '0 clamp(12px,3vw,24px)' }}>
        <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'var(--nav-height)', gap: 8 }}>

          {/* Logo */}
          <button onClick={goHome} aria-label="GitVerse home" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: 'var(--green)', letterSpacing: -0.5 }}>GitVerse</span>
          </button>

          {/* Breadcrumb — chapter view desktop */}
          {isChapterView && !isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>›</span>
              <span style={{ color: activeChapter.color, fontFamily: 'var(--font-mono)', fontSize: 11, background: activeChapter.color + '20', padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>Ch.{activeChapter.id}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeChapter.title}</span>
            </div>
          )}

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

            {/* Search */}
            <button onClick={() => setSearchOpen(true)} aria-label="Search" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-md)', padding: isMobile ? '6px 10px' : '6px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>🔍</span>
              {!isMobile && (
                <>
                  <span style={{ color: 'var(--text-secondary)' }}>Search</span>
                  <span style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 4, padding: '0 5px', fontSize: 10, color: 'var(--text-muted)' }}>/</span>
                </>
              )}
            </button>

            {/* ══ DESKTOP NAV LINKS ══ */}
            {!isMobile && (
              <>
                {/* IDE button — cyan glow */}
                <button
                  onClick={() => setView('ide')}
                  style={{
                    background: view === 'ide' ? 'rgba(0,212,255,0.14)' : 'linear-gradient(135deg,rgba(0,212,255,0.08),rgba(77,159,255,0.05))',
                    border: `1px solid ${view === 'ide' ? 'rgba(0,212,255,0.45)' : 'rgba(0,212,255,0.22)'}`,
                    color: view === 'ide' ? '#00d4ff' : '#00d4ffbb',
                    borderRadius: 'var(--radius-md)', padding: '6px 12px',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11,
                    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
                    transition: 'all 0.15s',
                    boxShadow: view === 'ide' ? '0 0 14px rgba(0,212,255,0.2)' : 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(0,212,255,0.25)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = view === 'ide' ? '0 0 14px rgba(0,212,255,0.2)' : 'none'; e.currentTarget.style.borderColor = view === 'ide' ? 'rgba(0,212,255,0.45)' : 'rgba(0,212,255,0.22)'; }}
                >
                  <span>💻</span>
                  <span>IDE</span>
                  <span style={{ fontSize: 9, background: 'rgba(0,212,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.28)', borderRadius: 3, padding: '0 4px' }}>I</span>
                </button>

                {navBtn('Chapters',  'all-chapters', '📚')}
                {navBtn('Map',       'skill-tree',   '🗺️')}
                {navBtn('Dashboard', 'dashboard',    '📊')}
                {navBtn('Cheatsheet','cheatsheet',   '📋')}

                {/* Git Guide button — green glow */}
                <button
                  onClick={() => setView('git-guide')}
                  style={{
                    background: view === 'git-guide' ? 'rgba(0,229,160,0.12)' : 'linear-gradient(135deg,rgba(0,229,160,0.07),rgba(0,212,255,0.04))',
                    border: `1px solid ${view === 'git-guide' ? 'rgba(0,229,160,0.4)' : 'rgba(0,229,160,0.2)'}`,
                    color: view === 'git-guide' ? '#00e5a0' : '#00e5a0bb',
                    borderRadius: 'var(--radius-md)', padding: '6px 12px',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11,
                    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
                    transition: 'all 0.15s',
                    boxShadow: view === 'git-guide' ? '0 0 12px rgba(0,229,160,0.18)' : 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 14px rgba(0,229,160,0.22)'; e.currentTarget.style.borderColor = 'rgba(0,229,160,0.42)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = view === 'git-guide' ? '0 0 12px rgba(0,229,160,0.18)' : 'none'; e.currentTarget.style.borderColor = view === 'git-guide' ? 'rgba(0,229,160,0.4)' : 'rgba(0,229,160,0.2)'; }}
                >
                  <span>📖</span>
                  <span>Git Guide</span>
                  <span style={{ fontSize: 9, background: 'rgba(0,229,160,0.14)', color: '#00e5a0', border: '1px solid rgba(0,229,160,0.28)', borderRadius: 3, padding: '0 4px' }}>G</span>
                </button>

                {navBtn('Exam 🎓', 'certification', '🏆')}
              </>
            )}

            {/* XP Badge — desktop only */}
            {!isMobile && xp > 0 && (
              <div style={{ background: `${currentLevel.color}15`, border: `1px solid ${currentLevel.color}40`, borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }} title={`${currentLevel.title} · ${xp} XP`}>
                <span style={{ color: currentLevel.color, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>Lv.{currentLevel.level}</span>
                <span style={{ color: currentLevel.color, fontFamily: 'var(--font-mono)', fontSize: 10 }}>{xp.toLocaleString()} XP</span>
                {streak.count > 1 && <span style={{ fontSize: 11 }}>🔥{streak.count}</span>}
              </div>
            )}

            {/* Theme toggle */}
            <button onClick={toggleTheme} title={theme === 'dark' ? 'Light mode (T)' : 'Dark mode (T)'} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '6px 9px', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Print — chapter desktop */}
            {isChapterView && !isMobile && (
              <button onClick={() => window.print()} title="Print chapter" className="no-print" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-md)', padding: '6px 9px', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>🖨️</button>
            )}

            {/* Progress ring */}
            <div onClick={() => setView('dashboard')} title={`${completedCount}/22 chapters`} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ProgressRing progress={progressPct} size={32} />
            </div>

            {/* Chapter sidebar toggle — chapter view only */}
            {isChapterView && (
              <button onClick={() => setSidebarOpen(v => !v)} aria-label="Chapter list" style={{ background: sidebarOpen ? 'var(--green-glow)' : 'var(--bg-elevated)', border: `1px solid ${sidebarOpen ? 'rgba(0,255,136,0.3)' : 'var(--border)'}`, color: sidebarOpen ? 'var(--green)' : 'var(--text-secondary)', borderRadius: 'var(--radius-md)', padding: '6px 11px', cursor: 'pointer', fontSize: 13 }}>
                ☰
              </button>
            )}

            {/* ══ MOBILE HAMBURGER — opens full menu drawer ══ */}
            {isMobile && !isChapterView && (
              <button
                onClick={() => setMobileMenuOpen(v => !v)}
                aria-label="Open menu"
                style={{
                  background: mobileMenuOpen ? 'rgba(0,229,160,0.1)' : 'var(--bg-elevated)',
                  border: `1px solid ${mobileMenuOpen ? 'rgba(0,229,160,0.3)' : 'var(--border)'}`,
                  color: mobileMenuOpen ? 'var(--green)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)', padding: '6px 11px',
                  cursor: 'pointer', fontSize: 18, lineHeight: 1,
                  transition: 'all 0.15s',
                }}
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ══ MOBILE FULL-SCREEN MENU DRAWER ══ */}
      {isMobile && mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 190, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          />

          {/* Drawer */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: 'min(320px, 88vw)',
            background: theme === 'dark' ? '#0a0f1a' : 'var(--bg-surface)',
            borderLeft: '1px solid var(--border)',
            zIndex: 191, overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
            animation: 'fadeInRight 0.22s ease',
          }}>
            {/* Drawer header */}
            <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: 'var(--green)' }}>⚡ GitVerse</div>
                {xp > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                    Lv.{currentLevel.level} · {xp.toLocaleString()} XP {streak.count > 1 ? `· 🔥${streak.count}` : ''}
                  </div>
                )}
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Nav items */}
            <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>

              {/* Featured: IDE + Git Guide */}
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 1.5, padding: '0 4px 4px', marginBottom: 2 }}>Tools</div>
              {mobileNavItem('💻', 'GitVerse IDE', 'ide', '#00d4ff')}
              {mobileNavItem('📖', 'Git Complete Guide', 'git-guide', '#00e5a0')}

              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 1.5, padding: '0 4px 4px', marginBottom: 2 }}>Learn</div>
              {mobileNavItem('🏠', 'Home', 'home')}
              {mobileNavItem('📚', 'All Chapters', 'all-chapters')}
              {mobileNavItem('🗺️', 'Skill Map', 'skill-tree')}
              {mobileNavItem('📊', 'Dashboard', 'dashboard')}
              {mobileNavItem('📋', 'Cheatsheet', 'cheatsheet')}
              {mobileNavItem('🏆', 'Certification Exam', 'certification')}
            </div>

            {/* Bottom: progress */}
            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <ProgressRing progress={progressPct} size={38} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{completedCount} / 22 chapters</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{Math.round(progressPct)}% complete</div>
              </div>
              <button onClick={toggleTheme} style={{ marginLeft: 'auto', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 9px', cursor: 'pointer', fontSize: 16 }}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ══ MOBILE BOTTOM NAV BAR ══ (quick access, always visible) */}
      {isMobile && !isChapterView && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 58, zIndex: 99,
          background: theme === 'dark' ? 'rgba(8,12,20,0.97)' : 'rgba(237,240,249,0.97)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'stretch',
        }}>
          {[
            { icon: '🏠', label: 'Home',     viewName: 'home' },
            { icon: '💻', label: 'IDE',      viewName: 'ide',       accent: '#00d4ff' },
            { icon: '📖', label: 'Guide',    viewName: 'git-guide', accent: '#00e5a0' },
            { icon: '📚', label: 'Chapters', viewName: 'all-chapters' },
            { icon: '📊', label: 'Progress', viewName: 'dashboard' },
          ].map(item => {
            const isActive = view === item.viewName;
            const color = item.accent || 'var(--green)';
            return (
              <button
                key={item.viewName}
                onClick={() => { setView(item.viewName); setMobileMenuOpen(false); }}
                style={{
                  flex: 1, background: 'none', border: 'none',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 3,
                  borderTop: `2px solid ${isActive ? color : 'transparent'}`,
                  transition: 'all 0.15s',
                  padding: '6px 2px 8px',
                }}
              >
                <span style={{ fontSize: 20, filter: isActive ? `drop-shadow(0 0 5px ${color})` : 'none', transition: 'filter 0.15s' }}>{item.icon}</span>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: isActive ? color : 'var(--text-muted)', fontWeight: isActive ? 700 : 400, letterSpacing: 0.3 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}