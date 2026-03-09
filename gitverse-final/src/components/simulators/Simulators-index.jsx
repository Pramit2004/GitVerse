export { default as CommitGraphVisualizer } from './Commitgraphvisualizer';
export { default as GitUniverseMap      } from './Gituniversemap';
export { default as SnapshotTimeMachine  } from './Snapshottimemachine';
export { default as BranchGarden         } from './Branchgarden';
export { default as GitCommandMap         } from './Gitcommandmap';
export { default as TeamSimulator         } from './Teamsimulator';
export { default as StoryMode             } from './Storymode';
export { default as TagsSimulator       } from './Tagssimulator';
export { default as CommitLintSimulator } from './Commitlintsimulator';
export { default as MergeConflictSimulator } from './Mergeconflictsimulator';
export { default as PRSimulator           } from './Prsimulator';
export { default as ManualMergeSimulator  } from './Manualmergesimulator';
export { default as GitignorePlayground   } from './Gitignoreplayground';
export { default as GitVerseIDE } from './GitVerseIDE';

import React, { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════
   1. STAGING AREA SIMULATOR (Drag & Drop)
═══════════════════════════════════════════════════════ */
export function StagingSimulator({ color }) {
  const [files, setFiles] = useState([
    { id: 'f1', name: 'index.html',  status: 'modified', area: 'working' },
    { id: 'f2', name: 'style.css',   status: 'new',      area: 'working' },
    { id: 'f3', name: 'app.js',      status: 'modified', area: 'working' },
    { id: 'f4', name: 'README.md',   status: 'new',      area: 'working' },
  ]);
  const [commitMsg, setCommitMsg]       = useState('');
  const [commitHistory, setCommitHistory] = useState([
    { hash: 'a1b2c3d', msg: 'Initial commit', files: ['package.json'] },
  ]);
  const [dragOver, setDragOver]         = useState(null);
  const [dragging, setDragging]         = useState(null);
  const [notification, setNotification] = useState(null);

  const workingFiles = files.filter(f => f.area === 'working');
  const stagedFiles  = files.filter(f => f.area === 'staged');

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2000);
  };

  const moveFile = (fileId, targetArea) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, area: targetArea } : f));
    notify(targetArea === 'staged' ? '✓ File staged' : 'File unstaged', targetArea === 'staged' ? 'success' : 'info');
  };

  const handleDrop = (e, area) => {
    e.preventDefault();
    if (dragging) moveFile(dragging, area);
    setDragOver(null);
    setDragging(null);
  };

  const doCommit = () => {
    if (!stagedFiles.length) { notify('Nothing staged!', 'error'); return; }
    if (!commitMsg.trim())   { notify('Add a commit message!', 'error'); return; }
    const hash = Math.random().toString(36).substr(2, 7);
    setCommitHistory(prev => [{ hash, msg: commitMsg, files: stagedFiles.map(f => f.name) }, ...prev]);
    setFiles(prev => prev.filter(f => f.area !== 'staged'));
    setCommitMsg('');
    notify(`[${hash}] ${commitMsg}`);
  };

  const statusColor = s => s === 'modified' ? 'var(--amber)' : 'var(--green)';
  const statusLabel = s => s === 'modified' ? 'M' : 'A';

  return (
    <div style={{ position: 'relative' }}>
      {notification && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: notification.type === 'error' ? 'rgba(255,107,107,0.15)' : 'var(--green-glow)',
          border: `1px solid ${notification.type === 'error' ? 'rgba(255,107,107,0.4)' : 'rgba(0,255,136,0.3)'}`,
          color: notification.type === 'error' ? 'var(--red)' : 'var(--green)',
          padding: '10px 18px', borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-mono)', fontSize: 13,
          animation: 'fadeInUp 0.2s ease',
        }}>{notification.msg}</div>
      )}

      <SectionHeader
        title="🎮 Staging Area Simulator"
        desc="Drag files from Working Directory → Staging Area, then commit."
      />

      {/* Three-zone layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        {/* Working Directory */}
        <DropZone
          label="📁 Working Directory"
          count={workingFiles.length}
          countColor="var(--red)"
          isDragOver={dragOver === 'working'}
          onDragOver={() => setDragOver('working')}
          onDrop={(e) => handleDrop(e, 'working')}
          onDragLeave={() => setDragOver(null)}
          emptyText="All files staged ✓"
        >
          {workingFiles.map(file => (
            <FileCard key={file.id} file={file}
              onDragStart={() => setDragging(file.id)}
              onDragEnd={() => { setDragging(null); setDragOver(null); }}
              onClick={() => moveFile(file.id, 'staged')}
              dragging={dragging === file.id}
              statusColor={statusColor(file.status)}
              statusLabel={statusLabel(file.status)}
              hint="drag →"
            />
          ))}
        </DropZone>

        {/* Arrow */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 4 }}>git add</div>
          <div style={{ fontSize: 20, color: color }}>⇄</div>
        </div>

        {/* Staging Area */}
        <DropZone
          label="🎯 Staging Area"
          count={stagedFiles.length}
          countColor="var(--green)"
          isDragOver={dragOver === 'staged'}
          onDragOver={() => setDragOver('staged')}
          onDrop={(e) => handleDrop(e, 'staged')}
          onDragLeave={() => setDragOver(null)}
          emptyText="Drop files here"
          highlighted
        >
          {stagedFiles.map(file => (
            <FileCard key={file.id} file={file}
              onDragStart={() => setDragging(file.id)}
              onDragEnd={() => { setDragging(null); setDragOver(null); }}
              onClick={() => moveFile(file.id, 'working')}
              dragging={dragging === file.id}
              statusColor={statusColor(file.status)}
              statusLabel={statusLabel(file.status)}
              hint="← unstage"
              staged
            />
          ))}
        </DropZone>
      </div>

      {/* Commit section */}
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 16,
      }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <input
            value={commitMsg}
            onChange={e => setCommitMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doCommit()}
            placeholder='Commit message, e.g. "Add hero section"'
            style={{
              flex: 1, background: 'var(--bg-card)',
              border: '1px solid var(--border-bright)',
              borderRadius: 'var(--radius-md)', padding: '9px 14px',
              color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
              fontSize: 13, outline: 'none',
            }}
          />
          <button onClick={doCommit} style={{
            background: (stagedFiles.length && commitMsg) ? color : 'var(--bg-card)',
            color: (stagedFiles.length && commitMsg) ? '#000' : 'var(--text-muted)',
            border: 'none', borderRadius: 'var(--radius-md)', padding: '9px 20px',
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', transition: 'all var(--transition-base)',
            whiteSpace: 'nowrap',
          }}>git commit</button>
        </div>

        {/* History */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, marginBottom: 8, letterSpacing: 1 }}>
            COMMIT HISTORY
          </div>
          {commitHistory.map((c, i) => (
            <div key={c.hash} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6,
              animation: i === 0 ? 'fadeInRight 0.3s ease' : 'none',
            }}>
              <code style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: 12, flexShrink: 0 }}>
                {c.hash}
              </code>
              <span style={{ color: 'var(--text-secondary)', fontSize: 12, flex: 1 }}>{c.msg}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{c.files.join(', ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   2. COMMIT GRAPH VISUALIZER
═══════════════════════════════════════════════════════ */
function CommitGraphVisualizer({ color }) {
  const [commits, setCommits] = useState([
    { id: 'c1', hash: 'a1b2c3d', msg: 'Initial commit',  branch: 'main', parent: null, x: 0, y: 0 },
    { id: 'c2', hash: 'b2c3d4e', msg: 'Add README',       branch: 'main', parent: 'c1', x: 0, y: 1 },
  ]);
  const [branches, setBranches]       = useState([{ name: 'main', head: 'c2', color: '#4dabf7' }]);
  const [activeBranch, setActiveBranch] = useState('main');
  const [HEAD, setHEAD]               = useState('c2');
  const [newBranchName, setNewBranchName] = useState('');
  const [newCommitMsg, setNewCommitMsg]   = useState('');
  const [mode, setMode]               = useState(null);

  const BRANCH_COLORS = ['#4dabf7','#51cf66','#cc5de8','#ff6b6b','#ffb347','#74c0fc'];

  const createBranch = () => {
    if (!newBranchName.trim()) return;
    const col = BRANCH_COLORS[branches.length % BRANCH_COLORS.length];
    setBranches(prev => [...prev, { name: newBranchName, head: HEAD, color: col }]);
    setActiveBranch(newBranchName);
    setNewBranchName(''); setMode(null);
  };

  const addCommit = () => {
    const msg   = newCommitMsg.trim() || `Update on ${activeBranch}`;
    const id    = 'c' + (commits.length + 1);
    const hash  = Math.random().toString(36).substr(2, 7);
    const bIdx  = branches.findIndex(b => b.name === activeBranch);
    const maxY  = Math.max(...commits.map(c => c.y));
    const branch = branches.find(b => b.name === activeBranch);

    const newCommit = { id, hash, msg, branch: activeBranch, parent: branch.head, x: bIdx, y: maxY + 1 };
    setCommits(prev => [...prev, newCommit]);
    setBranches(prev => prev.map(b => b.name === activeBranch ? { ...b, head: id } : b));
    setHEAD(id);
    setNewCommitMsg(''); setMode(null);
  };

  const maxY  = Math.max(...commits.map(c => c.y));
  const graphH = Math.max((maxY + 1) * 64 + 40, 180);
  const graphW = Math.max(branches.length * 120 + 100, 320);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <SectionHeader title="🌿 Commit Graph Visualizer" desc={
            <>Active: <code style={{ color, fontFamily: 'var(--font-mono)' }}>{activeBranch}</code> · HEAD: <code style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{HEAD}</code></>
          } />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ModeButton active={mode === 'commit'} color={color} onClick={() => setMode(mode === 'commit' ? null : 'commit')}>
            + commit
          </ModeButton>
          <ModeButton active={mode === 'branch'} color="#cc5de8" onClick={() => setMode(mode === 'branch' ? null : 'branch')}>
            ⎇ branch
          </ModeButton>
        </div>
      </div>

      {mode === 'commit' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, animation: 'fadeIn 0.2s ease' }}>
          <select value={activeBranch} onChange={e => setActiveBranch(e.target.value)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            {branches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
          </select>
          <input value={newCommitMsg} onChange={e => setNewCommitMsg(e.target.value)} placeholder="Commit message..."
            style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-bright)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }} />
          <button onClick={addCommit} style={{ background: color, color: '#000', border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>Add</button>
        </div>
      )}

      {mode === 'branch' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, animation: 'fadeIn 0.2s ease' }}>
          <input value={newBranchName} onChange={e => setNewBranchName(e.target.value)} placeholder="New branch name..."
            onKeyDown={e => e.key === 'Enter' && createBranch()}
            style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-bright)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }} />
          <button onClick={createBranch} style={{ background: '#cc5de8', color: '#000', border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>Create</button>
        </div>
      )}

      {/* Branch switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {branches.map(b => (
          <button key={b.name} onClick={() => setActiveBranch(b.name)} style={{
            background: activeBranch === b.name ? b.color + '22' : 'var(--bg-card)',
            color: activeBranch === b.name ? b.color : 'var(--text-muted)',
            border: `1px solid ${activeBranch === b.name ? b.color + '50' : 'var(--border)'}`,
            borderRadius: 20, padding: '4px 12px',
            fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer',
          }}>
            {activeBranch === b.name ? '● ' : '○ '}{b.name}
          </button>
        ))}
      </div>

      {/* SVG Graph */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'auto', padding: 20 }}>
        <svg width="100%" height={graphH} viewBox={`0 0 ${graphW} ${graphH}`} style={{ minWidth: 280, display: 'block' }}>
          {commits.filter(c => c.parent).map(c => {
            const parent = commits.find(p => p.id === c.parent);
            if (!parent) return null;
            const bIdx  = Math.max(branches.findIndex(b => b.name === c.branch), 0);
            const pbIdx = Math.max(branches.findIndex(b => b.name === parent.branch), 0);
            const x1 = pbIdx * 110 + 55, y1 = parent.y * 60 + 40;
            const x2 = bIdx  * 110 + 55, y2 = c.y * 60 + 40;
            const bObj = branches.find(b => b.name === c.branch);
            return <line key={c.id+'l'} x1={x1} y1={y1} x2={x2} y2={y2} stroke={bObj?.color || '#4dabf7'} strokeWidth={2} strokeOpacity={0.6} />;
          })}
          {commits.map(c => {
            const bIdx  = Math.max(branches.findIndex(b => b.name === c.branch), 0);
            const cx    = bIdx * 110 + 55, cy = c.y * 60 + 40;
            const bObj  = branches.find(b => b.name === c.branch);
            const nc    = bObj?.color || '#4dabf7';
            const isHEAD = c.id === HEAD;
            return (
              <g key={c.id}>
                {isHEAD && <circle cx={cx} cy={cy} r={18} fill="none" stroke={nc} strokeWidth={1} strokeOpacity={0.35} />}
                <circle cx={cx} cy={cy} r={isHEAD ? 13 : 10} fill={isHEAD ? nc : 'var(--bg-card)'} stroke={nc} strokeWidth={2} />
                <text x={cx + 20} y={cy - 3} fill="var(--text-secondary)" fontSize={11} fontFamily="var(--font-mono)">{c.hash}</text>
                <text x={cx + 20} y={cy + 10} fill="var(--text-muted)" fontSize={10} fontFamily="var(--font-mono)">{c.msg.slice(0,22)}{c.msg.length>22?'…':''}</text>
                {branches.filter(b => b.head === c.id).map((b, i) => (
                  <g key={b.name}>
                    <rect x={cx + 20} y={cy + 14 + i*17} width={b.name.length*7+14} height={13} fill={b.color+'28'} stroke={b.color+'55'} rx={3} />
                    <text x={cx + 27} y={cy + 24 + i*17} fill={b.color} fontSize={9} fontFamily="var(--font-mono)" fontWeight="700">{b.name}</text>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   3. INTERACTIVE TERMINAL SIMULATOR
═══════════════════════════════════════════════════════ */
export function TerminalSimulator({ color }) {
  const [history, setHistory] = useState([
    { type: 'output', text: "Welcome to GitVerse Terminal! Type 'help' to see available commands.", color: 'var(--green)' },
  ]);
  const [input, setInput]         = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx]     = useState(-1);
  const [fs, setFs]               = useState({
    cwd: '~', files: [], staged: [], commits: [],
    branches: ['main'], currentBranch: 'main', initialized: false,
  });
  const endRef   = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

  const parseGit = (args, currentFs, setCurrentFs) => {
    const [sub, ...rest] = args;
    switch (sub) {
      case 'init':
        if (currentFs.initialized) return [{ type: 'output', text: 'Reinitialized existing Git repository in .git/', color: 'var(--amber)' }];
        setCurrentFs(p => ({ ...p, initialized: true }));
        return [{ type: 'output', text: 'Initialized empty Git repository in .git/', color: 'var(--green)' }];

      case 'status': {
        if (!currentFs.initialized) return [{ type: 'output', text: 'fatal: not a git repository', color: 'var(--red)' }];
        const lines = [{ type: 'output', text: `On branch ${currentFs.currentBranch}`, color: 'var(--text-primary)' }];
        if (!currentFs.commits.length) lines.push({ type: 'output', text: 'No commits yet' });
        if (currentFs.staged.length) {
          lines.push({ type: 'output', text: '\nChanges to be committed:', color: 'var(--green)' });
          currentFs.staged.forEach(f => lines.push({ type: 'output', text: `\tnew file:   ${f}`, color: 'var(--green)' }));
        }
        const unstaged = currentFs.files.filter(f => !currentFs.staged.includes(f) && !(currentFs.committed || []).includes(f));
        if (unstaged.length) {
          lines.push({ type: 'output', text: '\nUntracked files:', color: 'var(--red)' });
          unstaged.forEach(f => lines.push({ type: 'output', text: `\t${f}`, color: 'var(--red)' }));
        }
        if (!currentFs.staged.length && !unstaged.length) lines.push({ type: 'output', text: 'nothing to commit, working tree clean' });
        return lines;
      }

      case 'add': {
        if (!currentFs.initialized) return [{ type: 'output', text: 'fatal: not a git repository', color: 'var(--red)' }];
        const target = rest[0];
        if (!target) return [{ type: 'output', text: 'Nothing specified, nothing added.' }];
        let toStage = target === '.' ? currentFs.files.filter(f => !currentFs.staged.includes(f)) :
          currentFs.files.includes(target) ? [target] : null;
        if (!toStage) return [{ type: 'output', text: `error: pathspec '${target}' did not match any files`, color: 'var(--red)' }];
        if (!toStage.length) return [{ type: 'output', text: 'nothing to add' }];
        setCurrentFs(p => ({ ...p, staged: [...new Set([...p.staged, ...toStage])] }));
        return [{ type: 'output', text: '' }];
      }

      case 'commit': {
        if (!currentFs.initialized) return [{ type: 'output', text: 'fatal: not a git repository', color: 'var(--red)' }];
        const mIdx = rest.indexOf('-m');
        const msg = mIdx !== -1 ? rest.slice(mIdx + 1).join(' ').replace(/["']/g, '') : null;
        if (!msg) return [{ type: 'output', text: 'error: use: git commit -m "message"', color: 'var(--red)' }];
        if (!currentFs.staged.length) return [{ type: 'output', text: 'nothing to commit, working tree clean' }];
        const hash = Math.random().toString(36).substr(2, 7);
        const newCommit = { hash, msg, files: [...currentFs.staged] };
        setCurrentFs(p => ({ ...p, commits: [newCommit, ...p.commits], committed: [...(p.committed || []), ...p.staged], staged: [] }));
        return [
          { type: 'output', text: `[${currentFs.currentBranch} (root-commit) ${hash}] ${msg}`, color: 'var(--green)' },
          { type: 'output', text: ` ${currentFs.staged.length} file(s) changed` },
        ];
      }

      case 'log': {
        if (!currentFs.initialized) return [{ type: 'output', text: 'fatal: not a git repository', color: 'var(--red)' }];
        if (!currentFs.commits.length) return [{ type: 'output', text: 'fatal: your current branch has no commits yet' }];
        return currentFs.commits.flatMap((c, i) => [
          { type: 'output', text: `commit ${c.hash}${i === 0 ? ` (HEAD -> ${currentFs.currentBranch})` : ''}`, color: 'var(--amber)' },
          { type: 'output', text: `    ${c.msg}` },
          { type: 'output', text: '' },
        ]);
      }

      case 'branch': {
        if (!currentFs.initialized) return [{ type: 'output', text: 'fatal: not a git repository', color: 'var(--red)' }];
        if (!rest.length) return currentFs.branches.map(b => ({ type: 'output', text: `${b === currentFs.currentBranch ? '* ' : '  '}${b}`, color: b === currentFs.currentBranch ? 'var(--green)' : undefined }));
        const bname = rest[0];
        if (currentFs.branches.includes(bname)) return [{ type: 'output', text: `fatal: branch '${bname}' already exists`, color: 'var(--red)' }];
        setCurrentFs(p => ({ ...p, branches: [...p.branches, bname] }));
        return [{ type: 'output', text: '' }];
      }

      case 'switch':
      case 'checkout': {
        const createFlag = rest.includes('-b') || rest.includes('-c');
        const bname = rest.filter(r => r !== '-b' && r !== '-c')[0];
        if (!bname) return [{ type: 'output', text: 'error: no branch name provided', color: 'var(--red)' }];
        if (createFlag) {
          setCurrentFs(p => ({ ...p, branches: [...p.branches, bname], currentBranch: bname }));
          return [{ type: 'output', text: `Switched to a new branch '${bname}'`, color: 'var(--green)' }];
        }
        if (!currentFs.branches.includes(bname)) return [{ type: 'output', text: `error: branch '${bname}' not found`, color: 'var(--red)' }];
        setCurrentFs(p => ({ ...p, currentBranch: bname }));
        return [{ type: 'output', text: `Switched to branch '${bname}'`, color: 'var(--green)' }];
      }

      case 'diff': return [{ type: 'output', text: '(no changes to show in simulator)', color: 'var(--text-muted)' }];
      case '--version': return [{ type: 'output', text: 'git version 2.42.0 (GitVerse Simulator)', color: 'var(--green)' }];

      default:
        return [{ type: 'output', text: `git: '${sub}' is not a git command. Try 'help'.`, color: 'var(--red)' }];
    }
  };

  const runCommand = (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const inputLine = { type: 'input', text: trimmed };
    const [prog, ...args] = trimmed.split(/\s+/);
    let results = [];

    if (prog === 'git') {
      results = parseGit(args, fs, setFs);
    } else if (prog === 'touch') {
      const fname = args[0];
      if (!fname) { results = [{ type: 'output', text: 'touch: missing file operand', color: 'var(--red)' }]; }
      else if (fs.files.includes(fname)) { results = [{ type: 'output', text: '' }]; }
      else { setFs(p => ({ ...p, files: [...p.files, fname] })); results = [{ type: 'output', text: '' }]; }
    } else if (prog === 'ls') {
      results = [{ type: 'output', text: fs.files.length ? fs.files.join('  ') : '(empty)', color: 'var(--blue)' }];
    } else if (prog === 'pwd') {
      results = [{ type: 'output', text: `/home/user/${fs.cwd}` }];
    } else if (prog === 'mkdir') {
      results = [{ type: 'output', text: `mkdir: created directory '${args[0] || 'newdir'}'` }];
    } else if (prog === 'clear') {
      setHistory([]);
      setCmdHistory(p => [trimmed, ...p]);
      setInput(''); setHistIdx(-1);
      return;
    } else if (prog === 'help') {
      results = [
        { type: 'output', text: 'Available commands:', color: 'var(--amber)' },
        { type: 'output', text: '  git init / status / add / commit / log / branch / switch / diff / --version' },
        { type: 'output', text: '  touch <file>  ls  pwd  mkdir <dir>  clear  help' },
      ];
    } else {
      results = [{ type: 'output', text: `${prog}: command not found. Type 'help'`, color: 'var(--red)' }];
    }

    setHistory(prev => [...prev, inputLine, ...results]);
    setCmdHistory(prev => [trimmed, ...prev]);
    setInput(''); setHistIdx(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { runCommand(input); return; }
    if (e.key === 'ArrowUp') {
      const idx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(idx); setInput(cmdHistory[idx] || '');
    } else if (e.key === 'ArrowDown') {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx); setInput(idx === -1 ? '' : cmdHistory[idx] || '');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <SectionHeader
          title="💻 Interactive Terminal"
          desc="Type real Git commands. Try: touch index.html → git init → git add . → git commit -m 'first'"
        />
        <button onClick={() => {
          setHistory([{ type: 'output', text: 'Terminal reset.', color: 'var(--green)' }]);
          setFs({ cwd: '~', files: [], staged: [], commits: [], branches: ['main'], currentBranch: 'main', initialized: false });
        }} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)',
          padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer',
          flexShrink: 0,
        }}>reset</button>
      </div>

      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          background: '#050810',
          border: '1px solid var(--border-bright)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
          cursor: 'text',
        }}>
        {/* Title bar */}
        <div style={{
          background: 'var(--bg-card)', padding: '8px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          borderBottom: '1px solid var(--border)',
        }}>
          {['#ff5f56','#ffbd2e','#27c93f'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
          <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            gitverse — {fs.cwd} ({fs.currentBranch})
          </span>
        </div>

        {/* Output */}
        <div style={{ padding: 16, height: 320, overflowY: 'auto' }}>
          {history.map((line, i) => (
            <div key={i} style={{ marginBottom: 2, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              {line.type === 'input' && (
                <>
                  <span style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 13, flexShrink: 0 }}>$</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{line.text}</span>
                </>
              )}
              {line.type === 'output' && (
                <span style={{
                  color: line.color || 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)', fontSize: 13,
                  whiteSpace: 'pre-wrap', paddingLeft: line.text?.startsWith('\t') ? 16 : 0,
                }}>{line.text || '\u00A0'}</span>
              )}
            </div>
          ))}
          {/* Input line */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
            <span style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                fontSize: 13, flex: 1, caretColor: 'var(--green)',
              }}
              autoComplete="off" spellCheck={false}
            />
          </div>
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}

/* ── Shared Helpers ───────────────────────────────────── */
function SectionHeader({ title, desc }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        {title}
      </h3>
      {desc && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{desc}</p>}
    </div>
  );
}

function DropZone({ label, count, countColor, isDragOver, onDragOver, onDrop, onDragLeave, emptyText, highlighted, children }) {
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      style={{
        background: isDragOver
          ? (highlighted ? 'rgba(0,255,136,0.06)' : 'rgba(255,107,107,0.06)')
          : 'var(--bg-elevated)',
        border: `2px dashed ${isDragOver ? (highlighted ? 'rgba(0,255,136,0.4)' : 'rgba(255,107,107,0.4)') : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)', padding: 14, minHeight: 180,
        transition: 'all var(--transition-base)',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>{label}</span>
        <span style={{ background: countColor + '20', color: countColor, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          {count}
        </span>
      </div>
      {!children || (Array.isArray(children) && !children.filter(Boolean).length) ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', marginTop: 36 }}>{emptyText}</div>
      ) : children}
    </div>
  );
}

function FileCard({ file, onDragStart, onDragEnd, onClick, dragging, statusColor, statusLabel, hint, staged }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: staged ? 'var(--green-glow)' : 'var(--bg-card)',
        border: `1px solid ${staged ? 'rgba(0,255,136,0.2)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)', padding: '9px 12px', marginBottom: 7,
        cursor: 'grab', opacity: dragging ? 0.5 : 1,
        transition: 'opacity 0.15s',
        userSelect: 'none',
      }}>
      <span style={{
        background: statusColor + '25', color: statusColor,
        width: 20, height: 20, borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', flexShrink: 0,
      }}>{statusLabel}</span>
      <span style={{ color: staged ? 'var(--green)' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13, flex: 1 }}>
        {file.name}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</span>
    </div>
  );
}

function ModeButton({ children, active, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? color + '25' : 'var(--bg-card)',
      color: active ? color : 'var(--text-secondary)',
      border: `1px solid ${active ? color + '50' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)', padding: '7px 14px',
      fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer',
      transition: 'all var(--transition-fast)',
    }}>{children}</button>
  );
}