import React, { useState, useRef } from 'react';

/* ═══════════════════════════════════════════════════════
   GIT COMMAND MAP — Spatial mental model visualizer
   Three zones: Working Dir, Staging Area, Repository
   Plus a fourth: Remote (GitHub)
   Each command button fires animated particles moving
   between zones so beginners see WHERE data moves.
═══════════════════════════════════════════════════════ */

const ZONES = {
  working:  { label:'Working Directory', sub:'Your files — where you type code', icon:'📝', color:'#ff6b6b', x:0   },
  staging:  { label:'Staging Area',      sub:'"Cart" — files ready to commit',  icon:'🎯', color:'#ffb347', x:33  },
  repo:     { label:'Repository (.git)', sub:'Permanent history on your disk',   icon:'🗄️', color:'#51cf66', x:66  },
  remote:   { label:'GitHub (Remote)',   sub:'The cloud — shared with the team', icon:'🌐', color:'#4dabf7', x:100 },
};

const COMMANDS = [
  { cmd:'git add .',      from:'working', to:'staging',  label:'Files move to staging area',          color:'#ffb347', icon:'→' },
  { cmd:'git commit',     from:'staging', to:'repo',     label:'Snapshot saved to local repository',  color:'#51cf66', icon:'→' },
  { cmd:'git push',       from:'repo',    to:'remote',   label:'Commits uploaded to GitHub',           color:'#4dabf7', icon:'↑' },
  { cmd:'git pull',       from:'remote',  to:'working',  label:'Download + merge from GitHub',         color:'#ff6b6b', icon:'↓' },
  { cmd:'git fetch',      from:'remote',  to:'repo',     label:'Download only — no merge yet',         color:'#cc5de8', icon:'↓' },
  { cmd:'git restore',    from:'repo',    to:'working',  label:'Discard working directory changes',    color:'#ff6b6b', icon:'←' },
  { cmd:'git restore --staged', from:'staging', to:'working', label:'Unstage — move file back to working', color:'#ffb347', icon:'←' },
  { cmd:'git clone',      from:'remote',  to:'repo',     label:'Download the entire repo from scratch', color:'#4dabf7', icon:'↓' },
  { cmd:'git stash',      from:'working', to:'repo',     label:'Temporarily save uncommitted work',    color:'#63e6be', icon:'→' },
  { cmd:'git stash pop',  from:'repo',    to:'working',  label:'Restore the most recent stash',        color:'#63e6be', icon:'←' },
];

let _pid = 0;

export default function GitCommandMap({ color = '#51cf66' }) {
  const [activeCmd, setActiveCmd]  = useState(null);
  const [particles, setParticles]  = useState([]);
  const [filledZones, setFilledZones] = useState({ working: true, staging: false, repo: true, remote: true });

  const fire = (cmd) => {
    setActiveCmd(cmd);
    const id = ++_pid;
    setParticles(p => [...p, { id, from: cmd.from, to: cmd.to, color: cmd.color, born: Date.now() }]);
    setTimeout(() => setParticles(p => p.filter(x => x.id !== id)), 900);

    // Update zone fill state for realism
    if (cmd.cmd === 'git add .') setFilledZones(z => ({ ...z, staging: true }));
    if (cmd.cmd === 'git commit') setFilledZones(z => ({ ...z, staging: false, repo: true }));
    if (cmd.cmd === 'git push')  setFilledZones(z => ({ ...z, remote: true }));
    if (cmd.cmd === 'git restore --staged') setFilledZones(z => ({ ...z, staging: false }));
  };

  // Zone positions as % widths for the particle track
  const zoneX = { working:8, staging:37, repo:65, remote:91 };

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
          🗺️ Git Command Map
        </h3>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>
          Press any command to watch your files <em style={{color:'var(--text-secondary)'}}>physically move</em> between zones. This is the mental model every Git user must build.
        </p>
      </div>

      {/* Zone track */}
      <div style={{ position:'relative', marginBottom:20 }}>
        {/* Connector line */}
        <div style={{ position:'absolute', top:'50%', left:'8%', right:'8%', height:2, background:'linear-gradient(90deg,#ff6b6b44,#ffb34744,#51cf6644,#4dabf744)', zIndex:0 }} />

        {/* Zone boxes */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, position:'relative', zIndex:1 }}>
          {Object.entries(ZONES).map(([id, z]) => (
            <div key={id} style={{
              background: `linear-gradient(135deg,${z.color}18,${z.color}08)`,
              border: `2px solid ${activeCmd?.from===id||activeCmd?.to===id ? z.color+'88' : z.color+'28'}`,
              borderRadius:'var(--radius-lg)', padding:'14px 10px', textAlign:'center',
              transition:'all 0.2s',
              boxShadow: activeCmd?.from===id||activeCmd?.to===id ? `0 0 20px ${z.color}30` : 'none',
            }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{z.icon}</div>
              <div style={{ color:z.color, fontWeight:700, fontSize:11, fontFamily:'var(--font-mono)', marginBottom:4 }}>{z.label}</div>
              <div style={{ color:'var(--text-muted)', fontSize:10, lineHeight:1.4 }}>{z.sub}</div>
              {/* Files indicator */}
              <div style={{ marginTop:8, display:'flex', justifyContent:'center', gap:3, flexWrap:'wrap' }}>
                {filledZones[id] && ['📄','📄','📄'].slice(0, id==='staging' ? 2 : 3).map((f,i) => (
                  <span key={i} style={{ fontSize:10 }}>{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Particle track overlay (purely visual) */}
        <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, pointerEvents:'none', zIndex:2 }}>
          {particles.map(pk => {
            const fromX = zoneX[pk.from], toX = zoneX[pk.to];
            return (
              <div key={pk.id} style={{
                position:'absolute', top:'44%',
                left:`${fromX}%`,
                width:14, height:14, borderRadius:'50%',
                background: pk.color,
                boxShadow:`0 0 12px ${pk.color}`,
                animation:`particleMove 0.85s cubic-bezier(0.4,0,0.2,1) forwards`,
                '--to': `${toX - fromX}vw`, // used in keyframe via custom property isn't fully supported
              }}>
                <style>{`
                  @keyframes pm_${pk.id} {
                    0%   { left:${fromX}%; opacity:0; transform:scale(0.5) }
                    15%  { opacity:1; transform:scale(1.2) }
                    85%  { opacity:1; }
                    100% { left:${toX}%; opacity:0; transform:scale(0.4) }
                  }
                `}</style>
                <div style={{
                  position:'absolute', top:0, left:0, width:14, height:14, borderRadius:'50%',
                  background:pk.color, boxShadow:`0 0 12px ${pk.color}`,
                  animation:`pm_${pk.id} 0.85s cubic-bezier(0.4,0,0.2,1) forwards`,
                }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Active command description */}
      {activeCmd && (
        <div style={{ background:activeCmd.color+'12', border:`1px solid ${activeCmd.color}35`, borderRadius:'var(--radius-lg)', padding:'12px 16px', marginBottom:14, animation:'fadeIn 0.15s ease', display:'flex', gap:14, alignItems:'center' }}>
          <span style={{ fontSize:28 }}>{activeCmd.icon}</span>
          <div>
            <code style={{ color:activeCmd.color, fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700 }}>{activeCmd.cmd}</code>
            <div style={{ color:'var(--text-secondary)', fontSize:13, marginTop:3 }}>{activeCmd.label}</div>
            <div style={{ color:'var(--text-muted)', fontSize:12, marginTop:2, fontFamily:'var(--font-mono)' }}>
              {ZONES[activeCmd.from].icon} {ZONES[activeCmd.from].label} → {ZONES[activeCmd.to].icon} {ZONES[activeCmd.to].label}
            </div>
          </div>
        </div>
      )}

      {/* Command buttons grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:8 }}>
        {COMMANDS.map(cmd => (
          <button key={cmd.cmd} onClick={() => fire(cmd)} style={{
            background: activeCmd?.cmd===cmd.cmd ? cmd.color+'18' : 'var(--bg-elevated)',
            border: `1px solid ${activeCmd?.cmd===cmd.cmd ? cmd.color+'55' : 'var(--border)'}`,
            color: activeCmd?.cmd===cmd.cmd ? cmd.color : 'var(--text-secondary)',
            borderRadius:'var(--radius-md)', padding:'9px 14px', cursor:'pointer',
            fontFamily:'var(--font-mono)', fontSize:11, fontWeight:600,
            textAlign:'left', transition:'all 0.12s',
            display:'flex', alignItems:'center', gap:8,
          }}>
            <span style={{ fontSize:14 }}>{ZONES[cmd.from].icon}→{ZONES[cmd.to].icon}</span>
            <span>{cmd.cmd}</span>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ marginTop:14, display:'flex', gap:14, flexWrap:'wrap' }}>
        {Object.entries(ZONES).map(([id, z]) => (
          <div key={id} style={{ display:'flex', gap:6, alignItems:'center' }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:z.color }} />
            <span style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'var(--font-mono)' }}>{z.icon} {z.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
