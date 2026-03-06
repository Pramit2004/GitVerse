import React, { useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════
   TEAM SIMULATOR
   3 developers (You, Alice, Bob) each with their own
   local repo + a shared GitHub remote.
   Shows WHY Git exists: what happens when two people
   edit the same file, why push/pull is needed, conflicts.
═══════════════════════════════════════════════════════ */

const DEVS = {
  you:   { name: 'You',   icon: '💻', color: '#51cf66' },
  alice: { name: 'Alice', icon: '👩‍💻', color: '#cc5de8' },
  bob:   { name: 'Bob',   icon: '👨‍💻', color: '#ffb347' },
};

const INIT_REMOTE = [
  { id:1, by:'you',  hash:'a1b2c3d', msg:'Initial commit — index.html',  file:'index.html', content:'<h1>Hello World</h1>' },
];

const FILE_OPTIONS = [
  { id:'index', name:'index.html', snippets: ['<nav>Add navigation</nav>', '<footer>Add footer</footer>', '<button>Add button</button>'] },
  { id:'style',  name:'style.css',   snippets: ['body { font-size: 16px; }', '.dark { background:#000; }', 'h1 { color: blue; }'] },
  { id:'app',    name:'app.js',      snippets: ['console.log("ready")', 'const x = 42;', 'fetch("/api")'] },
];

let _uid = 2;

export default function TeamSimulator({ color = '#51cf66' }) {
  const [remoteCommits, setRemoteCommits]   = useState(INIT_REMOTE);
  const [localRepos,    setLocalRepos]      = useState({
    you:   { commits: [...INIT_REMOTE], upToDate: true },
    alice: { commits: [...INIT_REMOTE], upToDate: true },
    bob:   { commits: [...INIT_REMOTE], upToDate: true },
  });
  const [log, setLog]             = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [activeStep, setActiveStep] = useState(null);

  const addLog = (msg, color, icon='→') => setLog(l => [{ msg, color, icon, id: _uid }, ...l].slice(0, 8));

  // Make a commit for a dev (local only, not pushed)
  const doCommit = (dev, fileOption, snippetIdx) => {
    const file   = fileOption.name;
    const change = fileOption.snippets[snippetIdx];
    const id     = _uid++;
    const hash   = Math.random().toString(36).substr(2,7);
    const newCommit = { id, by:dev, hash, msg:`${change.slice(0,30)}…`, file, content:change };
    setLocalRepos(r => ({
      ...r,
      [dev]: { commits: [...r[dev].commits, newCommit], upToDate: false },
    }));
    addLog(`${DEVS[dev].icon} ${DEVS[dev].name} committed: "${change.slice(0,25)}"`, DEVS[dev].color, '✎');
    setActiveStep({ type:'committed', dev, hash, msg: change.slice(0,40) });
  };

  // Push dev's local commits to remote
  const doPush = (dev) => {
    const local  = localRepos[dev];
    const newCommits = local.commits.filter(c => !remoteCommits.find(r => r.id === c.id));
    if (!newCommits.length) {
      addLog(`${DEVS[dev].icon} Nothing to push — already up to date`, DEVS[dev].color, '✓');
      return;
    }
    // Check for conflict: remote has commits this dev doesn't have
    const remoteBehind = remoteCommits.some(rc => !local.commits.find(lc => lc.id === rc.id));
    if (remoteBehind) {
      setConflicts(c => [...c, { dev, msg:`${DEVS[dev].name} must pull first — remote has changes you don't have locally` }]);
      addLog(`${DEVS[dev].icon} Push REJECTED — pull first!`, '#ff6b6b', '✗');
      setActiveStep({ type:'conflict', dev });
      return;
    }
    setRemoteCommits(r => [...r, ...newCommits]);
    setLocalRepos(r => ({ ...r, [dev]: { ...r[dev], upToDate: true } }));
    addLog(`${DEVS[dev].icon} ${DEVS[dev].name} pushed ${newCommits.length} commit(s) to GitHub`, DEVS[dev].color, '↑');
    setActiveStep({ type:'pushed', dev, count: newCommits.length });
    setConflicts(c => c.filter(x => x.dev !== dev));
  };

  // Pull remote commits into dev's local
  const doPull = (dev) => {
    const local = localRepos[dev];
    const missing = remoteCommits.filter(rc => !local.commits.find(lc => lc.id === rc.id));
    if (!missing.length) {
      addLog(`${DEVS[dev].icon} Already up to date`, DEVS[dev].color, '✓');
      return;
    }
    setLocalRepos(r => ({ ...r, [dev]: { commits: [...r[dev].commits, ...missing], upToDate: true } }));
    addLog(`${DEVS[dev].icon} ${DEVS[dev].name} pulled ${missing.length} new commit(s) from GitHub`, DEVS[dev].color, '↓');
    setActiveStep({ type:'pulled', dev, count: missing.length });
    setConflicts(c => c.filter(x => x.dev !== dev));
  };

  const reset = () => {
    setRemoteCommits(INIT_REMOTE);
    setLocalRepos({ you: { commits:[...INIT_REMOTE], upToDate:true }, alice:{commits:[...INIT_REMOTE], upToDate:true}, bob:{commits:[...INIT_REMOTE], upToDate:true} });
    setLog([]); setConflicts([]); setActiveStep(null); _uid = 2;
  };

  const remoteAhead = (dev) => remoteCommits.some(rc => !localRepos[dev].commits.find(lc => lc.id === rc.id));
  const localAhead  = (dev) => localRepos[dev].commits.some(lc => !remoteCommits.find(rc => rc.id === lc.id));

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
          🤝 Team Simulator
        </h3>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>
          Three developers, one shared repo. Make commits, push, pull — and see what happens when people work on the same code simultaneously.
        </p>
      </div>

      {/* Conflict banners */}
      {conflicts.map((c, i) => (
        <div key={i} style={{ background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.3)', borderRadius:'var(--radius-md)', padding:'10px 14px', marginBottom:10, display:'flex', gap:10, animation:'fadeIn 0.2s ease' }}>
          <span>⚠️</span>
          <span style={{ color:'var(--red)', fontSize:13 }}>{c.msg}</span>
        </div>
      ))}

      {/* Active step explanation */}
      {activeStep && (
        <div style={{ background:DEVS[activeStep.dev]?.color+'10', border:`1px solid ${DEVS[activeStep.dev]?.color||'var(--border)'}30`, borderRadius:'var(--radius-lg)', padding:'12px 16px', marginBottom:14, fontSize:13, color:'var(--text-secondary)', animation:'fadeIn 0.2s ease' }}>
          {activeStep.type === 'committed' && <>✎ <strong style={{color:'var(--text-primary)'}}>Local commit created.</strong> This only exists on {DEVS[activeStep.dev].name}'s machine. Others cannot see it yet — push to share it.</>}
          {activeStep.type === 'pushed'    && <>↑ <strong style={{color:'var(--text-primary)'}}>Pushed to GitHub!</strong> {activeStep.count} commit(s) are now visible to everyone. Others need to pull to get them.</>}
          {activeStep.type === 'pulled'    && <>↓ <strong style={{color:'var(--text-primary)'}}>Pulled {activeStep.count} commit(s).</strong> {DEVS[activeStep.dev].name}'s local repo is now up to date with GitHub.</>}
          {activeStep.type === 'conflict'  && <>⚠️ <strong style={{color:'var(--red)'}}>Push rejected!</strong> GitHub has commits that {DEVS[activeStep.dev].name} doesn't have locally. Pull first to merge them, then push.</>}
        </div>
      )}

      {/* GitHub Remote — center top */}
      <div style={{ background:'rgba(77,171,247,0.08)', border:'2px solid rgba(77,171,247,0.3)', borderRadius:'var(--radius-xl)', padding:'14px 18px', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <span style={{ fontSize:22 }}>🌐</span>
          <div>
            <div style={{ color:'#4dabf7', fontWeight:700, fontSize:14 }}>GitHub (Remote) — Shared by everyone</div>
            <div style={{ color:'var(--text-muted)', fontSize:12 }}>{remoteCommits.length} commits visible to all</div>
          </div>
          <button onClick={reset} style={{ marginLeft:'auto', background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:'var(--radius-md)', padding:'4px 10px', fontFamily:'var(--font-mono)', fontSize:11, cursor:'pointer' }}>Reset</button>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {remoteCommits.map(c => (
            <div key={c.id} style={{ background:DEVS[c.by]?.color+'18', border:`1px solid ${DEVS[c.by]?.color||'#fff'}33`, borderRadius:8, padding:'4px 10px', display:'flex', gap:6, alignItems:'center' }}>
              <span style={{ fontSize:11 }}>{DEVS[c.by]?.icon}</span>
              <code style={{ color:DEVS[c.by]?.color, fontFamily:'var(--font-mono)', fontSize:10 }}>{c.hash}</code>
              <span style={{ color:'var(--text-muted)', fontSize:10 }}>{c.msg.slice(0,22)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Developer cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:16 }}>
        {Object.entries(DEVS).map(([id, dev]) => {
          const local = localRepos[id];
          const ahead = localAhead(id);
          const behind = remoteAhead(id);
          const localOnly = local.commits.filter(lc => !remoteCommits.find(rc => rc.id === lc.id));
          return (
            <div key={id} style={{ background:`linear-gradient(135deg,${dev.color}12,${dev.color}05)`, border:`1px solid ${dev.color}35`, borderRadius:'var(--radius-xl)', padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <span style={{ fontSize:20 }}>{dev.icon}</span>
                <div>
                  <div style={{ color:dev.color, fontWeight:700, fontSize:14 }}>{dev.name}</div>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:2 }}>
                    {ahead  && <span style={{ background:'rgba(255,183,71,0.15)', color:'#ffb347', fontSize:9, fontFamily:'var(--font-mono)', padding:'1px 6px', borderRadius:20 }}>↑ unpushed</span>}
                    {behind && <span style={{ background:'rgba(77,171,247,0.15)', color:'#4dabf7', fontSize:9, fontFamily:'var(--font-mono)', padding:'1px 6px', borderRadius:20 }}>↓ behind remote</span>}
                    {!ahead && !behind && <span style={{ background:'var(--green-glow)', color:'var(--green)', fontSize:9, fontFamily:'var(--font-mono)', padding:'1px 6px', borderRadius:20 }}>✓ synced</span>}
                  </div>
                </div>
              </div>

              {/* Local commits */}
              <div style={{ marginBottom:10 }}>
                <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>Local repo ({local.commits.length})</div>
                <div style={{ display:'flex', flexDirection:'column', gap:3, maxHeight:90, overflowY:'auto' }}>
                  {local.commits.slice(-4).map(c => {
                    const isLocalOnly = !remoteCommits.find(r => r.id === c.id);
                    return (
                      <div key={c.id} style={{ display:'flex', gap:6, alignItems:'center' }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:isLocalOnly?'#ffb347':dev.color, flexShrink:0 }} />
                        <code style={{ color:isLocalOnly?'#ffb347':dev.color, fontFamily:'var(--font-mono)', fontSize:9, flexShrink:0 }}>{c.hash}</code>
                        <span style={{ color:'var(--text-muted)', fontSize:9, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.msg.slice(0,20)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {/* Commit: pick a file+change */}
                <div style={{ position:'relative' }}>
                  <select defaultValue="" onChange={e => {
                    if (!e.target.value) return;
                    const [fi, si] = e.target.value.split('_').map(Number);
                    doCommit(id, FILE_OPTIONS[fi], si);
                    e.target.value = '';
                  }} style={{ width:'100%', background:'var(--bg-card)', border:`1px solid ${dev.color}44`, color:'var(--text-secondary)', borderRadius:'var(--radius-md)', padding:'6px 10px', fontFamily:'var(--font-mono)', fontSize:11, cursor:'pointer' }}>
                    <option value="">✎ Make a commit...</option>
                    {FILE_OPTIONS.map((f, fi) => f.snippets.map((s, si) => (
                      <option key={`${fi}_${si}`} value={`${fi}_${si}`}>{f.name}: {s.slice(0,28)}</option>
                    )))}
                  </select>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => doPush(id)} style={{ flex:1, background:ahead?dev.color:'var(--bg-card)', border:`1px solid ${ahead?dev.color+'80':'var(--border)'}`, color:ahead?'#000':'var(--text-muted)', borderRadius:'var(--radius-md)', padding:'6px', fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    ↑ Push
                  </button>
                  <button onClick={() => doPull(id)} style={{ flex:1, background:behind?'#4dabf7':'var(--bg-card)', border:`1px solid ${behind?'#4dabf780':'var(--border)'}`, color:behind?'#000':'var(--text-muted)', borderRadius:'var(--radius-md)', padding:'6px', fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    ↓ Pull
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event log */}
      {log.length > 0 && (
        <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'12px 16px' }}>
          <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Event stream</div>
          {log.map(l => (
            <div key={l.id} style={{ display:'flex', gap:10, marginBottom:5, animation:'fadeInRight 0.2s ease' }}>
              <span style={{ color:l.color, fontSize:13, flexShrink:0 }}>{l.icon}</span>
              <span style={{ color:'var(--text-secondary)', fontSize:12 }}>{l.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
