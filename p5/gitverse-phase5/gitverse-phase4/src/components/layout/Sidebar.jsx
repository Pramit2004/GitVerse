import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CHAPTERS, PARTS } from '../../data/chapters';

export default function Sidebar() {
  const { activeChapter, openChapter, progress, sidebarOpen, setSidebarOpen } = useApp();

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSidebarOpen]);

  if (!sidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setSidebarOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 150,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Drawer */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: 'min(var(--sidebar-width), 85vw)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        zIndex: 151, overflowY: 'auto',
        padding: '20px 0',
        animation: 'fadeInRight 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px 16px',
          borderBottom: '1px solid var(--border)',
          marginBottom: 16,
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 18,
            fontWeight: 700, color: 'var(--text-primary)',
          }}>All Chapters</span>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', borderRadius: 6,
              width: 28, height: 28, cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
        </div>

        {/* Parts & Chapters */}
        {PARTS.map(part => {
          const partChapters = CHAPTERS.filter(c => part.chapters.includes(c.id));
          const donePart = partChapters.filter(c => progress[c.id]).length;
          return (
            <div key={part.id} style={{ marginBottom: 24, padding: '0 8px' }}>
              {/* Part label */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '4px 8px 8px',
              }}>
                <span style={{
                  color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                  fontSize: 10, textTransform: 'uppercase', letterSpacing: 2,
                }}>
                  Part {part.id} · {part.title}
                </span>
                <span style={{
                  color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10,
                }}>
                  {donePart}/{partChapters.length}
                </span>
              </div>

              {/* Chapter buttons */}
              {partChapters.map(ch => {
                const isActive = activeChapter?.id === ch.id;
                const isDone = progress[ch.id];
                return (
                  <button
                    key={ch.id}
                    onClick={() => openChapter(ch)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', textAlign: 'left',
                      background: isActive ? ch.color + '18' : 'transparent',
                      border: `1px solid ${isActive ? ch.color + '40' : 'transparent'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '9px 10px', marginBottom: 3,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{ch.emoji}</span>
                    <span style={{
                      flex: 1, fontSize: 13, lineHeight: 1.4,
                      color: isActive ? ch.color : 'var(--text-secondary)',
                      fontWeight: isActive ? 600 : 400,
                    }}>
                      {ch.title}
                    </span>
                    {isDone && (
                      <span style={{ color: 'var(--green)', fontSize: 12, flexShrink: 0 }}>✓</span>
                    )}
                    {!isDone && isActive && (
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: ch.color, flexShrink: 0,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </aside>
    </>
  );
}
