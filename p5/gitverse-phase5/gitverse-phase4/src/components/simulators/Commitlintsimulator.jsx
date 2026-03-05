import React, { useState } from 'react';

/* ═══════════════════════════════════════════════════════
   CONVENTIONAL COMMIT LINTER SIMULATOR — Chapter 22
   5 rounds: read scenario, write the correct commit
═══════════════════════════════════════════════════════ */

const TEAL = '#12B886';

const SCENARIOS = [
  {
    context: 'You fixed a crash that happens when the user ID is null in the /profile API route.',
    bad: 'fixed it',
    expectedType: 'fix',
    expectedScope: 'api',
    expectedDesc: 'handle null user ID in /profile route',
    breaking: false,
    semver: 'PATCH',
    explanation: "Bug fixes use the 'fix' type. The scope 'api' tells readers which layer changed. Description is in imperative mood ('handle', not 'handled' or 'handling').",
  },
  {
    context: 'You added a Google OAuth2 login button to the authentication module.',
    bad: 'added google login',
    expectedType: 'feat',
    expectedScope: 'auth',
    expectedDesc: 'add Google OAuth2 sign-in button',
    breaking: false,
    semver: 'MINOR',
    explanation: "New features use 'feat'. This is a MINOR bump because it adds something new without breaking anything existing.",
  },
  {
    context: 'You renamed the /user API endpoint to /users. This breaks all existing API clients.',
    bad: 'renamed endpoint',
    expectedType: 'feat',
    expectedScope: 'api',
    expectedDesc: 'rename /user endpoint to /users',
    breaking: true,
    semver: 'MAJOR',
    explanation: "A breaking change uses ! after the type: feat(api)!: The BREAKING CHANGE triggers a MAJOR version bump, warning all users to review before upgrading.",
  },
  {
    context: 'You updated the README with Docker setup instructions. No code was changed.',
    bad: 'update readme',
    expectedType: 'docs',
    expectedScope: null,
    expectedDesc: 'add Docker setup instructions to README',
    breaking: false,
    semver: '—',
    explanation: "Documentation-only changes use 'docs'. No scope needed since it affects the whole project's docs. No version bump is triggered.",
  },
  {
    context: 'You upgraded the React dependency from 18.2.0 to 18.3.1. No application code changed.',
    bad: 'upgrade react',
    expectedType: 'chore',
    expectedScope: 'deps',
    expectedDesc: 'upgrade react from 18.2.0 to 18.3.1',
    breaking: false,
    semver: '—',
    explanation: "Dependency upgrades that are not user-facing features use 'chore'. The 'deps' scope clearly signals this is a dependency change. No version bump.",
  },
];

const TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf'];

export default function CommitLintSimulator({ color = TEAL }) {
  const [idx,     setIdx]     = useState(0);
  const [selType, setSelType] = useState('');
  const [scope,   setScope]   = useState('');
  const [desc,    setDesc]    = useState('');
  const [breaking,setBrk]    = useState(false);
  const [phase,   setPhase]   = useState('write'); // write | feedback | done
  const [results, setResults] = useState([]);

  const scenario = SCENARIOS[idx];
  const isLast   = idx === SCENARIOS.length - 1;

  function buildPreview() {
    const s = scope.trim() ? `(${scope.trim()})` : '';
    const b = breaking ? '!' : '';
    return `${selType || '?'}${s}${b}: ${desc.trim() || '…'}`;
  }

  function buildIdeal() {
    const s = scenario.expectedScope ? `(${scenario.expectedScope})` : '';
    const b = scenario.breaking ? '!' : '';
    return `${scenario.expectedType}${s}${b}: ${scenario.expectedDesc}`;
  }

  function validate() {
    const issues = [];
    if (!selType)              issues.push('Choose a commit type.');
    if (!desc.trim())          issues.push('Description cannot be empty.');
    if (desc.trim().length > 72) issues.push('Keep the description under 72 characters.');
    if (/\.$/.test(desc.trim())) issues.push('Do not end the description with a period.');
    if (/^[A-Z]/.test(desc.trim())) issues.push('Start with a lowercase letter (imperative mood: "add", not "Add").');

    const typeOk  = selType === scenario.expectedType;
    const breakOk = breaking === scenario.breaking;
    const perfect = typeOk && breakOk && issues.length === 0;

    const result = {
      built: buildPreview(),
      ideal: buildIdeal(),
      typeOk, breakOk, perfect, issues,
      explanation: scenario.explanation,
      semver: scenario.semver,
    };
    setResults(prev => [...prev, result]);
    setPhase('feedback');
  }

  function nextRound() {
    if (isLast) { setPhase('done'); return; }
    setIdx(i => i + 1);
    setSelType(''); setScope(''); setDesc(''); setBrk(false);
    setPhase('write');
  }

  function reset() {
    setIdx(0); setResults([]); setSelType(''); setScope('');
    setDesc(''); setBrk(false); setPhase('write');
  }

  // ── Done ───────────────────────────────────────────
  if (phase === 'done') {
    const perfCount = results.filter(r => r.perfect).length;
    return (
      <div style={{ animation:'fadeInUp 0.3s ease' }}>
        <SimHeader title="📝 Conventional Commit Linter" />
        <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'24px 20px', textAlign:'center', marginBottom:14 }}>
          <div style={{ fontSize:48, marginBottom:10 }}>{perfCount === SCENARIOS.length ? '🏆' : perfCount >= 3 ? '💪' : '📚'}</div>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color, marginBottom:6 }}>
            {perfCount}/{SCENARIOS.length} Perfect Commits
          </h3>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:20 }}>
            {perfCount === SCENARIOS.length ? 'Flawless. Your commits are machine-readable and human-friendly.' : 'Good effort — keep practicing. Consistent commits unlock automatic changelogs.'}
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8, textAlign:'left', maxWidth:500, margin:'0 auto 20px' }}>
            {results.map((r, i) => (
              <div key={i} style={{ background: r.perfect ? 'rgba(0,255,136,0.05)' : 'rgba(255,183,71,0.05)', border:`1px solid ${r.perfect ? 'rgba(0,255,136,0.18)' : 'rgba(255,183,71,0.18)'}`, borderRadius:8, padding:'10px 14px' }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom: r.perfect ? 0 : 4 }}>
                  <span>{r.perfect ? '✅' : '💡'}</span>
                  <code style={{ color: r.perfect ? 'var(--green)' : color, fontFamily:'var(--font-mono)', fontSize:12 }}>{r.built}</code>
                </div>
                {!r.perfect && (
                  <div style={{ marginTop:4, paddingLeft:24 }}>
                    <div style={{ color:'var(--text-muted)', fontSize:11, marginBottom:2 }}>Ideal:</div>
                    <code style={{ color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:12 }}>{r.ideal}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
          <SimButton color={color} onClick={reset}>↩ Try Again</SimButton>
        </div>
        <TypeRef color={color} />
      </div>
    );
  }

  // ── Feedback ───────────────────────────────────────
  if (phase === 'feedback') {
    const last = results[results.length - 1];
    return (
      <div style={{ animation:'fadeInUp 0.3s ease' }}>
        <SimHeader title="📝 Conventional Commit Linter" desc={`Round ${idx + 1} of ${SCENARIOS.length}`} />
        <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'20px', marginBottom:14 }}>
          <div style={{ fontSize:32, marginBottom:10 }}>{last.perfect ? '✅' : '💡'}</div>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color: last.perfect ? 'var(--green)' : color, marginBottom:14 }}>
            {last.perfect ? 'Perfect commit!' : 'Not quite — here is the ideal:'}
          </h3>

          <FeedbackRow label="Your commit">
            <code style={{ color: last.perfect ? 'var(--green)' : color, fontFamily:'var(--font-mono)', fontSize:13 }}>{last.built}</code>
          </FeedbackRow>

          {!last.perfect && (
            <FeedbackRow label="Ideal commit">
              <code style={{ color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:13 }}>{last.ideal}</code>
            </FeedbackRow>
          )}

          {last.issues.length > 0 && (
            <div style={{ background:'rgba(255,183,71,0.07)', border:'1px solid rgba(255,183,71,0.2)', borderRadius:8, padding:'10px 14px', margin:'10px 0' }}>
              {last.issues.map((iss, i) => (
                <div key={i} style={{ color:'var(--amber)', fontSize:13, marginBottom: i < last.issues.length-1 ? 4 : 0 }}>→ {iss}</div>
              ))}
            </div>
          )}

          <FeedbackRow label="Why" style={{ marginTop:10 }}>
            <span style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.6 }}>{last.explanation}</span>
          </FeedbackRow>

          <FeedbackRow label="SemVer impact">
            <SemVerBadge bump={last.semver} />
          </FeedbackRow>
        </div>
        <SimButton color={color} onClick={nextRound}>
          {isLast ? 'See Results →' : 'Next Round →'}
        </SimButton>
        <TypeRef color={color} />
      </div>
    );
  }

  // ── Write ──────────────────────────────────────────
  const preview = buildPreview();
  const descLen = desc.length;

  return (
    <div style={{ animation:'fadeInUp 0.3s ease' }}>
      <SimHeader
        title="📝 Conventional Commit Linter"
        desc="Read the scenario. Write the correct Conventional Commit message."
      />

      {/* Progress */}
      <div style={{ display:'flex', gap:5, marginBottom:18 }}>
        {SCENARIOS.map((_, i) => (
          <div key={i} style={{ flex:1, height:4, borderRadius:2, transition:'background 0.3s',
            background: i < idx ? color : i === idx ? color+'88' : 'var(--border)' }} />
        ))}
      </div>

      {/* Scenario */}
      <div style={{ background:`linear-gradient(135deg,${color}10,${color}05)`, border:`1px solid ${color}28`, borderRadius:'var(--radius-xl)', padding:'18px 20px', marginBottom:14 }}>
        <div style={{ color, fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:7 }}>
          Round {idx + 1} — Scenario
        </div>
        <p style={{ color:'var(--text-primary)', fontSize:15, fontWeight:600, lineHeight:1.6, marginBottom:10 }}>
          {scenario.context}
        </p>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ color:'var(--red)', fontFamily:'var(--font-mono)', fontSize:11 }}>❌ bad:</span>
          <code style={{ color:'var(--red)', fontFamily:'var(--font-mono)', fontSize:12, background:'rgba(255,107,107,0.08)', padding:'2px 9px', borderRadius:4 }}>{scenario.bad}</code>
          <span style={{ color:'var(--text-muted)', fontSize:12 }}>← write a proper commit below</span>
        </div>
      </div>

      {/* Builder */}
      <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'18px 20px', marginBottom:14 }}>

        {/* Type picker */}
        <div style={{ marginBottom:16 }}>
          <FieldLabel>1 — Choose a type</FieldLabel>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
            {TYPES.map(t => (
              <button key={t} onClick={() => setSelType(t)} style={{ background: selType===t ? color+'22' : 'var(--bg-card)', color: selType===t ? color : 'var(--text-secondary)', border:`1px solid ${selType===t ? color+'50' : 'var(--border)'}`, borderRadius:20, padding:'5px 14px', fontFamily:'var(--font-mono)', fontSize:12, cursor:'pointer', transition:'all 0.15s', fontWeight: selType===t ? 700 : 400 }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Scope + description */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:10, marginBottom:14 }}>
          <div>
            <FieldLabel>2 — Scope (optional)</FieldLabel>
            <input value={scope} onChange={e => setScope(e.target.value)} placeholder="auth, api, ui…"
              style={{ width:'100%', marginTop:7, background:'var(--bg-card)', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-md)', padding:'9px 11px', color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontSize:12, outline:'none', boxSizing:'border-box' }} />
          </div>
          <div>
            <FieldLabel>3 — Description (imperative, ≤72 chars)</FieldLabel>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="add dark mode toggle"
              style={{ width:'100%', marginTop:7, background:'var(--bg-card)', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-md)', padding:'9px 11px', color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontSize:12, outline:'none', boxSizing:'border-box' }} />
          </div>
        </div>

        {/* Breaking change toggle */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <button onClick={() => setBrk(v => !v)} style={{ width:38, height:22, borderRadius:11, background: breaking ? color : 'var(--bg-card)', border:`1px solid ${breaking ? color : 'var(--border)'}`, cursor:'pointer', position:'relative', transition:'all 0.2s', flexShrink:0 }}>
            <div style={{ width:16, height:16, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left: breaking ? 18 : 2, transition:'left 0.2s' }} />
          </button>
          <span style={{ color:'var(--text-secondary)', fontSize:13 }}>
            Breaking change <code style={{ color:'var(--red)', fontFamily:'var(--font-mono)', fontSize:12 }}>!</code>
            <span style={{ color:'var(--text-muted)', fontSize:11, marginLeft:6 }}>(triggers MAJOR bump)</span>
          </span>
        </div>

        {/* Live preview */}
        <div style={{ background:'#050810', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-md)', padding:'12px 16px' }}>
          <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Live preview</div>
          <code style={{ fontFamily:'var(--font-mono)', fontSize:14, color: selType && desc ? color : 'var(--text-muted)' }}>
            {preview}
          </code>
        </div>
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <SimButton color={color} disabled={!selType || !desc.trim()} onClick={validate}>
          Check Commit
        </SimButton>
        <span style={{ color: descLen > 72 ? 'var(--red)' : 'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:12 }}>
          {descLen}/72
        </span>
      </div>

      <TypeRef color={color} />
    </div>
  );
}

/* ── Shared sub-components ───────────────────────────── */
function SimHeader({ title, desc }) {
  return (
    <div style={{ marginBottom:18 }}>
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom: desc ? 5 : 0 }}>{title}</h3>
      {desc && <p style={{ color:'var(--text-muted)', fontSize:14, lineHeight:1.6 }}>{desc}</p>}
    </div>
  );
}
function FieldLabel({ children }) {
  return <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1 }}>{children}</div>;
}
function SimButton({ color, disabled, onClick, children }) {
  return (
    <button onClick={onClick} disabled={!!disabled} style={{ background: disabled ? 'var(--bg-card)' : color, color: disabled ? 'var(--text-muted)' : '#000', border:'none', borderRadius:'var(--radius-md)', padding:'11px 22px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor: disabled ? 'default' : 'pointer', transition:'all 0.15s' }}>
      {children}
    </button>
  );
}
function FeedbackRow({ label, children, style = {} }) {
  return (
    <div style={{ marginBottom:10, ...style }}>
      <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{label}</div>
      {children}
    </div>
  );
}
function SemVerBadge({ bump }) {
  const cfg = {
    MAJOR: { bg:'rgba(255,107,107,0.1)', color:'#ff6b6b', border:'rgba(255,107,107,0.22)' },
    MINOR: { bg:'rgba(18,184,134,0.1)',  color:TEAL,      border:'rgba(18,184,134,0.22)'  },
    PATCH: { bg:'rgba(77,171,247,0.1)',  color:'#4dabf7', border:'rgba(77,171,247,0.22)'  },
    '—':   { bg:'var(--bg-card)',        color:'var(--text-muted)', border:'var(--border)' },
  }[bump] || { bg:'var(--bg-card)', color:'var(--text-muted)', border:'var(--border)' };
  return (
    <span style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, padding:'3px 10px', borderRadius:20, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700 }}>
      {bump === '—' ? 'no version bump' : `${bump} version bump`}
    </span>
  );
}
function TypeRef({ color }) {
  const types = [
    { t:'feat',     bump:'MINOR', icon:'✨' },
    { t:'fix',      bump:'PATCH', icon:'🐛' },
    { t:'feat!',    bump:'MAJOR', icon:'💥' },
    { t:'docs',     bump:'—',     icon:'📚' },
    { t:'chore',    bump:'—',     icon:'🔧' },
    { t:'refactor', bump:'—',     icon:'♻️' },
  ];
  return (
    <div style={{ marginTop:18, background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'12px 16px' }}>
      <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:9 }}>Quick type reference</div>
      <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
        {types.map(t => (
          <div key={t.t} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'5px 10px' }}>
            <span style={{ fontSize:12 }}>{t.icon}</span>
            <code style={{ color, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700 }}>{t.t}</code>
            <SemVerBadge bump={t.bump} />
          </div>
        ))}
      </div>
    </div>
  );
}
