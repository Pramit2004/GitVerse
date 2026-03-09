import React, {
  useState, useRef, useEffect, useCallback, useMemo, useReducer
} from 'react';

/* ═══════════════════════════════════════════════════════════════════
   GITVERSE IDE v2 — "Make It Real"
   
   What's new vs v1:
   ✦ Syntax-highlighted editor (contenteditable overlay trick)
   ✦ Animated terminal — lines stream in one by one with delay
   ✦ Connected workflow — every git action visually ripples through UI
   ✦ Folder tree with collapsible directories
   ✦ GitHub panel rebuilt to match github.com layout
   ✦ Commit graph with real ASCII branch lines
   ✦ Push/fetch progress bar animation
   ✦ File flash animations on stage/unstage
   ✦ Guided workflow banner (first-time experience)
   ✦ Rename files, create folders
   ✦ .gitignore awareness
   ✦ git commit without -m spawns inline editor
═══════════════════════════════════════════════════════════════════ */

// ─── Utilities ───────────────────────────────────────────────────

// function makeHash() {
//   return Math.random().toString(36).substr(2, 7);
// }

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

// ─── Syntax Highlighter (token-based, per line) ───────────────────

const TOKEN_PATTERNS = {
  js: [
    { re: /(\/\/[^\n]*)/, cls: 'cmt' },
    { re: /(\/\*[\s\S]*?\*\/)/, cls: 'cmt' },
    { re: /(`(?:[^`\\]|\\.)*`)/, cls: 'str' },
    { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, cls: 'str' },
    { re: /\b(import|export|default|from|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|new|this|super|async|await|try|catch|finally|throw|typeof|instanceof|void|delete|in|of)\b/, cls: 'kw' },
    { re: /\b(true|false|null|undefined|NaN|Infinity)\b/, cls: 'lit' },
    { re: /\b([A-Z][a-zA-Z0-9]*)(?=\s*[\(\{])/, cls: 'cls' },
    { re: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/, cls: 'fn' },
    { re: /\b(\d+\.?\d*(?:e[+-]?\d+)?)\b/, cls: 'num' },
  ],
  css: [
    { re: /(\/\*[\s\S]*?\*\/)/, cls: 'cmt' },
    { re: /(@[a-zA-Z-]+)/, cls: 'kw' },
    { re: /([.#][a-zA-Z_-][a-zA-Z0-9_-]*)/, cls: 'cls' },
    { re: /\b([a-z-]+)(?=\s*:)/, cls: 'prop' },
    { re: /(#[0-9a-fA-F]{3,8})/, cls: 'str' },
    { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, cls: 'str' },
    { re: /\b(\d+\.?\d*(?:px|em|rem|%|vh|vw|deg|s|ms)?)\b/, cls: 'num' },
    { re: /\b(inherit|initial|unset|none|auto|flex|block|grid|absolute|relative|fixed)\b/, cls: 'lit' },
  ],
  html: [
    { re: /(<!--[\s\S]*?-->)/, cls: 'cmt' },
    { re: /(&lt;\/?)([\w-]+)/, cls_: ['tag-bracket','tag'] },
    { re: /\b(class|id|href|src|style|type|rel|name|value|placeholder|alt|title|data-[a-z-]+)(?==)/, cls: 'prop' },
    { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, cls: 'str' },
    { re: /(&gt;|&lt;|\/>)/, cls: 'tag-bracket' },
  ],
  md: [
    { re: /^(#{1,6} .*)$/, cls: 'heading' },
    { re: /(\*\*[^*]+\*\*)/, cls: 'bold' },
    { re: /(_[^_]+_|\*[^*]+\*)/, cls: 'em' },
    { re: /(`[^`]+`)/, cls: 'str' },
    { re: /^([-*+] )/, cls: 'kw' },
    { re: /^(\d+\. )/, cls: 'num' },
    { re: /(\[.*?\]\(.*?\))/, cls: 'link' },
    { re: /(^>+.*)/, cls: 'cmt' },
  ],
  json: [
    { re: /("(?:[^"\\]|\\.)*")(?=\s*:)/, cls: 'prop' },
    { re: /:\s*("(?:[^"\\]|\\.)*")/, cls: 'str' },
    { re: /\b(true|false|null)\b/, cls: 'lit' },
    { re: /\b(-?\d+\.?\d*(?:e[+-]?\d+)?)\b/, cls: 'num' },
  ],
  sh: [
    { re: /(#[^\n]*)/, cls: 'cmt' },
    { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, cls: 'str' },
    { re: /\b(if|then|else|elif|fi|for|do|done|while|case|esac|function|return|export|echo|cd|ls|mkdir|rm|cp|mv|cat|grep|sed|awk)\b/, cls: 'kw' },
    { re: /(\$[a-zA-Z_][a-zA-Z0-9_]*)/, cls: 'cls' },
    { re: /\b(\d+)\b/, cls: 'num' },
  ],
};

const TOKEN_COLORS = {
  cmt: '#6A9955', str: '#CE9178', kw: '#569CD6', lit: '#569CD6',
  cls: '#4EC9B0', fn: '#DCDCAA', num: '#B5CEA8', prop: '#9CDCFE',
  tag: '#4EC9B0', 'tag-bracket': '#808080', link: '#569CD6',
  heading: '#569CD6', bold: '#e8edf8', em: '#CE9178',
};

function highlightLine(line, type) {
  const patterns = TOKEN_PATTERNS[type] || TOKEN_PATTERNS.js;
  const esc = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  
  // Simple single-pass tokenizer
  let result = esc(line);
  
  // Apply patterns in order (comments & strings first to avoid re-highlighting)
  patterns.forEach(({ re, cls }) => {
    if (!cls) return;
    const color = TOKEN_COLORS[cls] || '#e8edf8';
    result = result.replace(new RegExp(re.source, re.flags || 'g'),
      (m) => `<span style="color:${color}">${m}</span>`
    );
  });
  
  return result;
}

function SyntaxHighlightedEditor({ value, onChange, fileType, onKeyDown }) {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const containerRef = useRef(null);

  const highlighted = useMemo(() => {
    if (!value) return '';
    return value.split('\n').map(line => 
      `<div class="code-line">${highlightLine(line, fileType) || ' '}</div>`
    ).join('');
  }, [value, fileType]);

  // Sync scroll between textarea and highlight layer
  const syncScroll = useCallback(() => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const lineCount = value ? value.split('\n').length : 1;
  const lines = useMemo(() => Array.from({ length: lineCount }, (_, i) => i + 1), [lineCount]);

  return (
    <div ref={containerRef} style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', background: '#070b12' }}>
      {/* Line numbers */}
      <div style={{
        width: 48, background: '#070b12', borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        flexShrink: 0, paddingTop: 10, userSelect: 'none', pointerEvents: 'none',
      }}>
        {lines.map(n => (
          <div key={n} style={{
            height: 20, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            paddingRight: 10, fontSize: 12, color: '#2a3d55',
            fontFamily: "'JetBrains Mono', monospace", lineHeight: '20px', flexShrink: 0,
          }}>{n}</div>
        ))}
      </div>

      {/* Syntax highlight layer (visual only) */}
      <div
        ref={highlightRef}
        aria-hidden="true"
        style={{
          position: 'absolute', left: 48, right: 0, top: 0, bottom: 0,
          padding: '10px 16px 10px 12px',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          lineHeight: '20px', color: '#e8f0fe', whiteSpace: 'pre',
          overflow: 'hidden', pointerEvents: 'none', userSelect: 'none',
          background: 'transparent', zIndex: 1,
          wordBreak: 'keep-all',
        }}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />

      {/* Transparent textarea (captures input) */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        style={{
          position: 'absolute', left: 48, right: 0, top: 0, bottom: 0,
          padding: '10px 16px 10px 12px',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          lineHeight: '20px',
          background: 'transparent', border: 'none', outline: 'none',
          resize: 'none', color: 'transparent', caretColor: '#00e5a0',
          zIndex: 2, overflow: 'auto',
          tabSize: 2, whiteSpace: 'pre',
        }}
      />
    </div>
  );
}

// ─── Animated Terminal ────────────────────────────────────────────

function useAnimatedTerminal() {
  const [lines, setLines] = useState([{
    id: 0, type: 'welcome',
    text: '  GitVerse IDE  —  Real Git Simulation\n  Type a command or click a workflow step above.\n  Try: git init',
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const queue = useRef([]);
  const timer = useRef(null);

  const flush = useCallback(() => {
    if (!queue.current.length) { setIsTyping(false); return; }
    setIsTyping(true);
    const item = queue.current.shift();
    setLines(l => [...l, { ...item, id: Date.now() + Math.random() }]);
    const delay = item.type === 'output' ? 18 : item.type === 'success' ? 25 : 15;
    timer.current = setTimeout(flush, delay);
  }, []);

  const pushLines = useCallback((items) => {
    queue.current.push(...items);
    if (!isTyping) flush();
  }, [isTyping, flush]);

  const clearLines = useCallback(() => {
    queue.current = [];
    setLines([]);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { lines, pushLines, clearLines, isTyping };
}

// ─── Git Engine ───────────────────────────────────────────────────

function makeHash() { return Math.random().toString(36).substr(2, 7); }

const INIT_FS = {
  'README.md': { content: '# My Project\n\nA sample project to learn Git with GitVerse IDE.\n\n## Setup\n\n```bash\ngit init\ngit add .\ngit commit -m "Initial commit"\n```\n', folder: '' },
  'src/index.js': { content: 'import App from \'./App\';\nimport { render } from \'./utils\';\n\nrender(App, document.getElementById(\'root\'));\n', folder: 'src' },
  'src/App.js': { content: 'export default function App() {\n  return {\n    title: \'My App\',\n    version: \'1.0.0\',\n  };\n}\n', folder: 'src' },
  'src/styles.css': { content: ':root {\n  --color-primary: #007acc;\n  --color-bg: #1e1e1e;\n  --font-size-base: 16px;\n}\n\nbody {\n  background: var(--color-bg);\n  font-size: var(--font-size-base);\n  margin: 0;\n  padding: 20px;\n}\n', folder: 'src' },
  'index.html': { content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My App</title>\n  <link rel="stylesheet" href="src/styles.css">\n</head>\n<body>\n  <div id="root"></div>\n  <script src="src/index.js"></script>\n</body>\n</html>\n', folder: '' },
  'package.json': { content: '{\n  "name": "my-project",\n  "version": "1.0.0",\n  "description": "A sample project",\n  "scripts": {\n    "start": "node src/index.js",\n    "test": "jest"\n  },\n  "dependencies": {},\n  "devDependencies": {}\n}\n', folder: '' },
  '.gitignore': { content: 'node_modules/\ndist/\n.env\n*.log\n.DS_Store\n', folder: '' },
};

function initGit() {
  return {
    initialized: false,
    files: {},        // tracked: { path: { content, tracked } }
    staged: {},       // { path: content | '__deleted__' }
    commits: [],
    branches: { main: null },
    HEAD: 'main',
    detached: false,
    remotes: { origin: { url: 'https://github.com/user/my-project.git', pushed: {} } },
    stash: [],
    tags: {},
    config: { name: 'Dev User', email: 'dev@gitverse.io' },
    merging: null,
    gitignorePatterns: [],
  };
}

function matchesGitignore(path, patterns) {
  return patterns.some(p => {
    if (!p || p.startsWith('#')) return false;
    const clean = p.trim().replace(/\/$/, '');
    if (clean.startsWith('*')) return path.endsWith(clean.slice(1));
    return path === clean || path.startsWith(clean + '/') || path.endsWith('/' + clean);
  });
}

// ─── File Icons ───────────────────────────────────────────────────

const EXT_ICON = {
  js:'⬡', jsx:'⚛', ts:'🔷', tsx:'⚛', css:'🎨', html:'🌐',
  json:'{}', md:'📝', txt:'📄', sh:'⚡', py:'🐍', env:'🔐',
  gitignore:'🚫', svg:'🖼', png:'🖼', jpg:'🖼', lock:'🔒',
};
const EXT_COLOR = {
  js:'#f7df1e', jsx:'#61dafb', ts:'#3178c6', tsx:'#61dafb',
  css:'#264de4', html:'#e34c26', json:'#f5a623', md:'#a8a8a8',
  sh:'#89e051', py:'#3572A5', gitignore:'#f14e32',
};

function fileExt(name) { return name.split('.').pop().toLowerCase(); }
function fileIcon(name) {
  const ext = fileExt(name);
  return EXT_ICON[ext] || '📄';
}
function fileColor(name) {
  const ext = fileExt(name);
  return EXT_COLOR[ext] || '#8899bb';
}
function fileType(name) { return fileExt(name); }

// ─── Diff Engine ─────────────────────────────────────────────────

function computeDiff(a, b) {
  const aL = (a||'').split('\n'), bL = (b||'').split('\n');
  const result = [];
  const max = Math.max(aL.length, bL.length);
  for (let i = 0; i < max; i++) {
    if (i >= aL.length) result.push({ type:'add', content: bL[i], line: i+1 });
    else if (i >= bL.length) result.push({ type:'del', content: aL[i], line: i+1 });
    else if (aL[i] !== bL[i]) {
      result.push({ type:'del', content: aL[i], line: i+1 });
      result.push({ type:'add', content: bL[i], line: i+1 });
    } else result.push({ type:'ctx', content: aL[i], line: i+1 });
  }
  return result;
}

// ─── Main Component ───────────────────────────────────────────────

export default function GitVerseIDE({ onXP, onBack }) {
  // ── State ──
  const [git, setGit] = useState(initGit);
  const [fs, setFs] = useState(() => {
    const contents = {};
    Object.entries(INIT_FS).forEach(([p, f]) => { contents[p] = f.content; });
    return contents;
  });
  const [openTabs, setOpenTabs] = useState(['README.md']);
  const [activeTab, setActiveTab] = useState('README.md');
  const [expandedFolders, setExpandedFolders] = useState({ '': true, 'src': true });
  const [renaming, setRenaming] = useState(null);
  const [newItemDraft, setNewItemDraft] = useState(null); // {type:'file'|'folder', parent:''}
  const [flashFiles, setFlashFiles] = useState({}); // { path: 'green'|'orange'|'red' }
  const [commitMsgDraft, setCommitMsgDraft] = useState('');
  const [showCommitBox, setShowCommitBox] = useState(false);
  const [ghTab, setGhTab] = useState('code');
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [pushProgress, setPushProgress] = useState(null); // 0-100
  const [activePanel, setActivePanel] = useState('split'); // editor|terminal|split
  const [ghBrowsePath, setGhBrowsePath] = useState('');
  const [activePR, setActivePR] = useState(null);
  const [prs, setPrs] = useState([]);
  const [prDraft, setPrDraft] = useState(null);
  const [newBranchInput, setNewBranchInput] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [workflowStep, setWorkflowStep] = useState(0); // 0=init,1=edit,2=add,3=commit,4=push
  const [termInput, setTermInput] = useState('');
  const [termHistory, setTermHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const termBodyRef = useRef(null);
  const termInputRef = useRef(null);
  const { lines: termLines, pushLines, clearLines } = useAnimatedTerminal();

  // ── Derived ──
  const allPaths = useMemo(() => Object.keys(fs).sort(), [fs]);

  const gitignorePatterns = useMemo(() => {
    const ig = fs['.gitignore'] || '';
    return ig.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  }, [fs]);

  const isIgnored = useCallback((path) => matchesGitignore(path, gitignorePatterns), [gitignorePatterns]);

  const statusOf = useCallback((path) => {
    if (!git.initialized) return null;
    if (isIgnored(path)) return 'ignored';
    if (git.staged[path] !== undefined) return 'staged';
    const tracked = git.files[path];
    if (!tracked) return 'untracked';
    if (tracked.content !== fs[path]) return 'modified';
    return 'clean';
  }, [git, fs, isIgnored]);

  const STATUS_COLOR = { staged:'#4caf50', modified:'#e2c08d', untracked:'#73c6fb', deleted:'#f44747', ignored:'#4a5878', clean:null };
  const STATUS_LETTER = { staged:'S', modified:'M', untracked:'U', deleted:'D', ignored:'I' };

  // ── Flash animation ──
  const flash = useCallback((paths, color) => {
    const update = {};
    paths.forEach(p => { update[p] = color; });
    setFlashFiles(prev => ({ ...prev, ...update }));
    setTimeout(() => setFlashFiles(prev => {
      const next = { ...prev };
      paths.forEach(p => delete next[p]);
      return next;
    }), 800);
  }, []);

  // ── Workflow step tracker ──
  const advanceWorkflow = useCallback((step) => {
    setWorkflowStep(prev => Math.max(prev, step));
  }, []);

  // ── Auto scroll terminal ──
  useEffect(() => {
    if (termBodyRef.current) termBodyRef.current.scrollTop = termBodyRef.current.scrollHeight;
  }, [termLines]);

  // ── File ops ──
  const openFile = useCallback((path) => {
    if (fs[path] === undefined) return;
    setOpenTabs(prev => prev.includes(path) ? prev : [...prev, path]);
    setActiveTab(path);
    setActivePanel(p => p === 'terminal' ? 'split' : p);
  }, [fs]);

  const closeTab = useCallback((path, e) => {
    e?.stopPropagation();
    setOpenTabs(prev => {
      const next = prev.filter(t => t !== path);
      if (activeTab === path) setActiveTab(next[next.length - 1] || null);
      return next;
    });
  }, [activeTab]);

  const saveFile = useCallback((path, content) => {
    setFs(prev => ({ ...prev, [path]: content }));
    setGit(g => ({ ...g, workingDir: { ...g.workingDir, [path]: content } }));
    advanceWorkflow(1);
  }, [advanceWorkflow]);

  const createFile = useCallback((path, content = '') => {
    setFs(prev => ({ ...prev, [path]: content }));
    openFile(path);
  }, [openFile]);

  const deleteFilePath = useCallback((path) => {
    setFs(prev => { const n = { ...prev }; delete n[path]; return n; });
    closeTab(path);
    setGit(g => {
      const newFiles = { ...g.files };
      if (newFiles[path]) { newFiles[path] = { ...newFiles[path], deleted: true }; }
      return { ...g, files: newFiles };
    });
  }, [closeTab]);

  const renameFile = useCallback((oldPath, newPath) => {
    if (!newPath || newPath === oldPath || fs[newPath] !== undefined) return;
    const content = fs[oldPath];
    setFs(prev => {
      const n = { ...prev };
      delete n[oldPath];
      n[newPath] = content;
      return n;
    });
    setOpenTabs(prev => prev.map(t => t === oldPath ? newPath : t));
    if (activeTab === oldPath) setActiveTab(newPath);
    setRenaming(null);
  }, [fs, activeTab]);

  // ─────────────────────────────────────────────────────────────────
  // ── Git Command Processor ─────────────────────────────────────────

  const runCommand = useCallback((rawCmd) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;
    setTermHistory(h => [cmd, ...h.slice(0, 49)]);
    setHistIdx(-1);
    pushLines([{ type: 'input', text: `$ ${cmd}` }]);

    // Parse command — strip angle brackets (users often type git add <file> literally)
    const parts = (cmd.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [])
      .map(p => p.replace(/^<|>$/g, '').replace(/^["']|["']$/g, ''));
    const base = parts[0];
    const sub = parts[1];

    // ── Shell commands ──
    if (base === 'clear' || base === 'cls') { clearLines(); return; }
    if (base === 'help') { pushLines([{ type: 'help', text: HELP_TEXT }]); return; }
    if (base === 'ls' || base === 'dir') {
      const items = allPaths.join('  ') || '(empty)';
      pushLines([{ type: 'output', text: items }]); return;
    }
    if (base === 'cat') {
      const f = parts[1];
      if (!f || fs[f] === undefined) { pushLines([{ type: 'error', text: `cat: ${f || '?'}: No such file` }]); return; }
      pushLines([{ type: 'output', text: fs[f] || '(empty)' }]); return;
    }
    if (base === 'touch') {
      const f = parts[1];
      if (!f) { pushLines([{ type: 'error', text: 'Usage: touch filename.txt' }]); return; }
      createFile(f);
      pushLines([{ type: 'success', text: `Created: ${f}` }]); return;
    }
    if (base === 'mkdir') {
      const d = parts[1];
      if (!d) { pushLines([{ type: 'error', text: 'Usage: mkdir folder-name' }]); return; }
      setExpandedFolders(e => ({ ...e, [d]: true }));
      pushLines([{ type: 'success', text: `Directory: ${d}/` }]); return;
    }
    if (base === 'echo') {
      const full = parts.slice(1).join(' ');
      const m = full.match(/^(.+?)\s*>\s*(.+)$/);
      if (m) {
        const content = m[1].replace(/^["']|["']$/g, '');
        createFile(m[2], content + '\n');
        pushLines([{ type: 'success', text: `Written to ${m[2]}` }]);
      } else pushLines([{ type: 'output', text: full.replace(/^["']|["']$/g,'') }]);
      return;
    }
    if (base === 'rm') {
      const f = parts[1];
      if (!f || fs[f] === undefined) { pushLines([{ type: 'error', text: `rm: ${f || '?'}: No such file` }]); return; }
      deleteFilePath(f);
      pushLines([{ type: 'success', text: `Removed: ${f}` }]); return;
    }
    if (base === 'mv') {
      const [,src,dst] = parts;
      if (!src || !dst) { pushLines([{ type:'error', text:'Usage: mv oldname.js newname.js' }]); return; }
      renameFile(src, dst);
      pushLines([{ type:'success', text:`Renamed: ${src} → ${dst}` }]); return;
    }

    if (base !== 'git') {
      pushLines([{ type: 'error', text: `command not found: ${base}` }]); return;
    }

    // ── Git commands ──
    setGit(prevGit => {
      const g = JSON.parse(JSON.stringify(prevGit));
      const output = [];
      const out = (text, type = 'output') => output.push({ type, text });
      const err = (text) => output.push({ type: 'error', text });

      switch (sub) {

        case 'init': {
          if (g.initialized) { err('Already a git repository.'); break; }
          g.initialized = true;
          g.branches = { main: null };
          g.HEAD = 'main';
          Object.entries(fs).forEach(([p, content]) => {
            g.files[p] = { content, tracked: false };
          });
          out('Initialized empty Git repository in .git/', 'success');
          out('');
          out('Next steps:', 'muted');
          out('  git add .          — stage all files', 'muted');
          out('  git commit -m ""   — save a snapshot', 'muted');
          setTimeout(() => { advanceWorkflow(1); flash(allPaths, 'blue'); }, 0);
          if (onXP) onXP(15, 'git init');
          break;
        }

        case 'status': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const lines = [];
          lines.push(`On branch ${g.HEAD}`);
          const pushed = g.remotes?.origin?.pushed?.[g.HEAD];
          const headHash = g.branches[g.HEAD];
          if (headHash && pushed !== headHash) {
            const ahead = g.commits.filter(c => c.branch === g.HEAD).length - (pushed ? 1 : 0);
            if (ahead > 0) lines.push(`Your branch is ahead of 'origin/${g.HEAD}' by ${ahead} commit(s).`);
          }
          lines.push('');
          const sk = Object.keys(g.staged);
          if (sk.length) {
            lines.push('Changes to be committed:');
            sk.forEach(p => {
              const st = g.staged[p] === '__deleted__' ? 'deleted' : !g.files[p]?.tracked ? 'new file' : 'modified';
              lines.push(`\t\x1b[32m${st}:\t${p}\x1b[0m`);
            });
            lines.push('');
          }
          const unstaged = Object.keys(fs).filter(p => {
            if (g.staged[p] !== undefined) return false;
            const tf = g.files[p];
            if (!tf || !tf.tracked) return false;
            return tf.content !== fs[p];
          });
          if (unstaged.length) {
            lines.push('Changes not staged for commit:');
            unstaged.forEach(p => lines.push(`\t\x1b[31mmodified:\t${p}\x1b[0m`));
            lines.push('');
          }
          const untracked = Object.keys(fs).filter(p =>
            !g.files[p]?.tracked && g.staged[p] === undefined && !isIgnored(p)
          );
          if (untracked.length) {
            lines.push('Untracked files:');
            untracked.forEach(p => lines.push(`\t\x1b[90m${p}\x1b[0m`));
            lines.push('');
          }
          if (!sk.length && !unstaged.length && !untracked.length)
            lines.push('nothing to commit, working tree clean');
          out(lines.join('\n'), 'status');
          break;
        }

        case 'add': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const target = parts.slice(2).join(' ').trim();
          if (!target) { err('Nothing specified, nothing added.'); break; }
          const toAdd = (target === '.' || target === '-A' || target === '--all')
            ? Object.keys(fs).filter(p => !isIgnored(p))
            : [target];
          let count = 0;
          const stagedPaths = [];
          toAdd.forEach(p => {
            if (fs[p] === undefined && !g.files[p]?.deleted) {
              output.push({ type:'error', text:`No file named '${p}' found.\nFiles available: ${Object.keys(fs).join(', ')}` });
              return;
            }
            g.staged[p] = fs[p] ?? '__deleted__';
            if (!g.files[p]) g.files[p] = { content:'', tracked:false };
            count++;
            stagedPaths.push(p);
          });
          if (count) {
            out(target === '.' ? `Staged ${count} file(s).` : `staged: ${target}`, 'success');
            setTimeout(() => flash(stagedPaths, 'green'), 0);
            setTimeout(() => advanceWorkflow(2), 0);
            if (onXP) onXP(5, 'git add');
          }
          break;
        }

        case 'restore': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const isStaged = parts.includes('--staged') || parts.includes('-S');
          const fname = parts.find((p, i) => i >= 2 && !p.startsWith('-'));
          if (!fname) { err('Usage: git restore [--staged] filename'); break; }
          if (isStaged) {
            if (!g.staged[fname]) { err(`error: '${fname}' is not staged`); break; }
            delete g.staged[fname];
            out(`Unstaged: ${fname}`, 'success');
            setTimeout(() => flash([fname], 'orange'), 0);
          } else {
            const lastHash = g.branches[g.HEAD];
            const lastCommit = lastHash ? g.commits.find(c => c.hash === lastHash) : null;
            const snap = lastCommit?.snapshot?.[fname];
            if (snap !== undefined) {
              saveFile(fname, snap);
              out(`Restored: ${fname}`, 'success');
            } else err(`error: '${fname}' not in last commit`);
          }
          break;
        }

        case 'commit': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          if (!Object.keys(g.staged).length) { err('nothing to commit, working tree clean'); break; }

          // Extract message
          let msg = '';
          const mIdx = parts.findIndex(p => p === '-m' || p === '--message');
          if (mIdx !== -1 && parts[mIdx+1]) {
            msg = parts.slice(mIdx+1).join(' ').replace(/^["']|["']$/g,'');
          } else if (parts.includes('--allow-empty-message')) {
            msg = 'Empty commit';
          } else {
            // No -m: show inline commit editor
            setTimeout(() => setShowCommitBox(true), 0);
            out('hint: Waiting for commit message...', 'muted');
            break;
          }

          if (!msg.trim()) { err('error: empty commit message'); break; }

          const hash = makeHash();
          const parent = g.branches[g.HEAD] || null;
          const parentSnap = parent ? g.commits.find(c=>c.hash===parent)?.snapshot || {} : {};
          const snapshot = { ...parentSnap };
          const stats = { added:0, modified:0, deleted:0 };

          Object.entries(g.staged).forEach(([p, content]) => {
            if (content === '__deleted__') {
              delete snapshot[p]; delete g.files[p]; stats.deleted++;
            } else {
              const wasTracked = g.files[p]?.tracked;
              if (!wasTracked) stats.added++; else if (g.files[p].content !== content) stats.modified++;
              snapshot[p] = content;
              g.files[p] = { content, tracked:true };
            }
          });

          const commit = {
            hash, msg, parent,
            author: g.config.name, email: g.config.email,
            date: new Date().toISOString(),
            branch: g.HEAD, snapshot, stats,
            mergeParent: g.merging?.sourceHash || null,
          };
          g.commits.push(commit);
          g.branches[g.HEAD] = hash;
          g.staged = {};
          if (g.merging) { g.merging = null; }

          const statStr = [
            stats.added ? `${stats.added} added` : '',
            stats.modified ? `${stats.modified} changed` : '',
            stats.deleted ? `${stats.deleted} deleted` : '',
          ].filter(Boolean).join(', ');

          out(`[${g.HEAD} ${hash.slice(0,7)}] ${msg}`, 'success');
          out(` ${statStr || '0 changes'}`);
          setTimeout(() => advanceWorkflow(3), 0);
          if (onXP) onXP(25, 'git commit');
          break;
        }

        case 'log': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          if (!g.commits.length) { out('(no commits yet — make your first commit!)', 'muted'); break; }
          const flags = parts.slice(2);
          const oneline = flags.includes('--oneline');
          const graph = flags.includes('--graph');
          const all = flags.includes('--all');
          const nLimit = parseInt(flags.find(f=>f.match(/^-\d+$/))?.slice(1)) || 99;

          // Build reachable chain from HEAD
          const headHash = g.branches[g.HEAD];
          const chain = [];
          let cur = headHash;
          while (cur && chain.length < nLimit) {
            const c = g.commits.find(x=>x.hash===cur);
            if (!c) break;
            chain.push(c);
            cur = c.parent;
          }

          const lines = [];
          chain.forEach((c, i) => {
            const refs = Object.entries(g.branches).filter(([,h])=>h===c.hash).map(([b])=>b===g.HEAD?`\x1b[32mHEAD → ${b}\x1b[0m`:`\x1b[33m${b}\x1b[0m`);
            const tags = Object.entries(g.tags||{}).filter(([,h])=>h===c.hash).map(([t])=>`\x1b[33mtag: ${t}\x1b[0m`);
            const refStr = [...refs,...tags].length ? ` (\x1b[0m${[...refs,...tags].join(', ')}\x1b[0m)` : '';

            if (oneline) {
              const glyph = graph ? (c.mergeParent ? '*   ' : '* ') : '';
              lines.push(`${glyph}\x1b[33m${c.hash.slice(0,7)}\x1b[0m${refStr} ${c.msg}`);
              if (graph && i < chain.length-1) lines.push('|');
            } else {
              lines.push(`\x1b[33mcommit ${c.hash}\x1b[0m${refStr}${c.mergeParent ? `\nMerge: ${c.parent?.slice(0,7)} ${c.mergeParent?.slice(0,7)}` : ''}`);
              lines.push(`Author: ${c.author} <${c.email}>`);
              lines.push(`Date:   ${new Date(c.date).toLocaleString()}`);
              lines.push('');
              lines.push(`    ${c.msg}`);
              lines.push('');
            }
          });
          out(lines.join('\n'), 'log');
          break;
        }

        case 'diff': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const flags = parts.slice(2);
          const staged = flags.includes('--staged') || flags.includes('--cached');
          const target = flags.find(f=>!f.startsWith('-'));
          const paths = target ? [target] : staged ? Object.keys(g.staged) : Object.keys(fs);
          const diffLines = [];
          paths.forEach(p => {
            const oldC = staged ? (g.files[p]?.content || '') : (g.files[p]?.content || '');
            const newC = staged ? (g.staged[p] === '__deleted__' ? '' : (g.staged[p]||'')) : (fs[p]||'');
            if (oldC === newC) return;
            const diff = computeDiff(oldC, newC);
            if (!diff.some(d=>d.type!=='ctx')) return;
            diffLines.push(`\x1b[1mdiff --git a/${p} b/${p}\x1b[0m`);
            diffLines.push(`--- a/${p}`);
            diffLines.push(`+++ b/${p}`);
            diff.slice(0,50).forEach(d => {
              if (d.type==='add') diffLines.push(`\x1b[32m+${d.content}\x1b[0m`);
              else if (d.type==='del') diffLines.push(`\x1b[31m-${d.content}\x1b[0m`);
              else diffLines.push(` ${d.content}`);
            });
            diffLines.push('');
          });
          out(diffLines.length ? diffLines.join('\n') : 'No changes.', 'diff');
          break;
        }

        case 'branch': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const flags = parts.slice(2);
          const delFlag = flags.includes('-d') || flags.includes('-D');
          const verboseFlag = flags.includes('-v') || flags.includes('-vv');
          const allFlag = flags.includes('-a') || flags.includes('--all');
          const name = flags.find(f=>!f.startsWith('-'));
          if (delFlag) {
            if (!name) { err('error: branch name required'); break; }
            if (name === g.HEAD) { err(`error: Cannot delete '${name}': currently checked out`); break; }
            delete g.branches[name];
            out(`Deleted branch ${name}.`, 'success');
          } else if (name) {
            if (g.branches[name] !== undefined) { err(`fatal: A branch named '${name}' already exists.`); break; }
            g.branches[name] = g.branches[g.HEAD];
            out(`Branch '${name}' created at ${g.branches[g.HEAD]?.slice(0,7)||'(root)'}`, 'success');
            if (onXP) onXP(10, 'git branch');
          } else {
            const lines = Object.entries(g.branches).map(([b, h]) => {
              const c = h ? g.commits.find(x=>x.hash===h) : null;
              const prefix = b===g.HEAD ? '* ' : '  ';
              const suffix = verboseFlag && c ? `  ${h.slice(0,7)} ${c.msg}` : '';
              return `${prefix}\x1b[${b===g.HEAD?'32':'0'}m${b}\x1b[0m${suffix}`;
            });
            if (allFlag) Object.keys(g.remotes.origin?.pushed||{}).forEach(b =>
              lines.push(`  \x1b[31mremotes/origin/${b}\x1b[0m`)
            );
            out(lines.join('\n'), 'branch');
          }
          break;
        }

        case 'switch':
        case 'checkout': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const flags = parts.slice(2);
          const createFlag = flags.includes('-b') || flags.includes('-c') || flags.includes('-B');
          const name = flags.find(f=>!f.startsWith('-'));
          if (!name) { err('error: branch name required'); break; }
          if (createFlag) {
            if (g.branches[name] !== undefined) { err(`fatal: branch '${name}' already exists`); break; }
            g.branches[name] = g.branches[g.HEAD];
            g.HEAD = name;
            out(`Switched to a new branch '${name}'`, 'success');
            if (onXP) onXP(10, 'git switch -c');
          } else if (g.branches[name] !== undefined) {
            g.HEAD = name; g.detached = false;
            const h = g.branches[name];
            if (h) {
              const c = g.commits.find(x=>x.hash===h);
              if (c?.snapshot) {
                setTimeout(() => {
                  Object.entries(c.snapshot).forEach(([p,cnt]) => saveFile(p,cnt));
                }, 0);
              }
            }
            out(`Switched to branch '${name}'`, 'success');
          } else {
            const c = g.commits.find(x=>x.hash.startsWith(name));
            if (c) { g.HEAD = c.hash; g.detached = true; out(`HEAD detached at ${c.hash.slice(0,7)}`, 'success'); }
            else err(`error: pathspec '${name}' did not match any known refs`);
          }
          break;
        }

        case 'merge': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const src = parts[2];
          if (!src) { err('error: branch name required'); break; }
          if (!g.branches[src]) { err(`merge: ${src} - not something we can merge`); break; }
          const srcHash = g.branches[src];
          const dstHash = g.branches[g.HEAD];
          const srcCommit = g.commits.find(c=>c.hash===srcHash);
          if (!srcCommit) { out('Already up to date.'); break; }
          const dstSnap = dstHash ? (g.commits.find(c=>c.hash===dstHash)?.snapshot || {}) : {};
          const srcSnap = srcCommit.snapshot || {};
          const conflicts = [];
          const merged = { ...dstSnap };
          Object.entries(srcSnap).forEach(([p,cnt]) => {
            if (dstSnap[p] && dstSnap[p] !== cnt && dstSnap[p] !== (srcSnap[p]||'')) {
              conflicts.push(p);
              merged[p] = `<<<<<<< HEAD\n${dstSnap[p]}\n=======\n${cnt}\n>>>>>>> ${src}\n`;
            } else merged[p] = cnt;
          });
          if (conflicts.length) {
            conflicts.forEach(p => saveFile(p, merged[p]));
            g.merging = { src, srcHash };
            out(`CONFLICT: Automatic merge failed in: ${conflicts.join(', ')}`, 'error');
            out(`Fix conflicts, then: git add . && git commit`, 'muted');
            setTimeout(() => flash(conflicts, 'red'), 0);
          } else {
            Object.entries(merged).forEach(([p,cnt]) => { saveFile(p,cnt); g.files[p]={content:cnt,tracked:true}; });
            const mh = makeHash();
            g.commits.push({ hash:mh, msg:`Merge branch '${src}' into ${g.HEAD}`, parent:dstHash, mergeParent:srcHash, author:g.config.name, email:g.config.email, date:new Date().toISOString(), branch:g.HEAD, snapshot:merged, stats:{added:0,modified:Object.keys(merged).length,deleted:0} });
            g.branches[g.HEAD] = mh;
            out(`Merge made by 'recursive' strategy.`, 'success');
            if (onXP) onXP(20, 'git merge');
          }
          break;
        }

        case 'stash': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const ss = parts[2];
          if (!ss || ss === 'push' || ss === 'save') {
            const changed = Object.entries(fs).filter(([p,cnt]) => g.files[p]?.tracked && g.files[p].content !== cnt);
            if (!changed.length) { err('No local changes to save'); break; }
            const saved = {};
            changed.forEach(([p,cnt]) => { saved[p]=cnt; });
            g.stash.unshift({ files:saved, msg:`WIP on ${g.HEAD}`, date:new Date().toISOString() });
            changed.forEach(([p]) => { if (g.files[p]) saveFile(p, g.files[p].content); });
            out(`Saved working directory state: WIP on ${g.HEAD}`, 'success');
          } else if (ss==='pop'||ss==='apply') {
            if (!g.stash.length) { err('No stash entries found.'); break; }
            const e = g.stash[0];
            Object.entries(e.files).forEach(([p,cnt]) => saveFile(p,cnt));
            if (ss==='pop') g.stash.shift();
            out(`Applied stash: ${e.msg}`, 'success');
          } else if (ss==='list') {
            out(g.stash.length ? g.stash.map((s,i)=>`stash@{${i}}: ${s.msg}`).join('\n') : '(empty stash)', 'log');
          } else if (ss==='drop') { g.stash.shift(); out('Dropped stash@{0}', 'success'); }
          else if (ss==='clear') { g.stash=[]; out('Cleared all stash entries.', 'success'); }
          break;
        }

        case 'reset': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const flags = parts.slice(2);
          const hard = flags.includes('--hard');
          const soft = flags.includes('--soft');
          const target = flags.find(f=>!f.startsWith('-'))||'HEAD';
          if (target.startsWith('HEAD')) {
            const steps = target.includes('~') ? parseInt(target.split('~')[1])||1 : target.split('^').length-1||0;
            let cur = g.branches[g.HEAD];
            for (let i=0;i<steps;i++) { const c=g.commits.find(x=>x.hash===cur); if(!c?.parent) break; cur=c.parent; }
            if (!soft) g.staged = {};
            const tc = g.commits.find(c=>c.hash===cur);
            if (hard && tc?.snapshot) {
              Object.entries(tc.snapshot).forEach(([p,cnt]) => { saveFile(p,cnt); g.files[p]={content:cnt,tracked:true}; });
            }
            g.branches[g.HEAD] = cur;
            out(`HEAD is now at ${cur?.slice(0,7)||'(root)'} ${tc?.msg||''}`, hard?'success':'output');
          } else {
            if (g.staged[target]) { delete g.staged[target]; out(`Unstaged: ${target}`, 'success'); }
            else err(`error: '${target}' did not match any staged files`);
          }
          break;
        }

        case 'revert': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const h = parts[2];
          const c = g.commits.find(x=>x.hash.startsWith(h||''));
          if (!c) { err(`error: object '${h}' not found`); break; }
          const pSnap = c.parent ? g.commits.find(x=>x.hash===c.parent)?.snapshot||{} : {};
          const rh = makeHash();
          g.commits.push({ hash:rh, msg:`Revert "${c.msg}"`, parent:g.branches[g.HEAD], author:g.config.name, email:g.config.email, date:new Date().toISOString(), branch:g.HEAD, snapshot:pSnap, stats:{added:0,modified:Object.keys(pSnap).length,deleted:0} });
          g.branches[g.HEAD] = rh;
          Object.entries(pSnap).forEach(([p,cnt]) => { saveFile(p,cnt); g.files[p]={content:cnt,tracked:true}; });
          out(`[${g.HEAD} ${rh.slice(0,7)}] Revert "${c.msg}"`, 'success');
          break;
        }

        case 'tag': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          if (!g.tags) g.tags = {};
          const flags = parts.slice(2);
          const del = flags.includes('-d');
          const name = flags.find(f=>!f.startsWith('-') && flags.indexOf(f) !== flags.indexOf('-m')+1);
          if (del) {
            if (!name||!g.tags[name]) { err(`error: tag '${name||'?'}' not found`); break; }
            delete g.tags[name];
            out(`Deleted tag '${name}'`, 'success');
          } else if (!name) {
            out(Object.keys(g.tags).join('\n')||'(no tags)', 'log');
          } else {
            const h = g.branches[g.HEAD];
            if (!h) { err('error: no commits yet'); break; }
            g.tags[name] = h;
            out(`Tagged: ${name} → ${h.slice(0,7)}`, 'success');
            if (onXP) onXP(10, 'git tag');
          }
          break;
        }

        case 'remote': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const rs = parts[2];
          if (rs==='add') {
            const [,,, rn, ru] = parts;
            if (!rn||!ru) { err('Usage: git remote add origin https://github.com/user/repo.git'); break; }
            g.remotes[rn]={url:ru,pushed:{}};
            out(`Added remote '${rn}' → ${ru}`, 'success');
          } else if (rs==='remove'||rs==='rm') {
            delete g.remotes[parts[3]];
            out(`Removed remote '${parts[3]}'`, 'success');
          } else if (rs==='-v'||rs==='--verbose') {
            const lines = [];
            Object.entries(g.remotes).forEach(([n,r]) => {
              lines.push(`${n}\t${r.url} (fetch)`);
              lines.push(`${n}\t${r.url} (push)`);
            });
            out(lines.join('\n')||'(no remotes)', 'output');
          } else out(Object.keys(g.remotes).join('\n')||'(no remotes)', 'output');
          break;
        }

        case 'push': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const flags = parts.slice(2);
          const rName = flags.find(f=>!f.startsWith('-'))||'origin';
          if (!g.remotes[rName]) { err(`fatal: '${rName}' does not appear to be a git repo`); break; }
          const h = g.branches[g.HEAD];
          if (!h) { err('error: no commits to push'); break; }
          g.remotes[rName].pushed = g.remotes[rName].pushed || {};
          g.remotes[rName].pushed[g.HEAD] = h;
          out(`Pushing to ${g.remotes[rName].url}...`, 'muted');
          // animate progress bar
          setTimeout(() => {
            setPushProgress(0);
            let p = 0;
            const iv = setInterval(() => {
              p += Math.random() * 25 + 5;
              if (p >= 100) { clearInterval(iv); setPushProgress(100); setTimeout(()=>setPushProgress(null),1000); }
              else setPushProgress(Math.min(p,99));
            }, 120);
          }, 0);
          out(`✓ ${g.HEAD} → ${rName}/${g.HEAD}`, 'success');
          setTimeout(() => advanceWorkflow(4), 500);
          if (onXP) onXP(20, 'git push');
          break;
        }

        case 'pull': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          out(`From ${g.remotes?.origin?.url||'origin'}`);
          out(`Already up to date.`, 'success');
          break;
        }

        case 'fetch': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          out(`Fetching from ${g.remotes?.origin?.url||'origin'}\n(no new changes)`, 'muted');
          break;
        }

        case 'clone': {
          const url = parts[2];
          if (!url) { err('Usage: git clone https://github.com/user/repo.git'); break; }
          const n = url.split('/').pop().replace('.git','');
          out(`Cloning into '${n}'...`, 'muted');
          out(`remote: Enumerating objects: done.`);
          out(`✓ Cloned successfully`, 'success');
          break;
        }

        case 'show': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const h = parts[2]||g.branches[g.HEAD];
          const c = g.commits.find(x=>x.hash.startsWith(h||'')||x.hash===h);
          if (!c) { err(`fatal: '${h}' not found`); break; }
          const pSnap = c.parent ? g.commits.find(x=>x.hash===c.parent)?.snapshot||{} : {};
          const lines = [`\x1b[33mcommit ${c.hash}\x1b[0m`,`Author: ${c.author} <${c.email}>`,`Date:   ${new Date(c.date).toLocaleString()}`,'',`    ${c.msg}`,``];
          Object.entries(c.snapshot||{}).forEach(([p,cnt]) => {
            const old = pSnap[p]||'';
            if (old===cnt) return;
            lines.push(`diff --git a/${p} b/${p}`);
            computeDiff(old,cnt).slice(0,20).forEach(d => {
              if (d.type==='add') lines.push(`\x1b[32m+${d.content}\x1b[0m`);
              else if (d.type==='del') lines.push(`\x1b[31m-${d.content}\x1b[0m`);
              else lines.push(` ${d.content}`);
            });
          });
          out(lines.join('\n'), 'log');
          break;
        }

        case 'config': {
          const k = parts[2]==='--global' ? parts[3] : parts[2];
          const v = parts[2]==='--global' ? parts.slice(4).join(' ').replace(/^["']|["']$/g,'') : parts.slice(3).join(' ').replace(/^["']|["']$/g,'');
          if (k==='--list'||parts[2]==='--list') { out(`user.name=${g.config.name}\nuser.email=${g.config.email}`,'output'); break; }
          if (k==='user.name') { g.config.name=v; out(`name → ${v}`,'success'); }
          else if (k==='user.email') { g.config.email=v; out(`email → ${v}`,'success'); }
          else if (k) out(`${k} = ${v}`,'output');
          else out(`user.name=${g.config.name}\nuser.email=${g.config.email}`,'output');
          break;
        }

        case 'blame': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const f = parts[2];
          if (!f||fs[f]===undefined) { err(`error: '${f||'?'}' not found`); break; }
          const lastC = g.commits.slice().reverse().find(c=>c.snapshot?.[f]);
          const blines = (fs[f]||'').split('\n').map((l,i) =>
            `\x1b[33m${(lastC?.hash||'0000000').slice(0,8)}\x1b[0m (${lastC?.author||'Unknown'} ${new Date(lastC?.date||Date.now()).toLocaleDateString()}) ${String(i+1).padStart(3)} ${l}`
          );
          out(blines.join('\n'),'log');
          break;
        }

        case 'reflog': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const lines = g.commits.slice().reverse().slice(0,15).map((c,i) =>
            `${c.hash.slice(0,7)} HEAD@{${i}}: ${c.branch}: ${c.msg}`
          );
          out(lines.join('\n')||'(empty reflog)','log');
          break;
        }

        case 'cherry-pick': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const h = parts[2];
          const c = g.commits.find(x=>x.hash.startsWith(h||''));
          if (!c) { err(`error: '${h}' not found`); break; }
          const nh = makeHash();
          const base = g.commits.find(x=>x.hash===g.branches[g.HEAD])?.snapshot||{};
          const newSnap = { ...base, ...(c.snapshot||{}) };
          g.commits.push({ ...c, hash:nh, parent:g.branches[g.HEAD], branch:g.HEAD, date:new Date().toISOString(), snapshot:newSnap });
          g.branches[g.HEAD] = nh;
          Object.entries(newSnap).forEach(([p,cnt]) => { saveFile(p,cnt); g.files[p]={content:cnt,tracked:true}; });
          out(`[${g.HEAD} ${nh.slice(0,7)}] ${c.msg}`,'success');
          break;
        }

        case 'rebase': {
          if (!g.initialized) { err('fatal: not a git repository'); break; }
          const flags = parts.slice(2);
          const interactive = flags.includes('-i');
          const target = flags.find(f=>!f.startsWith('-'));
          if (interactive) out(`Interactive rebase on ${target||'HEAD~3'}\nNote: Opens editor in real Git. Applied automatically here.`,'muted');
          else if (target && g.branches[target]) out(`Successfully rebased and updated refs/heads/${g.HEAD}.`,'success');
          else err('error: branch not found');
          break;
        }

        case '--version': out('git version 2.43.0 (GitVerse IDE)', 'output'); break;
        case 'help': case undefined: out(HELP_TEXT, 'help'); break;
        default: err(`git: '${sub}' is not a git command. See 'git help'.`);
      }

      setTimeout(() => pushLines(output), 0);
      return g;
    });
  }, [fs, allPaths, isIgnored, pushLines, clearLines, flash, advanceWorkflow, saveFile, createFile, deleteFilePath, renameFile, onXP]);

  // ─────────────────────────────────────────────────────────────────
  // ── Folder Tree ───────────────────────────────────────────────────

  const reachableCommits = useMemo(() => {
    const chain = [];
    let cur = git.branches[git.HEAD];
    while (cur && chain.length < 50) {
      const c = git.commits.find(x => x.hash === cur);
      if (!c) break; chain.push(c); cur = c.parent;
    }
    return chain;
  }, [git.commits, git.branches, git.HEAD]);

    const folderTree = useMemo(() => {
    const folders = new Set(['']);
    allPaths.forEach(p => {
      const parts = p.split('/');
      if (parts.length > 1) {
        for (let i=1; i<parts.length; i++) folders.add(parts.slice(0,i).join('/'));
      }
    });
    const tree = {};
    folders.forEach(f => { tree[f] = []; });
    allPaths.forEach(p => {
      const parts = p.split('/');
      const parent = parts.length > 1 ? parts.slice(0,-1).join('/') : '';
      if (tree[parent]) tree[parent].push(p);
    });
    return tree;
  }, [allPaths]);

  function renderTree(folder, depth = 0) {
    const children = folderTree[folder] || [];
    const subfolders = Object.keys(folderTree).filter(f => {
      if (!f) return false;
      const parts = f.split('/');
      const parentParts = folder ? folder.split('/') : [];
      return parts.length === parentParts.length + 1 && f.startsWith(folder ? folder + '/' : '');
    });

    return (
      <div key={folder || 'root'}>
        {/* Subfolders */}
        {subfolders.map(sf => {
          const name = sf.split('/').pop();
          const isOpen = expandedFolders[sf];
          return (
            <div key={sf}>
              <div
                onClick={() => setExpandedFolders(e => ({ ...e, [sf]: !isOpen }))}
                onContextMenu={e => { e.preventDefault(); setContextMenu({ x:e.clientX, y:e.clientY, type:'folder', path:sf }); }}
                style={{
                  display:'flex', alignItems:'center', gap:5, padding:`3px 8px 3px ${12+depth*14}px`,
                  cursor:'pointer', userSelect:'none', fontSize:13,
                  color: '#8899bb',
                  transition:'background 0.1s',
                }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <span style={{ fontSize:10, color:'#4a5878', minWidth:10 }}>{isOpen?'▾':'▸'}</span>
                <span style={{ fontSize:14 }}>📁</span>
                <span>{name}</span>
              </div>
              {isOpen && renderTree(sf, depth+1)}
            </div>
          );
        })}
        {/* Files in this folder */}
        {children.map(p => {
          const name = p.split('/').pop();
          const status = statusOf(p);
          const isActive = activeTab === p;
          const flashColor = flashFiles[p];
          return (
            <div
              key={p}
              onClick={() => openFile(p)}
              onContextMenu={e => { e.preventDefault(); setContextMenu({ x:e.clientX, y:e.clientY, type:'file', path:p }); }}
              style={{
                display:'flex', alignItems:'center', gap:6,
                padding:`3px 8px 3px ${12+depth*14}px`,
                cursor:'pointer', userSelect:'none',
                background: flashColor==='green' ? 'rgba(76,175,80,0.18)' : flashColor==='orange' ? 'rgba(226,192,141,0.15)' : flashColor==='red' ? 'rgba(244,71,71,0.15)' : flashColor==='blue' ? 'rgba(77,171,247,0.12)' : isActive ? 'rgba(77,171,247,0.1)' : 'transparent',
                borderLeft: isActive ? '2px solid #4dabf7' : `2px solid ${flashColor==='green'?'rgba(76,175,80,0.6)':flashColor==='orange'?'rgba(226,192,141,0.6)':'transparent'}`,
                transition:'all 0.15s',
              }}
              onMouseEnter={e => { if(!isActive&&!flashColor) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if(!isActive&&!flashColor) e.currentTarget.style.background='transparent'; }}
            >
              <span style={{ fontSize:13, color: fileColor(name) }}>{fileIcon(name)}</span>
              {renaming === p ? (
                <input
                  autoFocus defaultValue={name}
                  onBlur={e => { const newName = p.replace(name, e.target.value); renameFile(p, newName); setRenaming(null); }}
                  onKeyDown={e => {
                    if (e.key==='Enter') { const newName = p.replace(name, e.target.value); renameFile(p, newName); setRenaming(null); }
                    if (e.key==='Escape') setRenaming(null);
                  }}
                  onClick={e=>e.stopPropagation()}
                  style={{ flex:1, background:'#0a0e1a', border:'1px solid rgba(0,255,136,0.5)', borderRadius:3, padding:'1px 5px', color:'#e8edf8', fontSize:12, outline:'none' }}
                />
              ) : (
                <span style={{ flex:1, fontSize:12, color: status==='modified'?'#e2c08d':status==='staged'?'#4caf50':status==='untracked'?'#73c6fb':status==='ignored'?'#4a5878':'#c9d1d9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</span>
              )}
              {status && status !== 'clean' && status !== 'ignored' && (
                <span style={{ fontSize:10, color:STATUS_COLOR[status], fontWeight:700, minWidth:12, textAlign:'center', flexShrink:0 }}>{STATUS_LETTER[status]}</span>
              )}
            </div>
          );
        })}
        {/* New item draft */}
        {newItemDraft?.parent === folder && (
          <div style={{ padding:`3px 8px 3px ${12+depth*14+20}px` }}>
            <input
              autoFocus placeholder={newItemDraft.type==='file'?'filename.ext':'folder-name'}
              onBlur={() => setNewItemDraft(null)}
              onKeyDown={e => {
                if (e.key==='Enter') {
                  const val = e.target.value.trim();
                  if (!val) { setNewItemDraft(null); return; }
                  const fullPath = folder ? `${folder}/${val}` : val;
                  if (newItemDraft.type==='file') createFile(fullPath);
                  else { setExpandedFolders(ev=>({...ev,[fullPath]:true})); }
                  setNewItemDraft(null);
                }
                if (e.key==='Escape') setNewItemDraft(null);
              }}
              style={{ width:'90%', background:'#0a0e1a', border:'1px solid rgba(0,255,136,0.4)', borderRadius:3, padding:'2px 6px', color:'#e8edf8', fontSize:12, outline:'none' }}
            />
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // ── GitHub Panel ──────────────────────────────────────────────────

  function renderGitHubPanel() {
    const tabs = [
      { id:'code', label:'<> Code', icon:'📄' },
      { id:'commits', label:'Commits', icon:'🕐' },
      { id:'branches', label:'Branches', icon:'🌿' },
      { id:'prs', label:`PRs ${prs.length?`(${prs.length})`:''}`, icon:'🔀' },
      { id:'actions', label:'Actions', icon:'⚙️' },
    ];

    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#0d1117', borderLeft:'1px solid #21262d' }}>
        {/* Repo header */}
        <div style={{ padding:'10px 14px', borderBottom:'1px solid #21262d', background:'#161b22' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ fontSize:18 }}>🐙</span>
            <span style={{ fontSize:12, color:'#58a6ff', fontFamily:"'JetBrains Mono',monospace" }}>user / <strong>my-project</strong></span>
            {git.initialized && (
              <span style={{ marginLeft:'auto', background:'rgba(88,166,255,0.1)', border:'1px solid rgba(88,166,255,0.3)', color:'#58a6ff', borderRadius:20, padding:'1px 8px', fontSize:10 }}>Public</span>
            )}
          </div>
          {/* Branch selector */}
          {git.initialized && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'#21262d', border:'1px solid #30363d', borderRadius:6, padding:'4px 10px', fontSize:11, color:'#c9d1d9', fontFamily:"'JetBrains Mono',monospace" }}>
                <span>🌿</span>
                <span style={{ color:'#00ff88', fontWeight:700 }}>{git.HEAD}</span>
                <span style={{ color:'#484f58' }}>▾</span>
              </div>
              <span style={{ color:'#484f58', fontSize:11 }}>{git.commits.length} commits</span>
              {pushProgress !== null && (
                <div style={{ flex:1, background:'#21262d', borderRadius:4, height:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:'#00ff88', width:`${pushProgress}%`, transition:'width 0.12s ease', borderRadius:4 }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', borderBottom:'1px solid #21262d', background:'#161b22', overflow:'hidden' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setGhTab(t.id)} style={{
              padding:'8px 12px', background:'none', border:'none',
              borderBottom: ghTab===t.id ? '2px solid #f78166' : '2px solid transparent',
              color: ghTab===t.id ? '#e6edf3' : '#8b949e',
              fontFamily:"'JetBrains Mono',monospace", fontSize:11, cursor:'pointer',
              whiteSpace:'nowrap', transition:'color 0.15s', display:'flex', alignItems:'center', gap:5,
            }}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex:1, overflow:'auto' }}>

          {/* ── Code Tab ── */}
          {ghTab==='code' && (
            <div>
              {!git.initialized && (
                <div style={{ padding:24, textAlign:'center' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
                  <div style={{ color:'#8b949e', fontSize:13, marginBottom:16 }}>Initialize your repository to get started</div>
                  <button onClick={()=>runCommand('git init')} style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', color:'#00ff88', borderRadius:6, padding:'8px 20px', fontSize:12, cursor:'pointer', fontFamily:"'JetBrains Mono',monospace" }}>git init</button>
                </div>
              )}
              {git.initialized && (
                <>
                  {/* File browser */}
                  <div style={{ borderBottom:'1px solid #21262d' }}>
                    {Object.keys(folderTree).filter(f => {
                      if (!ghBrowsePath) return f === '';
                      return f === ghBrowsePath;
                    }).map(folder => {
                      const children = folderTree[folder]||[];
                      const subfolders = Object.keys(folderTree).filter(f => {
                        if (!f) return false;
                        const parts = f.split('/');
                        const parentParts = folder ? folder.split('/') : [];
                        return parts.length === parentParts.length+1 && f.startsWith(folder?folder+'/':'');
                      });
                      return (
                        <div key={folder}>
                          {subfolders.map(sf => {
                            const name = sf.split('/').pop();
                            const lastCommit = git.commits.slice(-1)[0];
                            return (
                              <div key={sf} onClick={()=>setGhBrowsePath(sf)} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 16px', borderBottom:'1px solid #21262d', cursor:'pointer', transition:'background 0.1s' }}
                                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                              >
                                <span>📁</span>
                                <span style={{ flex:1, color:'#79c0ff', fontSize:13 }}>{name}</span>
                                <span style={{ color:'#8b949e', fontSize:11, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lastCommit?.msg||''}</span>
                                <span style={{ color:'#484f58', fontSize:11, minWidth:60, textAlign:'right' }}>{timeAgo(lastCommit?.date||Date.now())}</span>
                              </div>
                            );
                          })}
                          {children.map(p => {
                            const name = p.split('/').pop();
                            const lastCommit = git.commits.slice().reverse().find(c=>c.snapshot?.[p]);
                            return (
                              <div key={p} onClick={()=>openFile(p)} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 16px', borderBottom:'1px solid #21262d', cursor:'pointer', transition:'background 0.1s' }}
                                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                              >
                                <span style={{ color:fileColor(name) }}>{fileIcon(name)}</span>
                                <span style={{ flex:1, color:'#e6edf3', fontSize:13 }}>{name}</span>
                                <span style={{ color:'#8b949e', fontSize:11, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lastCommit?.msg||'—'}</span>
                                <span style={{ color:'#484f58', fontSize:11, minWidth:60, textAlign:'right' }}>{lastCommit?timeAgo(lastCommit.date):'—'}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  {/* README preview */}
                  {fs['README.md'] && (
                    <div style={{ padding:16 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, paddingBottom:8, borderBottom:'1px solid #21262d' }}>
                        <span>📝</span>
                        <span style={{ color:'#e6edf3', fontSize:12 }}>README.md</span>
                      </div>
                      <pre style={{ color:'#c9d1d9', fontSize:12, fontFamily:'inherit', whiteSpace:'pre-wrap', lineHeight:1.6, margin:0 }}>{fs['README.md']}</pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Commits Tab ── */}
          {ghTab==='commits' && (
            <div>
              {!reachableCommits.length && (
                <div style={{ padding:24, textAlign:'center', color:'#8b949e', fontSize:12 }}>No commits yet</div>
              )}
              {reachableCommits.map((c, i) => {
                const branchLabels = Object.entries(git.branches).filter(([,h])=>h===c.hash).map(([b])=>b);
                const tagLabels = Object.entries(git.tags||{}).filter(([,h])=>h===c.hash).map(([t])=>t);
                const isSelected = selectedCommit?.hash===c.hash;
                return (
                  <div key={c.hash}>
                    <div onClick={()=>setSelectedCommit(isSelected?null:c)} style={{
                      display:'flex', alignItems:'flex-start', gap:10, padding:'12px 16px',
                      borderBottom:'1px solid #21262d', cursor:'pointer',
                      background: isSelected?'rgba(88,166,255,0.05)':'transparent',
                      transition:'background 0.1s',
                    }}
                      onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background='rgba(255,255,255,0.02)'; }}
                      onMouseLeave={e=>{ if(!isSelected) e.currentTarget.style.background='transparent'; }}
                    >
                      {/* Graph line */}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:3 }}>
                        <div style={{ width:12, height:12, borderRadius:'50%', background: i===0?'#00ff88':'#238636', border:`2px solid ${i===0?'#00cc6a':'#2ea043'}`, flexShrink:0 }}/>
                        {i<reachableCommits.length-1 && <div style={{ width:2, height:28, background:'#21262d', marginTop:2 }}/>}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:3 }}>
                          {branchLabels.map(b=>(
                            <span key={b} style={{ background:b===git.HEAD?'rgba(0,255,136,0.12)':'rgba(88,166,255,0.12)', color:b===git.HEAD?'#00ff88':'#79c0ff', border:`1px solid ${b===git.HEAD?'rgba(0,255,136,0.3)':'rgba(88,166,255,0.3)'}`, borderRadius:4, padding:'0 6px', fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>
                              {b===git.HEAD?'HEAD → ':''}{b}
                            </span>
                          ))}
                          {tagLabels.map(t=>(
                            <span key={t} style={{ background:'rgba(255,179,71,0.1)', color:'#f0883e', border:'1px solid rgba(255,179,71,0.3)', borderRadius:4, padding:'0 6px', fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>🏷 {t}</span>
                          ))}
                        </div>
                        <div style={{ fontSize:13, color:'#e6edf3', marginBottom:3 }}>{c.msg}</div>
                        <div style={{ fontSize:11, color:'#8b949e', display:'flex', gap:10 }}>
                          <span>{c.author}</span>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", color:'#8b949e' }}>{c.hash.slice(0,7)}</span>
                          <span>{timeAgo(c.date)}</span>
                        </div>
                      </div>
                      <button onClick={e=>{e.stopPropagation(); navigator.clipboard?.writeText(c.hash);}} style={{ background:'none', border:'1px solid #30363d', color:'#8b949e', borderRadius:5, padding:'2px 8px', fontSize:10, cursor:'pointer' }}>📋</button>
                    </div>
                    {/* Inline diff */}
                    {isSelected && (
                      <div style={{ background:'#0d1117', borderBottom:'1px solid #21262d' }}>
                        {renderCommitDiff(c)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Branches Tab ── */}
          {ghTab==='branches' && (
            <div style={{ padding:12 }}>
              {/* Create branch */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, color:'#484f58', fontFamily:"'JetBrains Mono',monospace", marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>New branch</div>
                <div style={{ display:'flex', gap:6 }}>
                  <input value={newBranchInput} onChange={e=>setNewBranchInput(e.target.value)}
                    onKeyDown={e=>{ if(e.key==='Enter'&&newBranchInput){ runCommand(`git branch ${newBranchInput}`); setNewBranchInput(''); }}}
                    placeholder="branch-name"
                    style={{ flex:1, background:'#0d1117', border:'1px solid #30363d', borderRadius:6, padding:'6px 10px', color:'#e6edf3', fontFamily:"'JetBrains Mono',monospace", fontSize:12, outline:'none' }}
                  />
                  <button onClick={()=>{ if(newBranchInput){ runCommand(`git switch -c ${newBranchInput}`); setNewBranchInput(''); }}} style={{ background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', color:'#00ff88', borderRadius:6, padding:'6px 12px', fontSize:12, cursor:'pointer' }}>Create</button>
                </div>
              </div>
              <div style={{ fontSize:11, color:'#484f58', fontFamily:"'JetBrains Mono',monospace", marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 }}>All branches</div>
              {Object.entries(git.branches).map(([name, hash]) => {
                const isActive = name===git.HEAD;
                const c = hash ? git.commits.find(x=>x.hash===hash) : null;
                const isPushed = git.remotes?.origin?.pushed?.[name] === hash;
                return (
                  <div key={name} style={{ padding:'10px 12px', borderRadius:8, marginBottom:6, background:isActive?'rgba(0,255,136,0.05)':'rgba(255,255,255,0.02)', border:`1px solid ${isActive?'rgba(0,255,136,0.2)':'#21262d'}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:14 }}>{isActive?'🟢':'⚪'}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:isActive?'#00ff88':'#e6edf3' }}>{name}</span>
                          {isActive && <span style={{ fontSize:10, color:'#00ff88', background:'rgba(0,255,136,0.1)', borderRadius:4, padding:'0 5px' }}>current</span>}
                          {isPushed && <span style={{ fontSize:10, color:'#8b949e', background:'rgba(255,255,255,0.05)', borderRadius:4, padding:'0 5px' }}>↑ pushed</span>}
                        </div>
                        {c && <div style={{ fontSize:11, color:'#484f58', fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>{c.hash.slice(0,7)} {c.msg}</div>}
                      </div>
                      {!isActive && <button onClick={()=>runCommand(`git switch ${name}`)} style={{ background:'none', border:'1px solid #30363d', color:'#8b949e', borderRadius:5, padding:'3px 9px', fontSize:11, cursor:'pointer', fontFamily:"'JetBrains Mono',monospace" }}>Switch</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── PRs Tab ── */}
          {ghTab==='prs' && (
            <div style={{ padding:12 }}>
              <button onClick={()=>setPrDraft({ title:'', body:'', from:git.HEAD, to:'main' })} style={{ width:'100%', background:'rgba(35,134,54,0.15)', border:'1px solid rgba(35,134,54,0.4)', color:'#3fb950', borderRadius:8, padding:'8px', fontSize:12, cursor:'pointer', marginBottom:12, fontFamily:"'JetBrains Mono',monospace", display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <span>+</span><span>New pull request</span>
              </button>
              {prDraft && (
                <div style={{ background:'#161b22', borderRadius:10, border:'1px solid #30363d', padding:14, marginBottom:14 }}>
                  <div style={{ fontSize:11, color:'#8b949e', fontFamily:"'JetBrains Mono',monospace", marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ color:'#f78166' }}>{prDraft.from}</span>
                    <span>→</span>
                    <span style={{ color:'#79c0ff' }}>{prDraft.to}</span>
                  </div>
                  <input value={prDraft.title} onChange={e=>setPrDraft(p=>({...p,title:e.target.value}))} placeholder="Pull request title" style={{ width:'100%', background:'#0d1117', border:'1px solid #30363d', borderRadius:6, padding:'7px 10px', color:'#e6edf3', fontSize:13, marginBottom:8, outline:'none', boxSizing:'border-box' }} />
                  <textarea value={prDraft.body} onChange={e=>setPrDraft(p=>({...p,body:e.target.value}))} placeholder="Leave a comment..." style={{ width:'100%', background:'#0d1117', border:'1px solid #30363d', borderRadius:6, padding:'7px 10px', color:'#e6edf3', fontSize:12, height:70, resize:'none', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }} />
                  <div style={{ display:'flex', gap:8, marginTop:8 }}>
                    <button onClick={()=>{
                      if(!prDraft.title.trim()) return;
                      const newPR = { ...prDraft, id:Date.now(), status:'open', date:new Date().toISOString(), number:prs.length+1 };
                      setPrs(p=>[...p,newPR]); setPrDraft(null);
                      if(onXP) onXP(20,'Pull Request opened');
                    }} style={{ flex:1, background:'rgba(35,134,54,0.2)', border:'1px solid rgba(35,134,54,0.5)', color:'#3fb950', borderRadius:6, padding:'7px', fontSize:12, cursor:'pointer' }}>Create pull request</button>
                    <button onClick={()=>setPrDraft(null)} style={{ background:'none', border:'1px solid #30363d', color:'#8b949e', borderRadius:6, padding:'7px 12px', fontSize:12, cursor:'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}
              {!prs.length && !prDraft && (
                <div style={{ textAlign:'center', padding:24, color:'#8b949e', fontSize:12 }}>
                  <div style={{ fontSize:36, marginBottom:8 }}>🔀</div>
                  No pull requests yet
                </div>
              )}
              {prs.map(pr => (
                <div key={pr.id} onClick={()=>setActivePR(activePR?.id===pr.id?null:pr)} style={{ padding:'12px 14px', borderRadius:10, border:`1px solid ${pr.status==='merged'?'rgba(163,113,247,0.3)':pr.status==='closed'?'#21262d':'rgba(35,134,54,0.3)'}`, marginBottom:8, cursor:'pointer', background:`${activePR?.id===pr.id?'rgba(255,255,255,0.03)':'transparent'}`, transition:'all 0.15s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:16 }}>{pr.status==='merged'?'🟣':pr.status==='closed'?'🔴':'🟢'}</span>
                    <span style={{ fontSize:13, color:'#e6edf3', fontWeight:600 }}>{pr.title}</span>
                    <span style={{ marginLeft:'auto', fontSize:10, color:'#8b949e' }}>#{pr.number}</span>
                  </div>
                  <div style={{ fontSize:11, color:'#8b949e', fontFamily:"'JetBrains Mono',monospace" }}>
                    {pr.from} → {pr.to} · {timeAgo(pr.date)}
                  </div>
                  {activePR?.id===pr.id && pr.status==='open' && (
                    <div style={{ display:'flex', gap:8, marginTop:10 }} onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>{ runCommand(`git merge ${pr.from}`); setPrs(p=>p.map(x=>x.id===pr.id?{...x,status:'merged'}:x)); setActivePR(null); }} style={{ background:'rgba(163,113,247,0.15)', border:'1px solid rgba(163,113,247,0.4)', color:'#a371f7', borderRadius:6, padding:'5px 12px', fontSize:11, cursor:'pointer' }}>Merge pull request</button>
                      <button onClick={()=>setPrs(p=>p.map(x=>x.id===pr.id?{...x,status:'closed'}:x))} style={{ background:'none', border:'1px solid #30363d', color:'#8b949e', borderRadius:6, padding:'5px 12px', fontSize:11, cursor:'pointer' }}>Close</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Actions Tab ── */}
          {ghTab==='actions' && (
            <div style={{ padding:16 }}>
              <div style={{ fontSize:11, color:'#484f58', fontFamily:"'JetBrains Mono',monospace", marginBottom:12, textTransform:'uppercase', letterSpacing:0.5 }}>Workflow Runs</div>
              {!git.commits.length ? (
                <div style={{ textAlign:'center', color:'#8b949e', fontSize:12, padding:20 }}>Push a commit to trigger workflows</div>
              ) : (
                git.commits.slice(-3).reverse().map(c => {
                  const passed = c.msg.toLowerCase().includes('fix')||c.msg.toLowerCase().includes('test')||Math.random()>0.3;
                  return (
                    <div key={c.hash} style={{ padding:'10px 12px', borderRadius:8, border:'1px solid #21262d', marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:18 }}>{passed?'✅':'❌'}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, color:'#e6edf3', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.msg}</div>
                        <div style={{ fontSize:10, color:'#8b949e', marginTop:2, fontFamily:"'JetBrains Mono',monospace" }}>CI / {c.hash.slice(0,7)} · {timeAgo(c.date)}</div>
                      </div>
                      <span style={{ fontSize:11, color:passed?'#3fb950':'#f85149', fontWeight:700 }}>{passed?'passed':'failed'}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      </div>
    );
  }

  function renderCommitDiff(commit) {
    const pSnap = commit.parent ? git.commits.find(c=>c.hash===commit.parent)?.snapshot||{} : {};
    const changed = Object.keys({ ...pSnap, ...(commit.snapshot||{}) }).filter(p => pSnap[p] !== (commit.snapshot||{})[p]);
    if (!changed.length) return <div style={{ padding:12, color:'#8b949e', fontSize:12 }}>No file changes</div>;
    return (
      <div>
        <div style={{ padding:'6px 16px', fontSize:11, color:'#8b949e', fontFamily:"'JetBrains Mono',monospace", borderBottom:'1px solid #21262d', display:'flex', gap:10 }}>
          {commit.stats && <>
            {commit.stats.added>0 && <span style={{color:'#3fb950'}}>+{commit.stats.added} added</span>}
            {commit.stats.modified>0 && <span style={{color:'#e3b341'}}>~{commit.stats.modified} modified</span>}
            {commit.stats.deleted>0 && <span style={{color:'#f85149'}}>-{commit.stats.deleted} deleted</span>}
          </>}
        </div>
        {changed.slice(0,5).map(p => {
          const old = pSnap[p]||'', neu = (commit.snapshot||{})[p]||'';
          const diff = computeDiff(old, neu);
          const hasChanges = diff.some(d=>d.type!=='ctx');
          if (!hasChanges) return null;
          return (
            <div key={p}>
              <div style={{ padding:'6px 16px', background:'#161b22', borderBottom:'1px solid #21262d', fontSize:11, color:'#8b949e', fontFamily:"'JetBrains Mono',monospace", display:'flex', gap:8 }}>
                <span style={{color:fileColor(p)}}>{fileIcon(p)}</span>
                <span>{p}</span>
                <span style={{marginLeft:'auto', color:'#3fb950'}}>+{diff.filter(d=>d.type==='add').length}</span>
                <span style={{color:'#f85149'}}>-{diff.filter(d=>d.type==='del').length}</span>
              </div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11 }}>
                {diff.slice(0,40).map((d,di) => (
                  <div key={di} style={{ display:'flex', gap:10, padding:'1px 16px', background:d.type==='add'?'rgba(63,185,80,0.06)':d.type==='del'?'rgba(248,81,73,0.06)':'transparent' }}>
                    <span style={{ color:'#484f58', minWidth:28, textAlign:'right', userSelect:'none' }}>{d.line}</span>
                    <span style={{ color:d.type==='add'?'#3fb950':d.type==='del'?'#f85149':'#484f58', minWidth:10 }}>{d.type==='add'?'+':d.type==='del'?'-':' '}</span>
                    <span style={{ color:d.type==='add'?'#aff5b4':d.type==='del'?'#ffdcd7':'#8b949e' }}>{d.content}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // ── Workflow Banner ───────────────────────────────────────────────

  // const WORKFLOW_STEPS = [
  //   { id:0, label:'git init', desc:'Initialize repo', cmd:'git init', done: git.initialized },
  //   { id:1, label:'Edit files', desc:'Modify a file', cmd:null, done: workflowStep>=1 },
  //   { id:2, label:'git add .', desc:'Stage changes', cmd:'git add .', done: workflowStep>=2 || Object.keys(git.staged).length>0 },
  //   { id:3, label:'git commit', desc:'Save snapshot', cmd:'git commit -m "my changes"', done: workflowStep>=3 || git.commits.length>0 },
  //   { id:4, label:'git push', desc:'Publish to remote', cmd:'git push', done: workflowStep>=4 },
  // ];
  // const currentStep = WORKFLOW_STEPS.find(s=>!s.done);

  // ─────────────────────────────────────────────────────────────────
  // ── Terminal line renderer ────────────────────────────────────────

  function renderTermLine(item) {
    if (item.type==='welcome') return (
      <div style={{ color:'#3fb950', fontFamily:"'JetBrains Mono',monospace", fontSize:12, whiteSpace:'pre-wrap', marginBottom:8, lineHeight:1.5, borderLeft:'2px solid #238636', paddingLeft:10 }}>{item.text}</div>
    );
    if (item.type==='input') return (
      <div style={{ color:'#79c0ff', fontFamily:"'JetBrains Mono',monospace", fontSize:12, marginBottom:3, letterSpacing:0.3 }}>{item.text}</div>
    );
    if (item.type==='error') return (
      <div style={{ color:'#f85149', fontFamily:"'JetBrains Mono',monospace", fontSize:12, whiteSpace:'pre-wrap', marginBottom:4 }}>{item.text}</div>
    );
    if (item.type==='success') return (
      <div style={{ color:'#3fb950', fontFamily:"'JetBrains Mono',monospace", fontSize:12, whiteSpace:'pre-wrap', marginBottom:4 }}>{item.text}</div>
    );
    if (item.type==='muted') return (
      <div style={{ color:'#484f58', fontFamily:"'JetBrains Mono',monospace", fontSize:12, whiteSpace:'pre-wrap', marginBottom:2, fontStyle:'italic' }}>{item.text}</div>
    );
    if (item.type==='help') return (
      <div style={{ color:'#79c0ff', fontFamily:"'JetBrains Mono',monospace", fontSize:11, whiteSpace:'pre', marginBottom:4, lineHeight:1.6 }}>{item.text}</div>
    );
    // log / diff / status / branch / output
    return (
      <div style={{ color:'#c9d1d9', fontFamily:"'JetBrains Mono',monospace", fontSize:12, whiteSpace:'pre-wrap', marginBottom:2, lineHeight:1.5 }}
        dangerouslySetInnerHTML={{ __html: item.text
          .replace(/\x1b\[33m(.*?)\x1b\[0m/g,'<span style="color:#e3b341">$1</span>')
          .replace(/\x1b\[32m(.*?)\x1b\[0m/g,'<span style="color:#3fb950">$1</span>')
          .replace(/\x1b\[31m(.*?)\x1b\[0m/g,'<span style="color:#f85149">$1</span>')
          .replace(/\x1b\[90m(.*?)\x1b\[0m/g,'<span style="color:#484f58">$1</span>')
          .replace(/\x1b\[1m(.*?)\x1b\[0m/g,'<strong>$1</strong>')
          .replace(/\x1b\[0m/g,'')
        }}
      />
    );
  }


  // ═══════════════════════════════════════════════════════════════
  // ── DESIGN SYSTEM — Obsidian Terminal v3
  // ═══════════════════════════════════════════════════════════════

  const DS = {
    // Surfaces
    bg:        '#05080f',
    surface1:  '#0a0f1a',
    surface2:  '#0e1520',
    surface3:  '#131c2b',
    surface4:  '#182235',
    // Borders
    border1:   'rgba(255,255,255,0.04)',
    border2:   'rgba(255,255,255,0.07)',
    border3:   'rgba(255,255,255,0.11)',
    // Accents
    green:     '#00e5a0',
    greenDim:  'rgba(0,229,160,0.08)',
    greenGlow: '0 0 12px rgba(0,229,160,0.25)',
    cyan:      '#00d4ff',
    cyanDim:   'rgba(0,212,255,0.08)',
    blue:      '#4d9fff',
    orange:    '#ff9f43',
    red:       '#ff5252',
    purple:    '#b47aff',
    yellow:    '#ffd60a',
    // Text
    text1:     '#e8f0fe',
    text2:     '#8ba3c7',
    text3:     '#4a6080',
    text4:     '#2a3d55',
    // Mono font
    mono:      "'JetBrains Mono', 'Fira Code', monospace",
    ui:        "'Inter', system-ui, sans-serif",
  };

  // ── Responsive breakpoint state ──
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState('editor'); // editor|terminal|github
  const [explorerOpen, setExplorerOpen] = useState(false); // mobile slide-in drawer

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth < 1024 && window.innerWidth >= 640);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Animation keyframes injected once ──
  useEffect(() => {
    if (document.getElementById('gv-ide-styles')) return;
    const s = document.createElement('style');
    s.id = 'gv-ide-styles';
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap');

      @keyframes gv-blink    { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes gv-pulse    { 0%,100%{opacity:1} 50%{opacity:0.35} }
      @keyframes gv-shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
      @keyframes gv-slide-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
      @keyframes gv-pop-in   { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
      @keyframes gv-aurora   { 0%,100%{opacity:0.4;transform:scale(1) rotate(0deg)} 50%{opacity:0.7;transform:scale(1.15) rotate(3deg)} }
      @keyframes gv-flash-g  { 0%{background:rgba(0,229,160,0.18)} 100%{background:transparent} }
      @keyframes gv-flash-o  { 0%{background:rgba(255,159,67,0.18)} 100%{background:transparent} }
      @keyframes gv-flash-r  { 0%{background:rgba(255,82,82,0.18)} 100%{background:transparent} }
      @keyframes gv-flash-b  { 0%{background:rgba(77,159,255,0.18)} 100%{background:transparent} }
      @keyframes gv-push-bar { from{width:0} to{width:100%} }

      .gv-flash-g { animation: gv-flash-g 0.8s ease forwards; }
      .gv-flash-o { animation: gv-flash-o 0.8s ease forwards; }
      .gv-flash-r { animation: gv-flash-r 0.8s ease forwards; }
      .gv-flash-b { animation: gv-flash-b 0.8s ease forwards; }

      .gv-root * { box-sizing: border-box; }
      .gv-root ::-webkit-scrollbar { width:4px; height:4px; }
      .gv-root ::-webkit-scrollbar-track { background:transparent; }
      .gv-root ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }
      .gv-root ::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.15); }

      .gv-tab-btn:hover { background: rgba(255,255,255,0.05) !important; }
      .gv-nav-btn:hover { background: rgba(255,255,255,0.06) !important; color: #e8f0fe !important; }
      .gv-file-row:hover { background: rgba(255,255,255,0.035) !important; }
      .gv-file-row:hover .gv-file-action { opacity: 1 !important; }
      .gv-file-action { opacity: 0; transition: opacity 0.15s; }
      .gv-ctx-item:hover { background: rgba(255,255,255,0.06) !important; }
      .gv-gh-row:hover { background: rgba(255,255,255,0.025) !important; }
      .gv-commit-row:hover { background: rgba(255,255,255,0.02) !important; }
      .gv-btn-hover:hover { filter: brightness(1.15); transform: translateY(-1px); }
      .gv-slide-in { animation: gv-slide-in 0.2s ease forwards; }
      .gv-pop-in   { animation: gv-pop-in   0.15s ease forwards; }

      .gv-term-input::placeholder { color: rgba(75,100,135,0.6); }
      .gv-term-input { caret-color: #00e5a0; }

      .gv-workflow-step-active .gv-wf-dot {
        animation: gv-pulse 1.5s ease-in-out infinite;
        box-shadow: 0 0 8px rgba(77,159,255,0.6);
      }
    `;
    document.head.appendChild(s);
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // ── UI Primitives ─────────────────────────────────────────────────

  const Btn = ({ children, onClick, style, variant = 'ghost', title, className = '' }) => {
    const base = {
      border: 'none', cursor: 'pointer', fontFamily: DS.mono,
      display: 'flex', alignItems: 'center', gap: 5,
      transition: 'all 0.15s', userSelect: 'none',
    };
    const variants = {
      ghost: { background: 'none', color: DS.text2, borderRadius: 6, padding: '4px 8px', fontSize: 12 },
      primary: { background: 'linear-gradient(135deg, rgba(0,229,160,0.15), rgba(0,229,160,0.08))', color: DS.green, border: `1px solid rgba(0,229,160,0.25)`, borderRadius: 7, padding: '5px 13px', fontSize: 12, boxShadow: '0 2px 8px rgba(0,229,160,0.1)' },
      danger: { background: 'rgba(255,82,82,0.08)', color: DS.red, border: `1px solid rgba(255,82,82,0.2)`, borderRadius: 7, padding: '4px 10px', fontSize: 11 },
      dim: { background: 'rgba(255,255,255,0.04)', color: DS.text2, border: `1px solid ${DS.border2}`, borderRadius: 6, padding: '4px 10px', fontSize: 11 },
    };
    return <button onClick={onClick} title={title} className={`gv-btn-hover ${className}`} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
  };

  const Tag = ({ children, color = DS.green }) => (
    <span style={{ fontFamily: DS.mono, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: `${color}14`, color, border: `1px solid ${color}28`, letterSpacing: 0.2, flexShrink: 0 }}>{children}</span>
  );

  // ─────────────────────────────────────────────────────────────────
  // ── renderTree (redesigned) ───────────────────────────────────────

  function renderTree(folder, depth = 0) {
    const children = folderTree[folder] || [];
    const subfolders = Object.keys(folderTree).filter(f => {
      if (!f) return false;
      const pp = folder ? folder.split('/') : [];
      return f.split('/').length === pp.length + 1 && f.startsWith(folder ? folder + '/' : '');
    });

    return (
      <div key={folder || 'root'}>
        {subfolders.map(sf => {
          const name = sf.split('/').pop();
          const isOpen = expandedFolders[sf];
          return (
            <div key={sf}>
              <div
                className="gv-file-row"
                onClick={() => setExpandedFolders(e => ({ ...e, [sf]: !isOpen }))}
                onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'folder', path: sf }); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: `4px 10px 4px ${10 + depth * 14}px`, cursor: 'pointer', userSelect: 'none', borderRadius: 5, margin: '0 4px', transition: 'background 0.1s' }}
              >
                <span style={{ fontSize: 9, color: DS.text1, minWidth: 10, transition: 'transform 0.15s', transform: isOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
                <span style={{ fontSize: 13 }}>📁</span>
                <span style={{ fontSize: 12, color: DS.text2, fontFamily: DS.mono }}>{name}</span>
              </div>
              {isOpen && renderTree(sf, depth + 1)}
            </div>
          );
        })}

        {children.map(p => {
          const name = p.split('/').pop();
          const status = statusOf(p);
          const isActive = activeTab === p;
          const fc = flashFiles[p];
          const flashClass = fc === 'green' ? 'gv-flash-g' : fc === 'orange' ? 'gv-flash-o' : fc === 'red' ? 'gv-flash-r' : fc === 'blue' ? 'gv-flash-b' : '';
          const sColor = STATUS_COLOR[status];

          return (
            <div
              key={p}
              className={`gv-file-row ${flashClass}`}
              onClick={() => openFile(p)}
              onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'file', path: p }); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: `4px 10px 4px ${10 + depth * 14 + 16}px`,
                cursor: 'pointer', userSelect: 'none',
                borderRadius: 5, margin: '0 4px', transition: 'background 0.1s',
                background: isActive ? 'rgba(0,229,160,0.07)' : 'transparent',
                borderLeft: isActive ? `2px solid ${DS.green}` : '2px solid transparent',
                marginLeft: isActive ? 4 : 4,
              }}
            >
              <span style={{ fontSize: 13, color: fileColor(name), flexShrink: 0 }}>{fileIcon(name)}</span>
              {renaming === p ? (
                <input
                  autoFocus defaultValue={name}
                  onBlur={e => { renameFile(p, p.replace(name, e.target.value)); setRenaming(null); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { renameFile(p, p.replace(name, e.target.value)); setRenaming(null); }
                    if (e.key === 'Escape') setRenaming(null);
                  }}
                  onClick={e => e.stopPropagation()}
                  style={{ flex: 1, background: DS.surface4, border: `1px solid ${DS.green}55`, borderRadius: 4, padding: '1px 6px', color: DS.text1, fontSize: 12, outline: 'none', fontFamily: DS.mono }}
                />
              ) : (
                <span style={{ flex: 1, fontSize: 12, fontFamily: DS.mono, color: sColor || DS.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
              )}
              {status && status !== 'clean' && status !== 'ignored' && (
                <span style={{ fontSize: 10, color: sColor, fontWeight: 700, fontFamily: DS.mono, flexShrink: 0 }}>{STATUS_LETTER[status]}</span>
              )}
            </div>
          );
        })}

        {newItemDraft?.parent === folder && (
          <div style={{ padding: `2px 10px 2px ${10 + depth * 14 + 32}px` }}>
            <input
              autoFocus placeholder={newItemDraft.type === 'file' ? 'filename.ext' : 'folder-name'}
              onBlur={() => setNewItemDraft(null)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = e.target.value.trim();
                  if (!val) { setNewItemDraft(null); return; }
                  const fp = folder ? `${folder}/${val}` : val;
                  if (newItemDraft.type === 'file') createFile(fp);
                  else setExpandedFolders(ev => ({ ...ev, [fp]: true }));
                  setNewItemDraft(null);
                }
                if (e.key === 'Escape') setNewItemDraft(null);
              }}
              style={{ width: '90%', background: DS.surface4, border: `1px solid ${DS.green}44`, borderRadius: 4, padding: '2px 7px', color: DS.text1, fontSize: 12, outline: 'none', fontFamily: DS.mono }}
            />
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // ── renderCommitDiff (redesigned) ────────────────────────────────

  function renderCommitDiff(commit) {
    const pSnap = commit.parent ? git.commits.find(c => c.hash === commit.parent)?.snapshot || {} : {};
    const changed = Object.keys({ ...pSnap, ...(commit.snapshot || {}) }).filter(p => pSnap[p] !== (commit.snapshot || {})[p]);
    if (!changed.length) return <div style={{ padding: 14, color: DS.text1, fontSize: 12, fontFamily: DS.mono }}>No file changes</div>;
    return (
      <div>
        <div style={{ padding: '6px 16px', fontSize: 11, color: DS.text1, fontFamily: DS.mono, borderBottom: `1px solid ${DS.border1}`, display: 'flex', gap: 12 }}>
          {commit.stats?.added > 0 && <span style={{ color: DS.green }}>+{commit.stats.added} added</span>}
          {commit.stats?.modified > 0 && <span style={{ color: DS.orange }}>~{commit.stats.modified} changed</span>}
          {commit.stats?.deleted > 0 && <span style={{ color: DS.red }}>-{commit.stats.deleted} deleted</span>}
        </div>
        {changed.slice(0, 5).map(p => {
          const old = pSnap[p] || '', neu = (commit.snapshot || {})[p] || '';
          const diff = computeDiff(old, neu);
          if (!diff.some(d => d.type !== 'ctx')) return null;
          return (
            <div key={p}>
              <div style={{ padding: '5px 14px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${DS.border1}`, fontSize: 11, color: DS.text1, fontFamily: DS.mono, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: fileColor(p) }}>{fileIcon(p)}</span>
                <span style={{ color: DS.text2 }}>{p}</span>
                <span style={{ marginLeft: 'auto', color: DS.green }}>+{diff.filter(d => d.type === 'add').length}</span>
                <span style={{ color: DS.red }}>-{diff.filter(d => d.type === 'del').length}</span>
              </div>
              {diff.slice(0, 30).map((d, di) => (
                <div key={di} style={{ display: 'flex', gap: 10, padding: '1px 14px', background: d.type === 'add' ? 'rgba(0,229,160,0.05)' : d.type === 'del' ? 'rgba(255,82,82,0.05)' : 'transparent', fontFamily: DS.mono, fontSize: 11 }}>
                  <span style={{ color: DS.text1, minWidth: 24, textAlign: 'right', userSelect: 'none' }}>{d.line}</span>
                  <span style={{ color: d.type === 'add' ? DS.green : d.type === 'del' ? DS.red : DS.text1, minWidth: 10 }}>{d.type === 'add' ? '+' : d.type === 'del' ? '-' : ' '}</span>
                  <span style={{ color: d.type === 'add' ? '#a8ffdf' : d.type === 'del' ? '#ffb3b3' : DS.text1 }}>{d.content}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // ── renderGitHubPanel (redesigned) ───────────────────────────────

  function renderGitHubPanel() {
    const ghTabs = [
      { id: 'code',     icon: '⬡', label: 'Code' },
      { id: 'commits',  icon: '◎', label: 'Commits' },
      { id: 'branches', icon: '⑂', label: 'Branches' },
      { id: 'prs',      icon: '↗', label: `PRs${prs.length ? ` · ${prs.length}` : ''}` },
      { id: 'actions',  icon: '⚡', label: 'CI' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: DS.surface1, borderLeft: `1px solid ${DS.border1}` }}>

        {/* Repo header */}
        <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${DS.border1}`, background: DS.surface2, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16, filter: 'drop-shadow(0 0 4px rgba(0,229,160,0.4))' }}>🐙</span>
            <span style={{ fontSize: 12, fontFamily: DS.mono, color: DS.text2 }}>
              <span style={{ color: DS.blue }}>user</span>
              <span style={{ color: DS.text1 }}> / </span>
              <span style={{ color: DS.text1, fontWeight: 700 }}>my-project</span>
            </span>
            {git.initialized && (
              <span style={{ marginLeft: 'auto', fontSize: 9, fontFamily: DS.mono, color: DS.green, background: `${DS.green}12`, border: `1px solid ${DS.green}28`, borderRadius: 10, padding: '1px 7px' }}>Public</span>
            )}
          </div>

          {git.initialized && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: DS.surface3, border: `1px solid ${DS.border2}`, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontFamily: DS.mono, cursor: 'default' }}>
                <span style={{ color: DS.text1 }}>⑂</span>
                <span style={{ color: DS.green, fontWeight: 600 }}>{git.HEAD}</span>
                {git.merging && <span style={{ color: DS.orange, fontSize: 9 }}>MERGING</span>}
              </div>
              <span style={{ color: DS.text1, fontSize: 11, fontFamily: DS.mono }}>{git.commits.length} commits</span>
              {pushProgress !== null && (
                <div style={{ flex: 1, minWidth: 60, background: DS.surface3, borderRadius: 3, height: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: `linear-gradient(90deg, ${DS.green}, ${DS.cyan})`, width: `${pushProgress}%`, transition: 'width 0.12s', borderRadius: 3, boxShadow: `0 0 6px ${DS.green}` }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${DS.border1}`, background: DS.surface2, flexShrink: 0, overflow: 'auto' }}>
          {ghTabs.map(t => (
            <button key={t.id} onClick={() => setGhTab(t.id)} className="gv-tab-btn" style={{
              padding: '8px 12px', border: 'none', cursor: 'pointer',
              background: ghTab === t.id ? `${DS.green}08` : 'none',
              borderBottom: ghTab === t.id ? `2px solid ${DS.green}` : '2px solid transparent',
              color: ghTab === t.id ? DS.text1 : DS.text1,
              fontFamily: DS.mono, fontSize: 11, whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 12 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'auto' }}>

          {/* ── CODE ── */}
          {ghTab === 'code' && (
            <div>
              {!git.initialized ? (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <div style={{ fontSize: 44, marginBottom: 14, filter: 'drop-shadow(0 0 12px rgba(0,229,160,0.3))' }}>📦</div>
                  <div style={{ color: DS.text1, fontSize: 13, marginBottom: 20, fontFamily: DS.mono }}>Repository not initialized</div>
                  <Btn variant="primary" onClick={() => runCommand('git init')} style={{ margin: '0 auto', fontSize: 13, padding: '8px 20px' }}>
                    <span>⚡</span> git init
                  </Btn>
                </div>
              ) : (
                <>
                  {Object.keys(folderTree).filter(f => f === (ghBrowsePath || '')).map(folder => {
                    const children = folderTree[folder] || [];
                    const subfolders = Object.keys(folderTree).filter(f2 => {
                      if (!f2) return false;
                      const pp = folder ? folder.split('/') : [];
                      return f2.split('/').length === pp.length + 1 && f2.startsWith(folder ? folder + '/' : '');
                    });
                    const lastC = git.commits.slice(-1)[0];
                    return (
                      <div key={folder}>
                        {ghBrowsePath && (
                          <div onClick={() => setGhBrowsePath(ghBrowsePath.split('/').slice(0, -1).join('/'))} className="gv-gh-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: `1px solid ${DS.border1}`, cursor: 'pointer', fontSize: 12, color: DS.blue, fontFamily: DS.mono }}>
                            <span>←</span> ..
                          </div>
                        )}
                        {subfolders.map(sf => (
                          <div key={sf} onClick={() => setGhBrowsePath(sf)} className="gv-gh-row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: `1px solid ${DS.border1}`, cursor: 'pointer', transition: 'background 0.1s' }}>
                            <span>📁</span>
                            <span style={{ flex: 1, fontSize: 13, color: DS.blue, fontFamily: DS.mono }}>{sf.split('/').pop()}</span>
                            <span style={{ color: DS.text1, fontSize: 11, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: DS.mono }}>{lastC?.msg || ''}</span>
                            <span style={{ color: DS.text1, fontSize: 10, flexShrink: 0, fontFamily: DS.mono }}>{timeAgo(lastC?.date || Date.now())}</span>
                          </div>
                        ))}
                        {children.map(p => {
                          const lc = git.commits.slice().reverse().find(c => c.snapshot?.[p]);
                          return (
                            <div key={p} onClick={() => openFile(p)} className="gv-gh-row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: `1px solid ${DS.border1}`, cursor: 'pointer', transition: 'background 0.1s' }}>
                              <span style={{ color: fileColor(p.split('/').pop()) }}>{fileIcon(p.split('/').pop())}</span>
                              <span style={{ flex: 1, fontSize: 13, color: '#d4e8ff', fontFamily: DS.mono }}>{p.split('/').pop()}</span>
                              <span style={{ color: DS.text1, fontSize: 11, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: DS.mono }}>{lc?.msg || '—'}</span>
                              <span style={{ color: DS.text1, fontSize: 10, flexShrink: 0, fontFamily: DS.mono }}>{lc ? timeAgo(lc.date) : '—'}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                  {fs['README.md'] && (
                    <div style={{ padding: 14, borderTop: `1px solid ${DS.border1}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${DS.border1}` }}>
                        <span>📝</span><span style={{ color: DS.text2, fontSize: 12, fontFamily: DS.mono }}>README.md</span>
                      </div>
                      <pre style={{ color: DS.text2, fontSize: 12, fontFamily: DS.mono, whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{fs['README.md']}</pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── COMMITS ── */}
          {ghTab === 'commits' && (
            <div>
              {!reachableCommits.length ? (
                <div style={{ padding: 24, textAlign: 'center', color: DS.text1, fontSize: 12, fontFamily: DS.mono }}>No commits yet — run git init then commit</div>
              ) : reachableCommits.map((c, i) => {
                const bLabels = Object.entries(git.branches).filter(([, h]) => h === c.hash).map(([b]) => b);
                const tLabels = Object.entries(git.tags || {}).filter(([, h]) => h === c.hash).map(([t]) => t);
                const isSel = selectedCommit?.hash === c.hash;
                return (
                  <div key={c.hash} className="gv-pop-in">
                    <div onClick={() => setSelectedCommit(isSel ? null : c)} className="gv-commit-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px', borderBottom: `1px solid ${DS.border1}`, cursor: 'pointer', background: isSel ? `${DS.green}05` : 'transparent', transition: 'background 0.1s' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
                        <div style={{ width: 11, height: 11, borderRadius: '50%', background: i === 0 ? DS.green : DS.surface4, border: `2px solid ${i === 0 ? DS.green : DS.border3}`, flexShrink: 0, boxShadow: i === 0 ? `0 0 8px ${DS.green}60` : 'none' }} />
                        {i < reachableCommits.length - 1 && <div style={{ width: 1, height: 28, background: DS.border2, marginTop: 3 }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 3 }}>
                          {bLabels.map(b => <Tag key={b} color={b === git.HEAD ? DS.green : DS.blue}>{b === git.HEAD ? `HEAD→${b}` : b}</Tag>)}
                          {tLabels.map(t => <Tag key={t} color={DS.orange}>🏷 {t}</Tag>)}
                        </div>
                        <div style={{ fontSize: 12, color: '#d8eaff', fontFamily: DS.mono, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{c.msg}</div>
                        <div style={{ fontSize: 10, color: DS.text1, display: 'flex', gap: 8, fontFamily: DS.mono }}>
                          <span>{c.author}</span>
                          <span style={{ color: DS.text1 }}>{c.hash.slice(0, 7)}</span>
                          <span>{timeAgo(c.date)}</span>
                        </div>
                      </div>
                    </div>
                    {isSel && <div style={{ borderBottom: `1px solid ${DS.border1}`, background: DS.bg }}>{renderCommitDiff(c)}</div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── BRANCHES ── */}
          {ghTab === 'branches' && (
            <div style={{ padding: 12 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: DS.text1, fontFamily: DS.mono, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>New branch from {git.HEAD}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={newBranchInput} onChange={e => setNewBranchInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && newBranchInput) { runCommand(`git switch -c ${newBranchInput}`); setNewBranchInput(''); } }}
                    placeholder="branch-name"
                    style={{ flex: 1, background: DS.surface3, border: `1px solid ${DS.border2}`, borderRadius: 7, padding: '7px 10px', color: DS.text1, fontFamily: DS.mono, fontSize: 12, outline: 'none', transition: 'border 0.15s' }}
                    onFocus={e => e.target.style.borderColor = `${DS.green}55`}
                    onBlur={e => e.target.style.borderColor = DS.border2}
                  />
                  <Btn variant="primary" onClick={() => { if (newBranchInput) { runCommand(`git switch -c ${newBranchInput}`); setNewBranchInput(''); } }}>Create</Btn>
                </div>
              </div>
              {Object.entries(git.branches).map(([name, hash]) => {
                const isActive = name === git.HEAD;
                const c = hash ? git.commits.find(x => x.hash === hash) : null;
                const isPushed = git.remotes?.origin?.pushed?.[name] === hash;
                return (
                  <div key={name} style={{ padding: '10px 12px', borderRadius: 9, marginBottom: 6, background: isActive ? `${DS.green}06` : DS.surface2, border: `1px solid ${isActive ? `${DS.green}28` : DS.border1}`, transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? DS.green : DS.text1, boxShadow: isActive ? `0 0 6px ${DS.green}` : 'none', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: DS.mono, fontSize: 12, color: isActive ? DS.green : '#c8ddf8', fontWeight: isActive ? 600 : 400 }}>{name}</span>
                          {isActive && <Tag color={DS.green}>current</Tag>}
                          {isPushed && <Tag color={DS.text1}>↑ synced</Tag>}
                        </div>
                        {c && <div style={{ fontSize: 10, color: DS.text1, fontFamily: DS.mono, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.hash.slice(0, 7)} {c.msg}</div>}
                      </div>
                      {!isActive && <Btn variant="dim" onClick={() => runCommand(`git switch ${name}`)} style={{ fontSize: 10, padding: '3px 9px' }}>Switch</Btn>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── PRs ── */}
          {ghTab === 'prs' && (
            <div style={{ padding: 12 }}>
              <Btn variant="primary" onClick={() => setPrDraft({ title: '', body: '', from: git.HEAD, to: 'main' })} style={{ width: '100%', justifyContent: 'center', marginBottom: 12, padding: '8px' }}>
                <span>+</span> New pull request
              </Btn>
              {prDraft && (
                <div className="gv-slide-in" style={{ background: DS.surface2, borderRadius: 10, border: `1px solid ${DS.border2}`, padding: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: DS.text1, fontFamily: DS.mono, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: DS.orange }}>{prDraft.from}</span><span>→</span><span style={{ color: DS.blue }}>{prDraft.to}</span>
                  </div>
                  <input value={prDraft.title} onChange={e => setPrDraft(p => ({ ...p, title: e.target.value }))} placeholder="Pull request title"
                    style={{ width: '100%', background: DS.surface3, border: `1px solid ${DS.border2}`, borderRadius: 7, padding: '8px 10px', color: DS.text1, fontSize: 13, marginBottom: 8, outline: 'none', boxSizing: 'border-box', fontFamily: DS.ui }}
                    onFocus={e => e.target.style.borderColor = `${DS.blue}55`}
                    onBlur={e => e.target.style.borderColor = DS.border2}
                  />
                  <textarea value={prDraft.body} onChange={e => setPrDraft(p => ({ ...p, body: e.target.value }))} placeholder="Describe your changes..."
                    style={{ width: '100%', background: DS.surface3, border: `1px solid ${DS.border2}`, borderRadius: 7, padding: '8px 10px', color: DS.text1, fontSize: 12, height: 70, resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: DS.ui }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <Btn variant="primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                      if (!prDraft.title.trim()) return;
                      setPrs(p => [...p, { ...prDraft, id: Date.now(), status: 'open', date: new Date().toISOString(), number: prs.length + 1 }]);
                      setPrDraft(null);
                      if (onXP) onXP(20, 'Pull Request opened');
                    }}>Create pull request</Btn>
                    <Btn variant="dim" onClick={() => setPrDraft(null)}>Cancel</Btn>
                  </div>
                </div>
              )}
              {!prs.length && !prDraft && (
                <div style={{ textAlign: 'center', padding: 28, color: DS.text1, fontSize: 12, fontFamily: DS.mono }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>↗</div>No pull requests yet
                </div>
              )}
              {prs.map(pr => (
                <div key={pr.id} onClick={() => setActivePR(activePR?.id === pr.id ? null : pr)}
                  style={{ padding: '11px 13px', borderRadius: 10, border: `1px solid ${pr.status === 'merged' ? `${DS.purple}33` : pr.status === 'closed' ? DS.border1 : `${DS.green}25`}`, marginBottom: 8, cursor: 'pointer', background: activePR?.id === pr.id ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 14 }}>{pr.status === 'merged' ? '🟣' : pr.status === 'closed' ? '🔴' : '🟢'}</span>
                    <span style={{ fontSize: 13, color: '#e2f0ff', fontWeight: 600, flex: 1, fontFamily: DS.ui }}>{pr.title}</span>
                    <span style={{ fontSize: 10, color: DS.text1, fontFamily: DS.mono }}>#{pr.number}</span>
                  </div>
                  <div style={{ fontSize: 10, color: DS.text1, fontFamily: DS.mono }}>{pr.from} → {pr.to} · {timeAgo(pr.date)}</div>
                  {activePR?.id === pr.id && pr.status === 'open' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }} onClick={e => e.stopPropagation()}>
                      <Btn variant="primary" style={{ background: `${DS.purple}18`, color: DS.purple, borderColor: `${DS.purple}33` }} onClick={() => { runCommand(`git merge ${pr.from}`); setPrs(p => p.map(x => x.id === pr.id ? { ...x, status: 'merged' } : x)); setActivePR(null); }}>Merge PR</Btn>
                      <Btn variant="dim" onClick={() => setPrs(p => p.map(x => x.id === pr.id ? { ...x, status: 'closed' } : x))}>Close</Btn>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── ACTIONS (CI) ── */}
          {ghTab === 'actions' && (
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 10, color: DS.text1, fontFamily: DS.mono, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Recent Workflow Runs</div>
              {!git.commits.length ? (
                <div style={{ textAlign: 'center', color: DS.text1, fontSize: 12, fontFamily: DS.mono, padding: 20 }}>Push a commit to trigger workflows</div>
              ) : git.commits.slice(-5).reverse().map(c => {
                const pass = Math.random() > 0.25;
                return (
                  <div key={c.hash} style={{ padding: '9px 11px', borderRadius: 8, border: `1px solid ${DS.border1}`, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{pass ? '✅' : '❌'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: DS.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: DS.mono }}>{c.msg}</div>
                      <div style={{ fontSize: 10, color: DS.text1, marginTop: 2, fontFamily: DS.mono }}>CI / {c.hash.slice(0, 7)} · {timeAgo(c.date)}</div>
                    </div>
                    <span style={{ fontSize: 11, color: pass ? DS.green : DS.red, fontWeight: 700, fontFamily: DS.mono }}>{pass ? 'passed' : 'failed'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // ── Terminal line renderer (redesigned) ──────────────────────────

  function renderTermLine(item) {
    const base = { fontFamily: DS.mono, fontSize: 12.5, whiteSpace: 'pre-wrap', lineHeight: 1.55, marginBottom: 3, wordBreak: 'break-word' };
    if (item.type === 'welcome') return <div style={{ ...base, color: DS.green, paddingLeft: 10, borderLeft: `2px solid ${DS.green}50`, marginBottom: 10, opacity: 0.9 }}>{item.text}</div>;
    if (item.type === 'input') return <div style={{ ...base, color: DS.cyan, letterSpacing: 0.2 }}>{item.text}</div>;
    if (item.type === 'error') return <div style={{ ...base, color: DS.red }}>{item.text}</div>;
    if (item.type === 'success') return <div style={{ ...base, color: DS.green }}>{item.text}</div>;
    if (item.type === 'muted') return <div style={{ ...base, color: DS.text1, fontStyle: 'italic' }}>{item.text}</div>;
    if (item.type === 'help') return <div style={{ ...base, color: DS.blue, fontSize: 11, lineHeight: 1.7 }}>{item.text}</div>;
    return (
      <div style={{ ...base, color: '#9db8d8' }}
        dangerouslySetInnerHTML={{
          __html: (item.text || '')
            .replace(/\x1b\[33m(.*?)\x1b\[0m/g, `<span style="color:${DS.yellow}">$1</span>`)
            .replace(/\x1b\[32m(.*?)\x1b\[0m/g, `<span style="color:${DS.green}">$1</span>`)
            .replace(/\x1b\[31m(.*?)\x1b\[0m/g, `<span style="color:${DS.red}">$1</span>`)
            .replace(/\x1b\[90m(.*?)\x1b\[0m/g, `<span style="color:${DS.text1}">$1</span>`)
            .replace(/\x1b\[1m(.*?)\x1b\[0m/g, '<strong>$1</strong>')
            .replace(/\x1b\[0m/g, '')
        }}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // ── Workflow steps ────────────────────────────────────────────────

  const WORKFLOW_STEPS = [
    { id: 0, label: 'git init',   cmd: 'git init',               done: git.initialized },
    { id: 1, label: 'Edit files', cmd: null,                      done: workflowStep >= 1 },
    { id: 2, label: 'git add .',  cmd: 'git add .',               done: workflowStep >= 2 || Object.keys(git.staged).length > 0 },
    { id: 3, label: 'git commit', cmd: 'git commit -m "my changes"', done: workflowStep >= 3 || git.commits.length > 0 },
    { id: 4, label: 'git push',   cmd: 'git push',                done: workflowStep >= 4 },
  ];
  const currentStep = WORKFLOW_STEPS.find(s => !s.done);

  // ─────────────────────────────────────────────────────────────────
  // ── MAIN RENDER ───────────────────────────────────────────────────

  const showGitHub = !isMobile && (!isTablet || activePanel !== 'split');
  const editorWidth = isTablet ? '100%' : showGitHub ? undefined : '100%';

  return (
    <div className="gv-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: DS.bg, overflow: 'hidden', fontFamily: DS.ui, position: 'relative' }}>

      {/* ── Ambient aurora background ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '10%', width: '40%', height: '50%', background: 'radial-gradient(ellipse, rgba(0,229,160,0.03) 0%, transparent 70%)', animation: 'gv-aurora 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '30%', right: '5%', width: '35%', height: '40%', background: 'radial-gradient(ellipse, rgba(0,212,255,0.025) 0%, transparent 70%)', animation: 'gv-aurora 16s ease-in-out infinite reverse' }} />
      </div>

      {/* ── Title bar ── */}
      <div style={{ height: 40, background: `${DS.surface2}ee`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${DS.border1}`, display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0, zIndex: 10, position: 'relative' }}>
        {onBack && (
          <button onClick={onBack} className="gv-nav-btn" style={{ height: '100%', padding: '0 16px', background: 'none', border: 'none', borderRight: `1px solid ${DS.border1}`, color: DS.text1, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s', fontFamily: DS.mono }}>
            <span style={{ fontSize: 14 }}>←</span>
            {!isMobile && 'GitVerse'}
          </button>
        )}

        {/* Logo */}
        <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, filter: `drop-shadow(0 0 6px ${DS.green}80)` }}>💻</span>
          {!isMobile && <span style={{ fontSize: 12, fontFamily: DS.mono, color: DS.text2 }}>
            <span style={{ color: DS.text1 }}>gitverse /</span> <span style={{ color: DS.text1, fontWeight: 600 }}>my-project</span>
          </span>}
          {git.initialized && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: DS.surface3, border: `1px solid ${DS.green}30`, borderRadius: 5, padding: '2px 8px', fontSize: 11, fontFamily: DS.mono }}>
              <span style={{ color: DS.text1 }}>⑂</span>
              <span style={{ color: DS.green }}>{git.HEAD}</span>
              {git.merging && <span style={{ color: DS.orange, fontSize: 9 }}>MERGING</span>}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Panel toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '0 10px' }}>
          {isMobile ? (
            <>
              {/* Mobile: hamburger for explorer + tabs for editor/terminal/github */}
              <button onClick={() => setExplorerOpen(o => !o)} style={{ background: explorerOpen ? `${DS.green}18` : 'none', border: `1px solid ${explorerOpen ? `${DS.green}40` : 'transparent'}`, color: explorerOpen ? DS.green : DS.text1, borderRadius: 6, padding: '5px 9px', fontSize: 16, cursor: 'pointer', transition: 'all 0.15s' }} title="Toggle Explorer">
                ☰
              </button>
              <div style={{ width: 1, height: 18, background: DS.border2, margin: '0 3px' }} />
              {[['editor','📝','Editor'],['terminal','⚡','Term'],['github','🐙','GitHub']].map(([id, icon, label]) => (
                <button key={id} onClick={() => setMobileDrawer(id)}
                  style={{ background: mobileDrawer === id ? `${DS.green}18` : 'none', border: `1px solid ${mobileDrawer === id ? `${DS.green}40` : 'transparent'}`, color: mobileDrawer === id ? DS.green : DS.text1, borderRadius: 6, padding: '5px 9px', fontSize: 15, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {icon}
                </button>
              ))}
            </>
          ) : (
            [['editor','Editor'],['split','Split'],['terminal','Term']].map(([id, label]) => (
              <button key={id} onClick={() => setActivePanel(id)}
                style={{ background: activePanel === id ? `${DS.green}18` : 'none', border: `1px solid ${activePanel === id ? `${DS.green}40` : 'transparent'}`, color: activePanel === id ? DS.green : DS.text1, borderRadius: 6, padding: '4px 11px', fontSize: 11, cursor: 'pointer', fontFamily: DS.mono, transition: 'all 0.15s' }}>
                {label}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Workflow banner ── */}
      {currentStep && (
        <div style={{ background: `${DS.surface2}cc`, backdropFilter: 'blur(8px)', borderBottom: `1px solid ${DS.border1}`, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', flexShrink: 0, zIndex: 9, position: 'relative' }}>
          <span style={{ fontSize: 10, color: DS.text1, flexShrink: 0, fontFamily: DS.mono, textTransform: 'uppercase', letterSpacing: 0.8 }}>Workflow</span>
          <div style={{ width: 1, height: 14, background: DS.border2, flexShrink: 0 }} />
          {WORKFLOW_STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              {i > 0 && <span style={{ color: DS.border3, flexShrink: 0, fontSize: 10 }}>›</span>}
              <button onClick={() => { if (s.cmd) { runCommand(s.cmd); setActivePanel('terminal'); } }}
                className={s.id === currentStep.id ? 'gv-workflow-step-active' : ''}
                style={{ background: s.done ? `${DS.green}10` : s.id === currentStep.id ? `${DS.blue}12` : 'none', border: `1px solid ${s.done ? `${DS.green}30` : s.id === currentStep.id ? `${DS.blue}35` : DS.border1}`, color: s.done ? DS.green : s.id === currentStep.id ? DS.blue : DS.text1, borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: s.cmd ? 'pointer' : 'default', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, fontFamily: DS.mono, transition: 'all 0.15s' }}>
                {s.done ? <span>✓</span> : s.id === currentStep.id ? <div className="gv-wf-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: DS.blue }} /> : null}
                {s.label}
              </button>
            </React.Fragment>
          ))}
          {!isMobile && currentStep.cmd && (
            <span style={{ color: DS.text1, fontSize: 11, fontFamily: DS.mono, flexShrink: 0, marginLeft: 4 }}>← click or type in terminal</span>
          )}
        </div>
      )}

      {/* ── Main content area ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* ── Activity bar ── */}
        {!isMobile && (
          <div style={{ width: 46, background: `${DS.surface2}ee`, backdropFilter: 'blur(8px)', borderRight: `1px solid ${DS.border1}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 2, flexShrink: 0 }}>
            {[
              { icon: '📁', tip: 'Explorer' },
              { icon: '⑂',  tip: 'Source Control', action: () => setGhTab('commits') },
              { icon: '🐙', tip: 'GitHub', action: () => setGhTab('code') },
              { icon: '⚡', tip: 'Terminal', action: () => setActivePanel('terminal') },
            ].map(item => (
              <button key={item.tip} title={item.tip} onClick={item.action} className="gv-nav-btn"
                style={{ width: 34, height: 34, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, borderRadius: 7, transition: 'all 0.15s', color: DS.text2 }}>
                {item.icon}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: git.initialized ? DS.green : DS.red, boxShadow: git.initialized ? `0 0 8px ${DS.green}` : 'none', marginBottom: 4, transition: 'all 0.3s' }} title={git.initialized ? 'Repo initialized' : 'No repo'} />
          </div>
        )}

        {/* ── Mobile explorer overlay ── */}
        {isMobile && explorerOpen && (
          <div onClick={() => setExplorerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, backdropFilter: 'blur(4px)' }} />
        )}

        {/* ── File explorer (desktop: always visible | mobile: slide-in drawer) ── */}
        {(!isMobile || explorerOpen) && (
          <div style={{
            width: isTablet ? 200 : 224,
            background: `${DS.surface1}fa`, backdropFilter: 'blur(12px)',
            borderRight: `1px solid ${DS.border1}`,
            display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
            // Mobile: fixed overlay drawer
            ...(isMobile ? {
              position: 'fixed', left: 0, top: 40, bottom: 0,
              width: '72vw', maxWidth: 280, zIndex: 51,
              borderRight: `1px solid ${DS.border2}`,
              boxShadow: `4px 0 32px rgba(0,0,0,0.8), 0 0 0 1px ${DS.border2}`,
              animation: 'gv-slide-in 0.2s ease',
            } : {}),
          }}>
            {/* Explorer header */}
            <div style={{ padding: '8px 12px 5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: `1px solid ${DS.border1}` }}>
              <span style={{ fontSize: 10, color: DS.text1, textTransform: 'uppercase', letterSpacing: 1, fontFamily: DS.mono }}>Explorer</span>
              <div style={{ display: 'flex', gap: 2 }}>
                <Btn onClick={() => setNewItemDraft({ type: 'file', parent: '' })} title="New file" style={{ padding: '2px 6px', fontSize: 14, color: DS.text1 }}>+</Btn>
                <Btn onClick={() => setNewItemDraft({ type: 'folder', parent: '' })} title="New folder" style={{ padding: '2px 6px', fontSize: 12 }}>📁</Btn>
              </div>
            </div>
            <div style={{ padding: '4px 8px 3px', fontSize: 10, color: DS.text1, fontFamily: DS.mono, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 12 }}>📂</span> my-project
            </div>

            {/* File tree */}
            <div style={{ flex: 1, overflow: 'auto', paddingBottom: 8 }}>
              {renderTree('')}
            </div>

            {/* Status footer */}
            {git.initialized && (
              <div style={{ padding: '5px 12px', borderTop: `1px solid ${DS.border1}`, background: DS.surface2, display: 'flex', gap: 10, fontSize: 10, fontFamily: DS.mono, flexShrink: 0 }}>
                {allPaths.filter(p => !git.files[p]?.tracked && !isIgnored(p)).length > 0 && <span style={{ color: DS.blue }}>{allPaths.filter(p => !git.files[p]?.tracked && !isIgnored(p)).length}U</span>}
                {allPaths.filter(p => git.files[p]?.tracked && git.files[p].content !== fs[p]).length > 0 && <span style={{ color: DS.orange }}>{allPaths.filter(p => git.files[p]?.tracked && git.files[p].content !== fs[p]).length}M</span>}
                {Object.keys(git.staged).length > 0 && <span style={{ color: DS.green }}>{Object.keys(git.staged).length}S</span>}
                {git.stash?.length > 0 && <span style={{ color: DS.yellow }}>{git.stash.length} stash</span>}
              </div>
            )}
          </div>
        )}

        {/* ── Center: Editor + Terminal ── */}
        {(!isMobile || mobileDrawer === 'editor' || mobileDrawer === 'terminal') && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

            {/* Tab bar */}
            {(activePanel === 'editor' || activePanel === 'split' || (isMobile && mobileDrawer === 'editor')) && (
              <div style={{ height: 36, background: `${DS.surface2}f0`, borderBottom: `1px solid ${DS.border1}`, display: 'flex', alignItems: 'stretch', overflow: 'hidden', flexShrink: 0 }}>
                {openTabs.map(path => {
                  const name = path.split('/').pop();
                  const status = statusOf(path);
                  const isActive = activeTab === path;
                  return (
                    <div key={path} onClick={() => { setActiveTab(path); setActivePanel(p => p === 'terminal' ? 'split' : p); }}
                      className="gv-tab-btn"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', cursor: 'pointer', minWidth: 0, maxWidth: 160, flexShrink: 0, borderRight: `1px solid ${DS.border1}`, fontSize: 12, fontFamily: DS.mono, color: isActive ? DS.text1 : DS.text1, background: isActive ? `${DS.surface3}` : 'transparent', borderBottom: isActive ? `2px solid ${DS.green}` : `2px solid transparent`, borderTop: isActive ? `1px solid ${DS.border2}` : '1px solid transparent', transition: 'all 0.12s' }}>
                      <span style={{ fontSize: 12, color: fileColor(name), flexShrink: 0 }}>{fileIcon(name)}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      {status === 'modified' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: DS.orange, flexShrink: 0 }} />}
                      {status === 'staged' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: DS.green, flexShrink: 0 }} />}
                      <span onClick={e => closeTab(path, e)} style={{ color: DS.text1, marginLeft: 2, fontSize: 16, lineHeight: 1, flexShrink: 0, borderRadius: 3, padding: '0 2px', transition: 'color 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.color = DS.text1}
                        onMouseLeave={e => e.currentTarget.style.color = DS.text1}>×</span>
                    </div>
                  );
                })}
                {!openTabs.length && <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', color: DS.text1, fontSize: 12, fontFamily: DS.mono }}>Open a file to start editing</div>}
              </div>
            )}

            {/* Editor / Terminal split */}
            <div style={{ flex: 1, display: 'flex', flexDirection: activePanel === 'split' ? 'row' : 'column', overflow: 'hidden' }}>

              {/* Editor */}
              {(activePanel === 'editor' || activePanel === 'split' || (isMobile && mobileDrawer === 'editor')) && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: activePanel === 'split' ? `1px solid ${DS.border1}` : 'none' }}>
                  {activeTab && fs[activeTab] !== undefined ? (
                    <>
                      {/* Editor toolbar */}
                      <div style={{ padding: '3px 12px', borderBottom: `1px solid ${DS.border1}`, background: DS.surface2, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: fileColor(activeTab) }}>{fileIcon(activeTab)}</span>
                        <span style={{ fontSize: 11, color: DS.text1, fontFamily: DS.mono }}>{activeTab}</span>
                        <div style={{ flex: 1 }} />
                        {statusOf(activeTab) === 'modified' && (
                          <Btn variant="primary" onClick={() => runCommand(`git add ${activeTab}`)} style={{ fontSize: 10, padding: '2px 9px', gap: 4 }}>
                            <span>+</span> Stage
                          </Btn>
                        )}
                        {statusOf(activeTab) === 'staged' && (
                          <Btn onClick={() => runCommand(`git restore --staged ${activeTab}`)} style={{ fontSize: 10, padding: '2px 9px', color: DS.orange, background: `${DS.orange}10`, border: `1px solid ${DS.orange}28`, borderRadius: 6 }}>
                            Unstage
                          </Btn>
                        )}
                        <span style={{ fontSize: 10, color: DS.text1, fontFamily: DS.mono, textTransform: 'uppercase', letterSpacing: 0.5 }}>{fileType(activeTab)}</span>
                      </div>
                      <SyntaxHighlightedEditor
                        value={fs[activeTab]}
                        onChange={val => saveFile(activeTab, val)}
                        fileType={fileType(activeTab)}
                        onKeyDown={e => {
                          if (e.key === 'Tab') {
                            e.preventDefault();
                            const ta = e.target, s = ta.selectionStart, en = ta.selectionEnd;
                            const val = ta.value.substring(0, s) + '  ' + ta.value.substring(en);
                            saveFile(activeTab, val);
                            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
                          }
                        }}
                      />
                    </>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, background: DS.surface1 }}>
                      <div style={{ fontSize: 52, filter: `drop-shadow(0 0 16px ${DS.green}30)` }}>📝</div>
                      <div style={{ fontSize: 14, color: DS.text1, fontFamily: DS.mono }}>Select a file to edit</div>
                      <div style={{ fontSize: 12, color: DS.text1, fontFamily: DS.mono }}>or right-click in explorer</div>
                    </div>
                  )}
                </div>
              )}

              {/* Terminal */}
              {(activePanel === 'terminal' || activePanel === 'split' || (isMobile && mobileDrawer === 'terminal')) && (
                <div style={{ flex: activePanel === 'split' ? '0 0 390px' : 1, display: 'flex', flexDirection: 'column', background: DS.bg, overflow: 'hidden', borderTop: activePanel !== 'split' ? `1px solid ${DS.border1}` : 'none' }}>

                  {/* Terminal header */}
                  <div style={{ padding: '5px 14px', borderBottom: `1px solid ${DS.border1}`, background: `${DS.surface2}cc`, backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ color: DS.green, fontSize: 13, filter: `drop-shadow(0 0 4px ${DS.green}60)` }}>⚡</span>
                    <span style={{ fontSize: 11, color: DS.text1, fontFamily: DS.mono, textTransform: 'uppercase', letterSpacing: 1 }}>Terminal</span>
                    {git.initialized && <Tag color={DS.green}>{git.HEAD}</Tag>}
                    {git.merging && <Tag color={DS.orange}>MERGING</Tag>}
                    <div style={{ flex: 1 }} />
                    <Btn onClick={clearLines} style={{ fontSize: 10, color: DS.text1, padding: '2px 7px' }}>clear</Btn>
                  </div>

                  {/* Terminal body */}
                  <div ref={termBodyRef} style={{ flex: 1, overflow: 'auto', padding: '10px 16px 4px' }}>
                    {termLines.map((l, i) => <div key={l.id || i} className="gv-slide-in">{renderTermLine(l)}</div>)}

                    {/* Inline commit editor */}
                    {showCommitBox && (
                      <div className="gv-slide-in" style={{ margin: '10px 0', background: DS.surface2, border: `1px solid ${DS.border2}`, borderRadius: 9, padding: 14 }}>
                        <div style={{ fontSize: 11, color: DS.text1, marginBottom: 7, fontFamily: DS.mono }}>Commit message:</div>
                        <textarea autoFocus value={commitMsgDraft} onChange={e => setCommitMsgDraft(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (commitMsgDraft.trim()) { runCommand(`git commit -m "${commitMsgDraft.trim()}"`); setCommitMsgDraft(''); setShowCommitBox(false); }
                            }
                            if (e.key === 'Escape') { setShowCommitBox(false); setCommitMsgDraft(''); }
                          }}
                          placeholder="Short imperative summary..."
                          style={{ width: '100%', background: DS.surface3, border: `1px solid ${DS.border2}`, borderRadius: 6, padding: '8px 10px', color: DS.text1, fontSize: 12, resize: 'none', height: 58, outline: 'none', fontFamily: DS.mono, boxSizing: 'border-box' }}
                          onFocus={e => e.target.style.borderColor = `${DS.green}55`}
                          onBlur={e => e.target.style.borderColor = DS.border2}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
                          <Btn variant="primary" onClick={() => { if (commitMsgDraft.trim()) { runCommand(`git commit -m "${commitMsgDraft.trim()}"`); setCommitMsgDraft(''); setShowCommitBox(false); } }}>Commit ↵</Btn>
                          <Btn variant="dim" onClick={() => { setShowCommitBox(false); setCommitMsgDraft(''); }}>Cancel Esc</Btn>
                        </div>
                      </div>
                    )}

                    {/* Blinking cursor line */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, fontFamily: DS.mono }}>
                      <span style={{ color: DS.green, fontSize: 12 }}>{git.initialized ? `(${git.HEAD}) $` : ' $'}</span>
                      <div style={{ width: 7, height: 14, background: DS.green, display: 'inline-block', animation: 'gv-blink 1.1s step-end infinite', borderRadius: 1, opacity: 0.7 }} />
                    </div>
                  </div>

                  {/* Terminal input */}
                  <div style={{ padding: '7px 14px', borderTop: `1px solid ${DS.border1}`, background: `${DS.surface2}bb`, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, backdropFilter: 'blur(8px)' }}>
                    <span style={{ color: DS.green, fontSize: 13, flexShrink: 0, fontFamily: DS.mono }}>
                      {git.initialized ? `(${git.HEAD}) $` : '$'}
                    </span>
                    <input
                      ref={termInputRef}
                      value={termInput}
                      onChange={e => setTermInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { runCommand(termInput); setTermInput(''); }
                        else if (e.key === 'ArrowUp') { e.preventDefault(); setHistIdx(i => { const n = Math.min(i + 1, termHistory.length - 1); setTermInput(termHistory[n] || ''); return n; }); }
                        else if (e.key === 'ArrowDown') { e.preventDefault(); setHistIdx(i => { const n = Math.max(i - 1, -1); setTermInput(n === -1 ? '' : termHistory[n] || ''); return n; }); }
                      }}
                      placeholder="type a command (try: git init)"
                      autoFocus
                      className="gv-term-input"
                      style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: DS.text1, fontFamily: DS.mono, fontSize: 13 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── GitHub panel ── */}
        {!isMobile && (
          <div style={{ width: isTablet ? 280 : 330, flexShrink: 0, overflow: 'hidden' }}>
            {renderGitHubPanel()}
          </div>
        )}

        {/* ── Mobile GitHub drawer ── */}
        {isMobile && mobileDrawer === 'github' && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {renderGitHubPanel()}
          </div>
        )}
      </div>

      {/* ── Status bar ── */}
      <div style={{ height: 24, background: `linear-gradient(90deg, ${DS.green}22, ${DS.cyan}15, transparent)`, borderTop: `1px solid ${DS.green}20`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', fontSize: 11, color: DS.text2, flexShrink: 0, fontFamily: DS.mono, position: 'relative', zIndex: 10 }}>
        <span style={{ color: DS.green, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: DS.green, display: 'inline-block', boxShadow: `0 0 5px ${DS.green}` }} />
          {git.initialized ? git.HEAD : 'no repo'}
        </span>
        {git.merging && <span style={{ color: DS.orange }}>⚠ MERGING</span>}
        {Object.keys(git.staged).length > 0 && <span style={{ color: DS.green }}>↑ {Object.keys(git.staged).length} staged</span>}
        <div style={{ flex: 1 }} />
        {activeTab && <span style={{ color: DS.text1 }}>{activeTab}</span>}
        {activeTab && <span style={{ color: DS.text1, textTransform: 'uppercase', letterSpacing: 0.5 }}>{fileType(activeTab)}</span>}
        <span style={{ color: DS.text1 }}>GitVerse IDE v3</span>
      </div>

      {/* ── Context menu ── */}
      {contextMenu && (
        <>
          <div onClick={() => setContextMenu(null)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
          <div className="gv-pop-in" style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, background: `${DS.surface3}f8`, backdropFilter: 'blur(16px)', border: `1px solid ${DS.border2}`, borderRadius: 10, boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px ${DS.border1}`, zIndex: 1000, overflow: 'hidden', minWidth: 176 }}>
            {(contextMenu.type === 'file' ? [
              { icon: '📝', label: 'Open', action: () => { openFile(contextMenu.path); setContextMenu(null); } },
              { icon: '✏️', label: 'Rename', action: () => { setRenaming(contextMenu.path); setContextMenu(null); } },
              { icon: '➕', label: 'Stage', action: () => { runCommand(`git add ${contextMenu.path}`); setContextMenu(null); } },
              { icon: '↩️', label: 'Restore', action: () => { runCommand(`git restore ${contextMenu.path}`); setContextMenu(null); } },
              { icon: '👁', label: 'Blame', action: () => { runCommand(`git blame ${contextMenu.path}`); setActivePanel('terminal'); setContextMenu(null); } },
              { icon: '🗑', label: 'Delete', action: () => { deleteFilePath(contextMenu.path); setContextMenu(null); }, danger: true },
            ] : [
              { icon: '📄', label: 'New file here', action: () => { setNewItemDraft({ type: 'file', parent: contextMenu.path }); setExpandedFolders(e => ({ ...e, [contextMenu.path]: true })); setContextMenu(null); } },
              { icon: '📁', label: 'New folder here', action: () => { setNewItemDraft({ type: 'folder', parent: contextMenu.path }); setContextMenu(null); } },
            ]).map(item => (
              <div key={item.label} onClick={item.action} className="gv-ctx-item" style={{ padding: '9px 16px', fontSize: 13, color: item.danger ? DS.red : DS.text1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontFamily: DS.ui, transition: 'background 0.1s', borderBottom: `1px solid ${DS.border1}` }}>
                <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span> {item.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Help text ─────────────────────────────────────────────────────
const HELP_TEXT = `
╔══════════════════════════════════════════════════════╗
║         GITVERSE IDE v3 — COMMAND REFERENCE           ║
╠══════════════════════════════════════════════════════╣
║  SHELL                                                ║
║  ls          List files    touch file.txt  New file   ║
║  cat README.md   Show file  mkdir folder  New folder  ║
║  echo "x">f  Write to file  rm file.txt   Delete      ║
║  mv old.js new.js  Rename   clear         Clear screen║
╠══════════════════════════════════════════════════════╣
║  GIT SETUP                                            ║
║  git init             Initialize repository           ║
║  git config user.name "Name"                         ║
║  git config user.email "e@mail.com"                  ║
╠══════════════════════════════════════════════════════╣
║  CORE WORKFLOW                                        ║
║  git status                  Show changes            ║
║  git add README.md           Stage one file          ║
║  git add src/App.js          Stage a nested file     ║
║  git add .                   Stage everything        ║
║  git commit -m "feat: login" Commit with message     ║
║  git commit                  Opens inline editor     ║
║  git log --oneline --graph   Visual commit graph     ║
║  git diff                    Unstaged changes        ║
║  git diff --staged           Staged changes          ║
║  git show a1b2c3d            Show commit + diff      ║
╠══════════════════════════════════════════════════════╣
║  BRANCHES                                             ║
║  git branch                  List branches           ║
║  git branch feature          Create branch           ║
║  git branch -d feature       Delete branch           ║
║  git switch feature          Switch branch           ║
║  git switch -c feature       Create & switch         ║
╠══════════════════════════════════════════════════════╣
║  UNDOING                                              ║
║  git restore README.md       Discard file changes    ║
║  git restore --staged README.md  Unstage file        ║
║  git reset HEAD~1            Undo last commit        ║
║  git reset --hard HEAD~1     Undo + discard files    ║
║  git revert a1b2c3d          Safe undo (new commit)  ║
║  git stash / git stash pop   Save & restore WIP      ║
╠══════════════════════════════════════════════════════╣
║  REMOTE                                               ║
║  git remote add origin URL   Add remote              ║
║  git push                    Push to origin          ║
║  git pull                    Pull from origin        ║
╠══════════════════════════════════════════════════════╣
║  INVESTIGATION                                        ║
║  git blame README.md         Who wrote each line     ║
║  git log --oneline           Compact history         ║
║  git reflog                  All HEAD moves          ║
╚══════════════════════════════════════════════════════╝
`;