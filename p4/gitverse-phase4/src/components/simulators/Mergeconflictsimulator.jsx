import React, { useState } from 'react';

const SCENARIOS = [
  {
    id: 1,
    file: 'README.md',
    title: 'Text Content Conflict',
    description: 'Two devs updated the project description on the same line.',
    ours:        'Welcome to AwesomeProject — the fastest task manager ever built.',
    theirs:      'Welcome to AwesomeProject — now with real-time sync and dark mode!',
    hint:        'Combine both claims into one sentence — keep all the good stuff.',
    ideal:       'Welcome to AwesomeProject — the fastest task manager with real-time sync and dark mode!',
  },
  {
    id: 2,
    file: 'package.json',
    title: 'Version Number Conflict',
    description: 'Your branch bumped a patch version. Theirs bumped a minor version.',
    ours:        '"version": "1.2.1"',
    theirs:      '"version": "1.3.0"',
    hint:        'Minor beats patch — use the higher version. 1.3.0 > 1.2.1.',
    ideal:       '"version": "1.3.0"',
  },
  {
    id: 3,
    file: 'src/api.js',
    title: 'Function Signature Conflict',
    description: 'One dev renamed the function, another added a parameter.',
    ours:        'async function fetchUser(id) {',
    theirs:      'async function getUser(id, options = {}) {',
    hint:        'Use the new name AND include the new parameter — both changes are valid.',
    ideal:       'async function getUser(id, options = {}) {',
  },
];

export default function MergeConflictSimulator({ color }) {
  const [idx, setIdx]           = useState(0);
  const [choice, setChoice]     = useState(null);   // 'ours'|'theirs'|'custom'
  const [resolution, setRes]    = useState('');
  const [phase, setPhase]       = useState('solve'); // solve | feedback | done
  const [results, setResults]   = useState([]);

  const sc     = SCENARIOS[idx];
  const isLast = idx === SCENARIOS.length - 1;

  function selectStrategy(s) {
    setChoice(s);
    if (s === 'ours')   setRes(sc.ours);
    if (s === 'theirs') setRes(sc.theirs);
    if (s === 'custom') setRes('');
  }

  function submit() {
    if (!resolution.trim()) return;
    const val = resolution.trim();
    // "good" if they used theirs or combined something non-trivially
    const good = val === sc.ideal
      || val === sc.theirs
      || (val !== sc.ours && val.length > 0);
    setResults(p => [...p, { title: sc.title, val, good, ideal: sc.ideal }]);
    setPhase('feedback');
  }

  function next() {
    if (isLast) { setPhase('done'); return; }
    setIdx(i => i + 1);
    setChoice(null); setRes(''); setPhase('solve');
  }

  function reset() {
    setIdx(0); setChoice(null); setRes('');
    setResults([]); setPhase('solve');
  }

  /* ── Done ──────────────────────────────────────────────── */
  if (phase === 'done') {
    const good = results.filter(r => r.good).length;
    return (
      <Wrap>
        <Header title="⚔️ Conflict Resolver" sub="All 3 conflicts resolved!" />
        <Card style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{good === 3 ? '🏆' : good >= 2 ? '💪' : '📚'}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color, marginBottom: 8 }}>
            {good}/3 Great Resolutions
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 380, margin: '0 auto 24px' }}>
            {good === 3 ? 'Perfect score — you kept the best of every branch.' : 'Tip: try to preserve changes from both sides whenever possible.'}
          </p>
          {results.map((r, i) => (
            <div key={i} style={{ display:'flex', gap:10, alignItems:'center', background: r.good ? 'rgba(0,255,136,0.06)' : 'rgba(255,107,107,0.06)', border:`1px solid ${r.good ? 'rgba(0,255,136,0.2)' : 'rgba(255,107,107,0.18)'}`, borderRadius:8, padding:'8px 14px', marginBottom:8, textAlign:'left' }}>
              <span style={{ fontSize:16 }}>{r.good ? '✓' : '○'}</span>
              <span style={{ color:'var(--text-secondary)', fontSize:13, flex:1 }}>{r.title}</span>
            </div>
          ))}
          <Btn color={color} onClick={reset} style={{ marginTop:8 }}>Try Again</Btn>
        </Card>
        <ConceptBox />
      </Wrap>
    );
  }

  /* ── Feedback ──────────────────────────────────────────── */
  if (phase === 'feedback') {
    const last = results[results.length - 1];
    return (
      <Wrap>
        <Header title="⚔️ Conflict Resolver" sub={`Scenario ${idx + 1} / ${SCENARIOS.length}`} />
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{last.good ? '✅' : '💡'}</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color: last.good ? 'var(--green)' : 'var(--amber)', marginBottom:10 }}>
            {last.good ? 'Solid resolution!' : 'There\'s a better answer'}
          </div>
          <div style={{ marginBottom:12 }}>
            <Label>Your resolution</Label>
            <Mono style={{ color: last.good ? 'var(--green)' : 'var(--text-secondary)' }}>{last.val}</Mono>
          </div>
          {!last.good && (
            <div style={{ marginBottom:12 }}>
              <Label style={{ color:'var(--green)' }}>Ideal resolution</Label>
              <Mono style={{ color:'var(--green)' }}>{last.ideal}</Mono>
            </div>
          )}
          <Tip>💡 {sc.hint}</Tip>
        </Card>
        <Btn color={color} onClick={next}>{isLast ? 'See Results →' : `Next Conflict (${idx + 2}/${SCENARIOS.length}) →`}</Btn>
        <ConceptBox />
      </Wrap>
    );
  }

  /* ── Solve ─────────────────────────────────────────────── */
  return (
    <Wrap>
      <Header
        title="⚔️ Merge Conflict Resolver"
        sub="Two branches changed the same lines. Produce the best combined result."
      />

      {/* Progress bar */}
      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        {SCENARIOS.map((_, i) => (
          <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i < idx ? color : i === idx ? color+'80' : 'var(--border)', transition:'background 0.3s' }} />
        ))}
      </div>

      {/* Scenario card */}
      <Card style={{ marginBottom:16, display:'flex', gap:14, alignItems:'flex-start' }}>
        <span style={{ fontSize:28, lineHeight:1, flexShrink:0 }}>📄</span>
        <div>
          <div style={{ color, fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, marginBottom:4, textTransform:'uppercase', letterSpacing:1 }}>
            Scenario {idx+1} · {sc.file}
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>{sc.title}</div>
          <div style={{ color:'var(--text-secondary)', fontSize:13 }}>{sc.description}</div>
        </div>
      </Card>

      {/* The conflict file as Git shows it */}
      <Terminal title={`${sc.file} — merge conflict`} style={{ marginBottom:18 }}>
        <Line color="#4dabf7">{'<<<<<<< HEAD (your branch)'}</Line>
        <ConflictBlock bg="rgba(77,171,247,0.07)" border="rgba(77,171,247,0.2)" color="#7ec8f7">{sc.ours}</ConflictBlock>
        <Line color="#666">{'======= (separator)'}</Line>
        <ConflictBlock bg="rgba(204,93,232,0.07)" border="rgba(204,93,232,0.2)" color="#cc5de8">{sc.theirs}</ConflictBlock>
        <Line color="#cc5de8">{'>>>>>>> feature-branch (incoming)'}</Line>
      </Terminal>

      {/* Strategy picker */}
      <Label style={{ marginBottom:10 }}>Choose a strategy:</Label>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
        {[
          { key:'ours',   label:'Keep Ours (HEAD)',    col:'#4dabf7' },
          { key:'theirs', label:'Accept Theirs',       col:'#cc5de8' },
          { key:'custom', label:'✏️ Write Custom',     col:color     },
        ].map(o => (
          <button key={o.key} onClick={() => selectStrategy(o.key)} style={{
            background: choice===o.key ? o.col+'20' : 'var(--bg-card)',
            color:      choice===o.key ? o.col : 'var(--text-secondary)',
            border:     `2px solid ${choice===o.key ? o.col+'60' : 'var(--border)'}`,
            borderRadius:'var(--radius-md)', padding:'9px 15px',
            fontFamily:'var(--font-mono)', fontSize:12, cursor:'pointer',
            transition:'all 0.15s', fontWeight: choice===o.key ? 700 : 400,
          }}>{o.label}</button>
        ))}
      </div>

      {/* Editor */}
      {choice && (
        <div style={{ animation:'fadeIn 0.2s ease', marginBottom:16 }}>
          <Label style={{ marginBottom:6 }}>{choice === 'custom' ? 'Write your resolution:' : 'Edit if needed:'}</Label>
          <textarea
            value={resolution}
            onChange={e => setRes(e.target.value)}
            rows={3}
            autoFocus={choice === 'custom'}
            placeholder="Type the resolved line here…"
            style={{ width:'100%', background:'var(--bg-card)', border:`1px solid ${color}40`, borderRadius:'var(--radius-md)', padding:14, color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontSize:13, outline:'none', resize:'vertical', lineHeight:1.6, boxSizing:'border-box' }}
          />
          <Tip style={{ marginTop:6 }}>💡 {sc.hint}</Tip>
        </div>
      )}

      <Btn color={color} disabled={!resolution.trim()} onClick={submit}>Resolve Conflict →</Btn>
      <ConceptBox />
    </Wrap>
  );
}

/* ── Sub-components ─────────────────────────────────── */
function Wrap({ children }) { return <div style={{ animation:'fadeInUp 0.3s ease' }}>{children}</div>; }
function Header({ title, sub }) {
  return (
    <div style={{ marginBottom:20 }}>
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>{title}</h3>
      {sub && <p style={{ color:'var(--text-muted)', fontSize:14, lineHeight:1.6 }}>{sub}</p>}
    </div>
  );
}
function Card({ children, style = {} }) {
  return <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'18px 20px', ...style }}>{children}</div>;
}
function Terminal({ title, children, style = {} }) {
  return (
    <div style={{ background:'#050810', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-lg)', overflow:'hidden', ...style }}>
      <div style={{ background:'var(--bg-card)', padding:'7px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:7 }}>
        {['#ff5f56','#ffbd2e','#27c93f'].map(c => <div key={c} style={{ width:9, height:9, borderRadius:'50%', background:c }} />)}
        <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, marginLeft:6 }}>{title}</span>
      </div>
      <div style={{ padding:'14px 18px', fontFamily:'var(--font-mono)', fontSize:13, lineHeight:1.9 }}>{children}</div>
    </div>
  );
}
function Line({ color, children }) { return <div style={{ color }}>{children}</div>; }
function ConflictBlock({ bg, border, color, children }) {
  return <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:4, padding:'5px 12px', margin:'3px 0', color }}>{children}</div>;
}
function Label({ children, style = {} }) {
  return <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:11, textTransform:'uppercase', letterSpacing:1, ...style }}>{children}</div>;
}
function Mono({ children, style = {} }) {
  return <div style={{ fontFamily:'var(--font-mono)', fontSize:13, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 14px', marginTop:4, lineHeight:1.6, ...style }}>{children}</div>;
}
function Tip({ children, style = {} }) {
  return <div style={{ color:'var(--text-muted)', fontSize:12, lineHeight:1.5, ...style }}>{children}</div>;
}
function Btn({ color, disabled, onClick, children, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background:disabled?'var(--bg-card)':color, color:disabled?'var(--text-muted)':'#000', border:'none', borderRadius:'var(--radius-md)', padding:'11px 22px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor:disabled?'default':'pointer', transition:'all 0.15s', ...style }}>
      {children}
    </button>
  );
}
function ConceptBox() {
  return (
    <div style={{ marginTop:24, background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'14px 18px' }}>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--amber)', fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>How Git conflict markers work</div>
      <div style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.8 }}>
        <code style={{ color:'#4dabf7' }}>{'<<<<<<< HEAD'}</code> — your current branch's version<br />
        <code style={{ color:'#aaa' }}>{'======='}</code> — the divider between the two versions<br />
        <code style={{ color:'#cc5de8' }}>{'>>>>>>> branch'}</code> — the incoming branch's version<br />
        <br />
        To resolve: <strong style={{ color:'var(--text-primary)' }}>delete all three marker lines</strong> and keep only the code you want.
      </div>
    </div>
  );
}
