import React, { useState, useEffect, useRef } from 'react';

/* ══════════════════════════════════════════════════════════════
   GitVerse — Complete Git Guide Page
   Beautiful interactive reference, fully responsive
══════════════════════════════════════════════════════════════ */

const G = {
  bg:      '#05080f',
  s1:      '#0a0f1a',
  s2:      '#0e1520',
  s3:      '#131c2b',
  s4:      '#182235',
  b1:      'rgba(255,255,255,0.04)',
  b2:      'rgba(255,255,255,0.07)',
  b3:      'rgba(255,255,255,0.12)',
  green:   '#00e5a0',
  cyan:    '#00d4ff',
  blue:    '#4d9fff',
  orange:  '#ff9f43',
  red:     '#ff5252',
  purple:  '#b47aff',
  yellow:  '#ffd60a',
  t1:      '#e8f0fe',
  t2:      '#8ba3c7',
  t3:      '#4a6080',
  t4:      '#2a3d55',
  mono:    "'JetBrains Mono', 'Fira Code', monospace",
  ui:      "'Inter', system-ui, sans-serif",
};

// ── Data: all guide sections ──────────────────────────────────

const SECTIONS = [
  {
    id: 'what-is-git', icon: '🧠', label: 'What is Git?', color: G.blue,
    title: 'What is Git?',
    subtitle: 'A time machine for your code — not just a backup tool',
    blocks: [
      { type: 'grid2', items: [
        { kind: 'card', label: 'WHAT', color: G.blue, text: 'Git is a **version control system**. It tracks every change to every file, forever. Like Google Docs version history — but for code, infinitely more powerful.' },
        { kind: 'card', label: 'WHY', color: G.orange, text: 'Without Git, one mistake can destroy days of work. With Git **nothing is ever truly lost**. Go back to any point, work on multiple features, collaborate without overwriting.' },
      ]},
      { type: 'callout', variant: 'tip', icon: '💡', text: '**Mental model:** Git is like a video game save system. Save at any point, try something risky, and if it breaks — reload. You can have multiple save slots (branches) running in parallel.' },
      { type: 'diagram', title: '📸 Git as a Timeline of Snapshots', content: `  Time ────────────────────────────────────────────────────────▶

  First files     Added login    Fixed bug    Added profile    Now
      │               │              │              │           │
      ▼               ▼              ▼              ▼           ▼
  ●───────────────●──────────────●─────────────●────────────●
  a1b2c3          d4e5f6         g7h8i9         j0k1l2       HEAD

  ← You can jump back to any point: git checkout a1b2c3` },
      { type: 'grid2', items: [
        { kind: 'card', label: 'GIT', color: G.orange, text: 'A tool that runs **on your computer**. Manages local version history. Works with zero internet.' },
        { kind: 'card', label: 'GITHUB', color: G.purple, text: 'A **website** that stores your Git repo in the cloud. Where teams share code, review changes, manage projects. Like Google Drive — but for Git.' },
      ]},
    ]
  },
  {
    id: 'three-zones', icon: '📦', label: 'The 3 Zones', color: G.cyan,
    title: 'The 3 Zones',
    subtitle: 'The most important thing to understand about Git',
    blocks: [
      { type: 'diagram', title: '🗂 The 3 Zones of Git', content: `  ┌───────────────────┐  git add  ┌───────────────────┐  git commit  ┌───────────────────┐
  │  WORKING DIR      │ ────────▶ │  STAGING AREA     │ ──────────▶ │  REPOSITORY       │
  │  (your files)     │ ◀──────── │  (the draft)      │ ◀────────── │  (saved history)  │
  └───────────────────┘ restore   └───────────────────┘  reset      └───────────────────┘
  What you see & edit          What you've said "yes"        Permanent snapshots` },
      { type: 'grid3', items: [
        { kind: 'card', label: '1. WORKING DIR', color: G.blue, text: 'The actual files on your computer. When you type in VS Code — that change is here. Git knows about it but hasn\'t saved it yet.' },
        { kind: 'card', label: '2. STAGING AREA', color: G.yellow, text: 'A **preparation zone**. You pick exactly which changes go into your next commit. Stage some files, leave others out.' },
        { kind: 'card', label: '3. REPOSITORY', color: G.green, text: 'Permanent history stored in a hidden `.git` folder. Every commit lives here forever. This is what gets pushed to GitHub.' },
      ]},
      { type: 'cmd', title: 'Seeing which zone your files are in', lines: [
        { prompt: '$', cmd: 'git status', comment: 'Shows files in each zone' },
        { out: 'Changes to be committed:    ← STAGING AREA', color: G.green },
        { out: '    modified: login.js', color: G.green },
        { out: 'Changes not staged:         ← WORKING DIRECTORY', color: G.orange },
        { out: '    modified: App.js', color: G.orange },
        { out: 'Untracked files:            ← NEW (never added)', color: G.blue },
        { out: '    profile.js', color: G.blue },
      ]},
      { type: 'callout', variant: 'warn', icon: '⚠️', text: '**Common mistake:** Run `git commit` and wonder why changes aren\'t saved. Reason: forgot `git add` first. You must move files to staging before committing.' },
    ]
  },
  {
    id: 'commits', icon: '📸', label: 'Commits', color: G.green,
    title: 'Commits',
    subtitle: 'Each commit is a complete snapshot — not just the diff',
    blocks: [
      { type: 'grid2', items: [
        { kind: 'card', label: 'WHAT', color: G.blue, text: 'A commit is a **saved snapshot** of all tracked files at a specific moment. Includes the changes, a message, who made it, and when.' },
        { kind: 'card', label: 'WHY', color: G.orange, text: 'Commits let you **tell the story of your code**. Good history reads like a book — each commit is one logical change with a clear description.' },
      ]},
      { type: 'flow', steps: [
        { n: '1', title: 'Edit your files', desc: 'Open any file, make changes. Git automatically detects what changed.' },
        { n: '2', title: 'Stage what you want', desc: 'Tell Git which changes belong in this commit.', cmd: 'git add login.js\ngit add .     # or stage everything' },
        { n: '3', title: 'Commit with a meaningful message', desc: 'The message should complete: "This commit will…"', cmd: 'git commit -m "add login form validation"' },
      ]},
      { type: 'table', head: ['❌ Bad', '✅ Good', 'Why'], rows: [
        ['fix', 'fix null pointer crash on logout', 'Says what was fixed and where'],
        ['changes', 'add email validation to signup form', 'Says what was added'],
        ['wip', 'refactor auth to use JWT tokens', 'Says what and how'],
        ['update', 'update README with install steps', 'Says what was updated'],
      ]},
      { type: 'hood', title: '🔬 Under the Hood — What a Commit Actually Is', text: 'Every commit is stored as a blob object in `.git/objects/`. It contains:\n• A **tree** — pointer to all files snapshot\n• A **parent** — pointer to the previous commit (the chain)\n• The **author**, **timestamp**, and **message**\n• A **SHA-1 hash** — unique fingerprint (e.g. `a1b2c3d4`)\n\nIf anything changes (even one character), the hash is completely different.' },
    ]
  },
  {
    id: 'branches', icon: '🌿', label: 'Why Branches?', color: G.orange,
    title: 'Why Branches?',
    subtitle: 'The answer to "why not just work on main?"',
    blocks: [
      { type: 'callout', variant: 'info', icon: '💡', text: '**Best analogy:** Writing a book. The published version is on your desk. You want to try a new chapter. You don\'t scribble in the published book — you **make a photocopy**, experiment on it, and if you like it, merge it in. Branches are those photocopies.' },
      { type: 'grid2', items: [
        { kind: 'card', label: 'WHAT', color: G.blue, text: 'A branch is a **separate, parallel version** of your codebase. Changes on one branch don\'t affect others until you explicitly merge.' },
        { kind: 'card', label: 'WHY', color: G.orange, text: 'So **in-progress work never breaks the working version**. `main` is always stable. New features, fixes, experiments — all on separate branches.' },
        { kind: 'card', label: 'WHEN', color: G.purple, text: 'Every time you start **any** new work: feature, bug fix, experiment, docs update. One branch = one unit of work.' },
        { kind: 'card', label: 'WHERE', color: G.cyan, text: 'Locally with `git switch -c branch-name`. It doesn\'t exist on GitHub until you push it.' },
      ]},
      { type: 'diagram', title: '🌿 Branches in Action — Visual Timeline', content: `                    ┌── feature/login branch ──────────────────┐
                    │                                          │
  main  ●───────────●──────────────────────────────────────────●──────●
        │         branch                                      merge   │
        │         created                                             │
        └── main stays untouched while you work ───────────────────┘

  main:      a1b2c3 ──── d4e5f6 ────────────────────────── m1n2o3
                          │                                   │
  feature/login:          └── e1f2g3 ── h4i5j6 ── k7l8m9 ──┘
                               add form   validate   tests` },
      { type: 'cmd', title: 'Working with branches', lines: [
        { prompt: '$', cmd: 'git branch', comment: 'List branches (* = current)' },
        { prompt: '$', cmd: 'git switch -c feature/login', comment: 'Create AND switch' },
        { prompt: '$', cmd: 'git switch main', comment: 'Go back to main' },
        { prompt: '$', cmd: 'git branch -d feature/login', comment: 'Delete (after merging)' },
      ]},
      { type: 'table', head: ['Pattern', 'Example', 'Use for'], rows: [
        ['feature/', 'feature/user-auth', 'New functionality'],
        ['fix/', 'fix/login-crash', 'Bug fixes'],
        ['hotfix/', 'hotfix/payment-error', 'Urgent production fixes'],
        ['docs/', 'docs/api-reference', 'Documentation'],
        ['refactor/', 'refactor/auth-service', 'Code cleanup'],
      ]},
    ]
  },
  {
    id: 'pull', icon: '⬇️', label: 'Pull & Fetch', color: G.cyan,
    title: 'Pull & Fetch',
    subtitle: 'Getting code FROM GitHub — when, where, which branch',
    blocks: [
      { type: 'grid2', items: [
        { kind: 'card', label: 'git fetch', color: G.blue, text: 'Downloads changes from GitHub **without applying them**. Your files don\'t change. Updates Git\'s knowledge of what\'s on GitHub. Safe to run anytime.' },
        { kind: 'card', label: 'git pull', color: G.green, text: '`git fetch` + `git merge` in one command. Downloads AND applies changes to your current branch. **This changes your files.**' },
      ]},
      { type: 'callout', variant: 'tip', icon: '⏰', text: '**Pull at the start of every work session** — before you touch any code. Your team pushed commits while you were away. Starting without pulling means your local main is stale.' },
      { type: 'cmd', title: 'The right pull sequence every morning', lines: [
        { prompt: '$', cmd: 'git switch main', comment: 'Always pull on main' },
        { prompt: '$', cmd: 'git pull origin main', comment: 'Get latest from GitHub' },
        { prompt: '$', cmd: 'git switch -c feature/my-feature', comment: 'Branch off fresh main' },
      ]},
      { type: 'diagram', title: '📥 git pull = fetch + merge', content: `  GitHub (origin/main):  A ── B ── C ── D ── E   (team pushed D and E)

  Your local main:        A ── B ── C              (you're behind by 2)

  After git pull:
  Your local main:        A ── B ── C ── D ── E   ✓ up to date` },
      { type: 'callout', variant: 'danger', icon: '🚨', text: '**Never pull someone else\'s feature branch into your work** unless you need their changes. Pulling means merging — you might accidentally merge unfinished code.' },
    ]
  },
  {
    id: 'pull-request', icon: '🔀', label: 'Pull Requests', color: G.purple,
    title: 'Pull Requests',
    subtitle: 'Where files go, how review works, everything',
    blocks: [
      { type: 'callout', variant: 'info', icon: '📌', text: '**A PR is NOT a Git feature — it\'s a GitHub feature.** Git doesn\'t know about PRs. A PR is GitHub\'s UI for saying "please review my branch before merging into main."' },
      { type: 'grid2', items: [
        { kind: 'card', label: 'WHERE ARE THE FILES?', color: G.cyan, text: 'Files **live on your branch on GitHub**. When you open a PR, GitHub shows what changed. Nothing is "sent" — the reviewer looks at your branch.' },
        { kind: 'card', label: 'WHEN', color: G.purple, text: 'When your feature/fix is done and tested. Push your branch, then open a PR from `feature/login` → `main`.' },
      ]},
      { type: 'flow', steps: [
        { n: '1', title: 'Do your work on a feature branch', cmd: 'git switch -c feature/login\n# ... edit, add, commit ...' },
        { n: '2', title: 'Push your branch to GitHub', cmd: 'git push -u origin feature/login' },
        { n: '3', title: 'Open PR on GitHub', desc: 'Go to github.com → "Compare & pull request" → base: main, compare: feature/login → Write description → Create.' },
        { n: '4', title: 'Reviewer asks for changes', desc: 'You commit more to the same branch and push — the PR updates automatically.', cmd: 'git add .\ngit commit -m "fix: address review feedback"\ngit push   # PR updates automatically' },
        { n: '5', title: 'Approved → Merge on GitHub', desc: 'Click "Merge pull request". Your feature is now part of main.' },
        { n: '6', title: 'Pull updated main locally', cmd: 'git switch main\ngit pull origin main' },
      ]},
    ]
  },
  {
    id: 'issues', icon: '🐛', label: 'Issues → Code', color: G.red,
    title: 'Issues → Code → Merge',
    subtitle: 'Full lifecycle: from bug report to merged fix',
    blocks: [
      { type: 'grid2', items: [
        { kind: 'card', label: 'WHAT IS AN ISSUE?', color: G.blue, text: 'A task, bug report, or feature request on GitHub. Like sticky notes — they track "things to do." Each gets a number like **#42**.' },
        { kind: 'card', label: 'WHY', color: G.orange, text: 'Issues are the **starting point of all work**. Before writing code, an issue is created. Reference it in your commit for a traceable history.' },
      ]},
      { type: 'flow', steps: [
        { n: '1', title: 'Issue is created on GitHub', desc: '"Login button crashes on mobile — Issue #42" with description, steps to reproduce, expected vs actual.' },
        { n: '2', title: 'Get latest main first', cmd: 'git switch main\ngit pull origin main' },
        { n: '3', title: 'Create a branch for this issue', cmd: 'git switch -c fix/42-login-crash-mobile' },
        { n: '4', title: 'Find & fix the relevant files', desc: 'All project files are already on your machine after cloning. Just open them in your editor.', cmd: 'code src/components/LoginButton.js' },
        { n: '5', title: 'Commit referencing the issue', desc: 'Using "Fixes #42" or "Closes #42" auto-closes the issue when the PR merges.', cmd: 'git add src/components/LoginButton.js\ngit commit -m "fix: resolve login crash on mobile\n\nCloses #42"' },
        { n: '6', title: 'Push and open PR', cmd: 'git push -u origin fix/42-login-crash-mobile', desc: 'Open PR: fix/42-login-crash-mobile → main. Mention "Closes #42" in the PR description.' },
        { n: '7', title: 'PR merged → Issue auto-closes', desc: 'GitHub sees "Closes #42" and automatically closes the issue. Shows "closed by PR #57".' },
      ]},
    ]
  },
  {
    id: 'conflicts', icon: '⚠️', label: 'Merge Conflicts', color: G.yellow,
    title: 'Merge Conflicts',
    subtitle: 'Two people edited the same lines — Git needs you to decide',
    blocks: [
      { type: 'grid2', items: [
        { kind: 'card', label: 'WHAT', color: G.blue, text: 'A conflict happens when two branches both modified the **same lines in the same file**. Git can\'t automatically pick which is correct.' },
        { kind: 'card', label: 'WHY IT HAPPENS', color: G.orange, text: 'You edited line 42 of login.js. Your teammate also edited line 42. Git sees two different versions and stops — it can\'t guess which is right.' },
      ]},
      { type: 'diagram', title: '⚠️ What a conflict looks like in the file', content: `  <<<<<<< HEAD  ← your version starts here
  const timeout = 5000;
  =======        ← separator between versions
  const timeout = 3000;
  >>>>>>> feature/faster-login  ← their version ends here` },
      { type: 'flow', steps: [
        { n: '1', title: 'Git tells you there\'s a conflict', cmd: 'git merge feature/faster-login\n# CONFLICT: Merge conflict in login.js' },
        { n: '2', title: 'Open the file, decide what to keep', desc: 'Delete the conflict markers (<<<, ===, >>>) and write the final version you want. Keep yours, theirs, or a mix.' },
        { n: '3', title: 'Stage and commit', cmd: 'git add login.js\ngit commit -m "resolve merge conflict in login.js"' },
      ]},
    ]
  },
  {
    id: 'undoing', icon: '↩️', label: 'Undoing Things', color: G.red,
    title: 'Undoing Things',
    subtitle: 'Every way to go back — and when to use each one',
    blocks: [
      { type: 'table', head: ['Situation', 'Command', 'Safe?'], rows: [
        ['Undo unsaved file changes', 'git restore login.js', '✅ Safe'],
        ['Unstage a file', 'git restore --staged login.js', '✅ Safe'],
        ['Undo last commit (keep changes staged)', 'git reset --soft HEAD~1', '✅ Safe'],
        ['Undo last commit (keep changes unstaged)', 'git reset HEAD~1', '✅ Safe'],
        ['Undo last commit AND delete changes', 'git reset --hard HEAD~1', '⚠️ Destructive'],
        ['Safely undo an old commit', 'git revert a1b2c3', '✅ Safe — new undo commit'],
        ['Save unfinished work temporarily', 'git stash', '✅ Safe'],
        ['Restore stashed work', 'git stash pop', '✅ Safe'],
      ]},
      { type: 'callout', variant: 'danger', icon: '🚨', text: '**Never `git reset --hard` or force-push on a shared branch.** You\'ll rewrite history others have already pulled. Use `git revert` instead — it adds a new undo commit without rewriting history.' },
    ]
  },
  {
    id: 'cheatsheet', icon: '📋', label: 'Cheatsheet', color: G.green,
    title: 'Full Command Cheatsheet',
    subtitle: 'Every command you need, organized by situation',
    blocks: [
      { type: 'cmd', title: 'Starting a Project', lines: [
        { prompt: '$', cmd: 'git init', comment: 'Initialize new repo in current folder' },
        { prompt: '$', cmd: 'git clone https://github.com/user/repo.git', comment: 'Download repo from GitHub' },
        { prompt: '$', cmd: 'git config --global user.name "Your Name"' },
        { prompt: '$', cmd: 'git config --global user.email "you@email.com"' },
      ]},
      { type: 'cmd', title: 'Daily Workflow', lines: [
        { prompt: '$', cmd: 'git status', comment: 'What changed?' },
        { prompt: '$', cmd: 'git add .', comment: 'Stage all changes' },
        { prompt: '$', cmd: 'git add filename.js', comment: 'Stage one file' },
        { prompt: '$', cmd: 'git commit -m "your message"' },
        { prompt: '$', cmd: 'git log --oneline', comment: 'See compact history' },
        { prompt: '$', cmd: 'git log --oneline --graph --all', comment: 'Visual branch history' },
        { prompt: '$', cmd: 'git diff', comment: 'See exact line changes' },
        { prompt: '$', cmd: 'git diff --staged', comment: 'See staged changes' },
      ]},
      { type: 'cmd', title: 'Branches', lines: [
        { prompt: '$', cmd: 'git branch', comment: 'List branches' },
        { prompt: '$', cmd: 'git switch -c feature/name', comment: 'Create + switch' },
        { prompt: '$', cmd: 'git switch main', comment: 'Go to main' },
        { prompt: '$', cmd: 'git merge feature/name', comment: 'Merge into current' },
        { prompt: '$', cmd: 'git branch -d feature/name', comment: 'Delete merged branch' },
        { prompt: '$', cmd: 'git rebase main', comment: 'Update branch with latest main' },
      ]},
      { type: 'cmd', title: 'Remote (GitHub)', lines: [
        { prompt: '$', cmd: 'git remote add origin https://github.com/user/repo.git' },
        { prompt: '$', cmd: 'git push -u origin main', comment: 'First push, sets up tracking' },
        { prompt: '$', cmd: 'git push', comment: 'Push current branch' },
        { prompt: '$', cmd: 'git pull origin main', comment: 'Download + merge from GitHub' },
        { prompt: '$', cmd: 'git fetch origin', comment: 'Download without merging' },
      ]},
      { type: 'cmd', title: 'Undoing', lines: [
        { prompt: '$', cmd: 'git restore filename.js', comment: 'Discard file changes' },
        { prompt: '$', cmd: 'git restore --staged filename.js', comment: 'Unstage a file' },
        { prompt: '$', cmd: 'git reset HEAD~1', comment: 'Undo last commit, keep changes' },
        { prompt: '$', cmd: 'git revert a1b2c3', comment: 'Safely undo any commit' },
        { prompt: '$', cmd: 'git stash', comment: 'Save work temporarily' },
        { prompt: '$', cmd: 'git stash pop', comment: 'Restore stashed work' },
      ]},
    ]
  },
];

const NAV_GROUPS = [
  { label: 'Foundations', ids: ['what-is-git','three-zones','commits'] },
  { label: 'Branching', ids: ['branches','pull','pull-request'] },
  { label: 'Real Workflows', ids: ['issues','conflicts','undoing'] },
  { label: 'Reference', ids: ['cheatsheet'] },
];

// ── Sub-components ───────────────────────────────────────────

function Callout({ variant, icon, text }) {
  const colors = {
    tip:    { bg: `${G.green}09`,  border: `${G.green}28`,  label: G.green },
    info:   { bg: `${G.blue}09`,   border: `${G.blue}28`,   label: G.blue },
    warn:   { bg: `${G.orange}09`, border: `${G.orange}28`, label: G.orange },
    danger: { bg: `${G.red}09`,    border: `${G.red}28`,    label: G.red },
  }[variant] || {};
  return (
    <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '13px 16px', margin: '14px 0', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: 13.5, color: G.t2, lineHeight: 1.65, fontFamily: G.ui }}
        dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${G.t1}">$1</strong>`).replace(/`(.*?)`/g, `<code style="font-family:${G.mono};font-size:12px;color:${G.cyan};background:rgba(0,212,255,0.1);padding:1px 5px;border-radius:3px">$1</code>`) }}
      />
    </div>
  );
}

function ConceptCard({ label, color, text }) {
  return (
    <div style={{ background: G.s3, border: `1px solid ${G.b1}`, borderRadius: 10, padding: '14px 16px', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${color}35`}
      onMouseLeave={e => e.currentTarget.style.borderColor = G.b1}
    >
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color, fontFamily: G.mono, marginBottom: 8 }}>{label}</div>
      <p style={{ fontSize: 13.5, color: G.t2, lineHeight: 1.65, margin: 0, fontFamily: G.ui }}
        dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${G.t1}">$1</strong>`).replace(/`(.*?)`/g, `<code style="font-family:${G.mono};font-size:12px;color:${G.cyan};background:rgba(0,212,255,0.1);padding:1px 5px;border-radius:3px">$1</code>`) }}
      />
    </div>
  );
}

function CmdBlock({ title, lines }) {
  const [copied, setCopied] = useState(null);
  const allCmds = lines.filter(l => l.cmd).map(l => l.cmd).join('\n');
  return (
    <div style={{ background: '#030608', border: `1px solid ${G.b2}`, borderRadius: 10, overflow: 'hidden', margin: '14px 0' }}>
      <div style={{ background: G.s3, padding: '8px 14px', borderBottom: `1px solid ${G.b1}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57','#ffbd2e','#28ca41'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
        </div>
        <span style={{ flex: 1, fontSize: 11, color: G.t4, fontFamily: G.mono }}>{title}</span>
        <button onClick={() => { navigator.clipboard?.writeText(allCmds); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          style={{ background: 'none', border: `1px solid ${G.b2}`, color: copied ? G.green : G.t4, borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer', fontFamily: G.mono, transition: 'all 0.2s' }}>
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      <div style={{ padding: '12px 16px' }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: G.mono, marginBottom: l.out ? 2 : 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            {l.prompt && <span style={{ color: G.green, fontSize: 13, flexShrink: 0 }}>{l.prompt}</span>}
            {l.cmd && <span style={{ fontSize: 13, color: '#d4e8ff', flex: 1, wordBreak: 'break-all' }}>{l.cmd}</span>}
            {l.comment && <span style={{ fontSize: 11, color: G.t4, flexShrink: 0 }}># {l.comment}</span>}
            {l.out && <span style={{ fontSize: 12, color: l.color || G.t3, paddingLeft: l.prompt ? 0 : 22 }}>{l.out}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowStep({ n, title, desc, cmd, isLast }) {
  return (
    <div style={{ display: 'flex', gap: 14, marginBottom: 0, position: 'relative' }}>
      {!isLast && <div style={{ position: 'absolute', left: 17, top: 34, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${G.b3}, transparent)` }} />}
      <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: G.mono, background: G.s4, border: `2px solid ${G.b3}`, color: G.green, zIndex: 1 }}>{n}</div>
      <div style={{ flex: 1, paddingBottom: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: G.t1, marginBottom: 4, fontFamily: G.ui }}>{title}</div>
        {desc && <p style={{ fontSize: 13, color: G.t2, margin: '0 0 6px', lineHeight: 1.6, fontFamily: G.ui }}
          dangerouslySetInnerHTML={{ __html: desc.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${G.t1}">$1</strong>`) }} />}
        {cmd && (
          <div style={{ background: '#030608', border: `1px solid ${G.b2}`, borderRadius: 7, padding: '10px 14px', fontFamily: G.mono, fontSize: 12.5, color: G.green, whiteSpace: 'pre-wrap' }}>{cmd}</div>
        )}
      </div>
    </div>
  );
}

function Diagram({ title, content }) {
  return (
    <div style={{ background: '#030608', border: `1px solid ${G.b2}`, borderRadius: 10, padding: '16px 20px', margin: '14px 0', overflow: 'auto' }}>
      {title && <div style={{ fontSize: 11, color: G.t4, fontFamily: G.ui, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>{title}</div>}
      <pre style={{ fontFamily: G.mono, fontSize: 12, color: G.t2, lineHeight: 1.8, margin: 0, whiteSpace: 'pre' }}>{content}</pre>
    </div>
  );
}

function HoodBox({ title, text }) {
  return (
    <div style={{ background: `linear-gradient(135deg, ${G.purple}09, ${G.cyan}07)`, border: `1px solid ${G.purple}28`, borderRadius: 10, padding: '16px 18px', margin: '14px 0' }}>
      <div style={{ fontSize: 11, color: G.purple, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, fontFamily: G.mono }}>{title}</div>
      <div style={{ fontSize: 13.5, color: G.t2, lineHeight: 1.7, fontFamily: G.ui, whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${G.t1}">$1</strong>`).replace(/`(.*?)`/g, `<code style="font-family:${G.mono};font-size:12px;color:${G.cyan};background:rgba(0,212,255,0.1);padding:1px 5px;border-radius:3px">$1</code>`) }}
      />
    </div>
  );
}

function DataTable({ head, rows }) {
  return (
    <div style={{ overflowX: 'auto', margin: '14px 0', borderRadius: 10, border: `1px solid ${G.b2}`, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>{head.map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 14px', background: G.s3, color: G.t3, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: `1px solid ${G.b2}`, fontFamily: G.ui }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? `1px solid ${G.b1}` : 'none' }}>
              {row.map((cell, j) => <td key={j} style={{ padding: '10px 14px', color: j === 0 ? G.cyan : G.t2, fontFamily: j === 0 ? G.mono : G.ui, fontSize: j === 0 ? 12 : 13, verticalAlign: 'top' }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderBlock(block, idx) {
  if (block.type === 'grid2') return (
    <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, margin: '14px 0' }}>
      {block.items.map((item, i) => <ConceptCard key={i} {...item} />)}
    </div>
  );
  if (block.type === 'grid3') return (
    <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, margin: '14px 0' }}>
      {block.items.map((item, i) => <ConceptCard key={i} {...item} />)}
    </div>
  );
  if (block.type === 'callout') return <Callout key={idx} {...block} />;
  if (block.type === 'cmd') return <CmdBlock key={idx} {...block} />;
  if (block.type === 'diagram') return <Diagram key={idx} {...block} />;
  if (block.type === 'hood') return <HoodBox key={idx} {...block} />;
  if (block.type === 'table') return <DataTable key={idx} {...block} />;
  if (block.type === 'flow') return (
    <div key={idx} style={{ margin: '16px 0' }}>
      {block.steps.map((step, i) => <FlowStep key={i} {...step} isLast={i === block.steps.length - 1} />)}
    </div>
  );
  return null;
}

// ── Main component ────────────────────────────────────────────

export default function GitGuidePage({ onBack }) {
  const [activeId, setActiveId] = useState('what-is-git');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mainRef = useRef(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const style = document.getElementById('gg-styles') || document.createElement('style');
    style.id = 'gg-styles';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700;800&display=swap');
      .gg-root * { box-sizing: border-box; }
      .gg-root ::-webkit-scrollbar { width: 4px; height: 4px; }
      .gg-root ::-webkit-scrollbar-track { background: transparent; }
      .gg-root ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      .gg-nav-item:hover { background: rgba(255,255,255,0.04) !important; color: #e8f0fe !important; }
      .gg-toc-card:hover { border-color: rgba(0,229,160,0.3) !important; transform: translateY(-2px); }
      .gg-section { animation: gg-fadein 0.35s ease forwards; }
      @keyframes gg-fadein { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: none; } }
    `;
    if (!document.getElementById('gg-styles')) document.head.appendChild(style);
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handler = () => {
      for (const s of SECTIONS) {
        const ref = sectionRefs.current[s.id];
        if (ref) {
          const rect = ref.getBoundingClientRect();
          if (rect.top <= 120) setActiveId(s.id);
        }
      }
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => {
    const el = sectionRefs.current[id];
    if (el && mainRef.current) {
      mainRef.current.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
      setActiveId(id);
      if (isMobile) setSidebarOpen(false);
    }
  };

  const activeSec = SECTIONS.find(s => s.id === activeId);

  return (
    <div className="gg-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: G.bg, overflow: 'hidden', fontFamily: G.ui }}>

      {/* ── Top bar ── */}
      <div style={{ height: 44, background: `${G.s2}ee`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${G.b1}`, display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0, zIndex: 20 }}>
        {onBack && (
          <button onClick={onBack} style={{ height: '100%', padding: '0 16px', background: 'none', border: 'none', borderRight: `1px solid ${G.b1}`, color: G.t3, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'color 0.15s', fontFamily: G.mono }}
            onMouseEnter={e => e.currentTarget.style.color = G.t1}
            onMouseLeave={e => e.currentTarget.style.color = G.t3}
          >
            ← {!isMobile && 'GitVerse'}
          </button>
        )}
        {isMobile && (
          <button onClick={() => setSidebarOpen(o => !o)} style={{ height: '100%', padding: '0 14px', background: 'none', border: 'none', borderRight: `1px solid ${G.b1}`, color: sidebarOpen ? G.green : G.t3, fontSize: 18, cursor: 'pointer' }}>☰</button>
        )}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10 }}>
          <span style={{ fontSize: 16, filter: `drop-shadow(0 0 6px ${G.green}80)` }}>📚</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: G.t1 }}>Git Complete Guide</span>
          {activeSec && !isMobile && (
            <>
              <span style={{ color: G.t4 }}>·</span>
              <span style={{ fontSize: 12, color: activeSec.color || G.green }}>{activeSec.icon} {activeSec.label}</span>
            </>
          )}
        </div>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 4, padding: '0 16px' }}>
          {SECTIONS.map(s => (
            <div key={s.id} onClick={() => scrollTo(s.id)} style={{ width: s.id === activeId ? 16 : 5, height: 5, borderRadius: 3, background: s.id === activeId ? G.green : G.b3, cursor: 'pointer', transition: 'all 0.2s', boxShadow: s.id === activeId ? `0 0 6px ${G.green}` : 'none' }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Sidebar overlay on mobile ── */}
        {isMobile && sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 30, backdropFilter: 'blur(4px)' }} />
        )}

        {/* ── Sidebar nav ── */}
        {(!isMobile || sidebarOpen) && (
          <div style={{
            width: 224, background: `${G.s1}fa`, backdropFilter: 'blur(12px)', borderRight: `1px solid ${G.b1}`,
            display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'auto',
            ...(isMobile ? { position: 'fixed', top: 44, bottom: 0, left: 0, zIndex: 31, boxShadow: `4px 0 32px rgba(0,0,0,0.8)`, animation: 'gg-fadein 0.2s ease' } : {}),
          }}>
            <div style={{ padding: '14px 16px 6px' }}>
              <div style={{ fontSize: 11, color: G.green, fontFamily: G.mono, fontWeight: 700, letterSpacing: 1 }}>GIT GUIDE</div>
              <div style={{ fontSize: 11, color: G.t4, marginTop: 2, fontFamily: G.mono }}>{SECTIONS.length} sections · complete ref</div>
            </div>
            {NAV_GROUPS.map(group => (
              <div key={group.label}>
                <div style={{ padding: '10px 16px 4px', fontSize: 10, color: G.t4, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: G.mono, fontWeight: 700 }}>{group.label}</div>
                {group.ids.map(id => {
                  const sec = SECTIONS.find(s => s.id === id);
                  if (!sec) return null;
                  const isActive = activeId === id;
                  return (
                    <div key={id} onClick={() => scrollTo(id)} className="gg-nav-item"
                      style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: isActive ? G.t1 : G.t2, background: isActive ? `${sec.color || G.green}09` : 'transparent', borderLeft: `2px solid ${isActive ? (sec.color || G.green) : 'transparent'}`, transition: 'all 0.12s', fontFamily: G.ui }}>
                      <span style={{ fontSize: 14 }}>{sec.icon}</span>
                      <span>{sec.label}</span>
                      {isActive && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: sec.color || G.green, boxShadow: `0 0 5px ${sec.color || G.green}` }} />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ── Main content ── */}
        <div ref={mainRef} style={{ flex: 1, overflow: 'auto', padding: isMobile ? '24px 16px 80px' : '40px 48px 100px', maxWidth: 860, margin: '0 auto', width: '100%' }}>

          {/* Hero */}
          <div style={{ marginBottom: 52, paddingBottom: 40, borderBottom: `1px solid ${G.b1}` }}>
            <div style={{ fontSize: 11, color: G.green, fontFamily: G.mono, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 20, height: 2, background: G.green }} /> Complete Beginner Guide
            </div>
            <h1 style={{ fontSize: isMobile ? 34 : 52, fontWeight: 800, color: G.t1, letterSpacing: -2, lineHeight: 1.05, margin: '0 0 14px', fontFamily: G.ui }}>
              Git — The<br /><span style={{ color: G.green }}>Complete</span><br />Mental Model
            </h1>
            <p style={{ fontSize: 15, color: G.t2, maxWidth: 520, lineHeight: 1.65, margin: '0 0 28px', fontFamily: G.ui }}>
              Every concept explained with <strong style={{ color: G.t1 }}>what, why, how, when, and where</strong> — from total beginner to understanding what really happens under the hood.
            </p>
            {/* TOC grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
              {SECTIONS.slice(0, 6).map(s => (
                <div key={s.id} onClick={() => scrollTo(s.id)} className="gg-toc-card"
                  style={{ background: G.s3, border: `1px solid ${G.b1}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 20, marginBottom: 7 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: G.t1, marginBottom: 3, fontFamily: G.ui }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: G.t4, fontFamily: G.ui }}>{s.subtitle?.split(' ').slice(0,5).join(' ')}…</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          {SECTIONS.map((sec, si) => (
            <div key={sec.id} ref={el => sectionRefs.current[sec.id] = el} className="gg-section" style={{ marginBottom: 72, animationDelay: `${si * 0.04}s` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid ${G.b1}` }}>
                <div style={{ fontSize: 10, fontFamily: G.mono, color: G.t4, background: G.s3, border: `1px solid ${G.b2}`, padding: '3px 8px', borderRadius: 4, marginTop: 5, flexShrink: 0 }}>
                  {String(si + 1).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#e8f0fe', lineHeight: 1.2, letterSpacing: -0.5, fontFamily: G.ui }}>{sec.title}</div>
                  <div style={{ fontSize: 14, color: G.t2, marginTop: 5, fontFamily: G.ui }}>{sec.subtitle}</div>
                </div>
              </div>
              {sec.blocks.map((block, bi) => renderBlock(block, bi))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}