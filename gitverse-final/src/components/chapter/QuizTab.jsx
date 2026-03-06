import React, { useState } from 'react';
import { useApp, XP_REWARDS } from '../../context/AppContext';

export default function QuizTab({ quiz, color, onComplete, completed, chapterId }) {
  const { recordAnswer, earnXP, unlockAchievement, addToast } = useApp();
  const [current,   setCurrent]   = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score,     setScore]     = useState(0);
  const [done,      setDone]      = useState(false);
  const [answers,   setAnswers]   = useState([]);
  const [startTime] = useState(Date.now());

  const q = quiz[current];

  const submit = () => {
    if (selected === null) return;
    const correct = selected === q.correct;
    if (correct) setScore(s => s + 1);
    setAnswers(prev => [...prev, { correct }]);
    setSubmitted(true);
    // Record for spaced repetition
    const conceptId = `${chapterId || 0}-${current}`;
    recordAnswer(conceptId, correct);
  };

  const next = () => {
    const isLast     = current + 1 >= quiz.length;
    const finalScore = score + (selected === q.correct ? 1 : 0);
    if (isLast) {
      setDone(true);
      const passed = finalScore >= Math.ceil(quiz.length * 0.7);
      if (passed) {
        onComplete();
        earnXP(XP_REWARDS.chapterDone, 'Chapter mastered!');
        if (finalScore === quiz.length) {
          earnXP(XP_REWARDS.quizPerfect, 'Perfect score!');
          unlockAchievement('perfect_quiz');
        }
        // Speed bonus
        const elapsed = (Date.now() - startTime) / 1000 / 60;
        if (elapsed < 2 && quiz.length >= 3) unlockAchievement('speed_run');
      }
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setSubmitted(false);
    }
  };

  const reset = () => {
    setCurrent(0); setSelected(null); setSubmitted(false);
    setScore(0); setDone(false); setAnswers([]);
  };

  /* ── Results ──────────────────────────────────────────── */
  if (done) {
    const finalScore = score;
    const passed = finalScore >= Math.ceil(quiz.length * 0.7);
    const pct    = Math.round(finalScore / quiz.length * 100);
    return (
      <div style={{ textAlign:'center', padding:'40px 20px', animation:'fadeInUp 0.4s ease' }}>
        <div style={{ fontSize:56, marginBottom:14 }}>
          {pct === 100 ? '🏆' : passed ? '🎉' : '📚'}
        </div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:900, color: passed?color:'var(--amber)', marginBottom:8 }}>
          {pct === 100 ? 'Flawless!' : passed ? 'Chapter Complete!' : 'Keep Practicing!'}
        </h2>
        <p style={{ color:'var(--text-secondary)', fontSize:16, marginBottom:6 }}>
          You scored <strong style={{color}}>{finalScore}</strong> / <strong>{quiz.length}</strong> — {pct}%
        </p>
        {!passed && (
          <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>
            Need 70% to pass. Answers are tracked — review weaker topics in your Dashboard.
          </p>
        )}

        {/* Answer dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:24, flexWrap:'wrap' }}>
          {answers.map((a,i) => (
            <div key={i} style={{ width:32, height:32, borderRadius:'50%', background: a.correct?'var(--green-glow)':'rgba(255,107,107,0.12)', border:`2px solid ${a.correct?'var(--green)':'var(--red)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
              {a.correct ? '✓' : '✗'}
            </div>
          ))}
        </div>

        {passed && (
          <div style={{ background:'var(--green-glow)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'var(--radius-lg)', padding:'10px 20px', display:'inline-flex', gap:8, alignItems:'center', marginBottom:20 }}>
            <span>⚡</span>
            <span style={{ color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:13 }}>+{XP_REWARDS.chapterDone} XP earned</span>
          </div>
        )}

        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={reset} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)', borderRadius:'var(--radius-md)', padding:'10px 24px', fontFamily:'var(--font-mono)', fontSize:13, cursor:'pointer' }}>
            Try Again
          </button>
          {!passed && (
            <button onClick={() => window.scrollTo({top:0,behavior:'smooth'})} style={{ background:color, color:'#000', border:'none', borderRadius:'var(--radius-md)', padding:'10px 24px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              Re-read Chapter ↑
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── Question ─────────────────────────────────────────── */
  return (
    <div style={{ maxWidth:600, animation:'fadeIn 0.3s ease' }}>
      {/* Progress */}
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20, alignItems:'center' }}>
        <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:12 }}>{current+1} / {quiz.length}</span>
        <div style={{ display:'flex', gap:5 }}>
          {quiz.map((_,i) => (
            <div key={i} style={{ width:8, height:8, borderRadius:'50%', background: i<current?'var(--green)':i===current?color:'var(--border)', transition:'background 0.3s' }} />
          ))}
        </div>
        <span style={{ color, fontFamily:'var(--font-mono)', fontSize:12 }}>Score: {score}</span>
      </div>

      {/* Question card */}
      <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'22px 24px', marginBottom:14 }}>
        <p style={{ color:'var(--text-primary)', fontSize:17, lineHeight:1.65, fontWeight:500 }}>{q.question}</p>
        {q.code && (
          <pre style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:14, marginTop:12, fontFamily:'var(--font-mono)', fontSize:12, color:'var(--green)', overflowX:'auto' }}>{q.code}</pre>
        )}
      </div>

      {/* Options */}
      <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:18 }}>
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect  = i === q.correct;
          let bg = 'var(--bg-elevated)', border = 'var(--border)', txtColor = 'var(--text-secondary)';
          if (submitted) {
            if (isCorrect)   { bg='var(--green-glow)'; border='rgba(0,255,136,0.3)'; txtColor='var(--green)'; }
            else if(isSelected) { bg='rgba(255,107,107,0.1)'; border='rgba(255,107,107,0.4)'; txtColor='var(--red)'; }
          } else if (isSelected) { bg=`${color}16`; border=`${color}55`; txtColor=color; }
          return (
            <button key={i} onClick={() => !submitted && setSelected(i)} style={{ background:bg, border:`2px solid ${border}`, borderRadius:'var(--radius-lg)', padding:'13px 17px', cursor:submitted?'default':'pointer', textAlign:'left', color:txtColor, fontSize:15, lineHeight:1.5, transition:'all 0.15s', display:'flex', gap:12, alignItems:'flex-start' }}>
              <span style={{ width:24, height:24, borderRadius:'50%', border:`2px solid ${border}`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, background: isSelected?`${color}28`:'transparent' }}>
                {submitted && isCorrect ? '✓' : submitted && isSelected && !isCorrect ? '✗' : String.fromCharCode(65+i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {submitted && (
        <div style={{ background: selected===q.correct?'var(--green-glow)':'rgba(255,107,107,0.08)', border:`1px solid ${selected===q.correct?'rgba(0,255,136,0.25)':'rgba(255,107,107,0.3)'}`, borderRadius:'var(--radius-lg)', padding:'13px 17px', marginBottom:16, animation:'fadeIn 0.3s ease' }}>
          <div style={{ fontWeight:700, marginBottom:5, fontSize:13, color: selected===q.correct?'var(--green)':'var(--red)' }}>
            {selected===q.correct ? '✓ Correct! +'+XP_REWARDS.quizCorrect+' XP' : '✗ Not quite — logged for review'}
          </div>
          <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.65 }}>{q.explanation}</p>
        </div>
      )}

      {!submitted ? (
        <button onClick={submit} disabled={selected===null} style={{ background: selected!==null?color:'var(--bg-card)', color: selected!==null?'#000':'var(--text-muted)', border:'none', borderRadius:'var(--radius-md)', padding:'12px 28px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor: selected!==null?'pointer':'default', transition:'all 0.15s' }}>
          Check Answer
        </button>
      ) : (
        <button onClick={next} style={{ background:color, color:'#000', border:'none', borderRadius:'var(--radius-md)', padding:'12px 28px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
          {current+1>=quiz.length ? 'See Results →' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}
