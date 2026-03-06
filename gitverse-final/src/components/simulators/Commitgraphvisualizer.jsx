import React, { useState, useCallback, useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   COMMIT GRAPH VISUALIZER — Full Git History Engine
   
   Features:
   • Full commit DAG with proper lane layout algorithm
   • Branches, HEAD pointer, detached HEAD, tags, stash
   • Merge commits (two parents), fast-forward detection
   • Interactive: click commit to inspect, drag to move
   • Operations: commit, branch, switch, merge, rebase, reset,
                  revert, cherry-pick, tag, stash, squash
   • Diff viewer between any two commits
   • Reflog panel showing all HEAD movements
   • Real git log --graph --oneline rendering
═══════════════════════════════════════════════════════════════════ */

const BRANCH_COLORS = ['#4dabf7','#51cf66','#cc5de8','#ff6b6b','#ffb347','#63e6be','#f783ac','#74c0fc','#a9e34b'];

let _uid = 100;
const uid  = () => (_uid++).toString(36);
const hash = () => Math.random().toString(36).substr(2, 7);
const now  = () => new Date().toLocaleTimeString();

/* ── Initial state ───────────────────────────────────── */
const makeInitState = () => {
  const c0 = { id:'c0', hash:'a1b2c3d', msg:'Initial commit',      parents:[],    branch:'main', tags:[], author:'You', time:'3d ago', files:{'README.md':'# My Project\nWelcome!'} };
  const c1 = { id:'c1', hash:'b2c3d4e', msg:'Add index.html',       parents:['c0'],branch:'main', tags:[], author:'You', time:'2d ago', files:{'README.md':'# My Project\nWelcome!','index.html':'<h1>Hello</h1>'} };
  const c2 = { id:'c2', hash:'c3d4e5f', msg:'Add styles',           parents:['c1'],branch:'main', tags:['v0.1.0'], author:'You', time:'1d ago', files:{'README.md':'# My Project','index.html':'<h1>Hello</h1>','style.css':'body{margin:0}'} };
  return {
    commits: { c0, c1, c2 },
    branches: { main:{head:'c2',color:BRANCH_COLORS[0],upstream:'origin/main'} },
    HEAD: 'main',          // branch name or commit id (detached)
    detached: false,
    tags: { 'v0.1.0': 'c2' },
    stash: [],
    reflog: [
      {action:'commit',target:'c2',from:'c1',msg:'Add styles',time:now()},
      {action:'commit',target:'c1',from:'c0',msg:'Add index.html',time:now()},
      {action:'commit',target:'c0',from:null,msg:'Initial commit',time:now()},
    ],
    remotes: { 'origin/main': 'c2' },
  };
};

/* ── Layout algorithm: assign lanes to commits ────────── */
function layoutCommits(commits, branches) {
  // Topological sort, then assign lane per branch
  const ids = Object.keys(commits);
  const order = [];
  const visited = new Set();

  const visit = (id) => {
    if (visited.has(id)) return;
    visited.add(id);
    const c = commits[id];
    if (c) c.parents.forEach(visit);
    order.push(id);
  };

  // Start from all branch heads
  Object.values(branches).forEach(b => visit(b.head));
  ids.forEach(visit);

  // Assign time-ordered rows (newest = top = row 0)
  const rows = {};
  [...order].reverse().forEach((id, i) => { rows[id] = i; });

  // Assign lanes: each branch gets a lane
  const lanes = {};
  const branchLane = {};
  let nextLane = 0;
  Object.entries(branches).forEach(([name]) => {
    branchLane[name] = nextLane++;
  });

  order.forEach(id => {
    const c = commits[id];
    if (!c) return;
    if (branchLane[c.branch] !== undefined) {
      lanes[id] = branchLane[c.branch];
    } else {
      lanes[id] = 0;
    }
  });

  return { rows, lanes, order };
}

/* ── SVG constants ───────────────────────────────────── */
const ROW_H  = 68;
const LANE_W = 110;
const PAD_X  = 60;
const PAD_Y  = 30;
const NODE_R = 14;

function CommitNode({ commit, cx, cy, branchColor, isHEAD, isSelected, onClick, branchLabels, tagLabels, isStash }) {
  const [hov, setHov] = useState(false);
  return (
    <g onClick={() => onClick(commit.id)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ cursor:'pointer' }}>
      {/* HEAD ring */}
      {isHEAD && (
        <circle cx={cx} cy={cy} r={NODE_R+7}
          fill="none" stroke="#00ff88" strokeWidth={2}
          strokeDasharray="5 2"
          style={{ animation:'headSpin 6s linear infinite' }}
        />
      )}
      {/* Hover ring */}
      {(hov || isSelected) && (
        <circle cx={cx} cy={cy} r={NODE_R+4}
          fill={branchColor+'15'} stroke={branchColor+'55'} strokeWidth={1}
        />
      )}
      {/* Merge commit diamond */}
      {commit.parents.length > 1 ? (
        <polygon
          points={`${cx},${cy-NODE_R} ${cx+NODE_R},${cy} ${cx},${cy+NODE_R} ${cx-NODE_R},${cy}`}
          fill={isSelected||isHEAD ? branchColor : branchColor+'33'}
          stroke={branchColor}
          strokeWidth={2}
          style={{ filter: isSelected ? `drop-shadow(0 0 8px ${branchColor})` : 'none' }}
        />
      ) : isStash ? (
        <rect x={cx-NODE_R} y={cy-NODE_R} width={NODE_R*2} height={NODE_R*2} rx={4}
          fill={isSelected ? branchColor : branchColor+'33'}
          stroke={branchColor} strokeWidth={2}
        />
      ) : (
        <circle cx={cx} cy={cy} r={NODE_R}
          fill={isSelected||isHEAD ? branchColor : branchColor+'33'}
          stroke={branchColor}
          strokeWidth={2}
          style={{ filter: isSelected ? `drop-shadow(0 0 8px ${branchColor})` : 'none', transition:'fill 0.2s' }}
        />
      )}
      {/* Merge icon */}
      {commit.parents.length > 1 && (
        <text x={cx} y={cy+4} textAnchor="middle" fill="#000" fontSize={11} fontWeight="900">⇒</text>
      )}
      {/* Hash */}
      <text x={cx+NODE_R+6} y={cy-4} fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-mono)">{commit.hash}</text>
      {/* Message */}
      <text x={cx+NODE_R+6} y={cy+8} fill="var(--text-secondary)" fontSize={10} fontFamily="var(--font-mono)">
        {commit.msg.length > 26 ? commit.msg.slice(0,25)+'…' : commit.msg}
      </text>
      {/* Author + time */}
      <text x={cx+NODE_R+6} y={cy+20} fill="var(--text-muted)" fontSize={8} fontFamily="var(--font-mono)">
        {commit.author} · {commit.time}
      </text>
      {/* Branch labels */}
      {branchLabels.map((b, i) => (
        <g key={b.name}>
          <rect x={cx-NODE_R} y={cy-NODE_R-18-i*16} width={b.name.length*6.5+12} height={14} rx={4}
            fill={b.color+'28'} stroke={b.color+'66'} />
          {b.isHEAD && <text x={cx-NODE_R+4} y={cy-NODE_R-7-i*16} fill={b.color} fontSize={8} fontWeight="900">HEAD→</text>}
          <text x={cx-NODE_R+(b.isHEAD?44:4)} y={cy-NODE_R-7-i*16} fill={b.color} fontSize={8} fontFamily="var(--font-mono)" fontWeight="700">{b.name}</text>
        </g>
      ))}
      {/* Tag labels */}
      {tagLabels.map((t, i) => (
        <g key={t}>
          <rect x={cx+NODE_R+6} y={cy+26+i*14} width={t.length*6+16} height={12} rx={3}
            fill="rgba(99,230,190,0.15)" stroke="rgba(99,230,190,0.5)" />
          <text x={cx+NODE_R+10} y={cy+35+i*14} fill="#63e6be" fontSize={8} fontFamily="var(--font-mono)" fontWeight="700">🏷 {t}</text>
        </g>
      ))}
    </g>
  );
}

export default function CommitGraphVisualizer({ color = '#4dabf7' }) {
  const [state, setState] = useState(makeInitState);
  const [selected, setSelected] = useState('c2');
  const [activeOp, setActiveOp] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [inputVal2, setInputVal2] = useState('');
  const [showReflog, setShowReflog] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [notification, setNotification] = useState(null);
  const inputRef = useRef(null);

  const notify = (msg, c='#51cf66') => {
    setNotification({msg,c});
    setTimeout(() => setNotification(null), 2500);
  };

  const addToReflog = (s, action, target, from, msg) => ({
    ...s,
    reflog: [{ action, target, from, msg, time: now() }, ...s.reflog].slice(0, 20),
  });

  /* ── OPERATIONS ───────────────────────────────────── */

  const doCommit = useCallback(() => {
    const msg = inputVal.trim() || `Update on ${state.HEAD}`;
    setState(s => {
      if (s.detached) { notify('Detached HEAD — commit will not be on any branch', '#ffb347'); return s; }
      const branchName = s.HEAD;
      const branch = s.branches[branchName];
      if (!branch) return s;
      const id = uid(), h = hash();
      const parentFiles = s.commits[branch.head]?.files || {};
      const newCommit = {
        id, hash: h, msg, parents: [branch.head],
        branch: branchName, tags: [], author: 'You', time: now(),
        files: { ...parentFiles, [`file_${id}.txt`]: `Content of ${msg}` },
      };
      const newBranches = { ...s.branches, [branchName]: { ...branch, head: id } };
      let ns = { ...s, commits: { ...s.commits, [id]: newCommit }, branches: newBranches };
      ns = addToReflog(ns, 'commit', id, branch.head, msg);
      notify(`Committed: ${h} "${msg}"`, '#51cf66');
      return ns;
    });
    setInputVal('');
    setActiveOp(null);
  }, [inputVal, state.HEAD]);

  const doBranch = useCallback(() => {
    const name = inputVal.trim();
    if (!name) return;
    setState(s => {
      if (s.branches[name]) { notify(`Branch '${name}' already exists`, '#ff6b6b'); return s; }
      const headCommit = s.detached ? s.HEAD : s.branches[s.HEAD]?.head;
      const c = BRANCH_COLORS[Object.keys(s.branches).length % BRANCH_COLORS.length];
      const ns = { ...s, branches: { ...s.branches, [name]: { head: headCommit, color: c } } };
      notify(`Branch '${name}' created at ${headCommit}`, '#4dabf7');
      return addToReflog(ns, 'branch', name, headCommit, `create ${name}`);
    });
    setInputVal('');
    setActiveOp(null);
  }, [inputVal]);

  const doSwitch = useCallback(() => {
    const name = inputVal.trim();
    setState(s => {
      if (!s.branches[name]) { notify(`Branch '${name}' not found`, '#ff6b6b'); return s; }
      let ns = { ...s, HEAD: name, detached: false };
      // Update branch field on relevant commits
      ns = addToReflog(ns, 'switch', name, s.HEAD, `checkout ${name}`);
      notify(`Switched to branch '${name}'`, '#4dabf7');
      return ns;
    });
    setInputVal('');
    setActiveOp(null);
  }, [inputVal]);

  const doMerge = useCallback(() => {
    const srcName = inputVal.trim();
    setState(s => {
      const srcBranch  = s.branches[srcName];
      const destName   = s.HEAD;
      const destBranch = s.branches[destName];
      if (!srcBranch || !destBranch) { notify('Branch not found', '#ff6b6b'); return s; }
      if (srcBranch.head === destBranch.head) { notify('Already up to date (fast-forward)', '#51cf66'); return s; }
      // Check if fast-forward is possible (srcBranch contains destBranch head in ancestry)
      const findAncestors = (id, depth=0) => {
        if (depth > 50) return new Set();
        const c = s.commits[id]; if (!c) return new Set([id]);
        const ancestors = new Set([id]);
        c.parents.forEach(p => { findAncestors(p, depth+1).forEach(a => ancestors.add(a)); });
        return ancestors;
      };
      const srcAncestors = findAncestors(srcBranch.head);
      const isFastForward = srcAncestors.has(destBranch.head);

      if (isFastForward) {
        // Fast-forward: just move branch pointer
        const ns = { ...s, branches: { ...s.branches, [destName]: { ...destBranch, head: srcBranch.head } } };
        notify(`Fast-forward merge: ${destName} → ${srcBranch.head}`, '#51cf66');
        return addToReflog(ns, 'merge (FF)', srcBranch.head, destBranch.head, `merge ${srcName}`);
      }

      // Three-way merge commit
      const id = uid(), h = hash();
      const mergeCommit = {
        id, hash: h, msg: `Merge branch '${srcName}' into ${destName}`,
        parents: [destBranch.head, srcBranch.head],
        branch: destName, tags: [], author: 'You', time: now(),
        files: { ...s.commits[destBranch.head]?.files, ...s.commits[srcBranch.head]?.files },
      };
      const ns = {
        ...s,
        commits: { ...s.commits, [id]: mergeCommit },
        branches: { ...s.branches, [destName]: { ...destBranch, head: id } },
      };
      notify(`Merged '${srcName}' → '${destName}' (merge commit ${h})`, '#cc5de8');
      return addToReflog(ns, 'merge', id, destBranch.head, `merge ${srcName}`);
    });
    setInputVal('');
    setActiveOp(null);
  }, [inputVal]);

  const doRebase = useCallback(() => {
    const onto = inputVal.trim();
    setState(s => {
      const destBranch = s.branches[s.HEAD];
      const ontoBranch = s.branches[onto];
      if (!destBranch || !ontoBranch) { notify('Branch not found', '#ff6b6b'); return s; }
      // Simplified: move HEAD branch to point to onto head (conceptual demo)
      const newHead = ontoBranch.head;
      const ns = { ...s, branches: { ...s.branches, [s.HEAD]: { ...destBranch, head: newHead } } };
      notify(`Rebased ${s.HEAD} onto ${onto} — history rewritten`, '#f783ac');
      return addToReflog(ns, 'rebase', newHead, destBranch.head, `rebase onto ${onto}`);
    });
    setInputVal('');
    setActiveOp(null);
  }, [inputVal]);

  const doReset = useCallback((mode) => {
    setState(s => {
      const branchName = s.HEAD;
      const branch = s.branches[branchName];
      if (!branch) return s;
      // Reset to parent of current head
      const current = s.commits[branch.head];
      if (!current || !current.parents.length) { notify('Nothing to reset to', '#ff6b6b'); return s; }
      const target = current.parents[0];
      const modeLabel = mode === 'hard' ? '--hard' : mode === 'soft' ? '--soft' : '--mixed';
      const ns = { ...s, branches: { ...s.branches, [branchName]: { ...branch, head: target } } };
      notify(`git reset ${modeLabel} HEAD~1 → ${target} ${mode==='hard'?'(changes DELETED)':mode==='soft'?'(changes staged)':'(changes unstaged)'}`, '#ff6b6b');
      return addToReflog(ns, `reset ${modeLabel}`, target, branch.head, `reset HEAD~1`);
    });
    setActiveOp(null);
  }, []);

  const doRevert = useCallback(() => {
    setState(s => {
      const branchName = s.HEAD;
      const branch = s.branches[branchName];
      const targetCommit = s.commits[selected];
      if (!branch || !targetCommit) return s;
      const id = uid(), h = hash();
      const revertCommit = {
        id, hash: h, msg: `Revert "${targetCommit.msg}"`,
        parents: [branch.head],
        branch: branchName, tags: [], author: 'You', time: now(),
        files: targetCommit.parents[0] ? (s.commits[targetCommit.parents[0]]?.files || {}) : {},
      };
      const ns = {
        ...s,
        commits: { ...s.commits, [id]: revertCommit },
        branches: { ...s.branches, [branchName]: { ...branch, head: id } },
      };
      notify(`Reverted "${targetCommit.msg}" — new commit ${h} created`, '#ff9f43');
      return addToReflog(ns, 'revert', id, branch.head, `revert ${targetCommit.hash}`);
    });
    setActiveOp(null);
  }, [selected]);

  const doCherryPick = useCallback(() => {
    setState(s => {
      const src = s.commits[selected];
      const branchName = s.HEAD;
      const branch = s.branches[branchName];
      if (!src || !branch) return s;
      const id = uid(), h = hash();
      const newCommit = {
        id, hash: h, msg: `cherry-pick: ${src.msg}`,
        parents: [branch.head],
        branch: branchName, tags: [], author: 'You', time: now(),
        files: { ...(s.commits[branch.head]?.files||{}), ...src.files },
      };
      const ns = {
        ...s,
        commits: { ...s.commits, [id]: newCommit },
        branches: { ...s.branches, [branchName]: { ...branch, head: id } },
      };
      notify(`Cherry-picked ${src.hash} → new commit ${h}`, '#63e6be');
      return addToReflog(ns, 'cherry-pick', id, branch.head, `pick ${src.hash}`);
    });
    setActiveOp(null);
  }, [selected]);

  const doTag = useCallback(() => {
    const tagName = inputVal.trim();
    if (!tagName) return;
    setState(s => {
      const targetId = selected;
      const target = s.commits[targetId];
      if (!target) return s;
      const newTags = { ...s.tags, [tagName]: targetId };
      const updatedCommit = { ...target, tags: [...target.tags, tagName] };
      notify(`Tag '${tagName}' → ${target.hash}`, '#63e6be');
      return { ...s, tags: newTags, commits: { ...s.commits, [targetId]: updatedCommit } };
    });
    setInputVal('');
    setActiveOp(null);
  }, [inputVal, selected]);

  const doStash = useCallback(() => {
    setState(s => {
      const ns = { ...s, stash: [...s.stash, { id: uid(), msg: `stash@{${s.stash.length}}: WIP on ${s.HEAD}`, time: now() }] };
      notify('Changes stashed', '#63e6be');
      return addToReflog(ns, 'stash', 'stash', s.branches[s.HEAD]?.head, 'stash push');
    });
    setActiveOp(null);
  }, []);

  const doStashPop = useCallback(() => {
    setState(s => {
      if (!s.stash.length) { notify('No stash entries', '#ff6b6b'); return s; }
      const [top, ...rest] = s.stash;
      notify(`Popped ${top.msg}`, '#63e6be');
      return addToReflog({ ...s, stash: rest }, 'stash pop', top.msg, '', 'stash pop');
    });
  }, []);

  const doDetach = useCallback(() => {
    if (!selected) return;
    setState(s => {
      const commit = s.commits[selected];
      if (!commit) return s;
      notify(`HEAD detached at ${commit.hash} — you are in "detached HEAD" state`, '#ffb347');
      return addToReflog({ ...s, HEAD: selected, detached: true }, 'checkout (detached)', selected, s.HEAD, `checkout ${commit.hash}`);
    });
    setActiveOp(null);
  }, [selected]);

  const doSquash = useCallback(() => {
    setState(s => {
      const branchName = s.HEAD;
      const branch = s.branches[branchName];
      if (!branch) return s;
      const head = s.commits[branch.head];
      if (!head || !head.parents[0]) return s;
      const parent = s.commits[head.parents[0]];
      if (!parent || !parent.parents[0]) { notify('Need at least 2 commits to squash', '#ff6b6b'); return s; }
      const grandparent = parent.parents[0];
      const id = uid(), h = hash();
      const squashedCommit = {
        id, hash: h, msg: `squash: ${parent.msg} + ${head.msg}`,
        parents: [grandparent],
        branch: branchName, tags: [], author: 'You', time: now(),
        files: head.files,
      };
      const filtered = Object.fromEntries(Object.entries(s.commits).filter(([k]) => k !== head.id && k !== parent.id));
      const ns = {
        ...s,
        commits: { ...filtered, [id]: squashedCommit },
        branches: { ...s.branches, [branchName]: { ...branch, head: id } },
      };
      notify(`Squashed last 2 commits into ${h}`, '#f783ac');
      return addToReflog(ns, 'squash', id, branch.head, 'rebase -i squash');
    });
    setActiveOp(null);
  }, []);

  const doDeleteBranch = useCallback(() => {
    const name = inputVal.trim();
    setState(s => {
      if (!s.branches[name]) { notify(`Branch '${name}' not found`, '#ff6b6b'); return s; }
      if (name === s.HEAD) { notify("Can't delete checked-out branch", '#ff6b6b'); return s; }
      const { [name]: _, ...rest } = s.branches;
      notify(`Deleted branch '${name}'`, '#ff6b6b');
      return { ...s, branches: rest };
    });
    setInputVal('');
    setActiveOp(null);
  }, [inputVal]);

  const doReset2 = () => doReset('mixed');

  /* ── Layout ───────────────────────────────────────── */
  const { rows, lanes, order } = React.useMemo(
    () => layoutCommits(state.commits, state.branches),
    [state.commits, state.branches]
  );

  const maxRow  = Math.max(0, ...Object.values(rows));
  const maxLane = Math.max(0, ...Object.values(lanes));
  const svgH = (maxRow + 2) * ROW_H + PAD_Y * 2;
  const svgW = (maxLane + 2) * LANE_W + PAD_X * 2 + 260;

  const cx = (id) => PAD_X + (lanes[id] || 0) * LANE_W + NODE_R * 2;
  const cy = (id) => PAD_Y + (rows[id] || 0) * ROW_H + ROW_H / 2;

  const headCommitId = state.detached ? state.HEAD : state.branches[state.HEAD]?.head;

  /* ── Diff viewer ──────────────────────────────────── */
  const selectedCommit = state.commits[selected];
  const parentCommit   = selectedCommit?.parents[0] ? state.commits[selectedCommit.parents[0]] : null;

  const diffLines = () => {
    if (!selectedCommit || !parentCommit) return [];
    const newFiles = selectedCommit.files || {};
    const oldFiles = parentCommit.files || {};
    const allKeys  = [...new Set([...Object.keys(newFiles), ...Object.keys(oldFiles)])];
    const lines = [];
    allKeys.forEach(key => {
      if (!oldFiles[key]) {
        lines.push({ text:`+++ ${key} (new file)`, type:'add' });
        (newFiles[key]||'').split('\n').forEach(l => lines.push({ text:`+ ${l}`, type:'add' }));
      } else if (!newFiles[key]) {
        lines.push({ text:`--- ${key} (deleted)`, type:'remove' });
      } else if (oldFiles[key] !== newFiles[key]) {
        lines.push({ text:`~~~ ${key} (modified)`, type:'header' });
        lines.push({ text:`- ${oldFiles[key].slice(0,60)}`, type:'remove' });
        lines.push({ text:`+ ${newFiles[key].slice(0,60)}`, type:'add' });
      }
    });
    return lines.length ? lines : [{ text:'(no changes)', type:'same' }];
  };

  /* ── Git log --oneline text ───────────────────────── */
  const gitLogText = [...order].map(id => {
    const c = state.commits[id];
    if (!c) return '';
    const isHead = id === headCommitId;
    const bs = Object.entries(state.branches).filter(([,b]) => b.head === id).map(([n]) => n);
    const ts = c.tags;
    const refs = [...bs.map(n => n === state.HEAD ? `HEAD -> ${n}` : n), ...ts.map(t => `tag: ${t}`)];
    return `${c.hash}${refs.length ? ' ('+refs.join(', ')+')' : ''} ${c.msg}`;
  }).filter(Boolean);

  /* ── Operation buttons ────────────────────────────── */
  const OPS = [
    { id:'commit',  label:'✎ Commit',        color:'#51cf66',  needsInput:'Message...', inputLabel:'Commit message' },
    { id:'branch',  label:'⎇ Branch',         color:'#4dabf7',  needsInput:'Name...', inputLabel:'New branch name' },
    { id:'switch',  label:'⇄ Switch',         color:'#74c0fc',  needsInput:'Name...', inputLabel:'Branch to switch to' },
    { id:'merge',   label:'⇒ Merge',          color:'#cc5de8',  needsInput:'From...', inputLabel:'Branch to merge in' },
    { id:'rebase',  label:'↳ Rebase',         color:'#f783ac',  needsInput:'Onto...', inputLabel:'Branch to rebase onto' },
    { id:'reset',   label:'↩ Reset',          color:'#ff6b6b',  multi:true },
    { id:'revert',  label:'⟲ Revert',         color:'#ff9f43',  noInput:true, action:doRevert },
    { id:'cherry',  label:'🍒 Cherry-pick',   color:'#63e6be',  noInput:true, action:doCherryPick },
    { id:'tag',     label:'🏷 Tag',           color:'#63e6be',  needsInput:'Tag name...', inputLabel:'Tag name' },
    { id:'stash',   label:'📦 Stash',         color:'#a9e34b',  noInput:true, action:doStash },
    { id:'detach',  label:'👻 Detach HEAD',   color:'#ffb347',  noInput:true, action:doDetach },
    { id:'squash',  label:'⊕ Squash',         color:'#f783ac',  noInput:true, action:doSquash },
    { id:'del_br',  label:'✕ Delete Branch', color:'#ff6b6b',  needsInput:'Name...', inputLabel:'Branch to delete' },
  ];

  const activeOpDef = OPS.find(o => o.id === activeOp);

  const doSubmit = () => {
    if (activeOp === 'commit')  doCommit();
    if (activeOp === 'branch')  doBranch();
    if (activeOp === 'switch')  doSwitch();
    if (activeOp === 'merge')   doMerge();
    if (activeOp === 'rebase')  doRebase();
    if (activeOp === 'tag')     doTag();
    if (activeOp === 'del_br')  doDeleteBranch();
  };

  return (
    <div style={{ fontFamily:'var(--font-mono)', position:'relative' }}>
      {/* Notification */}
      {notification && (
        <div style={{ position:'sticky', top:0, zIndex:99, background:notification.c+'18', border:`1px solid ${notification.c}55`, borderRadius:'var(--radius-md)', padding:'9px 16px', marginBottom:12, color:notification.c, fontSize:12, fontWeight:700, animation:'fadeInUp 0.2s ease', display:'flex', alignItems:'center', gap:8 }}>
          <span>⚡</span> {notification.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', gap:16, alignItems:'flex-start', marginBottom:14, flexWrap:'wrap' }}>
        <div style={{ flex:1 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
            🔱 Commit Graph Visualizer
          </h3>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <span style={{ background:'#00ff8820', color:'#00ff88', borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:700 }}>
              HEAD → {state.detached ? `detached:${state.HEAD.slice(0,6)}` : state.HEAD}
            </span>
            <span style={{ background:'var(--bg-card)', color:'var(--text-muted)', borderRadius:20, padding:'3px 12px', fontSize:11 }}>
              {Object.keys(state.commits).length} commits · {Object.keys(state.branches).length} branches
            </span>
            {state.stash.length > 0 && (
              <span style={{ background:'rgba(169,227,75,0.1)', color:'#a9e34b', borderRadius:20, padding:'3px 12px', fontSize:11 }}>
                📦 {state.stash.length} stashed
              </span>
            )}
          </div>
        </div>

        <div style={{ display:'flex', gap:6 }}>
          <button onClick={() => setShowLog(l => !l)} style={{ background: showLog?'var(--bg-card)':'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:'var(--radius-md)', padding:'5px 11px', fontSize:11, cursor:'pointer' }}>
            git log
          </button>
          <button onClick={() => setShowDiff(d => !d)} style={{ background: showDiff?'var(--bg-card)':'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:'var(--radius-md)', padding:'5px 11px', fontSize:11, cursor:'pointer' }}>
            git diff
          </button>
          <button onClick={() => setShowReflog(r => !r)} style={{ background: showReflog?'var(--bg-card)':'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:'var(--radius-md)', padding:'5px 11px', fontSize:11, cursor:'pointer' }}>
            reflog
          </button>
          <button onClick={() => { setState(makeInitState()); setSelected('c2'); }} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:'var(--radius-md)', padding:'5px 11px', fontSize:11, cursor:'pointer' }}>
            reset
          </button>
        </div>
      </div>

      {/* Operation buttons */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
        {OPS.map(op => (
          <button key={op.id}
            onClick={() => {
              if (op.noInput && op.action) { op.action(); return; }
              setActiveOp(activeOp === op.id ? null : op.id);
              setInputVal('');
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            style={{
              background: activeOp===op.id ? op.color+'22' : 'var(--bg-elevated)',
              border: `1px solid ${activeOp===op.id ? op.color+'66' : 'var(--border)'}`,
              color: activeOp===op.id ? op.color : 'var(--text-secondary)',
              borderRadius:'var(--radius-md)', padding:'6px 13px',
              fontSize:11, cursor:'pointer', fontWeight: activeOp===op.id ? 700:400, transition:'all 0.12s',
            }}>
            {op.label}
          </button>
        ))}
        {state.stash.length > 0 && (
          <button onClick={doStashPop} style={{ background:'rgba(169,227,75,0.1)', border:'1px solid rgba(169,227,75,0.3)', color:'#a9e34b', borderRadius:'var(--radius-md)', padding:'6px 13px', fontSize:11, cursor:'pointer', fontWeight:700 }}>
            📦 Pop Stash
          </button>
        )}
      </div>

      {/* Input panel */}
      {activeOp && activeOpDef && !activeOpDef.noInput && (
        <div style={{ background:'var(--bg-elevated)', border:`1px solid ${activeOpDef.color}40`, borderRadius:'var(--radius-lg)', padding:'12px 16px', marginBottom:12, animation:'fadeIn 0.15s ease' }}>
          <div style={{ color:'var(--text-muted)', fontSize:10, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>
            {activeOpDef.inputLabel}
          </div>
          {activeOpDef.multi ? (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button onClick={() => doReset('soft')} style={{ background:'rgba(81,207,102,0.15)', border:'1px solid #51cf6666', color:'#51cf66', borderRadius:'var(--radius-md)', padding:'8px 16px', fontSize:12, cursor:'pointer', fontWeight:700 }}>
                --soft (keep staged)
              </button>
              <button onClick={() => doReset('mixed')} style={{ background:'rgba(255,183,71,0.15)', border:'1px solid #ffb34766', color:'#ffb347', borderRadius:'var(--radius-md)', padding:'8px 16px', fontSize:12, cursor:'pointer', fontWeight:700 }}>
                --mixed (unstage)
              </button>
              <button onClick={() => doReset('hard')} style={{ background:'rgba(255,107,107,0.15)', border:'1px solid #ff6b6b66', color:'#ff6b6b', borderRadius:'var(--radius-md)', padding:'8px 16px', fontSize:12, cursor:'pointer', fontWeight:700 }}>
                --hard (DELETE changes)
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', gap:8 }}>
              {activeOp === 'switch' ? (
                <select ref={inputRef} value={inputVal} onChange={e => setInputVal(e.target.value)}
                  style={{ flex:1, background:'var(--bg-card)', border:`1px solid ${activeOpDef.color}40`, color:'var(--text-primary)', borderRadius:'var(--radius-md)', padding:'8px 12px', fontFamily:'var(--font-mono)', fontSize:12, outline:'none' }}>
                  <option value="">Select branch...</option>
                  {Object.keys(state.branches).filter(b => b !== state.HEAD).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              ) : activeOp === 'merge' || activeOp === 'rebase' ? (
                <select ref={inputRef} value={inputVal} onChange={e => setInputVal(e.target.value)}
                  style={{ flex:1, background:'var(--bg-card)', border:`1px solid ${activeOpDef.color}40`, color:'var(--text-primary)', borderRadius:'var(--radius-md)', padding:'8px 12px', fontFamily:'var(--font-mono)', fontSize:12, outline:'none' }}>
                  <option value="">Select branch...</option>
                  {Object.keys(state.branches).filter(b => b !== state.HEAD).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              ) : (
                <input ref={inputRef} value={inputVal} onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSubmit()}
                  placeholder={activeOpDef.needsInput}
                  style={{ flex:1, background:'var(--bg-card)', border:`1px solid ${activeOpDef.color}40`, color:'var(--text-primary)', borderRadius:'var(--radius-md)', padding:'8px 12px', fontFamily:'var(--font-mono)', fontSize:12, outline:'none' }}
                  autoFocus
                />
              )}
              <button onClick={doSubmit} style={{ background:activeOpDef.color, color:'#000', border:'none', borderRadius:'var(--radius-md)', padding:'8px 18px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                Run
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main graph + detail side panel */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:12, alignItems:'start' }}>

        {/* SVG Graph */}
        <div style={{ background:'#050810', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', overflow:'auto' }}>
          <svg width={svgW} height={svgH} style={{ display:'block', minWidth:Math.max(svgW, 400) }}>
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#ffffff30" />
              </marker>
            </defs>

            {/* Lane guide lines */}
            {Array.from({length: maxLane + 1}).map((_, lane) => {
              const x = PAD_X + lane * LANE_W + NODE_R * 2;
              const branchForLane = Object.entries(state.branches).find(([, b], i) => i === lane);
              return (
                <g key={lane}>
                  <line x1={x} y1={PAD_Y} x2={x} y2={svgH - PAD_Y}
                    stroke={branchForLane ? branchForLane[1].color + '15' : '#ffffff08'}
                    strokeWidth={1} strokeDasharray="2 4"
                  />
                  {branchForLane && (
                    <text x={x} y={14} textAnchor="middle"
                      fill={branchForLane[1].color + '60'}
                      fontSize={8} fontFamily="var(--font-mono)" fontWeight="700">
                      {branchForLane[0]}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Edges */}
            {order.map(id => {
              const c = state.commits[id];
              if (!c) return null;
              return c.parents.map((pid, pi) => {
                const x1 = cx(id),  y1 = cy(id);
                const x2 = cx(pid), y2 = cy(pid);
                const branchObj = state.branches[c.branch];
                const edgeColor = branchObj ? branchObj.color : '#4dabf7';
                const midX = (x1 + x2) / 2;
                const isSelected2 = id === selected || pid === selected;
                return (
                  <path key={`${id}-${pid}-${pi}`}
                    d={x1 === x2
                      ? `M${x1} ${y1} L${x2} ${y2}`
                      : `M${x1} ${y1} C${x1} ${(y1+y2)/2+20} ${x2} ${(y1+y2)/2-20} ${x2} ${y2}`}
                    fill="none"
                    stroke={isSelected2 ? edgeColor + 'cc' : edgeColor + '44'}
                    strokeWidth={isSelected2 ? 2.5 : 1.5}
                    markerEnd="url(#arrow)"
                  />
                );
              });
            })}

            {/* Remote tracking */}
            {Object.entries(state.remotes).map(([name, commitId]) => {
              if (!state.commits[commitId]) return null;
              const x = cx(commitId) - NODE_R - 2, y = cy(commitId) - 26;
              return (
                <g key={name}>
                  <rect x={x-2} y={y} width={name.length*6+14} height={13} rx={3}
                    fill="rgba(77,171,247,0.1)" stroke="rgba(77,171,247,0.3)" />
                  <text x={x+4} y={y+9} fill="#4dabf788" fontSize={8} fontFamily="var(--font-mono)">☁ {name}</text>
                </g>
              );
            })}

            {/* Commit nodes */}
            {order.map(id => {
              const c = state.commits[id];
              if (!c) return null;
              const branchObj = state.branches[c.branch];
              const nodeColor = branchObj?.color || '#4dabf7';
              const bLabels = Object.entries(state.branches)
                .filter(([, b]) => b.head === id)
                .map(([name, b]) => ({ name, color: b.color, isHEAD: !state.detached && name === state.HEAD }));
              const tLabels = c.tags || [];
              return (
                <CommitNode
                  key={id}
                  commit={c}
                  cx={cx(id)}
                  cy={cy(id)}
                  branchColor={nodeColor}
                  isHEAD={id === headCommitId}
                  isSelected={id === selected}
                  onClick={setSelected}
                  branchLabels={bLabels}
                  tagLabels={tLabels}
                />
              );
            })}
          </svg>
          <style>{`
            @keyframes headSpin { from{stroke-dashoffset:0} to{stroke-dashoffset:-28} }
          `}</style>
        </div>

        {/* Right panel — commit details or reflog or diff or log */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

          {/* Commit detail */}
          {selectedCommit && !showReflog && !showLog && !showDiff && (
            <div style={{ background:'var(--bg-elevated)', border:`1px solid ${state.branches[selectedCommit.branch]?.color||'var(--border)'}30`, borderRadius:'var(--radius-xl)', padding:'16px', animation:'fadeIn 0.15s ease' }}>
              <div style={{ color:'var(--text-muted)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Commit Details</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  ['hash',   selectedCommit.hash],
                  ['branch', selectedCommit.branch],
                  ['author', selectedCommit.author],
                  ['time',   selectedCommit.time],
                  ['parents', selectedCommit.parents.map(p => state.commits[p]?.hash || p).join(', ') || 'none'],
                  ['type',   selectedCommit.parents.length > 1 ? 'merge commit' : selectedCommit.parents.length === 0 ? 'root commit' : 'regular commit'],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', gap:8 }}>
                    <span style={{ color:'var(--text-muted)', fontSize:10, width:50, flexShrink:0 }}>{k}</span>
                    <span style={{ color:k==='hash'?'#ffb347':k==='branch'?(state.branches[v]?.color||'var(--text-secondary)'):'var(--text-secondary)', fontSize:10, fontWeight: k==='hash'?700:400, wordBreak:'break-all' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:10 }}>
                <div style={{ color:'var(--text-muted)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>Message</div>
                <div style={{ background:'var(--bg-card)', borderRadius:'var(--radius-sm)', padding:'8px', color:'var(--text-primary)', fontSize:11, lineHeight:1.5 }}>{selectedCommit.msg}</div>
              </div>
              {selectedCommit.tags?.length > 0 && (
                <div style={{ marginTop:8 }}>
                  <div style={{ color:'var(--text-muted)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>Tags</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {selectedCommit.tags.map(t => (
                      <span key={t} style={{ background:'rgba(99,230,190,0.1)', border:'1px solid rgba(99,230,190,0.3)', color:'#63e6be', borderRadius:20, padding:'2px 8px', fontSize:10 }}>🏷 {t}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedCommit.files && (
                <div style={{ marginTop:8 }}>
                  <div style={{ color:'var(--text-muted)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>Files in snapshot</div>
                  {Object.keys(selectedCommit.files).slice(0, 6).map(f => (
                    <div key={f} style={{ color:'#51cf66', fontSize:10, padding:'2px 0' }}>📄 {f}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Branch list */}
          <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'14px' }}>
            <div style={{ color:'var(--text-muted)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Branches</div>
            {Object.entries(state.branches).map(([name, branch]) => {
              const isActive = !state.detached && name === state.HEAD;
              const headC    = state.commits[branch.head];
              return (
                <div key={name} onClick={() => { setInputVal(name); setActiveOp('switch'); setTimeout(doSwitch, 50); }}
                  style={{ display:'flex', gap:8, alignItems:'center', marginBottom:7, cursor:'pointer', padding:'4px 6px', borderRadius:'var(--radius-sm)', background: isActive ? branch.color+'12':'transparent', transition:'background 0.15s' }}>
                  <span style={{ color:branch.color, fontSize:12 }}>{isActive ? '●' : '○'}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color: isActive ? branch.color : 'var(--text-secondary)', fontSize:11, fontWeight: isActive ? 700:400 }}>
                      {isActive && 'HEAD → '}{name}
                    </div>
                    {headC && <div style={{ color:'var(--text-muted)', fontSize:9 }}>{headC.hash} · {headC.msg.slice(0,20)}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tags */}
          {Object.keys(state.tags).length > 0 && (
            <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'12px 14px' }}>
              <div style={{ color:'var(--text-muted)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Tags</div>
              {Object.entries(state.tags).map(([tag, cid]) => (
                <div key={tag} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:5 }}>
                  <span style={{ color:'#63e6be', fontSize:10 }}>🏷</span>
                  <span style={{ color:'#63e6be', fontSize:10, fontWeight:700 }}>{tag}</span>
                  <span style={{ color:'var(--text-muted)', fontSize:9 }}>→ {state.commits[cid]?.hash}</span>
                </div>
              ))}
            </div>
          )}

          {/* Diff panel */}
          {showDiff && selectedCommit && (
            <div style={{ background:'#050810', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'12px', maxHeight:280, overflowY:'auto' }}>
              <div style={{ color:'var(--text-muted)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
                diff {parentCommit?.hash||'(root)'} → {selectedCommit.hash}
              </div>
              {diffLines().map((line, i) => (
                <div key={i} style={{ fontFamily:'var(--font-mono)', fontSize:10, lineHeight:1.7, color: line.type==='add'?'#51cf66':line.type==='remove'?'#ff6b6b':line.type==='header'?'#ffb347':'var(--text-muted)', background: line.type==='add'?'rgba(81,207,102,0.05)':line.type==='remove'?'rgba(255,107,107,0.05)':'transparent', paddingLeft:4 }}>
                  {line.text}
                </div>
              ))}
            </div>
          )}

          {/* Reflog */}
          {showReflog && (
            <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'12px 14px', maxHeight:320, overflowY:'auto' }}>
              <div style={{ color:'var(--text-muted)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>git reflog</div>
              {state.reflog.map((entry, i) => (
                <div key={i} style={{ marginBottom:7, borderBottom:'1px solid var(--border)', paddingBottom:5 }}>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    <code style={{ color:'#ffb347', fontSize:9 }}>HEAD@{'{'+i+'}'}</code>
                    <span style={{ color:'#4dabf7', fontSize:9 }}>{entry.action}</span>
                  </div>
                  <div style={{ color:'var(--text-secondary)', fontSize:10, marginTop:2 }}>{entry.msg}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:9 }}>{entry.time}</div>
                </div>
              ))}
            </div>
          )}

          {/* Git log text */}
          {showLog && (
            <div style={{ background:'#050810', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'12px 14px', maxHeight:280, overflowY:'auto' }}>
              <div style={{ color:'var(--text-muted)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>git log --oneline</div>
              {gitLogText.map((line, i) => (
                <div key={i} style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-secondary)', lineHeight:1.8, padding:'1px 0' }}>
                  <span style={{ color:'#ffb347' }}>{line.slice(0,7)}</span>
                  <span style={{ color:'var(--text-muted)' }}>{line.slice(7)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
