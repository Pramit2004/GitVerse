import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CHAPTERS, PARTS, COMMAND_REFERENCE } from '../data/chapters';
import { ProgressRing, AnimatedCounter } from '../components/ui';

/* ── Animated Terminal ──────────────────────────────── */
const LINES = [
  { cmd: 'git init',                              out: 'Initialized empty Git repository in .git/', delay: 400  },
  { cmd: 'git add .',                             out: null,                                         delay: 1200 },
  { cmd: 'git commit -m "Start learning Git 🚀"', out: '[main a1b2c3d] Start learning Git 🚀',      delay: 2100 },
  { cmd: 'git branch feature/dark-mode',          out: null,                                         delay: 3200 },
  { cmd: 'git switch feature/dark-mode',          out: "Switched to branch 'feature/dark-mode'",    delay: 4100 },
  { cmd: 'git log --oneline',                     out: 'a1b2c3d (HEAD → feature/dark-mode, main)',  delay: 5100 },
];

function TerminalLine({ command, output, delay }) {
  const [show, setShow]  = useState(false);
  const [out,  setOut]   = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), delay);
    const t2 = setTimeout(() => setOut(true),  delay + 550);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [delay]);
  return (
    <div style={{ marginBottom: 5, opacity: show ? 1 : 0, transition: 'opacity 0.3s' }}>
      <div style={{ display:'flex', gap:7 }}>
        <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:12 }}>$</span>
        <span style={{ color:'var(--green)',      fontFamily:'var(--font-mono)', fontSize:12 }}>{command}</span>
      </div>
      {output && out && (
        <div style={{ marginLeft:17, color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:11, marginTop:1, animation:'fadeIn 0.3s ease' }}>{output}</div>
      )}
    </div>
  );
}

function HeroTerminal() {
  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-bright)', borderRadius:14, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.6)', maxWidth:520, width:'100%' }}>
      <div style={{ background:'var(--bg-card)', padding:'9px 15px', display:'flex', alignItems:'center', gap:7, borderBottom:'1px solid var(--border)' }}>
        {['#ff5f56','#ffbd2e','#27c93f'].map(c => <div key={c} style={{ width:11, height:11, borderRadius:'50%', background:c }} />)}
        <span style={{ marginLeft:8, color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>~/project — bash</span>
      </div>
      <div style={{ padding:'17px 17px 21px', minHeight:210 }}>
        {LINES.map((l,i) => <TerminalLine key={i} command={l.cmd} output={l.out} delay={l.delay} />)}
        <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:6 }}>
          <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:12 }}>$</span>
          <span style={{ width:7, height:15, background:'var(--green)', display:'inline-block', marginLeft:2, animation:'blink 1s step-end infinite' }} />
        </div>
      </div>
    </div>
  );
}

/* ── HomePage ───────────────────────────────────────── */
export default function HomePage() {
  const { openChapter, progress, completedCount, progressPct, setView } = useApp();
  const [cmdTab, setCmdTab] = useState(0);
  const nextChapter = CHAPTERS.find(c => !progress[c.id]);

  return (
    <div>
      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section
        className="hero-section"
        style={{
          minHeight: 'calc(100vh - var(--nav-height))',
          display: 'flex', alignItems: 'center',
          padding: 'clamp(36px,6vw,80px) clamp(16px,4vw,48px)',
          maxWidth: 'var(--page-max)', margin: '0 auto',
          gap: 'clamp(32px,5vw,64px)', flexWrap: 'wrap',
        }}
      >
        {/* Copy column */}
        <div style={{ flex:'1 1 300px', minWidth:0 }}>
          {/* Pill badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--green-glow)', border:'1px solid rgba(0,255,136,0.25)', borderRadius:20, padding:'5px 14px', marginBottom:20 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', animation:'pulseGreen 2s infinite', flexShrink:0 }} />
            <span style={{ color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:12 }}>22 chapters · Free · No signup</span>
          </div>

          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(34px,6vw,70px)', fontWeight:900, lineHeight:1.05, marginBottom:18 }}>
            Master{' '}
            <span style={{ background:'linear-gradient(135deg,var(--green),var(--blue))', backgroundSize:'200% 200%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', animation:'gradientShift 4s ease infinite' }}>Git &amp;</span>
            <br />
            <span style={{ background:'linear-gradient(135deg,var(--blue),var(--purple))', backgroundSize:'200% 200%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', animation:'gradientShift 4s ease infinite' }}>GitHub</span>
          </h1>

          <p style={{ color:'var(--text-secondary)', fontSize:'clamp(14px,2vw,17px)', lineHeight:1.8, marginBottom:28, maxWidth:480 }}>
            22 deep chapters, 9 interactive simulators, real-world projects.
            Built for <em>real understanding</em> — not just memorization.
          </p>

          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:22 }}>
            <button
              onClick={() => openChapter(nextChapter || CHAPTERS[0])}
              style={{ background:'var(--green)', color:'#000', border:'none', borderRadius:10, padding:'13px 26px', fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700, cursor:'pointer', animation:'pulseGreen 3s infinite', whiteSpace:'nowrap' }}>
              {completedCount > 0 ? `Continue (Ch.${nextChapter?.id || 1}) →` : 'Start Learning →'}
            </button>
            <button
              onClick={() => setView('all-chapters')}
              style={{ background:'transparent', color:'var(--blue)', border:'1px solid var(--blue-dim)', borderRadius:10, padding:'13px 20px', fontFamily:'var(--font-mono)', fontSize:14, cursor:'pointer', whiteSpace:'nowrap' }}>
              Browse Chapters
            </button>
          </div>

          {/* Keyboard hints */}
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:28 }}>
            {[{keys:['/'],label:'search'},{keys:['J','K'],label:'navigate chapters'}].map(s => (
              <span key={s.label} style={{ display:'flex', alignItems:'center', gap:5, color:'var(--text-muted)', fontSize:12 }}>
                {s.keys.map(k => <kbd key={k} style={{ background:'var(--bg-card)', border:'1px solid var(--border-bright)', borderRadius:4, padding:'1px 6px', fontFamily:'var(--font-mono)', fontSize:10 }}>{k}</kbd>)}
                <span>{s.label}</span>
              </span>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
            {[{label:'Chapters',val:22},{label:'Commands',val:60,suf:'+'},{label:'Simulators',val:15}].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(26px,3vw,38px)', fontWeight:900, color:'var(--green)', lineHeight:1 }}>
                  <AnimatedCounter value={s.val} suffix={s.suf||''} />
                </div>
                <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Terminal — hidden below 640px via .hero-terminal-col CSS class */}
        <div className="hero-terminal-col" style={{ flex:'0 1 520px', display:'flex', justifyContent:'center', animation:'float 5s ease-in-out infinite' }}>
          <HeroTerminal />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PROGRESS BANNER
      ══════════════════════════════════════════════ */}
      {completedCount > 0 && (
        <div style={{ background:'var(--bg-surface)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'16px clamp(16px,4vw,48px)' }}>
          <div style={{ maxWidth:'var(--page-max)', margin:'0 auto', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <ProgressRing progress={progressPct} size={46} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:'var(--text-primary)', fontWeight:600, fontSize:14 }}>{completedCount} of {CHAPTERS.length} chapters complete</div>
              <div style={{ color:'var(--text-muted)', fontSize:12, marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {nextChapter ? `Next: ${nextChapter.emoji} ${nextChapter.title}` : '🎉 All chapters complete!'}
              </div>
            </div>
            {nextChapter && (
              <button onClick={() => openChapter(nextChapter)} style={{ background:'var(--green)', color:'#000', border:'none', borderRadius:8, padding:'8px 18px', fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                Continue →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          PARTS OVERVIEW
      ══════════════════════════════════════════════ */}
      <section style={{ padding:'clamp(40px,6vw,80px) clamp(16px,4vw,48px)', background:'var(--bg-surface)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:'var(--page-max)', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,4vw,38px)', fontWeight:900, marginBottom:8 }}>The Complete Journey</h2>
            <p style={{ color:'var(--text-muted)', fontSize:15 }}>Seven parts. 22 chapters. Everything there is to know about Git.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap:14 }}>
            {PARTS.map(part => {
              const partChs = CHAPTERS.filter(c => part.chapters.includes(c.id));
              const done    = partChs.filter(c => progress[c.id]).length;
              const pct     = Math.round((done / partChs.length) * 100);
              return (
                <div key={part.id}
                  onClick={() => openChapter(CHAPTERS.find(c => c.part === part.id))}
                  style={{ background:'var(--bg-card)', border:`1px solid ${done===partChs.length?part.color+'40':'var(--border)'}`, borderRadius:'var(--radius-xl)', padding:20, cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor=part.color+'55'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor=done===partChs.length?part.color+'40':'var(--border)'; }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div style={{ flex:1, minWidth:0, paddingRight:10 }}>
                      <div style={{ color:part.color, fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, marginBottom:4, textTransform:'uppercase', letterSpacing:1 }}>Part {part.id}</div>
                      <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, marginBottom:3 }}>{part.title}</h3>
                      <p style={{ color:'var(--text-muted)', fontSize:12, lineHeight:1.4 }}>{part.subtitle}</p>
                    </div>
                    <ProgressRing progress={pct} size={42} color={part.color} />
                  </div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
                    {partChs.map(ch => (
                      <div key={ch.id} style={{ width:24, height:24, borderRadius:'50%', background:progress[ch.id]?ch.color+'22':'var(--bg-elevated)', border:`1px solid ${progress[ch.id]?ch.color+'55':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:progress[ch.id]?10:12 }} title={ch.title}>
                        {progress[ch.id] ? <span style={{ color:ch.color }}>✓</span> : ch.emoji}
                      </div>
                    ))}
                  </div>
                  <div style={{ height:3, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:part.color, borderRadius:2, transition:'width 0.6s ease' }} />
                  </div>
                  <div style={{ marginTop:5, color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10 }}>{done}/{partChs.length} complete</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          INTERACTIVE TOOLS
      ══════════════════════════════════════════════ */}
      <section style={{ padding:'clamp(40px,6vw,80px) clamp(16px,4vw,48px)' }}>
        <div style={{ maxWidth:'var(--page-max)', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(22px,3vw,34px)', fontWeight:900, marginBottom:8 }}>Learn by Doing</h2>
            <p style={{ color:'var(--text-muted)', fontSize:15 }}>15 hands-on simulators built into every chapter.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(min(100%, 210px), 1fr))', gap:12 }}>
            {[
              { icon:'💻', title:'Terminal',          desc:'Run real Git commands in-browser.',  color:'#51cf66', ch:5  },
              { icon:'🌿', title:'Commit Graph',       desc:'Build visual branch graphs.',        color:'#4dabf7', ch:8  },
              { icon:'🎯', title:'Staging Area',       desc:'Drag files through the 3 trees.',   color:'#ffb347', ch:4  },
              { icon:'⚔️', title:'Conflict Resolver',  desc:'Resolve real merge conflicts.',     color:'#228be6', ch:10 },
              { icon:'🤝', title:'PR Walkthrough',     desc:'Review & merge a pull request.',    color:'#9c36b5', ch:12 },
              { icon:'📄', title:'Manual Merge',       desc:'Combine two file versions by hand.',color:'#ff6b6b', ch:1  },
              { icon:'🧹', title:'.gitignore',         desc:'Test patterns live.',               color:'#f06595', ch:17 },
            ].map(t => (
              <div key={t.title}
                onClick={() => openChapter(CHAPTERS.find(c => c.id === t.ch))}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:18, cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=t.color+'55'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; }}>
                <div style={{ fontSize:30, marginBottom:9 }}>{t.icon}</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:t.color, marginBottom:5 }}>{t.title}</h3>
                <p style={{ color:'var(--text-muted)', fontSize:12, lineHeight:1.5, marginBottom:9 }}>{t.desc}</p>
                <div style={{ color:t.color, fontFamily:'var(--font-mono)', fontSize:10 }}>→ Ch. {t.ch}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          COMMAND REFERENCE
      ══════════════════════════════════════════════ */}
      <section style={{ padding:'clamp(40px,6vw,80px) clamp(16px,4vw,48px)', background:'var(--bg-surface)', borderTop:'1px solid var(--border)' }}>
        <div style={{ maxWidth:'var(--page-max)', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(22px,3vw,34px)', fontWeight:900, marginBottom:8 }}>Quick Command Reference</h2>
            <p style={{ color:'var(--text-muted)', fontSize:15 }}>The commands you'll use every single day.</p>
          </div>
          {/* Category tabs */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center', marginBottom:18 }}>
            {COMMAND_REFERENCE.map((cat, i) => (
              <button key={i} onClick={() => setCmdTab(i)} style={{ background:cmdTab===i?cat.color+'20':'var(--bg-card)', color:cmdTab===i?cat.color:'var(--text-muted)', border:`1px solid ${cmdTab===i?cat.color+'50':'var(--border)'}`, borderRadius:20, padding:'5px 13px', fontFamily:'var(--font-mono)', fontSize:11, cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap' }}>
                {cat.category}
              </button>
            ))}
          </div>
          {/* Table */}
          {COMMAND_REFERENCE[cmdTab] && (
            <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', animation:'fadeIn 0.2s ease' }}>
              {COMMAND_REFERENCE[cmdTab].commands.map((cmd, i, arr) => (
                <div key={i}
                  className="cmd-table-row"
                  style={{ display:'flex', flexWrap:'wrap', borderBottom:i<arr.length-1?'1px solid var(--border)':'none' }}>
                  <div
                    className="cmd-table-code-col"
                    style={{ padding:'10px 15px', minWidth:220, background:'var(--bg-card)', borderRight:'1px solid var(--border)' }}>
                    <code style={{ color:COMMAND_REFERENCE[cmdTab].color, fontFamily:'var(--font-mono)', fontSize:12 }}>{cmd.cmd}</code>
                  </div>
                  <div style={{ padding:'10px 15px', flex:1, minWidth:140 }}>
                    <span style={{ color:'var(--text-secondary)', fontSize:13 }}>{cmd.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign:'center', marginTop:18 }}>
            <button onClick={() => setView('cheatsheet')} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:8, padding:'8px 18px', fontFamily:'var(--font-mono)', fontSize:12, cursor:'pointer' }}>
              Full Cheatsheet →
            </button>
          </div>
        </div>
      </section>

      {/* ── IDE + Git Guide dual banners ─────────────────────── */}
      <section style={{ padding:'0 clamp(16px,4vw,48px) clamp(32px,4vw,56px)', display:'flex', flexDirection:'column', gap:14 }}>

        {/* IDE Banner */}
        <div
          onClick={() => setView('ide')}
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(77,159,255,0.05) 100%)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 16, padding: 'clamp(16px,2.5vw,24px)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: 'clamp(14px,2.5vw,22px)', flexWrap: 'wrap',
            transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.38)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,255,0.07)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ position:'absolute', top:'-40%', right:'5%', width:'180px', height:'180px', background:'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ fontSize:'clamp(32px,4vw,44px)', flexShrink:0, filter:'drop-shadow(0 0 12px rgba(0,212,255,0.45))' }}>💻</div>
          <div style={{ flex:1, minWidth:180 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:5 }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'clamp(15px,2vw,20px)', fontWeight:800, color:'var(--text-primary)' }}>GitVerse IDE</span>
              <span style={{ fontSize:10, background:'rgba(0,212,255,0.12)', color:'#00d4ff', border:'1px solid rgba(0,212,255,0.25)', borderRadius:20, padding:'2px 9px', fontFamily:'var(--font-mono)', fontWeight:700 }}>INTERACTIVE</span>
              <span style={{ fontSize:10, background:'rgba(0,229,160,0.1)', color:'#00e5a0', border:'1px solid rgba(0,229,160,0.2)', borderRadius:20, padding:'2px 9px', fontFamily:'var(--font-mono)', fontWeight:700 }}>XP REWARDS</span>
            </div>
            <p style={{ color:'var(--text-secondary)', fontSize:13, margin:0, lineHeight:1.55, maxWidth:500 }}>
              A full VS Code–style IDE in your browser. Real syntax highlighting, animated terminal, GitHub panel, branch visualizer — practice every Git command live.
            </p>
          </div>
          <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
            <div style={{ background:'rgba(0,212,255,0.12)', border:'1px solid rgba(0,212,255,0.3)', color:'#00d4ff', borderRadius:10, padding:'9px 18px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:7, boxShadow:'0 0 18px rgba(0,212,255,0.14)' }}>
              Launch IDE <span style={{ fontSize:16 }}>→</span>
            </div>
            <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>press I anytime</span>
          </div>
        </div>

        {/* ── Git Complete Guide Banner ─────────────────────── */}
        <div
          onClick={() => setView('git-guide')}
          style={{
            background: 'linear-gradient(135deg, rgba(0,229,160,0.06) 0%, rgba(0,212,255,0.04) 50%, rgba(77,159,255,0.06) 100%)',
            border: '1px solid rgba(0,229,160,0.2)',
            borderRadius: 16,
            padding: 'clamp(20px,3vw,32px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(16px,3vw,28px)',
            flexWrap: 'wrap',
            transition: 'all 0.2s',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,160,0.38)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(0,229,160,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,229,160,0.2)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
        >
          {/* Background glow orbs */}
          <div style={{ position:'absolute', top:'-40%', right:'5%', width:'200px', height:'200px', background:'radial-gradient(circle, rgba(0,229,160,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-40%', left:'10%', width:'160px', height:'160px', background:'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

          <div style={{ fontSize:'clamp(36px,5vw,52px)', flexShrink:0, filter:'drop-shadow(0 0 14px rgba(0,229,160,0.4))' }}>📚</div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'clamp(16px,2vw,22px)', fontWeight:800, color:'var(--text-primary)' }}>Git Complete Guide</span>
              <span style={{ fontSize:10, background:'rgba(0,229,160,0.12)', color:'#00e5a0', border:'1px solid rgba(0,229,160,0.25)', borderRadius:20, padding:'2px 9px', fontFamily:'var(--font-mono)', fontWeight:700, letterSpacing:0.5 }}>17 SECTIONS</span>
              <span style={{ fontSize:10, background:'rgba(77,159,255,0.1)', color:'#4d9fff', border:'1px solid rgba(77,159,255,0.2)', borderRadius:20, padding:'2px 9px', fontFamily:'var(--font-mono)', fontWeight:700 }}>BEGINNER → PRO</span>
            </div>
            <p style={{ color:'var(--text-secondary)', fontSize:13, margin:0, lineHeight:1.6, maxWidth:560 }}>
              Branches, Pull Requests, Issues, Merging, Conflicts, Under-the-hood internals — every concept explained with <strong style={{ color:'var(--text-primary)' }}>what, why, how, when &amp; where</strong>. Interactive, searchable, fully responsive.
            </p>
            <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
              {['🌿 Branches','🔀 PRs','🐛 Issues','⚠️ Conflicts','🔬 Internals','📋 Cheatsheet'].map(tag => (
                <span key={tag} style={{ fontSize:11, color:'var(--text-muted)', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:20, padding:'2px 10px', fontFamily:'var(--font-mono)' }}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <div style={{ background:'rgba(0,229,160,0.12)', border:'1px solid rgba(0,229,160,0.3)', color:'#00e5a0', borderRadius:10, padding:'10px 20px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:7, boxShadow:'0 0 20px rgba(0,229,160,0.15)' }}>
              Open Guide <span style={{ fontSize:16 }}>→</span>
            </div>
            <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>press G anytime</span>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer style={{ padding:'clamp(24px,4vw,40px) clamp(16px,4vw,48px)', borderTop:'1px solid var(--border)', textAlign:'center' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:'var(--green)', marginBottom:6 }}>⚡ GitVerse</div>
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>Free forever. Built with React + Vite.</p>
      </footer>
    </div>
  );
}