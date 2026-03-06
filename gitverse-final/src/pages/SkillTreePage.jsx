import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CHAPTERS, PARTS } from '../data/chapters';

/* ── Chapter node positions in the tree ───────────────── */
// [col, row] — col=horizontal lane, row=vertical position
const NODE_POS = {
  1:  [2, 0], 2:  [1, 1], 3:  [3, 1],
  4:  [2, 2], 5:  [1, 3], 6:  [2, 3], 7:  [3, 3],
  8:  [1, 4], 9:  [2, 4], 10: [3, 4],
  11: [1, 5], 12: [2, 5], 13: [3, 5],
  14: [1, 6], 15: [2, 6], 16: [3, 6], 17: [3.8, 6],
  18: [2, 7],
  19: [1, 8], 20: [1.9, 8], 21: [2.8, 8], 22: [3.7, 8],
};

// Prerequisites: chapter must be done before this unlocks
const PREREQS = {
  2: [1], 3: [1],
  4: [2,3], 5: [4], 6: [4], 7: [4],
  8: [5,6], 9: [8], 10: [9],
  11: [6,7], 12: [11], 13: [12],
  14: [9,10], 15: [14], 16: [15], 17: [6],
  18: [12,13],
  19: [7], 20: [11], 21: [18], 22: [21],
};

const COLS = 5;
const ROWS = 9;
const NODE_R = 28;
const COL_W  = 160;
const ROW_H  = 100;
const PAD    = 50;

function isUnlocked(id, progress) {
  const prereqs = PREREQS[id];
  if (!prereqs) return true;
  return prereqs.every(p => progress[p]);
}

export default function SkillTreePage() {
  const { progress, openChapter, xp, currentLevel, nextLevel, xpToNext, achievements, streak } = useApp();
  const [hovered, setHovered] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);

  const PATHS = [
    { id:'deploy',  label:'🚀 Ship a React App', color:'#4dabf7', chapters:[1,2,3,4,6,7,11,12,18] },
    { id:'team',    label:'🤝 Team Collaboration',color:'#cc5de8', chapters:[1,2,3,11,12,13,10] },
    { id:'advanced',label:'⚡ Advanced Git',      color:'#ffb347', chapters:[1,4,7,8,9,10,14,15,16] },
    { id:'pro',     label:'🎓 Full Pro Stack',    color:'#51cf66', chapters:[1,2,3,4,5,6,7,8,9,10,11,12,13,19,20,21,22] },
  ];

  const svgW = COLS * COL_W + PAD * 2;
  const svgH = ROWS * ROW_H + PAD * 2;

  const nodeX = (id) => PAD + NODE_POS[id][0] * COL_W;
  const nodeY = (id) => PAD + NODE_POS[id][1] * ROW_H;

  const completedCount = Object.values(progress).filter(Boolean).length;
  const nextLevel2 = nextLevel;

  return (
    <div style={{ maxWidth:'var(--page-max)', margin:'0 auto', padding:'clamp(20px,4vw,48px) clamp(16px,4vw,32px)' }}>

      {/* Header */}
      <div style={{ display:'flex', gap:24, alignItems:'flex-start', marginBottom:28, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,4vw,38px)', fontWeight:900, marginBottom:6 }}>
            🗺️ Skill Tree
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:15 }}>
            Your Git learning map. Complete chapters to unlock new ones. Choose a learning path or explore freely.
          </p>
        </div>

        {/* Level card */}
        <div style={{ background:`linear-gradient(135deg,${currentLevel.color}18,${currentLevel.color}06)`, border:`1px solid ${currentLevel.color}40`, borderRadius:'var(--radius-xl)', padding:'16px 22px', minWidth:200, flexShrink:0 }}>
          <div style={{ color:currentLevel.color, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>
            Level {currentLevel.level}
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:'var(--text-primary)', marginBottom:8 }}>
            {currentLevel.title}
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
            <code style={{ color:currentLevel.color, fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700 }}>{xp.toLocaleString()} XP</code>
            {nextLevel2 && <span style={{ color:'var(--text-muted)', fontSize:12 }}>· {xpToNext} to {nextLevel2.title}</span>}
          </div>
          {nextLevel2 && (
            <div style={{ background:'var(--bg-card)', borderRadius:20, overflow:'hidden', height:6 }}>
              <div style={{ height:'100%', background:currentLevel.color, borderRadius:20, width:`${Math.round(((xp - currentLevel.min)/(nextLevel2.min - currentLevel.min))*100)}%`, transition:'width 0.6s ease' }} />
            </div>
          )}
          <div style={{ display:'flex', gap:14, marginTop:10 }}>
            <span style={{ color:'var(--text-muted)', fontSize:12, fontFamily:'var(--font-mono)' }}>🔥 {streak.count}d streak</span>
            <span style={{ color:'var(--text-muted)', fontSize:12, fontFamily:'var(--font-mono)' }}>🏅 {achievements.length} badges</span>
          </div>
        </div>
      </div>

      {/* Path selector */}
      <div style={{ marginBottom:20 }}>
        <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Learning Paths — highlight your route</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={() => setSelectedPath(null)} style={{ background: selectedPath===null?'var(--bg-card)':'transparent', border:'1px solid var(--border)', color:'var(--text-secondary)', borderRadius:20, padding:'5px 14px', fontFamily:'var(--font-mono)', fontSize:11, cursor:'pointer' }}>
            All
          </button>
          {PATHS.map(p => (
            <button key={p.id} onClick={() => setSelectedPath(selectedPath===p.id ? null : p.id)} style={{
              background: selectedPath===p.id ? p.color+'22':'transparent',
              border: `1px solid ${selectedPath===p.id ? p.color+'66':'var(--border)'}`,
              color: selectedPath===p.id ? p.color : 'var(--text-secondary)',
              borderRadius:20, padding:'5px 14px', fontFamily:'var(--font-mono)', fontSize:11, cursor:'pointer', fontWeight: selectedPath===p.id ? 700:400,
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Tree SVG + hover panel side by side */}
      <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>

        {/* SVG tree */}
        <div style={{ flex:'1 1 500px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', overflow:'auto' }}>
          <svg width={svgW} height={svgH} style={{ display:'block', minWidth:svgW }}>
            {/* Background part labels */}
            {PARTS.map(part => {
              const partChapters = CHAPTERS.filter(c => c.part === part.id);
              if (!partChapters.length) return null;
              const ys = partChapters.map(c => nodeY(c.id));
              const minY = Math.min(...ys) - 36;
              return (
                <g key={part.id}>
                  <text x={12} y={minY + 14} fill={part.color + '60'} fontSize={10} fontFamily="var(--font-mono)" fontWeight="700" textTransform="uppercase">
                    Part {part.id}: {part.title}
                  </text>
                  <line x1={8} y1={minY+20} x2={svgW-8} y2={minY+20} stroke={part.color+'22'} strokeWidth={1} />
                </g>
              );
            })}

            {/* Edges (prereq connections) */}
            {CHAPTERS.map(ch => {
              const prereqs = PREREQS[ch.id] || [];
              return prereqs.map(pid => {
                const x1 = nodeX(pid), y1 = nodeY(pid) + NODE_R;
                const x2 = nodeX(ch.id), y2 = nodeY(ch.id) - NODE_R;
                const done  = !!progress[pid] && !!progress[ch.id];
                const inPath = selectedPath && PATHS.find(p=>p.id===selectedPath)?.chapters.includes(ch.id) && PATHS.find(p=>p.id===selectedPath)?.chapters.includes(pid);
                const pathColor = selectedPath ? PATHS.find(p=>p.id===selectedPath)?.color : null;
                return (
                  <path key={`${pid}-${ch.id}`}
                    d={`M${x1} ${y1} C${x1} ${(y1+y2)/2} ${x2} ${(y1+y2)/2} ${x2} ${y2}`}
                    fill="none"
                    stroke={inPath ? pathColor+'cc' : done ? '#00ff8855' : '#ffffff18'}
                    strokeWidth={inPath ? 2.5 : done ? 2 : 1}
                    strokeDasharray={done ? 'none' : '5 3'}
                  />
                );
              });
            })}

            {/* Chapter nodes */}
            {CHAPTERS.map(ch => {
              const unlocked  = isUnlocked(ch.id, progress);
              const done      = !!progress[ch.id];
              const isHovered = hovered === ch.id;
              const inPath    = selectedPath && PATHS.find(p=>p.id===selectedPath)?.chapters.includes(ch.id);
              const pathColor = selectedPath ? PATHS.find(p=>p.id===selectedPath)?.color : null;
              const cx = nodeX(ch.id), cy = nodeY(ch.id);
              const nodeColor = inPath ? pathColor : ch.color;

              return (
                <g key={ch.id}
                  style={{ cursor: unlocked ? 'pointer' : 'default' }}
                  onClick={() => unlocked && openChapter(ch)}
                  onMouseEnter={() => setHovered(ch.id)}
                  onMouseLeave={() => setHovered(null)}>

                  {/* Glow ring when hovered */}
                  {isHovered && <circle cx={cx} cy={cy} r={NODE_R+8} fill={nodeColor+'18'} stroke={nodeColor+'44'} strokeWidth={1} />}

                  {/* Done ring */}
                  {done && <circle cx={cx} cy={cy} r={NODE_R+4} fill="none" stroke={nodeColor+'55'} strokeWidth={2} strokeDasharray="4 2" />}

                  {/* Main node */}
                  <circle cx={cx} cy={cy} r={NODE_R}
                    fill={done ? nodeColor+'28' : unlocked ? nodeColor+'12' : '#0a0e1a'}
                    stroke={done ? nodeColor : unlocked ? nodeColor+'66' : '#ffffff18'}
                    strokeWidth={done ? 2 : 1.5}
                    opacity={!unlocked && !inPath ? 0.45 : 1}
                  />

                  {/* Emoji */}
                  <text x={cx} y={cy-4} textAnchor="middle" fontSize={18} opacity={unlocked ? 1 : 0.4}>{ch.emoji}</text>

                  {/* Chapter number */}
                  <text x={cx} y={cy+14} textAnchor="middle" fontSize={9} fill={done ? nodeColor : unlocked ? nodeColor+'cc' : '#ffffff44'} fontFamily="var(--font-mono)" fontWeight="700">
                    Ch.{ch.id}
                  </text>

                  {/* Done checkmark */}
                  {done && (
                    <text x={cx+NODE_R-4} y={cy-NODE_R+8} textAnchor="middle" fontSize={11} fill={nodeColor}>✓</text>
                  )}

                  {/* Lock icon */}
                  {!unlocked && (
                    <text x={cx} y={cy+5} textAnchor="middle" fontSize={16} fill="#ffffff22">🔒</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover info panel */}
        <div style={{ flex:'0 0 240px', minWidth:220, position:'sticky', top:80 }}>
          {hovered ? (() => {
            const ch  = CHAPTERS.find(c => c.id === hovered);
            const done = !!progress[ch.id];
            const unlocked = isUnlocked(ch.id, progress);
            const prereqs  = PREREQS[ch.id] || [];
            return (
              <div style={{ background:`linear-gradient(135deg,${ch.color}18,${ch.color}06)`, border:`2px solid ${ch.color}50`, borderRadius:'var(--radius-xl)', padding:'20px', animation:'fadeIn 0.15s ease' }}>
                <div style={{ fontSize:40, marginBottom:10 }}>{ch.emoji}</div>
                <div style={{ color:ch.color, fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Chapter {ch.id} · {ch.duration}</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--text-primary)', lineHeight:1.3, marginBottom:12 }}>{ch.title}</div>
                {done && <div style={{ color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:11, marginBottom:10 }}>✓ Completed</div>}
                {!unlocked && prereqs.length > 0 && (
                  <div style={{ color:'var(--text-muted)', fontSize:12, marginBottom:12 }}>
                    🔒 Requires: {prereqs.map(p => `Ch.${p}`).join(', ')}
                  </div>
                )}
                {unlocked && (
                  <button onClick={() => openChapter(ch)} style={{ width:'100%', background:ch.color, color:'#000', border:'none', borderRadius:'var(--radius-md)', padding:'10px', fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                    {done ? 'Review Chapter →' : 'Start Chapter →'}
                  </button>
                )}
              </div>
            );
          })() : (
            <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'20px', textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>👆</div>
              <div style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.6 }}>Hover any chapter node to preview it. Click to open.</div>
              <div style={{ marginTop:16, padding:'12px', background:'var(--bg-card)', borderRadius:'var(--radius-lg)' }}>
                <div style={{ color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:22, fontWeight:900 }}>{completedCount}/22</div>
                <div style={{ color:'var(--text-muted)', fontSize:12, marginTop:2 }}>chapters complete</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
