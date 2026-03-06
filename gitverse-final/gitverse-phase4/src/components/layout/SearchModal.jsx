import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useSearch } from '../../hooks';

export default function SearchModal() {
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery, openChapter } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const results = useSearch(query);

  // Open on / key press
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && !searchOpen && !['INPUT','TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen, setSearchOpen]);

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) { setTimeout(() => inputRef.current?.focus(), 50); }
    else { setQuery(''); }
  }, [searchOpen]);

  if (!searchOpen) return null;

  const handleSelect = (chapter) => {
    openChapter(chapter);
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => { setSearchOpen(false); setQuery(''); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '12vh', left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(600px, 92vw)',
        zIndex: 301,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-bright)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,255,136,0.08)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.2s ease',
      }}>
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search chapters, commands, concepts..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
              fontSize: 16, caretColor: 'var(--green)',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', borderRadius: 4,
              padding: '2px 8px', cursor: 'pointer', fontSize: 11,
            }}>clear</button>
          )}
          <kbd style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '2px 8px',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)',
          }}>Esc</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
          {!query && (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                Type to search across all 18 chapters
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>
                Try: "rebase", "merge conflict", "git stash", "three trees"
              </p>
            </div>
          )}

          {query && results.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                No results for "<strong style={{ color: 'var(--text-secondary)' }}>{query}</strong>"
              </p>
            </div>
          )}

          {results.map((result, i) => (
            <button
              key={result.chapter.id}
              onClick={() => handleSelect(result.chapter)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                width: '100%', textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                padding: '14px 20px',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 24, lineHeight: 1, marginTop: 2 }}>
                {result.chapter.emoji}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    background: result.chapter.color + '25',
                    color: result.chapter.color,
                    padding: '1px 8px', borderRadius: 20,
                    fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600,
                  }}>Ch. {result.chapter.id}</span>
                  <span style={{
                    color: 'var(--text-primary)', fontWeight: 600, fontSize: 14,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {highlight(result.chapter.title, query)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {result.titleMatch && <Tag color={result.chapter.color}>title match</Tag>}
                  {result.subtitleMatch && <Tag color="#ffb347">subtitle</Tag>}
                  {result.sectionMatches.slice(0, 2).map((s, j) => (
                    <Tag key={j} color="var(--blue)">{s || 'section'}</Tag>
                  ))}
                  {result.quizMatches > 0 && <Tag color="#cc5de8">{result.quizMatches} quiz match</Tag>}
                </div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 12, flexShrink: 0, marginTop: 4 }}>
                {result.chapter.duration}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 16, alignItems: 'center',
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            {results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''}` : ''}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 'auto' }}>
            Press <kbd style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', fontFamily: 'var(--font-mono)', fontSize: 10 }}>Enter</kbd> to select
          </span>
        </div>
      </div>
    </>
  );
}

function Tag({ children, color }) {
  return (
    <span style={{
      background: (color || 'var(--green)') + '18',
      color: color || 'var(--green)',
      border: `1px solid ${(color || 'var(--green)') + '30'}`,
      padding: '1px 7px', borderRadius: 20,
      fontSize: 10, fontFamily: 'var(--font-mono)',
    }}>{children}</span>
  );
}

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'rgba(0,255,136,0.25)', color: 'var(--green)', borderRadius: 2 }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
