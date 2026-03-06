import React, { useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════
   BRANCH GARDEN — Living tree visualization
   Branches = real growing tree branches
   Commits = leaves/fruits on each branch
   Merge = two branches physically joining
═══════════════════════════════════════════════════════ */

const PALETTE = ['#51cf66','#4dabf7','#cc5de8','#ffb347','#ff6b6b','#63e6be'];
let _nextId = 1;
const uid = () => _nextId++;

const INIT_COMMITS = [
  { id:1, branch:'main', msg:'🌱 Initial commit',    parent:null, color:'#51cf66' },
  { id:2, branch:'main', msg:'📄 Add README',         parent:1,    color:'#51cf66' },
  { id:3, branch:'main', msg:'⚙️ Configure project',  parent:2,    color:'#51cf66' },
];
const INIT_BRANCHES = [{ name:'main', head:3, color:'#51cf66', from:null }];

export default function BranchGarden({ color = '#51cf66' }) {
  const [commits, setCommits]   = useState(INIT_COMMITS);
  const [branches, setBranches] = useState(INIT_BRANCHES);
  const [current, setCurrent]   = useState('main');
  const [newBranchName, setNewBranchName] = useState('');
  const [newCommitMsg,  setNewCommitMsg]  = useState('');
  const [mergeTarget,   setMergeTarget]   = useState('');
  const [log, setLog] = useState([]);
  const [mode, setMode] = useState(null); // 'branch'|'commit'|'merge'

  const addLog = (msg, c) => setLog(l => [{ msg, c, id: uid() }, ...l].slice(0, 6));

  const currentBranch = branches.find(b => b.name === current);

  const doNewBranch = () => {
    const name = newBranchName.trim();
    if (!name || branches.find(b => b.name === name)) return;
    const c = PALETTE[branches.length % PALETTE.length];
    setBranches(p => [...p, { name, head: currentBranch.head, color: c, from: current }]);
    setCurrent(name);
    setNewBranchName('');
    setMode(null);
    addLog(`git switch -c ${name}`, c);
  };

  const doCommit = () => {
    const msg = newCommitMsg.trim() || `Update on ${current}`;
    const id  = uid();
    const newCommit = { id, branch: current, msg, parent: currentBranch.head, color: currentBranch.color };
    setCommits(p => [...p, newCommit]);
    setBranches(p => p.map(b => b.name === current ? { ...b, head: id } : b));
    setNewCommitMsg('');
    setMode(null);
    addLog(`git commit -m "${msg}"`, currentBranch.color);
  };

  const doMerge = () => {
    if (!mergeTarget || mergeTarget === current) return;
    const srcBranch = branches.find(b => b.name === mergeTarget);
    if (!srcBranch) return;
    const id = uid();
    const mergeCommit = {
      id, branch: current,
      msg: `🔀 Merge ${mergeTarget} → ${current}`,
      parent: currentBranch.head,
      parent2: srcBranch.head,
      color: currentBranch.color,
      isMerge: true,
    };
    setCommits(p => [...p, mergeCommit]);
    setBranches(p => p.map(b => b.name === current ? { ...b, head: id } : b));
    setMergeTarget('');
    setMode(null);
    addLog(`git merge ${mergeTarget}`, currentBranch.color);
  };

  const reset = () => {
    setCommits(INIT_COMMITS);
    setBranches(INIT_BRANCHES);
    setCurrent('main');
    setLog([]);
    setMode(null);
    _nextId = 4;
  };

  // ── Layout: build tree positions ─────────────────────
  // Each branch gets a lane (x). Commits stack upward (y).
  const branchLane = (name) => branches.findIndex(b => b.name === name);
  const LANE_W = 80, NODE_H = 52, PAD_X = 40, PAD_Y = 20;

  // Assign y positions: commits in chronological order
  const commitY = {};
  commits.forEach((c, i) => { commitY[c.id] = PAD_Y + i * NODE_H; });

  const svgH = Math.max(240, commits.length * NODE_H + PAD_Y * 2);
  const svgW = Math.max(240, branches.length * LANE_W + PAD_X * 2);

  const commitX = (c) => PAD_X + branchLane(c.branch) * LANE_W;

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
          🌿 Branch Garden
        </h3>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>
          Branches are like parallel timelines. Create a branch, add commits, then merge it back. Watch the tree grow.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>On:</span>
        <select value={current} onChange={e => setCurrent(e.target.value)}
          style={{ background:'var(--bg-card)', border:`1px solid ${currentBranch?.color||'var(--border)'}`, color:currentBranch?.color||'var(--text-primary)', borderRadius:'var(--radius-md)', padding:'5px 10px', fontFamily:'var(--font-mono)', fontSize:12, cursor:'pointer' }}>
          {branches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
        </select>

        {[
          { id:'commit', label:'+ Commit', c:'#51cf66' },
          { id:'branch', label:'⎇ Branch', c:'#4dabf7' },
          { id:'merge',  label:'⇒ Merge',  c:'#cc5de8' },
        ].map(btn => (
          <button key={btn.id} onClick={() => setMode(mode===btn.id ? null : btn.id)} style={{
            background: mode===btn.id ? btn.c+'22':'var(--bg-elevated)',
            border: `1px solid ${mode===btn.id ? btn.c+'55':'var(--border)'}`,
            color: mode===btn.id ? btn.c : 'var(--text-secondary)',
            borderRadius:'var(--radius-md)', padding:'6px 14px',
            fontFamily:'var(--font-mono)', fontSize:12, cursor:'pointer', fontWeight: mode===btn.id ? 700:400,
          }}>{btn.label}</button>
        ))}
        <button onClick={reset} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:'var(--radius-md)', padding:'6px 12px', fontFamily:'var(--font-mono)', fontSize:11, cursor:'pointer', marginLeft:'auto' }}>Reset</button>
      </div>

      {/* Inline input panels */}
      {mode === 'commit' && (
        <div style={{ display:'flex', gap:8, marginBottom:12, animation:'fadeIn 0.15s ease' }}>
          <input value={newCommitMsg} onChange={e => setNewCommitMsg(e.target.value)}
            placeholder={`Commit message on ${current}...`} onKeyDown={e => e.key==='Enter' && doCommit()}
            style={{ flex:1, background:'var(--bg-card)', border:`1px solid ${currentBranch?.color||'var(--border)'}40`, borderRadius:'var(--radius-md)', padding:'8px 12px', color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontSize:12, outline:'none' }}
            autoFocus />
          <button onClick={doCommit} style={{ background:currentBranch?.color||color, color:'#000', border:'none', borderRadius:'var(--radius-md)', padding:'8px 16px', fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, cursor:'pointer' }}>Commit</button>
        </div>
      )}
      {mode === 'branch' && (
        <div style={{ display:'flex', gap:8, marginBottom:12, animation:'fadeIn 0.15s ease' }}>
          <input value={newBranchName} onChange={e => setNewBranchName(e.target.value)}
            placeholder="New branch name..." onKeyDown={e => e.key==='Enter' && doNewBranch()}
            style={{ flex:1, background:'var(--bg-card)', border:'1px solid #4dabf740', borderRadius:'var(--radius-md)', padding:'8px 12px', color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontSize:12, outline:'none' }}
            autoFocus />
          <button onClick={doNewBranch} style={{ background:'#4dabf7', color:'#000', border:'none', borderRadius:'var(--radius-md)', padding:'8px 16px', fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, cursor:'pointer' }}>Create</button>
        </div>
      )}
      {mode === 'merge' && (
        <div style={{ display:'flex', gap:8, marginBottom:12, animation:'fadeIn 0.15s ease', flexWrap:'wrap' }}>
          <select value={mergeTarget} onChange={e => setMergeTarget(e.target.value)}
            style={{ flex:1, background:'var(--bg-card)', border:'1px solid #cc5de840', borderRadius:'var(--radius-md)', padding:'8px 12px', color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontSize:12 }}>
            <option value="">Merge which branch → {current}?</option>
            {branches.filter(b => b.name !== current).map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
          </select>
          <button onClick={doMerge} disabled={!mergeTarget} style={{ background:mergeTarget?'#cc5de8':'var(--bg-card)', color:mergeTarget?'#fff':'var(--text-muted)', border:'none', borderRadius:'var(--radius-md)', padding:'8px 16px', fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, cursor:mergeTarget?'pointer':'default' }}>Merge</button>
        </div>
      )}

      {/* Tree SVG */}
      <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', overflow:'auto', padding:'12px' }}>
        {/* Branch labels row */}
        <div style={{ display:'flex', gap:0, paddingLeft:PAD_X, marginBottom:8, minWidth:svgW }}>
          {branches.map(b => (
            <div key={b.name} style={{ width:LANE_W, textAlign:'center' }}>
              <span style={{ background:b.color+'22', color:b.color, border:`1px solid ${b.color}44`, padding:'2px 10px', borderRadius:20, fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700 }}>
                {b.name === current ? '* ' : ''}{b.name}
              </span>
            </div>
          ))}
        </div>
        <svg width={svgW} height={svgH} style={{ display:'block', minWidth:svgW }}>
          {/* Edges */}
          {commits.map(c => {
            if (!c.parent) return null;
            const x1 = commitX(c), y1 = commitY[c.id]+16;
            const p  = commits.find(x => x.id === c.parent);
            if (!p) return null;
            const x2 = commitX(p), y2 = commitY[p.id]+16;
            return (
              <path key={c.id+'e'}
                d={x1===x2 ? `M${x1} ${y1} L${x2} ${y2}` : `M${x1} ${y1} C${x1} ${(y1+y2)/2} ${x2} ${(y1+y2)/2} ${x2} ${y2}`}
                fill="none" stroke={c.color+'66'} strokeWidth={2}
                strokeDasharray={c.isMerge ? '4 2' : 'none'}
              />
            );
          })}
          {/* Merge parent2 edge */}
          {commits.filter(c => c.parent2).map(c => {
            const p2 = commits.find(x => x.id === c.parent2);
            if (!p2) return null;
            const x1 = commitX(c), y1 = commitY[c.id]+16;
            const x2 = commitX(p2), y2 = commitY[p2.id]+16;
            return (
              <path key={c.id+'m2'}
                d={`M${x1} ${y1} C${x1} ${(y1+y2)/2} ${x2} ${(y1+y2)/2} ${x2} ${y2}`}
                fill="none" stroke={'#cc5de8'+'66'} strokeWidth={2} strokeDasharray="4 2"
              />
            );
          })}
          {/* Commit nodes */}
          {commits.map(c => {
            const cx = commitX(c), cy = commitY[c.id]+16;
            const bHead = branches.find(b => b.head === c.id);
            return (
              <g key={c.id}>
                {c.isMerge && (
                  <circle cx={cx} cy={cy} r={20} fill="none" stroke={'#cc5de8'+'44'} strokeWidth={1} />
                )}
                <circle cx={cx} cy={cy} r={bHead?14:10} fill={c.color+'22'} stroke={c.color} strokeWidth={bHead?2:1.5} />
                <text x={cx} y={cy+4} textAnchor="middle" fill={c.color} fontSize={c.isMerge?12:10} fontFamily="var(--font-mono)">
                  {c.isMerge ? '⇒' : '●'}
                </text>
                {/* HEAD marker */}
                {bHead && (
                  <text x={cx+18} y={cy-10} fill={c.color} fontSize={8} fontFamily="var(--font-mono)" fontWeight="700">{bHead.name}</text>
                )}
                {/* Commit message tooltip */}
                <title>{c.msg}</title>
                <text x={cx} y={cy+26} textAnchor="middle" fill="var(--text-muted)" fontSize={7} fontFamily="var(--font-mono)">
                  {c.msg.length > 14 ? c.msg.slice(0,13)+'…' : c.msg}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Git log */}
      {log.length > 0 && (
        <div style={{ marginTop:12, background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'10px 14px' }}>
          <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:7 }}>Commands run</div>
          {log.map(l => (
            <div key={l.id} style={{ display:'flex', gap:10, marginBottom:4, animation:'fadeInRight 0.2s ease' }}>
              <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>$</span>
              <code style={{ color:l.c, fontFamily:'var(--font-mono)', fontSize:11 }}>{l.msg}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
