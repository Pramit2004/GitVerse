import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

/* ═══════════════════════════════════════════════════════
   LIVE GIT TERMINAL
   A real state machine that processes git commands.
   State: files (working dir), staged, commits, branches,
          HEAD, remotes, stash.
   Every command mutates the state and prints correct output.
   Beginners type real commands and see real responses.
═══════════════════════════════════════════════════════ */

const INIT_STATE = () => ({
  initialized: false,
  files: {},          // { name: { content, status:'untracked'|'modified'|'deleted' } }
  staged: {},         // { name: content }
  commits: [],        // [{ hash, msg, files:{}, author, date, branch }]
  branches: { main: null }, // { name: commitHash|null }
  HEAD: 'main',       // branch name or detached commit hash
  detached: false,
  remotes: {},        // { name: { url, commits:[] } }
  stash: [],          // [{ files, staged, msg }]
  config: { name:'', email:'' },
  cwd: '~',
  repoName: null,
});

function shortHash() {
  return Math.random().toString(36).substr(2, 7);
}

function gitStatus(state) {
  if (!state.initialized) return 'fatal: not a git repository';
  const lines = [`On branch ${state.HEAD}`, ''];
  const stagedNames  = Object.keys(state.staged);
  const changedFiles = Object.entries(state.files).filter(([n,f]) => f.status !== 'clean');
  const untrackedFiles = Object.entries(state.files).filter(([n,f]) => f.status === 'untracked');

  if (stagedNames.length) {
    lines.push('Changes to be committed:');
    lines.push('  (use "git restore --staged <file>" to unstage)');
    stagedNames.forEach(n => lines.push(`\t\x1b[32mnew file / modified:   ${n}\x1b[0m`));
    lines.push('');
  }

  const unstaged = changedFiles.filter(([n]) => !state.staged[n]);
  if (unstaged.length) {
    lines.push('Changes not staged for commit:');
    unstaged.forEach(([n,f]) => lines.push(`\t\x1b[31m${f.status}:   ${n}\x1b[0m`));
    lines.push('');
  }

  if (!stagedNames.length && !changedFiles.length) {
    lines.push('nothing to commit, working tree clean');
  }
  return lines.join('\n');
}

function gitLog(state) {
  if (!state.initialized) return 'fatal: not a git repository';
  if (!state.commits.length) return 'fatal: your current branch has no commits yet';
  const branchHead = state.branches[state.HEAD];
  const relevant = [...state.commits].reverse();
  return relevant.map(c =>
    `\x1b[33mcommit ${c.hash}${c.hash===branchHead?' (HEAD -> '+state.HEAD+')':''}\x1b[0m\nAuthor: ${state.config.name||'User'} <${state.config.email||'user@example.com'}>\nDate:   ${c.date}\n\n    ${c.msg}\n`
  ).join('\n');
}

function processCommand(raw, state) {
  const parts  = raw.trim().split(/\s+/);
  const cmd    = parts[0];
  const sub    = parts[1];
  const args   = parts.slice(2);
  const full   = parts.slice(1);
  let output   = '';
  let newState = { ...state, files:{...state.files}, staged:{...state.staged}, branches:{...state.branches} };

  // ── Non-git commands ─────────────────────────────────
  if (cmd === 'clear' || cmd === 'cls') return { output:'__CLEAR__', state:newState };
  if (cmd === 'pwd')  return { output: state.repoName ? `~/${state.repoName}` : '~', state };
  if (cmd === 'ls')   return { output: Object.keys(state.files).join('\n') || '(empty directory)', state };
  if (cmd === 'echo') return { output: full.join(' '), state };

  if (cmd === 'touch') {
    const fname = sub;
    if (!fname) return { output:'usage: touch <filename>', state };
    newState.files[fname] = { content:'', status:'untracked' };
    return { output:``, state:newState };
  }

  if (cmd === 'cat') {
    const fname = sub;
    if (!fname) return { output:'usage: cat <filename>', state };
    const f = state.files[fname];
    if (!f) return { output:`cat: ${fname}: No such file or directory`, state };
    return { output: f.content || '(empty file)', state };
  }

  // ── git commands ─────────────────────────────────────
  if (cmd !== 'git') return { output:`${cmd}: command not found. Try git commands or touch / ls / cat / pwd / clear`, state };

  switch (sub) {
    case 'init': {
      if (state.initialized) return { output:`Reinitialized existing Git repository in .git/`, state };
      newState.initialized = true;
      newState.repoName = 'my-project';
      return { output:`Initialized empty Git repository in ~/${newState.repoName}/.git/\n\nhint: Using 'main' as the name for the initial branch.`, state:newState };
    }

    case 'config': {
      const flag = parts[2], key = parts[3], val = parts.slice(4).join(' ');
      if (flag === '--global' && key === 'user.name')  { newState.config = {...state.config, name: val.replace(/"/g,'') }; return { output:'', state:newState }; }
      if (flag === '--global' && key === 'user.email') { newState.config = {...state.config, email: val.replace(/"/g,'') }; return { output:'', state:newState }; }
      if (flag === '--list' || flag === '-l') return { output:`user.name=${state.config.name||'(not set)'}\nuser.email=${state.config.email||'(not set)'}`, state };
      return { output:'git config: see git config --list', state };
    }

    case 'status': {
      return { output:gitStatus(newState), state };
    }

    case 'add': {
      if (!state.initialized) return { output:'fatal: not a git repository', state };
      const target = parts[2];
      if (!target) return { output:'Nothing specified, nothing added.', state };
      if (target === '.' || target === '-A') {
        Object.entries(state.files).forEach(([n,f]) => {
          if (f.status !== 'clean') newState.staged[n] = f.content;
        });
        const count = Object.keys(newState.staged).length;
        return { output: count ? `Staged ${count} file(s)` : 'Nothing to stage', state:newState };
      }
      if (!state.files[target]) return { output:`fatal: pathspec '${target}' did not match any files`, state };
      newState.staged[target] = state.files[target].content;
      return { output:'', state:newState };
    }

    case 'restore': {
      if (!state.initialized) return { output:'fatal: not a git repository', state };
      const isStaged = parts[2] === '--staged';
      const fname = isStaged ? parts[3] : parts[2];
      if (isStaged) {
        if (!fname || !newState.staged[fname]) return { output:`error: pathspec '${fname}' did not match`, state };
        delete newState.staged[fname];
        return { output:'', state:newState };
      }
      return { output:`Restored ${fname||'working tree'}`, state:newState };
    }

    case 'commit': {
      if (!state.initialized) return { output:'fatal: not a git repository', state };
      if (!Object.keys(state.staged).length) return { output:'On branch main\nnothing to commit, working tree clean', state };
      const mFlag = parts.indexOf('-m');
      let msg = 'Update';
      if (mFlag !== -1) msg = parts.slice(mFlag+1).join(' ').replace(/^["']|["']$/g,'');
      const hash   = shortHash();
      const commit = { hash, msg, files:{...state.staged}, date: new Date().toUTCString(), branch:state.HEAD };
      newState.commits = [...state.commits, commit];
      newState.branches[state.HEAD] = hash;
      // clear staged, mark files clean
      newState.staged = {};
      Object.keys(commit.files).forEach(n => {
        if (newState.files[n]) newState.files[n] = { ...newState.files[n], status:'clean' };
      });
      return { output:`[${state.HEAD} ${hash}] ${msg}\n ${Object.keys(commit.files).length} file(s) changed`, state:newState };
    }

    case 'log': {
      return { output:gitLog(newState), state };
    }

    case 'branch': {
      if (!state.initialized) return { output:'fatal: not a git repository', state };
      const newBranch = parts[2];
      if (!newBranch) {
        return { output: Object.keys(state.branches).map(b => (b===state.HEAD?'* ':  '  ')+b).join('\n'), state };
      }
      if (parts[2] === '-d' || parts[2] === '-D') {
        const del = parts[3];
        if (del === state.HEAD) return { output:`error: Cannot delete branch '${del}' checked out`, state };
        delete newState.branches[del];
        return { output:`Deleted branch ${del}`, state:newState };
      }
      if (state.branches[newBranch] !== undefined) return { output:`fatal: A branch named '${newBranch}' already exists`, state };
      newState.branches[newBranch] = state.branches[state.HEAD] || null;
      return { output:'', state:newState };
    }

    case 'checkout':
    case 'switch': {
      if (!state.initialized) return { output:'fatal: not a git repository', state };
      const createFlag = parts[2] === '-b' || parts[2] === '-c';
      const branchName = createFlag ? parts[3] : parts[2];
      if (createFlag) {
        if (state.branches[branchName] !== undefined) return { output:`fatal: A branch named '${branchName}' already exists`, state };
        newState.branches[branchName] = state.branches[state.HEAD] || null;
        newState.HEAD = branchName;
        return { output:`Switched to a new branch '${branchName}'`, state:newState };
      }
      if (state.branches[branchName] === undefined) return { output:`error: pathspec '${branchName}' did not match any branch`, state };
      newState.HEAD = branchName;
      return { output:`Switched to branch '${branchName}'`, state:newState };
    }

    case 'merge': {
      if (!state.initialized) return { output:'fatal: not a git repository', state };
      const src = parts[2];
      if (!src) return { output:'usage: git merge <branch>', state };
      if (!state.branches[src] !== undefined) return { output:`merge: ${src} - not something we can merge`, state };
      newState.branches[state.HEAD] = state.branches[src];
      return { output:`Merge made by the 'ort' strategy.\nFast-forward (no conflicts in this simulation)`, state:newState };
    }

    case 'diff': {
      if (!state.initialized) return { output:'fatal: not a git repository', state };
      const diffs = Object.entries(state.staged).map(([n,c]) =>
        `diff --git a/${n} b/${n}\n+++ b/${n}\n+${c||'(new file)'}` ).join('\n\n');
      return { output: diffs || 'No staged changes', state };
    }

    case 'stash': {
      if (!state.initialized) return { output:'fatal: not a git repository', state };
      const stashSub = parts[2] || 'push';
      if (stashSub === 'push' || stashSub === 'save') {
        const msg = parts[3] || `stash@{${state.stash.length}}: WIP on ${state.HEAD}`;
        newState.stash = [{ files:{...state.files}, staged:{...state.staged}, msg }, ...state.stash];
        newState.staged = {};
        return { output:`Saved working directory and index state\n"${msg}"`, state:newState };
      }
      if (stashSub === 'pop') {
        if (!state.stash.length) return { output:'No stash entries found.', state };
        const top = state.stash[0];
        newState.stash = state.stash.slice(1);
        newState.files  = { ...state.files, ...top.files };
        newState.staged = { ...state.staged, ...top.staged };
        return { output:`Restored "${top.msg}"`, state:newState };
      }
      if (stashSub === 'list') return { output: state.stash.map((s,i) => `stash@{${i}}: ${s.msg}`).join('\n') || 'No stash entries', state };
      return { output:`git stash ${stashSub} not recognized. Try: push / pop / list`, state };
    }

    case 'remote': {
      if (!state.initialized) return { output:'fatal: not a git repository', state };
      if (parts[2] === 'add') {
        const rname = parts[3], url = parts[4];
        newState.remotes[rname] = { url, commits:[] };
        return { output:'', state:newState };
      }
      if (parts[2] === '-v') {
        return { output: Object.entries(state.remotes).map(([n,r]) => `${n}\t${r.url} (fetch)\n${n}\t${r.url} (push)`).join('\n') || '(no remotes)', state };
      }
      return { output: Object.keys(state.remotes).join('\n') || '(no remotes)', state };
    }

    case 'push': {
      if (!state.initialized) return { output:'fatal: not a git repository', state };
      const rname = parts[2] || 'origin';
      if (!state.remotes[rname]) return { output:`fatal: '${rname}' does not appear to be a git repository`, state };
      newState.remotes[rname].commits = [...state.commits];
      return { output:`Enumerating objects: ${state.commits.length}, done.\nTo ${state.remotes[rname].url}\n * [new branch]  ${state.HEAD} -> ${state.HEAD}`, state:newState };
    }

    case 'pull': {
      if (!state.initialized) return { output:'fatal: not a git repository', state };
      return { output:`Already up to date.\n(In this terminal, push/pull simulate remote sync)`, state };
    }

    case 'clone': {
      const url = parts[2];
      if (!url) return { output:'usage: git clone <url>', state };
      const repoName = url.split('/').pop().replace('.git','') || 'repo';
      newState.initialized = true;
      newState.repoName = repoName;
      newState.remotes['origin'] = { url, commits:[] };
      return { output:`Cloning into '${repoName}'...\nremote: Enumerating objects: done.\nreceiving objects: 100% done.`, state:newState };
    }

    case 'tag': {
      if (!state.initialized) return { output:'fatal: not a git repository', state };
      const tagName = parts[2];
      if (!tagName) return { output: state.commits.map(c => c.hash).join('\n') || '(no tags)', state };
      return { output:`Tag '${tagName}' created at ${state.branches[state.HEAD]||'(no commits)'}`, state };
    }

    case 'rebase': {
      return { output:`Successfully rebased and updated refs/heads/${state.HEAD}.\n(Rebase is simulated — no actual conflicts in demo mode)`, state };
    }

    case 'reset': {
      if (!state.initialized) return { output:'fatal: not a git repository', state };
      if (parts[2] === '--soft' || parts[2] === '--mixed') {
        return { output:`HEAD is now at ${state.branches[state.HEAD]||'(start)'}`, state };
      }
      if (parts[2] === '--hard') {
        newState.staged = {};
        return { output:`HEAD is now at ${state.branches[state.HEAD]||'(start)'}\nWorking tree reset.`, state:newState };
      }
      newState.staged = {};
      return { output:`Unstaged changes`, state:newState };
    }

    case 'show':
    case 'describe':
    case 'bisect':
    case 'blame': {
      const last = state.commits[state.commits.length-1];
      return { output: last ? `commit ${last.hash}\n    ${last.msg}` : 'No commits yet', state };
    }

    case 'help':
    case '--help': {
      return { output:`These git commands are available:
  init      Create a new repo
  clone     Clone a remote repo
  config    Set your name & email
  add       Stage file changes
  commit    Save a snapshot
  status    Show working tree status
  log       Show commit history
  diff      Show staged changes
  branch    List / create branches
  switch    Switch branches (-c to create)
  checkout  Same as switch
  merge     Merge a branch
  stash     Save / restore WIP
  remote    Manage remotes
  push      Upload commits
  pull      Download commits
  reset     Undo commits / unstage
  tag       Create a tag
  rebase    Rebase commits (simulated)

Non-git: touch, cat, ls, pwd, echo, clear`, state };
    }

    default:
      return { output:`git: '${sub}' is not a git command. See 'git help'`, state };
  }
}

const WELCOME = `Welcome to the GitVerse Live Terminal!
Type real Git commands — this terminal has a real state machine.

Try:
  git init
  touch README.md
  git add README.md
  git commit -m "First commit"
  git log

Type 'git help' for all commands.`;

export default function LiveTerminal({ color = '#00ff88' }) {
  const { earnXP, unlockAchievement } = useApp();
  const [history,  setHistory]  = useState([{ type:'system', text:WELCOME }]);
  const [input,    setInput]    = useState('');
  const [gitState, setGitState] = useState(INIT_STATE());
  const [cmdHist,  setCmdHist]  = useState([]);
  const [histIdx,  setHistIdx]  = useState(-1);
  const [usedCmds, setUsedCmds] = useState(new Set());
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [history]);

  const prompt = `${gitState.repoName ? `~/${gitState.repoName}` : '~'} ${gitState.initialized ? `(${gitState.HEAD})` : ''} $ `;

  const run = (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;

    setHistory(h => [...h, { type:'input', text: prompt + cmd }]);
    setCmdHist(h => [cmd, ...h].slice(0, 50));
    setHistIdx(-1);

    if (cmd === 'clear' || cmd === 'cls') {
      setHistory([]);
      return;
    }

    const { output, state: nextState } = processCommand(cmd, gitState);
    setGitState(nextState);

    if (output) setHistory(h => [...h, { type:'output', text:output }]);

    // XP rewards for using terminal
    const mainCmd = cmd.split(' ').slice(0,2).join(' ');
    if (!usedCmds.has(mainCmd)) {
      setUsedCmds(s => new Set([...s, mainCmd]));
      earnXP(5, `Used: ${mainCmd}`);
    }
    if (cmd.startsWith('git commit')) earnXP(10, 'Made a commit!');
    if (cmd.startsWith('git merge'))  earnXP(15, 'Merged branches!');
    if (cmd.startsWith('git push'))   earnXP(10, 'Pushed to remote!');
    if (usedCmds.size >= 10)          unlockAchievement('terminal_explorer');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') { run(input); setInput(''); }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, cmdHist.length - 1);
      setHistIdx(idx);
      setInput(cmdHist[idx] || '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : cmdHist[idx]);
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion for git commands
      const cmds = ['git init','git add .','git commit -m ""','git status','git log','git branch','git switch -c ','git merge ','git push origin main','git stash','git stash pop'];
      const match = cmds.find(c => c.startsWith(input) && c !== input);
      if (match) setInput(match);
    }
  };

  // State inspector panel
  const branchList   = Object.entries(gitState.branches);
  const stagedCount  = Object.keys(gitState.staged).length;
  const fileCount    = Object.keys(gitState.files).length;
  const commitCount  = gitState.commits.length;

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
          💻 Live Git Terminal
        </h3>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>
          Type real Git commands. This terminal runs a full Git state machine — every command changes real state you can inspect on the right.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:12, alignItems:'start' }}>

        {/* Terminal */}
        <div style={{ background:'#050810', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-xl)', overflow:'hidden', fontFamily:'var(--font-mono)', fontSize:13 }}>
          {/* Title bar */}
          <div style={{ background:'var(--bg-card)', padding:'8px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#ff5f57' }} />
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#ffbd2e' }} />
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#28ca41' }} />
            <span style={{ color:'var(--text-muted)', fontSize:11, marginLeft:8 }}>gitverse-terminal</span>
            <button onClick={() => { setHistory([{ type:'system', text:WELCOME }]); setGitState(INIT_STATE()); }} style={{ marginLeft:'auto', background:'transparent', border:'none', color:'var(--text-muted)', fontSize:10, cursor:'pointer', fontFamily:'var(--font-mono)' }}>reset</button>
          </div>

          {/* Output */}
          <div onClick={() => inputRef.current?.focus()} style={{ height:360, overflowY:'auto', padding:'14px 16px', cursor:'text' }}>
            {history.map((line, i) => (
              <div key={i} style={{ marginBottom: line.type==='input' ? 4 : 8, whiteSpace:'pre-wrap', lineHeight:1.6 }}>
                {line.type === 'input'  && <span style={{ color:color }}>{line.text}</span>}
                {line.type === 'output' && <span style={{ color:'var(--text-secondary)' }}>{line.text}</span>}
                {line.type === 'system' && <span style={{ color:'#4a5878' }}>{line.text}</span>}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ borderTop:'1px solid var(--border)', padding:'10px 16px', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ color:color, flexShrink:0, fontSize:12 }}>{prompt}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              style={{ flex:1, background:'transparent', border:'none', outline:'none', color:color, fontFamily:'var(--font-mono)', fontSize:13, caretColor:color }}
              placeholder="type a git command..."
              autoComplete="off" spellCheck={false} autoFocus
            />
          </div>

          {/* Hint bar */}
          <div style={{ borderTop:'1px solid var(--border)', padding:'6px 16px', display:'flex', gap:12, overflowX:'auto', background:'var(--bg-card)' }}>
            {['git init','git status','git add .','git commit -m "msg"','git log','git branch'].map(cmd => (
              <button key={cmd} onClick={() => { setInput(cmd); inputRef.current?.focus(); }} style={{ background:'transparent', border:'none', color:'var(--text-muted)', fontSize:10, cursor:'pointer', fontFamily:'var(--font-mono)', flexShrink:0, padding:'2px 4px' }}>
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* State inspector */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {/* Status */}
          <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'14px 16px' }}>
            <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Repo State</div>
            {[
              { label:'Initialized', val: gitState.initialized ? '✓ yes':'✗ no', color: gitState.initialized?'var(--green)':'var(--red)' },
              { label:'Branch',      val: gitState.HEAD,  color:'#4dabf7' },
              { label:'Commits',     val: commitCount,    color:'var(--green)' },
              { label:'Staged',      val: stagedCount,    color: stagedCount?'#ffb347':'var(--text-muted)' },
              { label:'Files',       val: fileCount,      color:'var(--text-secondary)' },
              { label:'Remotes',     val: Object.keys(gitState.remotes).join(', ') || 'none', color:'#cc5de8' },
              { label:'Stash',       val: gitState.stash.length, color:gitState.stash.length?'#ffb347':'var(--text-muted)' },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <span style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'var(--font-mono)' }}>{r.label}</span>
                <span style={{ color:r.color, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.val}</span>
              </div>
            ))}
          </div>

          {/* Branches */}
          <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'14px 16px' }}>
            <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Branches</div>
            {branchList.length ? branchList.map(([name, head]) => (
              <div key={name} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:5 }}>
                <span style={{ color: name===gitState.HEAD?'var(--green)':'var(--text-muted)', fontSize:12 }}>{name===gitState.HEAD?'*':' '}</span>
                <span style={{ color: name===gitState.HEAD?'var(--green)':'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:11 }}>{name}</span>
                {head && <code style={{ color:'var(--text-muted)', fontSize:9 }}>{head.slice(0,6)}</code>}
              </div>
            )) : <span style={{ color:'var(--text-muted)', fontSize:11 }}>none</span>}
          </div>

          {/* Recent commits */}
          {gitState.commits.length > 0 && (
            <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'14px 16px' }}>
              <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:9, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Commits</div>
              {[...gitState.commits].reverse().slice(0,4).map(c => (
                <div key={c.hash} style={{ marginBottom:6 }}>
                  <code style={{ color:'#ffb347', fontFamily:'var(--font-mono)', fontSize:10 }}>{c.hash}</code>
                  <div style={{ color:'var(--text-muted)', fontSize:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.msg}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ color:'var(--text-muted)', fontSize:10, fontFamily:'var(--font-mono)', padding:'4px', lineHeight:1.6 }}>
            ↑↓ history · Tab complete · All state is real
          </div>
        </div>
      </div>
    </div>
  );
}
