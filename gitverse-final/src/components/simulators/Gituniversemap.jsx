import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   GIT UNIVERSE — Complete Git Ecosystem Simulation
   Every git command visualized with animated data flow,
   real state changes, zone-by-zone deep-dive panels,
   live repo state inspectors, and step-by-step narration.
═══════════════════════════════════════════════════════════════════ */

const C = {
  you:    { primary:'#00ff88', glow:'rgba(0,255,136,0.25)' },
  github: { primary:'#4dabf7', glow:'rgba(77,171,247,0.25)' },
  alice:  { primary:'#cc5de8', glow:'rgba(204,93,232,0.25)' },
  bob:    { primary:'#ffb347', glow:'rgba(255,179,71,0.25)' },
  local:  { primary:'#63e6be', glow:'rgba(99,230,190,0.2)' },
};

/* ── SVG node positions in 800×440 viewBox ──────────── */
const NODES = {
  you_working: { x:90,  y:160, label:'Working Dir', sub:'📝 your files', color:C.you.primary,    zone:'you'    },
  you_staging: { x:90,  y:270, label:'Staging Area',sub:'🎯 staged',     color:'#ffb347',         zone:'you'    },
  you_repo:    { x:90,  y:380, label:'Local Repo',  sub:'🗄️ .git',       color:C.local.primary,   zone:'you'    },
  github:      { x:400, y:60,  label:'GitHub',      sub:'🌐 remote',      color:C.github.primary,  zone:'github' },
  alice_repo:  { x:670, y:160, label:"Alice's Repo",sub:'👩‍💻 local',     color:C.alice.primary,   zone:'alice'  },
  bob_repo:    { x:670, y:310, label:"Bob's Repo",  sub:'👨‍💻 local',     color:C.bob.primary,     zone:'bob'    },
};

/* ── All git commands with full metadata ─────────────── */
const COMMANDS = [
  // Working → Staging
  { id:'add',         cmd:'git add .',         from:'you_working', to:'you_staging',  color:'#ffb347', group:'local',   emoji:'📦',
    desc:'Moves changed files into the Staging Area (index). Git now knows these files should be in the next commit.',
    detail:'git add . stages ALL modified/untracked files. Use git add <file> for specific files. The staging area is like a loading dock — you decide exactly what goes into each commit.' },
  // Staging → Local Repo
  { id:'commit',      cmd:'git commit',        from:'you_staging', to:'you_repo',     color:'#51cf66', group:'local',   emoji:'📸',
    desc:'Creates a permanent snapshot (commit) from everything in the Staging Area. Saves to your local .git repository.',
    detail:'A commit is a SHA-1 hash pointing to a tree of file snapshots. It stores author, date, message, and parent commit(s). Git NEVER loses commits — even "deleted" ones live in the reflog for 30+ days.' },
  // Local Repo → Working (checkout)
  { id:'checkout',    cmd:'git checkout',      from:'you_repo',    to:'you_working',  color:'#74c0fc', group:'local',   emoji:'⏪',
    desc:'Restores files from a commit or branch into your working directory. Can switch branches or restore specific files.',
    detail:'git checkout <branch> switches your entire working directory. git checkout <hash> -- <file> restores just that file. Use git switch (newer) for branches and git restore for files.' },
  // Working ↔ Stash
  { id:'stash',       cmd:'git stash',         from:'you_working', to:'you_repo',     color:'#63e6be', group:'local',   emoji:'🗃️',
    desc:'Temporarily saves your uncommitted changes to a stash stack, leaving a clean working directory.',
    detail:'Stash is a stack (LIFO). git stash push saves; git stash pop restores the top. You can have multiple stashes. git stash list shows all. Great for switching contexts without committing.' },
  // Local Repo → GitHub (push)
  { id:'push',        cmd:'git push',          from:'you_repo',    to:'github',       color:C.github.primary, group:'remote', emoji:'🚀',
    desc:'Uploads your local commits to GitHub. Other collaborators can now see and pull your changes.',
    detail:'git push origin main sends main branch to remote "origin". Use -u to set upstream tracking. Force push (--force) rewrites remote history — dangerous on shared branches. Always pull before push.' },
  // GitHub → Local Repo (fetch)
  { id:'fetch',       cmd:'git fetch',         from:'github',      to:'you_repo',     color:'#74c0fc', group:'remote', emoji:'📥',
    desc:'Downloads commits from GitHub to your local repo WITHOUT merging. Safe — your working directory is untouched.',
    detail:'Fetch updates your remote-tracking branches (origin/main) but does not touch your local branches. Run git diff origin/main to see what changed before merging. Safer than pull.' },
  // GitHub → Working (pull)
  { id:'pull',        cmd:'git pull',          from:'github',      to:'you_working',  color:C.you.primary, group:'remote', emoji:'⬇️',
    desc:'Downloads commits from GitHub AND immediately merges them into your current branch. fetch + merge in one step.',
    detail:'git pull = git fetch + git merge. Can cause merge conflicts if your local branch has diverged. Some prefer git fetch then git merge for more control. Use --rebase to rebase instead of merge.' },
  // GitHub → Local (clone)
  { id:'clone',       cmd:'git clone',         from:'github',      to:'you_repo',     color:C.you.primary, group:'remote', emoji:'📋',
    desc:'Downloads an entire repository from GitHub — all commits, branches, and history — to your machine.',
    detail:'Clone creates a full copy. Sets up "origin" remote automatically. Checks out the default branch. Use --depth 1 for a shallow clone (just latest commit) for huge repos.' },
  // Alice → GitHub
  { id:'alice_push',  cmd:"Alice: git push",   from:'alice_repo',  to:'github',       color:C.alice.primary, group:'team', emoji:'👩‍💻',
    desc:"Alice pushes her local commits to GitHub. Her changes are now available for everyone to pull.",
    detail:'In team workflows, everyone pushes to the shared remote. If Alice and You both modified the same branch, one of you will need to pull and resolve conflicts before pushing.' },
  // GitHub → Bob
  { id:'bob_pull',    cmd:"Bob: git pull",     from:'github',      to:'bob_repo',     color:C.bob.primary,   group:'team', emoji:'👨‍💻',
    desc:"Bob pulls Alice's latest commits from GitHub. He now has the same codebase as Alice.",
    detail:'This is the pull loop: Alice pushes → Bob pulls. In practice, everyone periodically pulls to stay in sync. The longer you wait, the bigger potential merge conflicts.' },
  // Fork
  { id:'fork',        cmd:'fork on GitHub',    from:'github',      to:'alice_repo',   color:C.alice.primary, group:'team', emoji:'🍴',
    desc:'Alice forks the repo on GitHub — creates her own cloud copy. Used for contributing to open-source projects.',
    detail:'A fork is a GitHub concept (not a Git command). It gives Alice her own remote copy to push to freely. She can then open a Pull Request to propose merging her changes back to the original repo.' },
  // PR
  { id:'pr',          cmd:'Pull Request',      from:'alice_repo',  to:'github',       color:'#f783ac',       group:'team', emoji:'🤝',
    desc:'Alice opens a Pull Request on GitHub to propose merging her branch. Team reviews code before it merges.',
    detail:'PRs are GitHub\'s code review workflow. Reviewers can comment line by line, request changes, or approve. When approved, the branch merges into main. CI/CD often runs automatically on PRs.' },
  // Rebase
  { id:'rebase',      cmd:'git rebase',        from:'you_repo',    to:'you_repo',     color:'#f783ac',       group:'advanced', emoji:'✏️',
    desc:'Rewrites commits to appear as if they branched from a different point. Creates a cleaner, linear history.',
    detail:'Rebase replays your commits on top of another branch. Changes commit hashes. NEVER rebase public/shared branches. Interactive rebase (git rebase -i) lets you squash, edit, or reorder commits.' },
  // Reset
  { id:'reset',       cmd:'git reset',         from:'you_repo',    to:'you_staging',  color:'#ff6b6b',       group:'advanced', emoji:'↩️',
    desc:'Moves the branch pointer backward. --soft keeps changes staged; --mixed unstages; --hard discards everything.',
    detail:'git reset HEAD~1 undoes the last commit. --soft: keeps changes staged. --mixed (default): keeps changes but unstages. --hard: DELETES the changes permanently (but recoverable via reflog for ~30 days).' },
  // Revert
  { id:'revert',      cmd:'git revert',        from:'you_repo',    to:'you_repo',     color:'#ff9f43',       group:'advanced', emoji:'🔄',
    desc:'Creates a NEW commit that undoes a previous commit. Safe for shared branches — does not rewrite history.',
    detail:'Unlike reset, revert is safe on public branches because it adds a new commit rather than removing one. git revert <hash> creates an "undo" commit. Others can still pull without conflict.' },
  // Tag
  { id:'tag',         cmd:'git tag',           from:'you_repo',    to:'github',       color:'#63e6be',       group:'advanced', emoji:'🏷️',
    desc:'Creates a permanent label (tag) on a specific commit. Used for version releases like v1.0.0.',
    detail:'Lightweight tags are just a pointer. Annotated tags (git tag -a) store tagger info + message. Push tags separately with git push origin --tags. Semantic versioning: MAJOR.MINOR.PATCH.' },
];

const GROUPS = [
  { id:'local',    label:'📁 Local Git',      color:'#51cf66', desc:'Commands that work entirely on your machine' },
  { id:'remote',   label:'🌐 Remote / GitHub', color:'#4dabf7', desc:'Commands that communicate with GitHub' },
  { id:'team',     label:'🤝 Team Flow',       color:'#cc5de8', desc:'Multi-developer collaboration patterns' },
  { id:'advanced', label:'⚡ Advanced',        color:'#ffb347', desc:'Rewriting history, tagging, undoing' },
];

/* ── Connection paths between nodes ─────────────────── */
const CONNECTIONS = [
  ['you_working','you_staging'],
  ['you_staging','you_repo'],
  ['you_repo','github'],
  ['alice_repo','github'],
  ['bob_repo','github'],
];

/* ── Animated packet along SVG path ─────────────────── */
function usePackets() {
  const [packets, setPackets] = useState([]);
  const ctr = useRef(0);
  const fire = useCallback((from, to, color, label) => {
    const id = ++ctr.current;
    setPackets(p => [...p, { id, from, to, color, label, t: Date.now() }]);
    setTimeout(() => setPackets(p => p.filter(x => x.id !== id)), 1600);
  }, []);
  return { packets, fire };
}

function lerp(a, b, t) { return a + (b - a) * t; }

function AnimPacket({ from, to, color, label, progress }) {
  const f = NODES[from], t2 = NODES[to];
  if (!f || !t2) return null;
  const cx = lerp(f.x, t2.x, progress);
  const cy = lerp(f.y, t2.y, progress);
  const opacity = progress < 0.1 ? progress * 10 : progress > 0.9 ? (1 - progress) * 10 : 1;
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={color} opacity={opacity * 0.9} style={{ filter:`drop-shadow(0 0 8px ${color})` }} />
      <circle cx={cx} cy={cy} r={4} fill="#fff" opacity={opacity * 0.7} />
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize={9} fill={color} fontFamily="var(--font-mono)" fontWeight="700" opacity={opacity}>
        {label}
      </text>
    </g>
  );
}

function LivePacket({ packet }) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const duration = 1400;

  useEffect(() => {
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, []);

  return <AnimPacket {...packet} progress={progress} />;
}

/* ── Zone background areas ───────────────────────────── */
const ZONES = [
  { id:'you',    x:18,  y:80,  w:200, h:340, label:'Your Machine',   color:'#00ff88' },
  { id:'github', x:300, y:18,  w:200, h:80,  label:'GitHub Cloud',   color:'#4dabf7' },
  { id:'team',   x:580, y:80,  w:170, h:300, label:'Teammates',      color:'#cc5de8' },
];

export default function GitUniverseMap({ color = '#4dabf7' }) {
  const { packets, fire } = usePackets();
  const [activeCmd, setActiveCmd] = useState(null);
  const [activeGroup, setActiveGroup] = useState('local');
  const [repoState, setRepoState] = useState({
    you: { commits: 2, staged: 0, modified: 1, branch: 'main', stash: 0 },
    github: { commits: 2, branches: 1 },
    alice: { commits: 2, branch: 'feature/nav' },
    bob: { commits: 2, branch: 'main' },
  });
  const [log, setLog] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [animatingNodes, setAnimatingNodes] = useState(new Set());

  const flashNode = (nodeId) => {
    setAnimatingNodes(s => new Set([...s, nodeId]));
    setTimeout(() => setAnimatingNodes(s => { const n = new Set(s); n.delete(nodeId); return n; }), 800);
  };

  const runCommand = (cmd) => {
    setActiveCmd(cmd);
    setShowDetail(false);

    // Fire packet(s)
    fire(cmd.from, cmd.to, cmd.color, cmd.cmd.split(' ').slice(0,2).join(' '));
    setTimeout(() => { flashNode(cmd.from); flashNode(cmd.to); }, 700);

    // Update repo state
    setRepoState(prev => {
      const s = JSON.parse(JSON.stringify(prev));
      if (cmd.id === 'add')        { s.you.staged = s.you.modified; s.you.modified = 0; }
      if (cmd.id === 'commit')     { s.you.commits++; s.you.staged = 0; s.github.commits = s.you.commits; }
      if (cmd.id === 'stash')      { s.you.stash = (s.you.stash||0)+1; s.you.modified=0; }
      if (cmd.id === 'push')       { s.github.commits = s.you.commits; }
      if (cmd.id === 'fetch')      { /* no state change, just awareness */ }
      if (cmd.id === 'pull')       { s.you.commits = Math.max(s.you.commits, s.github.commits); }
      if (cmd.id === 'clone')      { s.you.commits = s.github.commits; }
      if (cmd.id === 'alice_push') { s.github.commits = Math.max(s.github.commits, s.alice.commits + 1); s.alice.commits++; }
      if (cmd.id === 'bob_pull')   { s.bob.commits = s.github.commits; }
      return s;
    });

    setLog(l => [{
      id: Date.now(), cmd: cmd.cmd, emoji: cmd.emoji,
      color: cmd.color, desc: cmd.desc.slice(0, 60) + '…'
    }, ...l].slice(0, 6));
  };

  const groupCmds = COMMANDS.filter(c => c.group === activeGroup);

  /* ── Node tooltip ─────────────────────────────────── */
  const NODE_DETAILS = {
    you_working: { title:'Working Directory', body:'Your actual files on disk. Any edit here is "unstaged" — Git tracks the change but it\'s not in the next commit yet. Run git status to see.' },
    you_staging: { title:'Staging Area (Index)', body:'The "loading dock" before a commit. Only staged files get committed. This lets you craft precise commits even when you\'ve changed many files.' },
    you_repo:    { title:'Local Repository (.git)', body:'The hidden .git/ folder. Contains your entire commit history, branches, tags, stash, and config. Everything Git knows lives here.' },
    github:      { title:'GitHub Remote', body:'The shared cloud copy. Others pull from here, you push to here. Acts as the single source of truth for the team.' },
    alice_repo:  { title:"Alice's Local Repo", body:"Alice's full local copy of the project. She can commit freely here without affecting you or the remote until she pushes." },
    bob_repo:    { title:"Bob's Local Repo", body:"Bob's local copy. Independent from Alice's and yours until someone pushes/pulls." },
  };

  return (
    <div style={{ fontFamily:'var(--font-mono)' }}>

      {/* Header */}
      <div style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
          🌌 Git Universe
        </h3>
        <p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.6 }}>
          The complete Git ecosystem. Every command, every data flow, every state change — visualized. Click any command to watch your data travel.
        </p>
      </div>

      {/* Group tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {GROUPS.map(g => (
          <button key={g.id} onClick={() => setActiveGroup(g.id)} style={{
            background: activeGroup===g.id ? g.color+'22' : 'var(--bg-elevated)',
            border: `1px solid ${activeGroup===g.id ? g.color+'66' : 'var(--border)'}`,
            color: activeGroup===g.id ? g.color : 'var(--text-muted)',
            borderRadius:'var(--radius-md)', padding:'6px 14px',
            fontSize:12, cursor:'pointer', fontWeight: activeGroup===g.id ? 700:400,
            transition:'all 0.15s',
          }}>{g.label}</button>
        ))}
      </div>

      {/* Command palette */}
      <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:14 }}>
        {groupCmds.map(cmd => (
          <button key={cmd.id} onClick={() => runCommand(cmd)} style={{
            background: activeCmd?.id===cmd.id ? cmd.color+'20' : 'var(--bg-elevated)',
            border: `2px solid ${activeCmd?.id===cmd.id ? cmd.color+'88' : 'var(--border)'}`,
            color: activeCmd?.id===cmd.id ? cmd.color : 'var(--text-secondary)',
            borderRadius:'var(--radius-lg)', padding:'8px 16px',
            fontSize:12, cursor:'pointer', fontWeight:700,
            transition:'all 0.12s', display:'flex', alignItems:'center', gap:7,
            boxShadow: activeCmd?.id===cmd.id ? `0 0 16px ${cmd.color}30` : 'none',
          }}>
            <span style={{ fontSize:16 }}>{cmd.emoji}</span>
            <span>{cmd.cmd}</span>
          </button>
        ))}
      </div>

      {/* Main SVG Universe */}
      <div style={{ background:'radial-gradient(ellipse at 30% 40%, #0d1b2e 0%, #080c14 70%)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', overflow:'hidden', marginBottom:14, position:'relative' }}>

        <svg viewBox="0 0 800 460" style={{ width:'100%', display:'block' }}>

          {/* Stars */}
          {Array.from({length:80}).map((_,i) => (
            <circle key={i}
              cx={(i*97.3+17)%800} cy={(i*61.7+11)%460}
              r={i%5===0 ? 1.2 : 0.6}
              fill="#fff"
              opacity={0.1 + (i%7)*0.04}
            />
          ))}

          {/* Zone backgrounds */}
          {ZONES.map(z => (
            <g key={z.id}>
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={14}
                fill={z.color+'06'} stroke={z.color+'20'} strokeWidth={1}
                strokeDasharray="6 3"
              />
              <text x={z.x+z.w/2} y={z.y+16} textAnchor="middle"
                fill={z.color+'50'} fontSize={9} fontFamily="var(--font-mono)" fontWeight="700"
                textTransform="uppercase" letterSpacing="1">
                {z.label}
              </text>
            </g>
          ))}

          {/* Connection lines */}
          {CONNECTIONS.map(([a,b]) => {
            const n1 = NODES[a], n2 = NODES[b];
            const isActive = activeCmd && (activeCmd.from===a||activeCmd.to===a||activeCmd.from===b||activeCmd.to===b);
            const c1 = n1.color, c2 = n2.color;
            return (
              <line key={a+b}
                x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                stroke={isActive ? c1 : '#ffffff14'}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? 'none' : '5 4'}
                style={{ transition:'stroke 0.3s, stroke-width 0.3s' }}
              />
            );
          })}

          {/* Extra connections for team */}
          <line x1={NODES.you_repo.x} y1={NODES.you_repo.y} x2={NODES.github.x} y2={NODES.github.y}
            stroke="#ffffff14" strokeWidth={1} strokeDasharray="5 4" />

          {/* Live packets */}
          {packets.map(pk => <LivePacket key={pk.id} packet={pk} />)}

          {/* Nodes */}
          {Object.entries(NODES).map(([id, n]) => {
            const isHovered  = hoveredNode === id;
            const isAnimating = animatingNodes.has(id);
            const isActive   = activeCmd && (activeCmd.from===id || activeCmd.to===id);
            const stateKey   = id === 'you_working' ? 'you' : id === 'you_staging' ? 'you' : id === 'you_repo' ? 'you' : id.split('_')[0];
            const rs         = repoState[stateKey];

            return (
              <g key={id}
                onMouseEnter={() => setHoveredNode(id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor:'pointer' }}>

                {/* Glow ring when active */}
                {(isActive || isAnimating) && (
                  <circle cx={n.x} cy={n.y} r={42}
                    fill={n.color+'10'} stroke={n.color+'40'} strokeWidth={1.5}
                    style={{ animation: isAnimating ? 'pulse 0.6s ease-out' : 'none' }}
                  />
                )}

                {/* Hover ring */}
                {isHovered && (
                  <circle cx={n.x} cy={n.y} r={38} fill="none"
                    stroke={n.color+'55'} strokeWidth={1} strokeDasharray="4 2"
                  />
                )}

                {/* Node body */}
                <circle cx={n.x} cy={n.y} r={30}
                  fill={isActive ? n.color+'25' : '#0d1525'}
                  stroke={isActive ? n.color : n.color+'55'}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ transition:'all 0.2s', filter: isActive ? `drop-shadow(0 0 12px ${n.color}88)` : 'none' }}
                />

                {/* Icon */}
                <text x={n.x} y={n.y+2} textAnchor="middle" dominantBaseline="middle"
                  fontSize={16} style={{ userSelect:'none' }}>
                  {id==='you_working'?'📝':id==='you_staging'?'🎯':id==='you_repo'?'🗄️':
                   id==='github'?'🌐':id==='alice_repo'?'👩‍💻':'👨‍💻'}
                </text>

                {/* Label */}
                <text x={n.x} y={n.y+38} textAnchor="middle"
                  fill={isActive ? n.color : n.color+'cc'}
                  fontSize={8.5} fontFamily="var(--font-mono)" fontWeight="700">
                  {n.label}
                </text>

                {/* Sub-label */}
                <text x={n.x} y={n.y+50} textAnchor="middle"
                  fill={n.color+'66'} fontSize={7} fontFamily="var(--font-mono)">
                  {n.sub}
                </text>

                {/* Commit counter badge for repo nodes */}
                {(id==='you_repo'||id==='github'||id==='alice_repo'||id==='bob_repo') && rs && (
                  <g>
                    <circle cx={n.x+22} cy={n.y-22} r={11} fill={n.color} />
                    <text x={n.x+22} y={n.y-18} textAnchor="middle"
                      fill="#000" fontSize={8} fontFamily="var(--font-mono)" fontWeight="900">
                      {id==='you_repo'?rs.commits:id==='github'?repoState.github.commits:
                       id==='alice_repo'?repoState.alice.commits:repoState.bob.commits}
                    </text>
                    <text x={n.x+22} y={n.y-9} textAnchor="middle"
                      fill="#00000088" fontSize={5.5} fontFamily="var(--font-mono)">cmts</text>
                  </g>
                )}

                {/* Staged badge */}
                {id==='you_staging' && repoState.you.staged > 0 && (
                  <g>
                    <circle cx={n.x+22} cy={n.y-22} r={11} fill="#ffb347" />
                    <text x={n.x+22} y={n.y-15} textAnchor="middle"
                      fill="#000" fontSize={8} fontFamily="var(--font-mono)" fontWeight="900">
                      {repoState.you.staged}
                    </text>
                  </g>
                )}

                {/* Modified badge */}
                {id==='you_working' && repoState.you.modified > 0 && (
                  <g>
                    <circle cx={n.x+22} cy={n.y-22} r={11} fill="#ff6b6b" />
                    <text x={n.x+22} y={n.y-15} textAnchor="middle"
                      fill="#fff" fontSize={8} fontFamily="var(--font-mono)" fontWeight="900">
                      ✎{repoState.you.modified}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Node tooltip */}
          {hoveredNode && NODE_DETAILS[hoveredNode] && (() => {
            const n = NODES[hoveredNode];
            const d = NODE_DETAILS[hoveredNode];
            const tx = Math.min(Math.max(n.x - 100, 8), 600);
            const ty = n.y < 200 ? n.y + 60 : n.y - 100;
            return (
              <g style={{ pointerEvents:'none' }}>
                <rect x={tx} y={ty} width={200} height={70} rx={8}
                  fill="#0d1525" stroke={n.color+'55'} strokeWidth={1} />
                <text x={tx+10} y={ty+16} fill={n.color} fontSize={9} fontFamily="var(--font-mono)" fontWeight="700">
                  {d.title}
                </text>
                {d.body.split('. ').slice(0,2).map((line,i) => (
                  <text key={i} x={tx+10} y={ty+30+i*14} fill="#ffffff80" fontSize={7.5} fontFamily="var(--font-mono)">
                    {line.slice(0,38)}{line.length>38?'…':''}
                  </text>
                ))}
              </g>
            );
          })()}

          {/* "YOU ARE HERE" pointer */}
          <text x={90} y={68} textAnchor="middle" fill="#00ff8866" fontSize={8} fontFamily="var(--font-mono)">▶ YOU</text>

          {/* Branch labels */}
          <text x={90} y={440} textAnchor="middle" fill={`${C.you.primary}50`} fontSize={8} fontFamily="var(--font-mono)">
            branch: {repoState.you.branch}
          </text>
          <text x={670} y={440} textAnchor="middle" fill={`${C.alice.primary}50`} fontSize={8} fontFamily="var(--font-mono)">
            branch: {repoState.alice.branch}
          </text>
        </svg>
      </div>

      {/* Active command deep-dive */}
      {activeCmd && (
        <div style={{ background:`linear-gradient(135deg,${activeCmd.color}10,${activeCmd.color}05)`, border:`1px solid ${activeCmd.color}35`, borderRadius:'var(--radius-xl)', padding:'18px 22px', marginBottom:12, animation:'fadeInUp 0.2s ease' }}>
          <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
            <span style={{ fontSize:32, flexShrink:0 }}>{activeCmd.emoji}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginBottom:6 }}>
                <code style={{ color:activeCmd.color, fontSize:15, fontWeight:700 }}>{activeCmd.cmd}</code>
                <span style={{ background:activeCmd.color+'20', color:activeCmd.color, fontSize:9, padding:'2px 8px', borderRadius:20, fontWeight:700, textTransform:'uppercase' }}>
                  {NODES[activeCmd.from]?.label} → {NODES[activeCmd.to]?.label}
                </span>
              </div>
              <p style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.6, margin:0 }}>{activeCmd.desc}</p>
            </div>
            <button onClick={() => setShowDetail(d => !d)} style={{ background:'transparent', border:`1px solid ${activeCmd.color}40`, color:activeCmd.color, borderRadius:'var(--radius-sm)', padding:'4px 10px', fontSize:10, cursor:'pointer', flexShrink:0 }}>
              {showDetail ? 'less ↑' : 'deep dive ↓'}
            </button>
          </div>
          {showDetail && (
            <div style={{ background:'var(--bg-card)', borderRadius:'var(--radius-lg)', padding:'14px 18px', borderLeft:`3px solid ${activeCmd.color}`, animation:'fadeIn 0.15s ease' }}>
              <div style={{ color:'var(--text-muted)', fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>How it works</div>
              <p style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.8, margin:0 }}>{activeCmd.detail}</p>
            </div>
          )}
        </div>
      )}

      {/* Repo State Dashboard */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:8, marginBottom:12 }}>
        {[
          { label:'Your Repo', icon:'🗄️', c:C.you.primary,    items:[`commits: ${repoState.you.commits}`, `staged: ${repoState.you.staged}`, `modified: ${repoState.you.modified}`, `stash: ${repoState.you.stash||0}`, `branch: ${repoState.you.branch}`] },
          { label:'GitHub',    icon:'🌐', c:C.github.primary,  items:[`commits: ${repoState.github.commits}`, `branches: ${repoState.github.branches}`] },
          { label:"Alice",     icon:'👩‍💻', c:C.alice.primary,  items:[`commits: ${repoState.alice.commits}`, `branch: ${repoState.alice.branch}`] },
          { label:"Bob",       icon:'👨‍💻', c:C.bob.primary,    items:[`commits: ${repoState.bob.commits}`, `branch: ${repoState.bob.branch}`] },
        ].map(panel => (
          <div key={panel.label} style={{ background:'var(--bg-elevated)', border:`1px solid ${panel.c}28`, borderRadius:'var(--radius-lg)', padding:'12px 14px' }}>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:16 }}>{panel.icon}</span>
              <span style={{ color:panel.c, fontSize:11, fontWeight:700 }}>{panel.label}</span>
            </div>
            {panel.items.map(item => (
              <div key={item} style={{ color:'var(--text-muted)', fontSize:10, marginBottom:3 }}>
                <span style={{ color:panel.c+'80' }}>›</span> {item}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Event log */}
      {log.length > 0 && (
        <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'12px 16px' }}>
          <div style={{ color:'var(--text-muted)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Command History</div>
          {log.map(l => (
            <div key={l.id} style={{ display:'flex', gap:10, alignItems:'center', marginBottom:6, animation:'fadeInRight 0.2s ease' }}>
              <span style={{ fontSize:14 }}>{l.emoji}</span>
              <code style={{ color:l.color, fontSize:11, fontWeight:700, flexShrink:0, minWidth:120 }}>{l.cmd}</code>
              <span style={{ color:'var(--text-muted)', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.desc}</span>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}`}</style>
    </div>
  );
}
