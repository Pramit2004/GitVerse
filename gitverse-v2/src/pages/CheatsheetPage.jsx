import React, { useState } from 'react';
import { COMMAND_REFERENCE } from '../data/chapters';
import { CopyButton } from '../components/ui';

export default function CheatsheetPage() {
  const [search, setSearch] = useState('');

  const filtered = COMMAND_REFERENCE.map(cat => ({
    ...cat,
    commands: cat.commands.filter(c =>
      c.cmd.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.commands.length > 0);

  return (
    <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,48px)' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(26px,4vw,40px)', fontWeight:900, marginBottom:6 }}>
          Git Cheatsheet
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize:15 }}>
          Every command you'll ever need, organized by category.
        </p>
      </div>

      {/* ── Search + Print row ─────────────────────────── */}
      <div style={{ display:'flex', gap:10, marginBottom:28, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg-elevated)', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-lg)', padding:'9px 15px', flex:'1 1 200px', minWidth:0 }}>
          <span style={{ flexShrink:0 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter commands…"
            style={{ background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontSize:13, flex:1, minWidth:0, caretColor:'var(--green)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:16, flexShrink:0, lineHeight:1 }}>×</button>
          )}
        </div>
        <button
          onClick={() => window.print()}
          className="no-print"
          style={{ background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-secondary)', borderRadius:'var(--radius-md)', padding:'9px 16px', fontFamily:'var(--font-mono)', fontSize:12, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
          🖨 Print / PDF
        </button>
      </div>

      {/* ── Command category grid ──────────────────────── */}
      {/* cheatsheet-grid class gets overridden to 1-col on tablet */}
      <div
        className="cheatsheet-grid"
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(min(100%,400px), 1fr))', gap:16 }}
      >
        {filtered.map(cat => (
          <div key={cat.category} style={{ background:'var(--bg-elevated)', border:`1px solid ${cat.color}22`, borderRadius:'var(--radius-xl)', overflow:'hidden' }}>
            {/* Category header */}
            <div style={{ background:cat.color+'12', borderBottom:`1px solid ${cat.color}22`, padding:'11px 17px', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:cat.color, flexShrink:0 }} />
              <h3 style={{ fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, color:cat.color, textTransform:'uppercase', letterSpacing:1 }}>{cat.category}</h3>
            </div>
            {/* Commands */}
            {cat.commands.map((cmd, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', borderBottom: i<cat.commands.length-1?'1px solid var(--border)':'none', padding:'10px 15px', gap:10, flexWrap:'wrap' }}>
                <code style={{ color:cat.color, fontFamily:'var(--font-mono)', fontSize:11, flexShrink:0, background:cat.color+'10', padding:'2px 8px', borderRadius:4, whiteSpace:'nowrap' }}>{cmd.cmd}</code>
                <span style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.5 }}>
                  {search ? highlight(cmd.desc, search) : cmd.desc}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
          No commands matching "<strong style={{ color:'var(--text-secondary)' }}>{search}</strong>"
        </div>
      )}

      {/* ── First-time setup block ─────────────────────── */}
      <div style={{ marginTop:28, background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', overflow:'hidden' }}>
        <div style={{ background:'var(--bg-card)', padding:'11px 17px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, color:'var(--amber)' }}>⚙️ FIRST-TIME SETUP</span>
          <CopyButton text={SETUP_CODE} />
        </div>
        <pre
          className="setup-pre"
          style={{ padding:18, fontFamily:'var(--font-mono)', fontSize:12, color:'var(--green)', lineHeight:1.8, overflowX:'auto', margin:0 }}
        >
          {SETUP_CODE}
        </pre>
      </div>
    </div>
  );
}

const SETUP_CODE = `# Identity (required before first commit)
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"

# Set VS Code as default editor
git config --global core.editor "code --wait"

# Better default branch name
git config --global init.defaultBranch main

# Colorful output
git config --global color.ui auto

# Helpful aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.lg "log --oneline --graph --all"`;

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background:'rgba(0,255,136,0.2)', color:'var(--green)', borderRadius:2 }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
