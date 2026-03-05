import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CHAPTERS, PARTS } from '../data/chapters';
import { ProgressRing } from '../components/ui';

export default function AllChaptersPage() {
  const { openChapter, progress, completedCount, progressPct } = useApp();
  const [filterPart, setFilterPart] = useState(0); // 0 = all
  const [showDone, setShowDone]     = useState(true);

  const visible = CHAPTERS.filter(ch => {
    if (filterPart && ch.part !== filterPart) return false;
    if (!showDone && progress[ch.id]) return false;
    return true;
  });

  return (
    <div style={{
      maxWidth: 'var(--page-max)', margin: '0 auto',
      padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,48px)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, marginBottom: 6 }}>
            All Chapters
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            {completedCount} of {CHAPTERS.length} chapters complete
          </p>
        </div>
        <ProgressRing progress={progressPct} size={60} />
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28, alignItems: 'center' }}>
        {/* Part filter */}
        <button
          onClick={() => setFilterPart(0)}
          style={filterBtn(filterPart === 0, 'var(--green)')}
        >All Parts</button>
        {PARTS.map(p => (
          <button
            key={p.id}
            onClick={() => setFilterPart(p.id)}
            style={filterBtn(filterPart === p.id, p.color)}
          >
            Part {p.id}: {p.title}
          </button>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

        {/* Show/hide done */}
        <button
          onClick={() => setShowDone(v => !v)}
          style={{
            background: !showDone ? 'rgba(255,107,107,0.1)' : 'var(--bg-card)',
            color: !showDone ? 'var(--red)' : 'var(--text-muted)',
            border: `1px solid ${!showDone ? 'rgba(255,107,107,0.3)' : 'var(--border)'}`,
            borderRadius: 20, padding: '6px 14px',
            fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
          {showDone ? 'Hide completed' : 'Show all'}
        </button>
      </div>

      {/* Chapter grid */}
      {filterPart === 0 ? (
        /* Grouped by part */
        PARTS.map(part => {
          const partChapters = visible.filter(c => c.part === part.id);
          if (!partChapters.length) return null;
          const allDone = CHAPTERS.filter(c => c.part === part.id).filter(c => progress[c.id]).length;
          const total   = CHAPTERS.filter(c => c.part === part.id).length;
          return (
            <div key={part.id} style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  Part {part.id}: {part.title}
                </h2>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {allDone}/{total}
                </span>
                <div style={{
                  flex: 1, height: 2, background: 'var(--border)',
                  borderRadius: 1, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.round((allDone / total) * 100)}%`,
                    background: part.color,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {partChapters.map(ch => <ChapterCard key={ch.id} chapter={ch} />)}
              </div>
            </div>
          );
        })
      ) : (
        /* Flat grid when filtered */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {visible.map(ch => <ChapterCard key={ch.id} chapter={ch} />)}
        </div>
      )}

      {visible.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <p style={{ fontSize: 16 }}>All visible chapters are complete!</p>
        </div>
      )}
    </div>
  );
}

function ChapterCard({ chapter }) {
  const { openChapter, progress } = useApp();
  const done = !!progress[chapter.id];

  return (
    <div
      onClick={() => openChapter(chapter)}
      style={{
        background: done ? 'var(--bg-card)' : 'var(--bg-elevated)',
        border: `1px solid ${done ? chapter.color + '35' : 'var(--border)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: 18, cursor: 'pointer',
        transition: 'all var(--transition-base)',
        opacity: done ? 0.8 : 1,
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = chapter.color + '60';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = done ? chapter.color + '35' : 'var(--border)';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.opacity = done ? '0.8' : '1';
      }}
    >
      {/* Glow */}
      {done && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 80, height: 80,
          background: `radial-gradient(circle, ${chapter.color}15, transparent 70%)`,
          transform: 'translate(20%, -20%)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 32 }}>{chapter.emoji}</span>
        {done && (
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--green-glow)', border: '1px solid rgba(0,255,136,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--green)', fontSize: 12,
          }}>✓</div>
        )}
      </div>

      <div style={{
        color: chapter.color, fontFamily: 'var(--font-mono)',
        fontSize: 10, fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1,
      }}>Ch. {chapter.id}</div>

      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
        color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 10,
      }}>
        {chapter.title}
      </h3>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          ⏱ {chapter.duration}
        </span>
        <span style={{
          background: chapter.color + '18', color: chapter.color,
          padding: '2px 8px', borderRadius: 20,
          fontSize: 10, fontFamily: 'var(--font-mono)',
        }}>{done ? 'Complete' : 'Start →'}</span>
      </div>
    </div>
  );
}

function filterBtn(active, color) {
  return {
    background: active ? color + '20' : 'var(--bg-card)',
    color: active ? color : 'var(--text-muted)',
    border: `1px solid ${active ? color + '50' : 'var(--border)'}`,
    borderRadius: 20, padding: '6px 14px',
    fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer',
    transition: 'all 0.15s',
  };
}