import React, { useState, useMemo } from 'react';

const DEFAULT_FILES = [
  'index.html','src/App.jsx','src/main.jsx','src/styles.css',
  'src/utils/helper.js','src/utils/api.js',
  'node_modules/react/index.js','node_modules/lodash/lodash.js',
  '.env','.env.local','.env.production',
  'dist/bundle.js','dist/index.html',
  'build/static/main.js',
  'README.md','package.json','package-lock.json',
  '.DS_Store','Thumbs.db',
  'coverage/lcov.info','coverage/report.html',
  'logs/error.log','logs/debug.log',
  'src/secret.key','config/database.yml',
  'test/unit/app.test.js','test/e2e/main.spec.js',
  'public/images/hero.png','public/favicon.ico',
  'tmp/cache.tmp','tmp/session.dat',
];

const PRESETS = [
  {
    label:'Node / React', icon:'⚛️',
    patterns:`# Dependencies
node_modules/

# Build output
dist/
build/

# Environment files
.env
.env.local
.env.*.local

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Test coverage
coverage/`,
  },
  {
    label:'Secrets only', icon:'🔒',
    patterns:`.env
.env.*
*.key
*.pem
config/database.yml`,
  },
  {
    label:'Temp files', icon:'🗑️',
    patterns:`tmp/
*.tmp
*.cache
.DS_Store
Thumbs.db`,
  },
];

/* Simple glob matcher — handles *, **, dir/ patterns */
function matches(filePath, rawPattern) {
  const p = rawPattern.trim();
  if (!p || p.startsWith('#')) return false;
  const pat = p.startsWith('!') ? p.slice(1) : p;

  let re = pat
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')  // escape regex special chars (not * ?)
    .replace(/\\\*/g, '*')                   // un-escape * back for processing
    .replace(/\\\?/g, '?')                   // un-escape ?
    .replace(/\*\*/g, '\x00')               // placeholder for **
    .replace(/\*/g, '[^/]*')                // * = anything except slash
    .replace(/\?/g, '[^/]')                 // ? = single char except slash
    .replace(/\x00/g, '.*');                // ** = anything including slash

  // dir/ pattern: match directory prefix
  if (pat.endsWith('/')) {
    try { return new RegExp(`^${re}|^${re.slice(0,-1)}/`,'i').test(filePath + '/'); } catch { return false; }
  }
  // no slash in pattern → match basename anywhere in path
  if (!pat.includes('/')) {
    const base = filePath.split('/').pop();
    try {
      const r = new RegExp(`^${re}$`, 'i');
      if (r.test(base)) return true;
      const r2 = new RegExp(`(^|/)${re}(/|$)`, 'i');
      return r2.test(filePath);
    } catch { return false; }
  }
  try { return new RegExp(`^${re}$`, 'i').test(filePath); } catch { return false; }
}

function computeIgnored(files, patternText) {
  const lines = patternText.split('\n');
  const ignored = new Set();
  for (const file of files) {
    let isIgnored = false;
    for (const line of lines) {
      const l = line.trim();
      if (!l || l.startsWith('#')) continue;
      if (l.startsWith('!')) { if (matches(file, l.slice(1))) isIgnored = false; }
      else if (matches(file, l)) isIgnored = true;
    }
    if (isIgnored) ignored.add(file);
  }
  return ignored;
}

export default function GitignorePlayground({ color }) {
  const [patterns, setPatterns]   = useState(PRESETS[0].patterns);
  const [files, setFiles]         = useState(DEFAULT_FILES);
  const [newFile, setNewFile]     = useState('');
  const [preset, setPreset]       = useState(0);
  const [showIgnored, setShowIgnored] = useState(true);
  const [showTracked, setShowTracked] = useState(true);

  const ignored = useMemo(() => computeIgnored(files, patterns), [files, patterns]);
  const ignoredCount = ignored.size;
  const trackedCount = files.length - ignoredCount;
  const pct = files.length > 0 ? Math.round((ignoredCount / files.length) * 100) : 0;

  const patternLines = patterns.split('\n');
  const activeRules  = patternLines.filter(l => l.trim() && !l.trim().startsWith('#')).length;

  function loadPreset(i) { setPreset(i); setPatterns(PRESETS[i].patterns); }
  function addFile() {
    const f = newFile.trim();
    if (!f || files.includes(f)) return;
    setFiles(p => [...p, f]);
    setNewFile('');
  }

  return (
    <div style={{ animation:'fadeInUp 0.3s ease' }}>
      <div style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>🧹 .gitignore Playground</h3>
        <p style={{ color:'var(--text-muted)', fontSize:14, lineHeight:1.6 }}>Write patterns and watch files get ignored in real time. 🟢 = tracked  🔴 = ignored.</p>
      </div>

      {/* Preset buttons */}
      <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:14 }}>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => loadPreset(i)} style={{ background: preset===i?color+'20':'var(--bg-card)', color: preset===i?color:'var(--text-muted)', border:`1px solid ${preset===i?color+'50':'var(--border)'}`, borderRadius:20, padding:'5px 13px', fontFamily:'var(--font-mono)', fontSize:11, cursor:'pointer', transition:'all 0.15s' }}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {/* Left: editor */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
            <Label>.gitignore</Label>
            <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10 }}>{activeRules} rules</span>
          </div>

          {/* Terminal-style editor */}
          <div style={{ background:'#050810', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
            <div style={{ background:'var(--bg-card)', padding:'7px 13px', borderBottom:'1px solid var(--border)', display:'flex', gap:6, alignItems:'center' }}>
              {['#ff5f56','#ffbd2e','#27c93f'].map(c=><div key={c} style={{width:9,height:9,borderRadius:'50%',background:c}}/>)}
              <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, marginLeft:6 }}>.gitignore</span>
            </div>
            <div style={{ display:'flex', height:300 }}>
              {/* Line numbers */}
              <div style={{ padding:'13px 0', background:'rgba(255,255,255,0.02)', borderRight:'1px solid var(--border)', minWidth:34, textAlign:'right', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', lineHeight:'1.6', userSelect:'none', overflowY:'hidden' }}>
                {patternLines.map((_,i) => <div key={i} style={{ padding:'0 7px' }}>{i+1}</div>)}
              </div>
              <textarea
                value={patterns}
                onChange={e => setPatterns(e.target.value)}
                spellCheck={false}
                style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:12, lineHeight:1.6, padding:'13px 11px', resize:'none', height:'100%', boxSizing:'border-box', caretColor:'var(--green)' }}
              />
            </div>
          </div>

          {/* Pattern syntax ref */}
          <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'11px 14px', marginTop:10 }}>
            <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Pattern Syntax</div>
            {[
              ['*.log',        'All .log files anywhere in the repo'],
              ['node_modules/','Entire directory and its contents'],
              ['.env',         'A specific file by name'],
              ['**/*.test.js', 'All .test.js files in any subdirectory'],
              ['!important.log','Un-ignore this specific file (negation)'],
            ].map(([pat, desc]) => (
              <div key={pat} style={{ display:'flex', gap:10, marginBottom:5, alignItems:'baseline' }}>
                <code style={{ color, fontFamily:'var(--font-mono)', fontSize:11, flexShrink:0, minWidth:120 }}>{pat}</code>
                <span style={{ color:'var(--text-muted)', fontSize:12 }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: file tree */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
            <Label>File Tree</Label>
            <div style={{ display:'flex', gap:10 }}>
              <span style={{ color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:10 }}>{trackedCount} tracked</span>
              <span style={{ color:'var(--red)', fontFamily:'var(--font-mono)', fontSize:10 }}>{ignoredCount} ignored</span>
            </div>
          </div>

          {/* Filter toggles */}
          <div style={{ display:'flex', gap:6, marginBottom:8 }}>
            {[
              { label:'🟢 tracked', active:showTracked, toggle:() => setShowTracked(v=>!v), onColor:'rgba(0,255,136,0.1)', activeColor:'var(--green)', activeBorder:'rgba(0,255,136,0.3)' },
              { label:'🔴 ignored', active:showIgnored, toggle:() => setShowIgnored(v=>!v), onColor:'rgba(255,107,107,0.1)', activeColor:'var(--red)', activeBorder:'rgba(255,107,107,0.3)' },
            ].map(btn => (
              <button key={btn.label} onClick={btn.toggle} style={{ background:btn.active?btn.onColor:'var(--bg-card)', color:btn.active?btn.activeColor:'var(--text-muted)', border:`1px solid ${btn.active?btn.activeBorder:'var(--border)'}`, borderRadius:20, padding:'4px 11px', fontFamily:'var(--font-mono)', fontSize:10, cursor:'pointer', transition:'all 0.15s' }}>{btn.label}</button>
            ))}
          </div>

          <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', height:300, overflowY:'auto', padding:10 }}>
            {files
              .filter(f => ignored.has(f) ? showIgnored : showTracked)
              .map(file => {
                const isIgnored = ignored.has(file);
                return (
                  <div key={file} style={{ display:'flex', alignItems:'center', gap:7, padding:'4px 7px', borderRadius:5, marginBottom:2, background: isIgnored?'rgba(255,107,107,0.04)':'transparent', transition:'background 0.2s' }}>
                    <span style={{ fontSize:11, flexShrink:0 }}>{isIgnored?'🚫':'📄'}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color: isIgnored?'var(--red)':'var(--green)', textDecoration: isIgnored?'line-through':'none', opacity: isIgnored?0.6:1, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file}</span>
                    <button onClick={() => setFiles(p => p.filter(f => f !== file))} style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:12, flexShrink:0, padding:'0 2px', opacity:0, transition:'opacity 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0'}>×</button>
                  </div>
                );
              })}
          </div>

          {/* Add file */}
          <div style={{ display:'flex', gap:7, marginTop:8 }}>
            <input value={newFile} onChange={e=>setNewFile(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addFile()} placeholder="Add a file path, e.g. src/secret.key"
              style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-md)', padding:'7px 11px', color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontSize:11, outline:'none' }} />
            <button onClick={addFile} style={{ background:color, color:'#000', border:'none', borderRadius:'var(--radius-md)', padding:'7px 14px', fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, cursor:'pointer' }}>+ Add</button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ marginTop:14, background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'10px 16px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
        <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:3, overflow:'hidden', minWidth:80 }}>
          <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,var(--red),rgba(255,107,107,0.5))`, borderRadius:3, transition:'width 0.3s ease' }} />
        </div>
        <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:11, flexShrink:0 }}>{pct}% of files ignored</span>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1 }}>{children}</div>;
}
