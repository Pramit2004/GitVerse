import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CHAPTERS } from '../../data/chapters';
import { getChapterContent } from '../../data/chapterContent';
import { ContentSection } from './ContentSection';
import PracticeTab from './PracticeTab';
import QuizTab from './QuizTab';

export default function ChapterView({ navDirection = 'enter' }) {
  const { activeChapter, completeChapter, progress, goNext, goPrev } = useApp();
  const [activeTab, setActiveTab] = useState('learn');

  if (!activeChapter) return null;

  // Pick animation class based on how user arrived
  const animClass =
    navDirection === 'next' ? 'chapter-anim-next' :
    navDirection === 'prev' ? 'chapter-anim-prev' :
                              'chapter-anim-enter';

  const content   = getChapterContent(activeChapter.id);
  const completed = !!progress[activeChapter.id];
  const prevCh    = CHAPTERS.find(c => c.id === activeChapter.id - 1);
  const nextCh    = CHAPTERS.find(c => c.id === activeChapter.id + 1);

  const tabs = [
    { id: 'learn',    label: '📖 Learn'    },
    { id: 'practice', label: '⚡ Practice' },
    { id: 'quiz',     label: '🧠 Quiz'     },
  ];

  return (
    <div
      className={animClass}
      style={{ maxWidth:'var(--content-max)', margin:'0 auto', padding:'32px 24px 80px' }}
    >
      {/* ── Print-only header ──────────────────────────── */}
      <div className="print-header">
        GitVerse · Chapter {activeChapter.id} · {activeChapter.title}
      </div>

      {/* ── Chapter Header ─────────────────────────────── */}
      <div
        className="chapter-header"
        style={{
          background: `linear-gradient(135deg,${activeChapter.color}18 0%,transparent 65%)`,
          border: `1px solid ${activeChapter.color}30`,
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(20px,4vw,36px)',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div style={{ position:'absolute', top:0, right:0, width:200, height:200, background:`radial-gradient(circle,${activeChapter.color}22,transparent 70%)`, transform:'translate(30%,-30%)', pointerEvents:'none' }} />

        <div style={{ display:'flex', alignItems:'flex-start', gap:16, position:'relative' }}>
          <span style={{ fontSize:'clamp(36px,6vw,52px)', lineHeight:1, flexShrink:0 }}>
            {activeChapter.emoji}
          </span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
              <span style={{ background:`${activeChapter.color}25`, color:activeChapter.color, padding:'2px 10px', borderRadius:20, fontSize:11, fontFamily:'var(--font-mono)', fontWeight:600 }}>
                Chapter {activeChapter.id}
              </span>
              <span style={{ background:'var(--bg-card)', color:'var(--text-secondary)', padding:'2px 10px', borderRadius:20, fontSize:11, fontFamily:'var(--font-mono)' }}>
                ⏱ {activeChapter.duration}
              </span>
              {completed && (
                <span style={{ background:'var(--green-glow)', color:'var(--green)', padding:'2px 10px', borderRadius:20, fontSize:11, fontFamily:'var(--font-mono)' }}>
                  ✓ Complete
                </span>
              )}
            </div>

            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(20px,3.5vw,32px)', fontWeight:900, lineHeight:1.2, color:'var(--text-primary)', marginBottom:8 }}>
              {activeChapter.title}
            </h1>

            <p style={{ color:'var(--text-secondary)', fontSize:15, lineHeight:1.6 }}>
              {content?.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab Nav ────────────────────────────────────── */}
      <div className="no-print" style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:28, overflowX:'auto' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding:'10px 20px', border:'none', cursor:'pointer',
            background:'transparent',
            color: activeTab === tab.id ? activeChapter.color : 'var(--text-muted)',
            fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600,
            borderBottom:`2px solid ${activeTab === tab.id ? activeChapter.color : 'transparent'}`,
            textTransform:'uppercase', letterSpacing:1,
            transition:'color 0.15s,border-color 0.15s',
            whiteSpace:'nowrap',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────────── */}
      {activeTab === 'learn' && (
        <div style={{ animation:'fadeIn 0.25s ease' }}>
          {content?.sections?.map((section, i) => (
            <ContentSection
              key={i}
              section={section}
              color={activeChapter.color}
              delay={i * 70}
            />
          ))}
        </div>
      )}

      {activeTab === 'practice' && (
        <div className="tab-practice" style={{ animation:'fadeIn 0.25s ease' }}>
          <PracticeTab
            practice={content?.practice}
            color={activeChapter.color}
            chapterId={activeChapter.id}
          />
        </div>
      )}

      {activeTab === 'quiz' && content?.quiz && (
        <div className="tab-quiz" style={{ animation:'fadeIn 0.25s ease' }}>
          <QuizTab
            quiz={content.quiz}
            color={activeChapter.color}
            onComplete={() => completeChapter(activeChapter.id)}
            completed={completed}
          />
        </div>
      )}

      {/* ── Chapter Navigation ─────────────────────────── */}
      <div className="no-print" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:52, paddingTop:24, borderTop:'1px solid var(--border)', flexWrap:'wrap', gap:12 }}>
        <button
          className="chapter-nav-btn"
          onClick={goPrev}
          disabled={!prevCh}
          style={{ background: prevCh?'var(--bg-elevated)':'transparent', border: prevCh?'1px solid var(--border)':'none', color: prevCh?'var(--text-secondary)':'transparent', borderRadius:'var(--radius-md)', padding:'11px 18px', cursor: prevCh?'pointer':'default', fontFamily:'var(--font-mono)', fontSize:13, display:'flex', alignItems:'center', gap:8, transition:'background 0.15s,border-color 0.15s' }}>
          {prevCh && <>← {prevCh.emoji} Ch.{prevCh.id}</>}
        </button>

        {completed && (
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--green-glow)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:20, padding:'8px 16px' }}>
            <span style={{ color:'var(--green)', fontSize:14 }}>✓</span>
            <span style={{ color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:12 }}>Chapter Complete!</span>
          </div>
        )}

        <button
          className="chapter-nav-btn"
          onClick={goNext}
          disabled={!nextCh}
          style={{ background: nextCh?activeChapter.color:'transparent', border:'none', color: nextCh?'#000':'transparent', borderRadius:'var(--radius-md)', padding:'11px 18px', cursor: nextCh?'pointer':'default', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:8, transition:'opacity 0.15s' }}>
          {nextCh && <>Ch.{nextCh.id} {nextCh.emoji} Next →</>}
        </button>
      </div>
    </div>
  );
}
