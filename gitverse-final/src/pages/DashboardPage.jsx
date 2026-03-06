import React, { useState, useEffect } from 'react';
import { useApp, ACHIEVEMENTS, LEVELS, XP_REWARDS } from '../context/AppContext';
import { CHAPTERS, PARTS } from '../data/chapters';
import { getChapterContent } from '../data/chapterContent';

/* ── Mini radar chart (SVG) ────────────────────────────── */
function RadarChart({ skills, size = 180 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 28;
  const n = skills.length;
  const angle = (i) => (i / n) * Math.PI * 2 - Math.PI / 2;
  const pt = (i, radius) => [cx + radius * Math.cos(angle(i)), cy + radius * Math.sin(angle(i))];
  const gridLevels = [0.25, 0.5, 0.75, 1];
  return (
    <svg width={size} height={size}>
      {/* Grid */}
      {gridLevels.map(lvl => (
        <polygon key={lvl}
          points={skills.map((_,i) => pt(i, r*lvl).join(',')).join(' ')}
          fill="none" stroke="var(--border)" strokeWidth={1} />
      ))}
      {/* Spokes */}
      {skills.map((_,i) => (
        <line key={i} x1={cx} y1={cy} x2={pt(i,r)[0]} y2={pt(i,r)[1]} stroke="var(--border)" strokeWidth={1} />
      ))}
      {/* Data polygon */}
      <polygon
        points={skills.map((s,i) => pt(i, r * Math.min(s.pct, 1)).join(',')).join(' ')}
        fill="rgba(0,255,136,0.12)" stroke="var(--green)" strokeWidth={2}
      />
      {/* Labels */}
      {skills.map((s,i) => {
        const [x,y] = pt(i, r + 18);
        return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-mono)">{s.label}</text>;
      })}
      {/* Data dots */}
      {skills.map((s,i) => {
        const [x,y] = pt(i, r * Math.min(s.pct, 1));
        return <circle key={i} cx={x} cy={y} r={3.5} fill="var(--green)" />;
      })}
    </svg>
  );
}

/* ── Streak calendar (last 30 days) ────────────────────── */
function StreakCalendar({ streak }) {
  const days = Array.from({length:30}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0,10);
  });
  const today   = new Date().toISOString().slice(0,10);
  const lastDay = streak.lastDay;
  // Approximate active days (we only persist last day + count)
  const activeSet = new Set();
  if (lastDay) {
    for (let k = 0; k < Math.min(streak.count, 30); k++) {
      const d = new Date(lastDay); d.setDate(d.getDate() - k);
      activeSet.add(d.toISOString().slice(0,10));
    }
  }
  return (
    <div>
      <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Last 30 Days</div>
      <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
        {days.map(d => (
          <div key={d} title={d} style={{ width:14, height:14, borderRadius:3, background: activeSet.has(d) ? 'var(--green)' : d===today ? 'var(--border-bright)' : 'var(--bg-card)', border:`1px solid ${d===today?'var(--border-bright)':'transparent'}`, transition:'background 0.2s' }} />
        ))}
      </div>
    </div>
  );
}

/* ── Due reviews panel ─────────────────────────────────── */
function DueReviewsPanel({ getDueReviews, recordAnswer, onClose }) {
  const [queue,   setQueue]   = useState(() => {
    const due = getDueReviews();
    // Fetch quiz questions for due concepts
    const questions = [];
    CHAPTERS.forEach(ch => {
      const content = getChapterContent(ch.id);
      (content?.quiz || []).forEach((q, qi) => {
        const conceptId = `${ch.id}-${qi}`;
        if (due.find(([id]) => id === conceptId)) {
          questions.push({ ...q, conceptId, chapterId: ch.id, chapterTitle: ch.title });
        }
      });
    });
    return questions.slice(0, 5);
  });
  const [idx,      setIdx]      = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted,setSubmitted]= useState(false);
  const [results,  setResults]  = useState([]);

  if (!queue.length) {
    return (
      <div style={{ textAlign:'center', padding:'40px 20px' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>All caught up!</div>
        <div style={{ color:'var(--text-muted)', fontSize:14, marginBottom:20 }}>No reviews due right now. Keep learning!</div>
        <button onClick={onClose} style={{ background:'var(--green)', color:'#000', border:'none', borderRadius:'var(--radius-md)', padding:'10px 24px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor:'pointer' }}>Back to Dashboard</button>
      </div>
    );
  }

  if (idx >= queue.length) {
    const correct = results.filter(Boolean).length;
    return (
      <div style={{ textAlign:'center', padding:'40px 20px' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>{correct === queue.length ? '🏆' : correct >= queue.length/2 ? '💪' : '📚'}</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>Review Complete</div>
        <div style={{ color:'var(--text-muted)', fontSize:15, marginBottom:20 }}>{correct}/{queue.length} correct</div>
        <button onClick={onClose} style={{ background:'var(--green)', color:'#000', border:'none', borderRadius:'var(--radius-md)', padding:'10px 24px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor:'pointer' }}>Done</button>
      </div>
    );
  }

  const q = queue[idx];
  const submit = () => {
    if (selected === null) return;
    const correct = selected === q.correct;
    recordAnswer(q.conceptId, correct);
    setResults(r => [...r, correct]);
    setSubmitted(true);
  };
  const next = () => { setIdx(i => i+1); setSelected(null); setSubmitted(false); };

  return (
    <div style={{ animation:'fadeInUp 0.3s ease' }}>
      <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>
        Daily Review · {idx+1}/{queue.length} · from: {q.chapterTitle}
      </div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, color:'var(--text-primary)', marginBottom:18, lineHeight:1.4 }}>{q.question}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:18 }}>
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect  = submitted && i === q.correct;
          const isWrong    = submitted && isSelected && i !== q.correct;
          return (
            <button key={i} onClick={() => !submitted && setSelected(i)} style={{
              background: isCorrect ? 'rgba(0,255,136,0.12)' : isWrong ? 'rgba(255,107,107,0.12)' : isSelected ? 'var(--bg-card)' : 'var(--bg-elevated)',
              border: `2px solid ${isCorrect ? 'var(--green)' : isWrong ? 'var(--red)' : isSelected ? 'var(--border-bright)' : 'var(--border)'}`,
              borderRadius:'var(--radius-md)', padding:'12px 16px', textAlign:'left',
              color: isCorrect ? 'var(--green)' : isWrong ? 'var(--red)' : 'var(--text-secondary)',
              fontFamily:'var(--font-body)', fontSize:14, cursor: submitted ? 'default':'pointer', transition:'all 0.12s',
            }}>{opt}</button>
          );
        })}
      </div>
      {submitted && (
        <div style={{ background:'rgba(0,255,136,0.06)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'var(--radius-md)', padding:'12px 16px', marginBottom:14, color:'var(--text-secondary)', fontSize:13, lineHeight:1.6 }}>
          {q.explanation}
        </div>
      )}
      <div style={{ display:'flex', gap:10 }}>
        {!submitted && <button onClick={submit} disabled={selected===null} style={{ background: selected!==null?'var(--green)':'var(--bg-card)', color: selected!==null?'#000':'var(--text-muted)', border:'none', borderRadius:'var(--radius-md)', padding:'10px 22px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor: selected!==null?'pointer':'default' }}>Check</button>}
        {submitted && <button onClick={next} style={{ background:'var(--green)', color:'#000', border:'none', borderRadius:'var(--radius-md)', padding:'10px 22px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor:'pointer' }}>Next →</button>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { progress, completedCount, xp, currentLevel, nextLevel, xpToNext,
    achievements, streak, getDueReviews, recordAnswer, earnXP, openChapter,
    setView, srData } = useApp();
  const [showReview, setShowReview] = useState(false);

  const due       = getDueReviews();
  const nextChapter = CHAPTERS.find(c => !progress[c.id]);

  // Skill scores per part
  const skillData = PARTS.map(part => {
    const chs = CHAPTERS.filter(c => c.part === part.id);
    const done = chs.filter(c => progress[c.id]).length;
    return { label: part.title.split(' ')[0], pct: chs.length ? done / chs.length : 0 };
  });

  // Recent weak spots
  const weakSpots = Object.entries(srData)
    .filter(([,v]) => v.wrong > 0)
    .sort((a,b) => (b[1].wrong/Math.max(b[1].correct+b[1].wrong,1)) - (a[1].wrong/Math.max(a[1].correct+a[1].wrong,1)))
    .slice(0,3);

  if (showReview) {
    return (
      <div style={{ maxWidth:640, margin:'0 auto', padding:'40px 24px' }}>
        <button onClick={() => setShowReview(false)} style={{ background:'transparent', border:'none', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:12, cursor:'pointer', marginBottom:20 }}>← Back</button>
        <DueReviewsPanel getDueReviews={getDueReviews} recordAnswer={recordAnswer} onClose={() => setShowReview(false)} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth:'var(--page-max)', margin:'0 auto', padding:'clamp(20px,4vw,48px) clamp(16px,4vw,32px)' }}>

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,4vw,38px)', fontWeight:900, marginBottom:6 }}>
          📊 Your Dashboard
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize:15 }}>Your learning progress, skills, and what to do next.</p>
      </div>

      {/* Top stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:24 }}>
        {[
          { label:'XP Earned',    value:xp.toLocaleString(), icon:'⚡', color:'var(--green)',  sub:currentLevel.title },
          { label:'Chapters',     value:`${completedCount}/22`, icon:'📖', color:'#4dabf7', sub:`${Math.round(completedCount/22*100)}% complete` },
          { label:'Streak',       value:`${streak.count}d`,   icon:'🔥', color:'#ffb347', sub: streak.count > 0 ? 'Keep it going!' : 'Start today' },
          { label:'Achievements', value:achievements.length,  icon:'🏅', color:'#cc5de8', sub:`of ${ACHIEVEMENTS.length} unlocked` },
          { label:'Reviews Due',  value:due.length,           icon:'🧠', color: due.length>0?'var(--red)':'var(--green)', sub: due.length>0 ? 'Need attention':'All caught up' },
        ].map(s => (
          <div key={s.label} style={{ background:`linear-gradient(135deg,var(--bg-elevated),var(--bg-card))`, border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'18px 20px' }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'var(--font-mono)', marginTop:4 }}>{s.label}</div>
            <div style={{ color:'var(--text-muted)', fontSize:10, marginTop:2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
        {/* Radar chart */}
        <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:16, alignSelf:'flex-start' }}>Skill Radar</div>
          <RadarChart skills={skillData} size={200} />
        </div>

        {/* Streak + next action */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'20px', flex:1 }}>
            <StreakCalendar streak={streak} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {due.length > 0 && (
              <button onClick={() => setShowReview(true)} style={{ background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.35)', color:'var(--red)', borderRadius:'var(--radius-lg)', padding:'14px 18px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor:'pointer', textAlign:'left', display:'flex', gap:12, alignItems:'center' }}>
                <span style={{ fontSize:22 }}>🧠</span>
                <div><div>{due.length} Review{due.length>1?'s':''} Due</div><div style={{ fontWeight:400, fontSize:11, marginTop:2, color:'rgba(255,107,107,0.8)' }}>Flashcard review — 3 min</div></div>
              </button>
            )}
            {nextChapter && (
              <button onClick={() => openChapter(nextChapter)} style={{ background:`linear-gradient(135deg,${nextChapter.color}20,${nextChapter.color}08)`, border:`1px solid ${nextChapter.color}40`, color:nextChapter.color, borderRadius:'var(--radius-lg)', padding:'14px 18px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor:'pointer', textAlign:'left', display:'flex', gap:12, alignItems:'center' }}>
                <span style={{ fontSize:22 }}>{nextChapter.emoji}</span>
                <div><div>Continue Learning</div><div style={{ fontWeight:400, fontSize:11, marginTop:2 }}>Ch.{nextChapter.id}: {nextChapter.title}</div></div>
              </button>
            )}
            <button onClick={() => setView('skill-tree')} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)', borderRadius:'var(--radius-lg)', padding:'12px 18px', fontFamily:'var(--font-mono)', fontSize:12, cursor:'pointer', textAlign:'left' }}>
              🗺️ View Skill Tree →
            </button>
          </div>
        </div>
      </div>

      {/* Achievements grid */}
      <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'20px', marginBottom:20 }}>
        <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>Achievements ({achievements.length}/{ACHIEVEMENTS.length})</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:8 }}>
          {ACHIEVEMENTS.map(ach => {
            const unlocked = achievements.includes(ach.id);
            return (
              <div key={ach.id} style={{ background: unlocked ? 'rgba(255,183,71,0.08)' : 'var(--bg-card)', border:`1px solid ${unlocked?'rgba(255,183,71,0.3)':'var(--border)'}`, borderRadius:'var(--radius-lg)', padding:'12px 14px', opacity: unlocked ? 1 : 0.45 }}>
                <div style={{ fontSize:22, marginBottom:5 }}>{ach.icon}</div>
                <div style={{ color: unlocked?'#ffb347':'var(--text-muted)', fontWeight:700, fontSize:12, marginBottom:3 }}>{ach.title}</div>
                <div style={{ color:'var(--text-muted)', fontSize:11 }}>{ach.desc}</div>
                <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, marginTop:5 }}>+{ach.xp} XP</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
