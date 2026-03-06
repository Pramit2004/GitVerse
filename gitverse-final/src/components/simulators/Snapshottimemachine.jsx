import React, { useState } from 'react';

/* ═══════════════════════════════════════════════════════
   SNAPSHOT TIME MACHINE
   Shows commits as Polaroid photos you can scrub through.
   Click any photo → file contents update to that moment.
   Makes "git is just snapshots" physically tangible.
═══════════════════════════════════════════════════════ */

const SNAPSHOTS = [
  {
    hash: 'a1b2c3d', label: 'Initial commit', emoji: '🌱', date: '3 days ago',
    author: 'You', branch: 'main',
    files: {
      'index.html': `<!DOCTYPE html>
<html>
  <head><title>My App</title></head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>`,
      'style.css': `body {
  font-family: sans-serif;
  background: white;
}`,
    },
  },
  {
    hash: 'b7c8d9e', label: 'Add dark mode', emoji: '🌙', date: '2 days ago',
    author: 'You', branch: 'main',
    files: {
      'index.html': `<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body class="dark">
    <h1>Hello World</h1>
    <button id="toggle">Toggle theme</button>
  </body>
</html>`,
      'style.css': `body {
  font-family: sans-serif;
  background: white;
  color: black;
}
body.dark {
  background: #1a1a2e;
  color: #e8edf8;
}`,
      'app.js': `const btn = document.getElementById('toggle');
btn.onclick = () => {
  document.body.classList.toggle('dark');
};`,
    },
  },
  {
    hash: 'c3d4e5f', label: 'Add user login', emoji: '🔐', date: '1 day ago',
    author: 'Alice', branch: 'feature/auth',
    files: {
      'index.html': `<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body class="dark">
    <h1>Hello World</h1>
    <button id="toggle">Toggle theme</button>
    <form id="login">
      <input type="text" placeholder="Username">
      <input type="password" placeholder="Password">
      <button type="submit">Login</button>
    </form>
  </body>
</html>`,
      'style.css': `body {
  font-family: sans-serif;
  background: white;
  color: black;
}
body.dark {
  background: #1a1a2e;
  color: #e8edf8;
}
form { margin-top: 20px; }
input { display: block; margin: 8px 0; }`,
      'app.js': `const btn = document.getElementById('toggle');
btn.onclick = () => {
  document.body.classList.toggle('dark');
};

const form = document.getElementById('login');
form.onsubmit = (e) => {
  e.preventDefault();
  alert('Login submitted!');
};`,
      'auth.js': `// Authentication module
export function validateUser(username, password) {
  return username.length > 0 && password.length >= 8;
}`,
    },
  },
  {
    hash: 'd9e0f1a', label: 'Fix login bug', emoji: '🐛', date: '8 hours ago',
    author: 'You', branch: 'main',
    files: {
      'index.html': `<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body class="dark">
    <h1>My App ✓</h1>
    <button id="toggle">Toggle theme</button>
    <form id="login">
      <input type="text" placeholder="Username" required>
      <input type="password" placeholder="Password (min 8)" required>
      <button type="submit">Login</button>
      <p id="error" hidden>Invalid credentials</p>
    </form>
  </body>
</html>`,
      'style.css': `body {
  font-family: sans-serif;
  background: white;
  color: black;
  transition: all 0.3s;
}
body.dark {
  background: #1a1a2e;
  color: #e8edf8;
}
form { margin-top: 20px; }
input { display: block; margin: 8px 0; padding: 6px; }
#error { color: red; }`,
      'app.js': `const btn = document.getElementById('toggle');
btn.onclick = () => {
  document.body.classList.toggle('dark');
};

const form = document.getElementById('login');
const errEl = document.getElementById('error');
form.onsubmit = (e) => {
  e.preventDefault();
  const [user, pass] = form.querySelectorAll('input');
  if (validateUser(user.value, pass.value)) {
    alert('Welcome, ' + user.value + '!');
    errEl.hidden = true;
  } else {
    errEl.hidden = false;  // Bug fix: was missing this
  }
};`,
      'auth.js': `// Authentication module (fixed)
export function validateUser(username, password) {
  if (!username || !password) return false;
  return username.length >= 3 && password.length >= 8;
}`,
    },
  },
];

// Diff two file contents — return lines with +/- annotations
function diffLines(oldText, newText) {
  if (!oldText) return (newText || '').split('\n').map(l => ({ text: l, type: 'add' }));
  const oldLines = (oldText || '').split('\n');
  const newLines = (newText || '').split('\n');
  const result = [];
  const max = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < max; i++) {
    if (i >= oldLines.length) result.push({ text: newLines[i], type: 'add' });
    else if (i >= newLines.length) result.push({ text: oldLines[i], type: 'remove' });
    else if (oldLines[i] !== newLines[i]) {
      result.push({ text: oldLines[i], type: 'remove' });
      result.push({ text: newLines[i], type: 'add' });
    } else {
      result.push({ text: newLines[i], type: 'same' });
    }
  }
  return result;
}

export default function SnapshotTimeMachine({ color = '#51CF66' }) {
  const [activeIdx, setActiveIdx] = useState(SNAPSHOTS.length - 1);
  const [viewFile,  setViewFile]  = useState('index.html');
  const [showDiff,  setShowDiff]  = useState(false);

  const snap = SNAPSHOTS[activeIdx];
  const prevSnap = activeIdx > 0 ? SNAPSHOTS[activeIdx - 1] : null;
  const fileContent = snap.files[viewFile] || '(file did not exist yet)';
  const prevFileContent = prevSnap?.files[viewFile];

  const allFiles = [...new Set(SNAPSHOTS.flatMap(s => Object.keys(s.files)))];
  const diffResult = showDiff ? diffLines(prevFileContent, fileContent) : null;

  const lineTypeStyle = (type) => ({
    background: type==='add' ? 'rgba(0,255,136,0.08)' : type==='remove' ? 'rgba(255,107,107,0.08)' : 'transparent',
    color: type==='add' ? 'var(--green)' : type==='remove' ? 'var(--red)' : 'var(--text-secondary)',
    paddingLeft: 8,
    borderLeft: `2px solid ${type==='add' ? 'var(--green)' : type==='remove' ? 'var(--red)' : 'transparent'}`,
  });

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
          📸 Snapshot Time Machine
        </h3>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>
          Git saves a <em style={{color:'var(--text-secondary)'}}>complete snapshot</em> of your project at every commit. Click any Polaroid to travel back in time and see what your code looked like.
        </p>
      </div>

      {/* Timeline slider */}
      <div style={{ marginBottom:20 }}>
        <input
          type="range" min={0} max={SNAPSHOTS.length-1} value={activeIdx}
          onChange={e => { setActiveIdx(+e.target.value); setShowDiff(false); }}
          style={{ width:'100%', accentColor:color, cursor:'pointer', marginBottom:4 }}
        />
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10 }}>oldest</span>
          <span style={{ color:color, fontFamily:'var(--font-mono)', fontSize:11 }}>← drag to travel through time →</span>
          <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10 }}>newest</span>
        </div>
      </div>

      {/* Polaroid strip */}
      <div style={{ display:'flex', gap:10, marginBottom:20, overflowX:'auto', padding:'8px 4px' }}>
        {SNAPSHOTS.map((s, i) => (
          <div key={s.hash} onClick={() => { setActiveIdx(i); setShowDiff(false); }}
            style={{
              flexShrink:0, cursor:'pointer', transition:'all 0.2s',
              transform: i===activeIdx ? 'scale(1.08) translateY(-4px)' : 'scale(0.95)',
              filter: i===activeIdx ? 'none' : 'brightness(0.6)',
            }}>
            {/* Polaroid card */}
            <div style={{ background:'var(--bg-card)', border:`2px solid ${i===activeIdx ? color : 'var(--border)'}`, borderRadius:10, padding:'10px 10px 20px', width:110, boxShadow: i===activeIdx ? `0 8px 24px ${color}30` : 'none' }}>
              <div style={{ background: i===activeIdx ? color+'22' : 'var(--bg-elevated)', borderRadius:6, height:70, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
                <div style={{ fontSize:28 }}>{s.emoji}</div>
                <div style={{ color:i===activeIdx?color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:9, marginTop:4, textAlign:'center' }}>{s.hash}</div>
              </div>
              <div style={{ color:i===activeIdx?'var(--text-primary)':'var(--text-muted)', fontSize:10, fontWeight:600, lineHeight:1.3, textAlign:'center' }}>{s.label}</div>
              <div style={{ color:'var(--text-muted)', fontSize:9, textAlign:'center', marginTop:2 }}>{s.date}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Active snapshot info */}
      <div style={{ background:`${color}10`, border:`1px solid ${color}30`, borderRadius:'var(--radius-lg)', padding:'14px 18px', marginBottom:14 }}>
        <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ fontSize:24 }}>{snap.emoji}</span>
          <div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <code style={{ color, fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700 }}>{snap.hash}</code>
              <span style={{ color:'var(--text-primary)', fontWeight:600, fontSize:14 }}>{snap.label}</span>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:4, flexWrap:'wrap' }}>
              <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>by {snap.author}</span>
              <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>· {snap.date}</span>
              <span style={{ background:color+'20', color, fontFamily:'var(--font-mono)', fontSize:10, padding:'1px 8px', borderRadius:20 }}>⎇ {snap.branch}</span>
            </div>
          </div>
          <div style={{ marginLeft:'auto' }}>
            {prevSnap && (
              <button onClick={() => setShowDiff(d => !d)} style={{
                background: showDiff ? color+'20' : 'var(--bg-elevated)',
                border: `1px solid ${showDiff ? color+'50' : 'var(--border)'}`,
                color: showDiff ? color : 'var(--text-muted)',
                borderRadius:'var(--radius-md)', padding:'5px 12px',
                fontFamily:'var(--font-mono)', fontSize:11, cursor:'pointer',
              }}>
                {showDiff ? '📄 Full file' : '± Show diff'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* File tabs */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
        {allFiles.map(f => {
          const existsHere = !!snap.files[f];
          const isNew = existsHere && !prevSnap?.files[f];
          return (
            <button key={f} onClick={() => existsHere && setViewFile(f)} style={{
              background: viewFile===f ? color+'20' : 'var(--bg-elevated)',
              border: `1px solid ${viewFile===f ? color+'50' : 'var(--border)'}`,
              color: !existsHere ? 'var(--text-muted)' : viewFile===f ? color : 'var(--text-secondary)',
              borderRadius:'var(--radius-sm)', padding:'4px 12px',
              fontFamily:'var(--font-mono)', fontSize:11, cursor: existsHere ? 'pointer' : 'default',
              opacity: existsHere ? 1 : 0.4, transition:'all 0.15s',
            }}>
              {f}{isNew && <span style={{ color:'var(--green)', fontSize:9, marginLeft:4 }}>NEW</span>}
            </button>
          );
        })}
      </div>

      {/* File content / diff */}
      <div style={{ background:'#050810', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
        <div style={{ background:'var(--bg-card)', padding:'8px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color:color, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700 }}>{viewFile}</span>
          {showDiff && prevSnap && <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10 }}>→ changes vs previous snapshot</span>}
        </div>
        <pre style={{ padding:'16px', fontFamily:'var(--font-mono)', fontSize:12, lineHeight:1.7, overflowX:'auto', margin:0, maxHeight:280, overflowY:'auto', color:'var(--text-secondary)' }}>
          {showDiff && diffResult
            ? diffResult.map((line, i) => (
                <div key={i} style={lineTypeStyle(line.type)}>
                  <span style={{ color:'var(--text-muted)', marginRight:12, userSelect:'none', fontSize:10 }}>
                    {line.type==='add' ? '+' : line.type==='remove' ? '-' : ' '}
                  </span>
                  {line.text}
                </div>
              ))
            : <code style={{ color:'var(--green)' }}>{snap.files[viewFile] || '(file did not exist at this snapshot)'}</code>
          }
        </pre>
      </div>
    </div>
  );
}
