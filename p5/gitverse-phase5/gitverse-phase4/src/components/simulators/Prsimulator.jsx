import React, { useState } from 'react';

/* ── Fake PR data ───────────────────────────────────── */
const PR = {
  number: 142,
  title: 'feat: add dark mode toggle to navbar',
  branch: 'feature/dark-mode',
  base: 'main',
  author: { name: 'alex-dev', avatar: '👩‍💻' },
  labels: ['enhancement', 'ui'],
  description: `## What does this PR do?

Adds a 🌙/☀️ toggle to the navbar. User preference is saved to localStorage.

## Changes
- New \`ThemeToggle\` component
- Updated \`App.jsx\` to pass theme state
- CSS variables for both themes in \`global.css\`

## Checklist
- [x] Toggle works correctly
- [x] Preference persists on refresh
- [ ] Accessibility tested`,
  commits: [
    { hash: 'a3f2e1d', msg: 'Add ThemeToggle component',         time: '3h ago' },
    { hash: 'b7c9f23', msg: 'Wire theme state in App.jsx',       time: '2h ago' },
    { hash: 'd1e8a44', msg: 'Add CSS variables for light theme', time: '90m ago' },
    { hash: 'f2b5c67', msg: 'fix: persist theme to localStorage',time: '30m ago' },
  ],
  files: [
    { name: 'src/components/ThemeToggle.jsx', add: 44, del: 0,  status: 'added'    },
    { name: 'src/App.jsx',                   add: 9,  del: 2,  status: 'modified' },
    { name: 'src/styles/global.css',          add: 22, del: 4,  status: 'modified' },
  ],
  checks: [
    { name: 'CI / build',    status: 'pass' },
    { name: 'Tests (47/47)', status: 'pass' },
    { name: 'Lint',          status: 'pass' },
    { name: 'Coverage (78%)',status: 'warn' },
  ],
  initialComments: [
    { id: 1, author: 'sam-lead', avatar: '👨‍💼', text: 'Code looks clean! Could you add a transition animation when the theme changes? Also make sure the icon is accessible with aria-label.', time: '1h ago', badge: null },
  ],
};

const DIFF = `// src/components/ThemeToggle.jsx
+import React, { useState, useEffect } from 'react';
+
+export function ThemeToggle() {
+  const [theme, setTheme] = useState(
+    () => localStorage.getItem('theme') || 'dark'
+  );
+
+  useEffect(() => {
+    document.documentElement.setAttribute('data-theme', theme);
+    localStorage.setItem('theme', theme);
+  }, [theme]);
+
+  return (
+    <button
+      onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
+      aria-label="Toggle color theme"
+    >
+      {theme === 'dark' ? '☀️' : '🌙'}
+    </button>
+  );
+}`;

const TABS = [
  { id: 'overview', icon: '📋', label: 'Overview'     },
  { id: 'commits',  icon: '📦', label: 'Commits'      },
  { id: 'files',    icon: '📁', label: 'Files'        },
  { id: 'review',   icon: '✅', label: 'Review'       },
];

export default function PRSimulator({ color }) {
  const [tab, setTab]           = useState('overview');
  const [comments, setComments] = useState(PR.initialComments);
  const [newComment, setNewCmt] = useState('');
  const [reviewType, setRvType] = useState(null); // 'approve'|'request'|'comment'
  const [reviewNote, setRvNote] = useState('');
  const [prState, setPrState]   = useState('open'); // open|approved|merged

  function addComment() {
    if (!newComment.trim()) return;
    setComments(p => [...p, { id: Date.now(), author: 'you', avatar: '🧑‍💻', text: newComment, time: 'just now', badge: null }]);
    setNewCmt('');
  }

  function submitReview() {
    if (!reviewType) return;
    const badge = reviewType === 'approve' ? 'APPROVED' : reviewType === 'request' ? 'CHANGES REQUESTED' : null;
    const text  = reviewNote.trim() || (reviewType === 'approve' ? '✅ Looks great — approved!' : reviewType === 'request' ? '🔄 Requesting a few changes (see comments above).' : 'Left some thoughts.');
    setComments(p => [...p, { id: Date.now(), author: 'you (reviewer)', avatar: '🧑‍💻', text, time: 'just now', badge }]);
    setPrState(reviewType === 'approve' ? 'approved' : 'open');
    setRvType(null); setRvNote('');
  }

  /* ── Merged ─────────────────────────────────────────── */
  if (prState === 'merged') return (
    <Wrap>
      <Header title="🤝 PR Walkthrough" />
      <div style={{ background:'rgba(139,92,246,0.07)', border:'1px solid rgba(139,92,246,0.25)', borderRadius:'var(--radius-xl)', padding:'32px 24px', textAlign:'center', marginBottom:16 }}>
        <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:900, color:'#8b5cf6', marginBottom:10 }}>Pull Request Merged!</h3>
        <p style={{ color:'var(--text-secondary)', fontSize:14, maxWidth:380, margin:'0 auto 20px' }}>
          <Mono2>feature/dark-mode</Mono2> has been merged into <Mono2 green>main</Mono2>. The branch can now be deleted.
        </p>
        <InfoBox title="What happens next" items={['Merge commit added to main','CI/CD deploys to production','GitHub closes the PR automatically','Team pulls main to get the changes']} color="#8b5cf6" />
      </div>
      <BtnRow><GhostBtn onClick={() => setPrState('open')}>Start Over</GhostBtn></BtnRow>
    </Wrap>
  );

  const stateColor = { open:'var(--green)', approved:'#8b5cf6', merged:'#8b5cf6' };
  const stateLabel = { open:'● Open', approved:'✓ Approved', merged:'⎇ Merged' };

  return (
    <Wrap>
      <Header title="🤝 Pull Request Walkthrough" />

      {/* PR Header card */}
      <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'18px 20px', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:12, flexWrap:'wrap' }}>
          <span style={{ fontSize:32, lineHeight:1, flexShrink:0 }}>{PR.author.avatar}</span>
          <div style={{ flex:1, minWidth:0 }}>
            {/* Badges row */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center', marginBottom:6 }}>
              <StatusBadge color={stateColor[prState]}>{stateLabel[prState]}</StatusBadge>
              <MonoBadge>#{PR.number}</MonoBadge>
              {PR.labels.map(l => <MonoBadge key={l} color="var(--blue)">{l}</MonoBadge>)}
            </div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, marginBottom:5, color:'var(--text-primary)' }}>{PR.title}</h3>
            <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>
              <span style={{ color:'var(--text-secondary)' }}>{PR.author.name}</span>
              {' wants to merge '}
              <span style={{ color }}>{PR.branch}</span>
              {' → '}
              <span style={{ color:'var(--green)' }}>{PR.base}</span>
            </div>
          </div>
          {/* Stats */}
          <div style={{ display:'flex', gap:16, flexShrink:0 }}>
            {[['Commits', PR.commits.length, 'var(--blue)'], ['Files', PR.files.length, 'var(--amber)'], ['Comments', comments.length, color]].map(([l,v,c]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:18, fontWeight:700, color:c, lineHeight:1 }}>{v}</div>
                <div style={{ color:'var(--text-muted)', fontSize:10, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:1, marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:18, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:'9px 15px', border:'none', cursor:'pointer', background:'transparent', color: tab===t.id ? color : 'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:12, borderBottom:`2px solid ${tab===t.id ? color : 'transparent'}`, transition:'all 0.15s', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5 }}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────── */}
      {tab === 'overview' && (
        <div style={{ animation:'fadeIn 0.2s ease' }}>
          {/* Description */}
          <Section title="Description">
            <pre style={{ color:'var(--text-secondary)', fontFamily:'var(--font-body)', fontSize:13, lineHeight:1.7, whiteSpace:'pre-wrap', margin:0 }}>{PR.description}</pre>
          </Section>

          {/* CI checks */}
          <Section title="⚙️ Status Checks" style={{ marginTop:14 }}>
            {PR.checks.map((c, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i < PR.checks.length-1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ color: c.status==='pass' ? 'var(--green)' : 'var(--amber)', fontFamily:'var(--font-mono)', fontSize:13, width:14 }}>{c.status==='pass'?'✓':'⚠'}</span>
                <span style={{ color:'var(--text-secondary)', fontSize:13, flex:1 }}>{c.name}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color: c.status==='pass'?'var(--green)':'var(--amber)', background: (c.status==='pass'?'var(--green)':'var(--amber)')+'18', padding:'2px 8px', borderRadius:20 }}>{c.status}</span>
              </div>
            ))}
          </Section>

          {/* Conversation */}
          <Section title={`💬 Conversation (${comments.length})`} style={{ marginTop:14 }}>
            {comments.map(c => (
              <div key={c.id} style={{ display:'flex', gap:10, marginBottom:12, animation:'fadeIn 0.3s ease' }}>
                <span style={{ fontSize:26, lineHeight:1, flexShrink:0 }}>{c.avatar}</span>
                <div style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
                  <div style={{ background:'var(--bg-elevated)', padding:'7px 13px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:'var(--blue)', fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700 }}>{c.author}</span>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      {c.badge && <ReviewBadge type={c.badge}>{c.badge}</ReviewBadge>}
                      <span style={{ color:'var(--text-muted)', fontSize:11 }}>{c.time}</span>
                    </div>
                  </div>
                  <div style={{ padding:'10px 13px', color:'var(--text-secondary)', fontSize:13, lineHeight:1.6 }}>{c.text}</div>
                </div>
              </div>
            ))}
            {/* Add comment box */}
            <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
              <span style={{ fontSize:26, lineHeight:1, flexShrink:0 }}>🧑‍💻</span>
              <div style={{ flex:1 }}>
                <textarea value={newComment} onChange={e=>setNewCmt(e.target.value)} placeholder="Leave a comment…" rows={3}
                  style={{ width:'100%', background:'var(--bg-card)', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-md)', padding:11, color:'var(--text-primary)', fontFamily:'var(--font-body)', fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box', marginBottom:8 }} />
                <ActionBtn color={color} disabled={!newComment.trim()} onClick={addComment}>Comment</ActionBtn>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ── Commits ──────────────────────────────────── */}
      {tab === 'commits' && (
        <div style={{ animation:'fadeIn 0.2s ease', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
          {PR.commits.map((c, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 18px', borderBottom: i<PR.commits.length-1?'1px solid var(--border)':'none' }}>
              <span style={{ fontSize:20 }}>📦</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:'var(--text-primary)', fontSize:13, marginBottom:2 }}>{c.msg}</div>
                <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:11 }}>{PR.author.name} · {c.time}</div>
              </div>
              <code style={{ color:'var(--amber)', fontFamily:'var(--font-mono)', fontSize:11, background:'rgba(255,179,71,0.1)', padding:'3px 8px', borderRadius:4, flexShrink:0 }}>{c.hash}</code>
            </div>
          ))}
        </div>
      )}

      {/* ── Files ────────────────────────────────────── */}
      {tab === 'files' && (
        <div style={{ animation:'fadeIn 0.2s ease' }}>
          <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', marginBottom:14 }}>
            {PR.files.map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', borderBottom: i<PR.files.length-1?'1px solid var(--border)':'none', flexWrap:'wrap' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:4, flexShrink:0, background: f.status==='added'?'rgba(0,255,136,0.1)':'rgba(255,183,71,0.1)', color: f.status==='added'?'var(--green)':'var(--amber)' }}>{f.status}</span>
                <code style={{ color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:12, flex:1 }}>{f.name}</code>
                <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                  <span style={{ color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:11, background:'var(--green-glow)', padding:'1px 7px', borderRadius:4 }}>+{f.add}</span>
                  {f.del > 0 && <span style={{ color:'var(--red)', fontFamily:'var(--font-mono)', fontSize:11, background:'rgba(255,107,107,0.1)', padding:'1px 7px', borderRadius:4 }}>-{f.del}</span>}
                </div>
              </div>
            ))}
          </div>
          <DiffView diff={DIFF} title="src/components/ThemeToggle.jsx — diff" />
        </div>
      )}

      {/* ── Review ───────────────────────────────────── */}
      {tab === 'review' && (
        <div style={{ animation:'fadeIn 0.2s ease' }}>
          {prState !== 'approved' ? (
            <Section title="Submit Review">
              <textarea value={reviewNote} onChange={e=>setRvNote(e.target.value)} placeholder="Overall review comment (optional)…" rows={3}
                style={{ width:'100%', background:'var(--bg-card)', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-md)', padding:11, color:'var(--text-primary)', fontFamily:'var(--font-body)', fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box', marginBottom:12 }} />
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                {[
                  { t:'comment', label:'💬 Comment',         col:'var(--blue)'  },
                  { t:'request', label:'🔄 Request Changes', col:'var(--amber)' },
                  { t:'approve', label:'✅ Approve',          col:'var(--green)' },
                ].map(o => (
                  <button key={o.t} onClick={() => setRvType(o.t)} style={{ background:reviewType===o.t?o.col+'20':'var(--bg-card)', color:reviewType===o.t?o.col:'var(--text-secondary)', border:`2px solid ${reviewType===o.t?o.col+'55':'var(--border)'}`, borderRadius:'var(--radius-md)', padding:'9px 16px', fontFamily:'var(--font-mono)', fontSize:12, cursor:'pointer', transition:'all 0.15s', fontWeight:reviewType===o.t?700:400 }}>{o.label}</button>
                ))}
              </div>
              <ActionBtn color={color} disabled={!reviewType} onClick={submitReview}>Submit Review</ActionBtn>
            </Section>
          ) : (
            /* Merge button */
            <div style={{ background:'rgba(139,92,246,0.07)', border:'1px solid rgba(139,92,246,0.25)', borderRadius:'var(--radius-xl)', padding:22, marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <span style={{ fontSize:26 }}>✅</span>
                <div>
                  <div style={{ color:'var(--green)', fontWeight:700, fontSize:14 }}>Approved by you</div>
                  <div style={{ color:'var(--text-muted)', fontSize:12 }}>All status checks passed</div>
                </div>
              </div>
              <button onClick={() => setPrState('merged')} style={{ width:'100%', background:'#8b5cf6', color:'#fff', border:'none', borderRadius:'var(--radius-md)', padding:'13px', fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                ⎇ Merge Pull Request
              </button>
              <p style={{ color:'var(--text-muted)', fontSize:11, textAlign:'center', marginTop:8 }}>Merges {PR.commits.length} commits into main</p>
            </div>
          )}

          <Section title="💡 Code Review Etiquette" style={{ marginTop:14 }}>
            {[
              'Be specific — "line 42 should use const" beats "fix this"',
              'Ask questions — "What if id is null?" not "This is wrong"',
              'Approve when it\'s good enough, not perfect',
              'Respond to every comment before requesting a merge',
            ].map((tip, i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:7 }}>
                <span style={{ color:'var(--amber)', flexShrink:0 }}>→</span>
                <span style={{ color:'var(--text-secondary)', fontSize:13 }}>{tip}</span>
              </div>
            ))}
          </Section>
        </div>
      )}
    </Wrap>
  );
}

/* ── Shared sub-components ──────────────────────────── */
function Wrap({ children }) { return <div style={{ animation:'fadeInUp 0.3s ease' }}>{children}</div>; }
function Header({ title }) { return <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>{title}</h3>; }
function Section({ title, children, style={} }) {
  return (
    <div style={style}>
      <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1, fontWeight:700, marginBottom:10 }}>{title}</div>
      <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'14px 16px' }}>{children}</div>
    </div>
  );
}
function StatusBadge({ color, children }) {
  return <span style={{ background:color+'18', color, border:`1px solid ${color}40`, padding:'3px 10px', borderRadius:20, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700 }}>{children}</span>;
}
function MonoBadge({ color='var(--text-muted)', children }) {
  return <span style={{ background:'var(--bg-card)', color, border:'1px solid var(--border)', padding:'2px 8px', borderRadius:20, fontFamily:'var(--font-mono)', fontSize:10 }}>{children}</span>;
}
function ReviewBadge({ type, children }) {
  const good = type === 'APPROVED';
  return <span style={{ background: good?'var(--green-glow)':'rgba(255,183,71,0.1)', color:good?'var(--green)':'var(--amber)', border:`1px solid ${good?'rgba(0,255,136,0.25)':'rgba(255,183,71,0.3)'}`, padding:'2px 8px', borderRadius:20, fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700 }}>{children}</span>;
}
function ActionBtn({ color, disabled, onClick, children }) {
  return <button onClick={onClick} disabled={disabled} style={{ background:disabled?'var(--bg-card)':color, color:disabled?'var(--text-muted)':'#000', border:'none', borderRadius:'var(--radius-md)', padding:'8px 18px', fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, cursor:disabled?'default':'pointer' }}>{children}</button>;
}
function BtnRow({ children }) { return <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>{children}</div>; }
function GhostBtn({ onClick, children }) { return <button onClick={onClick} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-secondary)', borderRadius:'var(--radius-md)', padding:'9px 18px', fontFamily:'var(--font-mono)', fontSize:12, cursor:'pointer' }}>{children}</button>; }
function InfoBox({ title, items, color }) {
  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'14px 18px', textAlign:'left', maxWidth:400, margin:'0 auto' }}>
      <div style={{ color, fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>{title}</div>
      {items.map((s,i) => <div key={i} style={{ color:'var(--text-secondary)', fontSize:13, marginBottom:5, display:'flex', gap:8 }}><span style={{ color, flexShrink:0 }}>→</span>{s}</div>)}
    </div>
  );
}
function Mono2({ children, green }) { return <code style={{ color: green?'var(--green)':'#cc5de8', fontFamily:'var(--font-mono)', fontSize:13 }}>{children}</code>; }
function DiffView({ diff, title }) {
  return (
    <div style={{ background:'#050810', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
      <div style={{ background:'var(--bg-card)', padding:'7px 14px', borderBottom:'1px solid var(--border)', display:'flex', gap:7, alignItems:'center' }}>
        {['#ff5f56','#ffbd2e','#27c93f'].map(c=><div key={c} style={{width:9,height:9,borderRadius:'50%',background:c}}/>)}
        <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, marginLeft:6 }}>{title}</span>
      </div>
      <pre style={{ padding:'14px 16px', fontFamily:'var(--font-mono)', fontSize:11, lineHeight:1.9, margin:0, overflowX:'auto' }}>
        {diff.split('\n').map((line, i) => (
          <div key={i} style={{ color: line.startsWith('+') ? '#51cf66' : line.startsWith('-') ? '#ff6b6b' : line.startsWith('//') ? 'var(--text-muted)' : 'var(--text-secondary)', background: line.startsWith('+') ? 'rgba(81,207,102,0.05)' : line.startsWith('-') ? 'rgba(255,107,107,0.05)' : 'transparent', paddingLeft:8 }}>{line || ' '}</div>
        ))}
      </pre>
    </div>
  );
}
