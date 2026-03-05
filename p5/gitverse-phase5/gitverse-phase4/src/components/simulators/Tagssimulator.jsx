import React, { useState } from 'react';

/* ═══════════════════════════════════════════════════════
   TAGS SIMULATOR — Chapter 19
   4-exercise guided SemVer tagging workflow
═══════════════════════════════════════════════════════ */

const COMMITS = [
  { hash: 'f2b5c67', msg: 'fix: handle null user ID in /profile route',    date: '2 hours ago'  },
  { hash: 'd1e8a44', msg: 'feat: add dark mode toggle to dashboard',        date: '1 day ago'    },
  { hash: 'b7c9f23', msg: 'feat!: rename /user API endpoint to /users',     date: '3 days ago'   },
  { hash: 'a3f2e1d', msg: 'chore: upgrade react from 18.2.0 to 18.3.1',    date: '1 week ago'   },
  { hash: '9fceb02', msg: 'docs: add Docker setup to README',               date: '2 weeks ago'  },
];

const EXERCISES = [
  {
    id: 1,
    title: 'Tag the first stable release',
    context: 'The project is stable and ready for public use. This is the first official release.',
    task: 'Create an annotated tag named v1.0.0 with a meaningful message.',
    expectedVersion: '1.0.0',
    expectedType: 'annotated',
    hint: 'Use: git tag -a v1.0.0 -m "First stable release"',
    semverRule: 'First stable public release — the starting point',
  },
  {
    id: 2,
    title: 'Ship a bug fix release',
    context: 'You fixed a null pointer crash in the profile route. This is a backwards-compatible bug fix.',
    task: 'Create an annotated tag for the correct PATCH release after v1.0.0.',
    expectedVersion: '1.0.1',
    expectedType: 'annotated',
    hint: 'Bug fix = PATCH bump. v1.0.0 → v1.0.1',
    semverRule: 'PATCH: bug fix only, backwards compatible',
  },
  {
    id: 3,
    title: 'Release a new feature',
    context: 'Dark mode is complete and ready. This is a new backwards-compatible feature.',
    task: 'Create an annotated tag for the correct MINOR release after v1.0.1.',
    expectedVersion: '1.1.0',
    expectedType: 'annotated',
    hint: 'New feature = MINOR bump. v1.0.1 → v1.1.0  (reset PATCH to 0)',
    semverRule: 'MINOR: new feature, backwards compatible — reset PATCH to 0',
  },
  {
    id: 4,
    title: 'Release a breaking change',
    context: 'The API endpoint /user was renamed to /users. This breaks all existing clients.',
    task: 'Create an annotated tag for the correct MAJOR release after v1.1.0.',
    expectedVersion: '2.0.0',
    expectedType: 'annotated',
    hint: 'Breaking change = MAJOR bump. v1.1.0 → v2.0.0  (reset MINOR and PATCH to 0)',
    semverRule: 'MAJOR: breaking change — reset both MINOR and PATCH to 0',
  },
];

export default function TagsSimulator({ color = '#63E6BE' }) {
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [createdTags, setCreatedTags] = useState([]);
  const [tagName,  setTagName]  = useState('');
  const [tagMsg,   setTagMsg]   = useState('');
  const [tagType,  setTagType]  = useState('annotated');
  const [feedback, setFeedback] = useState(null);
  const [phase,    setPhase]    = useState('exercise'); // exercise | result

  const exercise = EXERCISES[exerciseIdx];
  const isLast   = exerciseIdx === EXERCISES.length - 1;

  function handleSubmit() {
    const name = tagName.trim();
    if (!name) return;

    // Validate format
    const match = name.replace(/^v/, '').match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!match) {
      setFeedback({ ok: false, text: `"${name}" is not a valid version tag. Use the format v1.0.0` });
      return;
    }
    const version = `${match[1]}.${match[2]}.${match[3]}`;

    if (version !== exercise.expectedVersion) {
      setFeedback({ ok: false, text: `Wrong version. Expected v${exercise.expectedVersion}. Hint: ${exercise.hint}` });
      return;
    }
    if (tagType !== exercise.expectedType) {
      setFeedback({ ok: false, text: 'For releases, always use an annotated tag (git tag -a). Lightweight tags lack metadata.' });
      return;
    }
    if (tagType === 'annotated' && !tagMsg.trim()) {
      setFeedback({ ok: false, text: 'Annotated tags require a message. Describe what changed in this release.' });
      return;
    }

    setCreatedTags(prev => [...prev, {
      name: `v${version}`,
      type: tagType,
      msg: tagMsg.trim(),
      hash: COMMITS[0].hash,
      rule: exercise.semverRule,
    }]);
    setFeedback({ ok: true, text: `✅ Tag v${version} created successfully!` });
  }

  function handleNext() {
    if (isLast) { setPhase('result'); return; }
    setExerciseIdx(i => i + 1);
    setTagName(''); setTagMsg(''); setTagType('annotated'); setFeedback(null);
  }

  function handleReset() {
    setExerciseIdx(0); setCreatedTags([]); setTagName('');
    setTagMsg(''); setTagType('annotated'); setFeedback(null); setPhase('exercise');
  }

  // ── Result Screen ──────────────────────────────────
  if (phase === 'result') {
    return (
      <div style={{ animation:'fadeInUp 0.3s ease' }}>
        <SimHeader title="🏷️ Tag & Release Simulator" />
        <div style={{ background:'var(--green-glow)', border:'1px solid rgba(0,255,136,0.25)', borderRadius:'var(--radius-xl)', padding:'28px 24px', textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:52, marginBottom:10 }}>🎉</div>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--green)', marginBottom:8 }}>
            Full SemVer Lifecycle Complete!
          </h3>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:20 }}>
            You tagged v1.0.0 → v1.0.1 → v1.1.0 → v2.0.0, navigating every type of version bump.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8, maxWidth:420, margin:'0 auto 22px' }}>
            {createdTags.map(t => (
              <div key={t.name} style={{ display:'flex', gap:10, alignItems:'flex-start', background:'var(--bg-elevated)', border:`1px solid ${color}28`, borderRadius:10, padding:'10px 14px', textAlign:'left' }}>
                <span style={{ fontSize:18, flexShrink:0 }}>🏷️</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <code style={{ color, fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700 }}>{t.name}</code>
                    <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10 }}>{t.type}</span>
                  </div>
                  <div style={{ color:'var(--text-muted)', fontSize:12, marginTop:2 }}>{t.rule}</div>
                  {t.msg && <div style={{ color:'var(--text-secondary)', fontSize:12, marginTop:2, fontStyle:'italic' }}>"{t.msg}"</div>}
                </div>
              </div>
            ))}
          </div>
          <SimButton color={color} onClick={handleReset}>↩ Try Again</SimButton>
        </div>
        <CheatSheet color={color} />
      </div>
    );
  }

  // ── Exercise Screen ────────────────────────────────
  return (
    <div style={{ animation:'fadeInUp 0.3s ease' }}>
      <SimHeader
        title="🏷️ Tag & Release Simulator"
        desc="Navigate the full SemVer lifecycle by tagging four releases."
      />

      {/* Progress bar */}
      <div style={{ display:'flex', gap:5, marginBottom:20 }}>
        {EXERCISES.map((_, i) => (
          <div key={i} style={{ flex:1, height:4, borderRadius:2, transition:'background 0.3s',
            background: i < exerciseIdx ? color : i === exerciseIdx ? color+'88' : 'var(--border)' }} />
        ))}
      </div>

      {/* Commit log */}
      <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'12px 16px', marginBottom:14 }}>
        <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
          📦 Commit log — HEAD at top
        </div>
        {COMMITS.map((c, i) => {
          const tag = createdTags.find(t => t.hash === c.hash);
          return (
            <div key={c.hash} style={{ display:'flex', gap:9, alignItems:'center', padding:'5px 0', borderBottom: i < COMMITS.length-1 ? '1px solid var(--border)' : 'none', flexWrap:'wrap' }}>
              <code style={{ color:'var(--amber)', fontFamily:'var(--font-mono)', fontSize:11, flexShrink:0 }}>{c.hash}</code>
              {i === 0 && <span style={{ color:'var(--green)', fontSize:9, background:'var(--green-glow)', border:'1px solid rgba(0,255,136,0.2)', padding:'1px 6px', borderRadius:20, flexShrink:0 }}>HEAD</span>}
              {tag && <span style={{ color, fontSize:9, background:color+'14', border:`1px solid ${color}30`, padding:'1px 7px', borderRadius:20, flexShrink:0, fontFamily:'var(--font-mono)' }}>🏷️ {tag.name}</span>}
              <span style={{ color:'var(--text-secondary)', fontSize:12, flex:1 }}>{c.msg}</span>
              <span style={{ color:'var(--text-muted)', fontSize:11, flexShrink:0 }}>{c.date}</span>
            </div>
          );
        })}
      </div>

      {/* Exercise card */}
      <div style={{ background:`linear-gradient(135deg,${color}12,${color}06)`, border:`1px solid ${color}30`, borderRadius:'var(--radius-xl)', padding:'18px 20px', marginBottom:16 }}>
        <div style={{ color, fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>
          Exercise {exerciseIdx + 1} of {EXERCISES.length}
        </div>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--text-primary)', marginBottom:6 }}>{exercise.title}</h3>
        <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.6, marginBottom:6 }}>{exercise.context}</p>
        <p style={{ color, fontFamily:'var(--font-mono)', fontSize:12 }}>→ {exercise.task}</p>
      </div>

      {/* Tag builder */}
      <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'18px 20px', marginBottom:14 }}>

        {/* Type selector */}
        <div style={{ marginBottom:14 }}>
          <FieldLabel>Tag type</FieldLabel>
          <div style={{ display:'flex', gap:8, marginTop:7 }}>
            {[
              { val:'annotated',   label:'Annotated (-a)', note:'Stores metadata — use for releases' },
              { val:'lightweight', label:'Lightweight',    note:'Just a pointer — for internal use'  },
            ].map(opt => (
              <button key={opt.val} onClick={() => setTagType(opt.val)} style={{
                flex:1, textAlign:'left', padding:'10px 12px', cursor:'pointer', transition:'all 0.15s',
                background: tagType===opt.val ? color+'1a' : 'var(--bg-card)',
                border: `2px solid ${tagType===opt.val ? color+'55' : 'var(--border)'}`,
                borderRadius:'var(--radius-md)',
                color: tagType===opt.val ? color : 'var(--text-secondary)',
                fontFamily:'var(--font-mono)', fontSize:11,
                fontWeight: tagType===opt.val ? 700 : 400,
              }}>
                <div>{opt.label}</div>
                <div style={{ color:'var(--text-muted)', fontSize:10, marginTop:2, fontWeight:400 }}>{opt.note}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tag name */}
        <div style={{ marginBottom: tagType === 'annotated' ? 14 : 0 }}>
          <FieldLabel>Tag name</FieldLabel>
          <input
            value={tagName}
            onChange={e => { setTagName(e.target.value); setFeedback(null); }}
            placeholder="e.g. v1.0.0"
            style={{ width:'100%', marginTop:7, background:'var(--bg-card)', border:`1px solid ${feedback?.ok===false ? 'var(--red)' : color+'44'}`, borderRadius:'var(--radius-md)', padding:'9px 12px', color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontSize:13, outline:'none', boxSizing:'border-box' }}
          />
        </div>

        {/* Message (annotated only) */}
        {tagType === 'annotated' && (
          <div>
            <FieldLabel>Message (-m "...")</FieldLabel>
            <input
              value={tagMsg}
              onChange={e => setTagMsg(e.target.value)}
              placeholder='e.g. "First stable release"'
              style={{ width:'100%', marginTop:7, background:'var(--bg-card)', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-md)', padding:'9px 12px', color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontSize:13, outline:'none', boxSizing:'border-box' }}
            />
          </div>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{ background: feedback.ok ? 'var(--green-glow)' : 'rgba(255,107,107,0.08)', border:`1px solid ${feedback.ok ? 'rgba(0,255,136,0.25)' : 'rgba(255,107,107,0.3)'}`, borderRadius:'var(--radius-md)', padding:'10px 14px', marginBottom:14, color: feedback.ok ? 'var(--green)' : 'var(--red)', fontFamily:'var(--font-mono)', fontSize:13, animation:'fadeIn 0.2s ease' }}>
          {feedback.text}
        </div>
      )}

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <SimButton color={color} disabled={!tagName.trim()} onClick={handleSubmit}>
          Create Tag
        </SimButton>
        {feedback?.ok && (
          <SimButton color={color} onClick={handleNext}>
            {isLast ? 'See Results →' : 'Next Exercise →'}
          </SimButton>
        )}
      </div>

      <CheatSheet color={color} />
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
function CheatSheet({ color }) {
  const cmds = [
    ['git tag -a v1.0.0 -m "msg"', 'Create annotated tag at HEAD'],
    ['git tag v1.0.0',             'Create lightweight tag at HEAD'],
    ['git push origin v1.0.0',     'Push a specific tag to remote'],
    ['git push origin --tags',     'Push ALL local tags to remote'],
    ['git tag -d v1.0.0',          'Delete a tag locally'],
    ['git describe --tags',        'Human-readable version string'],
  ];
  return (
    <div style={{ marginTop:20, background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'14px 18px' }}>
      <div style={{ color:'var(--amber)', fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Tag commands reference</div>
      {cmds.map(([cmd, desc]) => (
        <div key={cmd} style={{ display:'flex', gap:12, marginBottom:6, flexWrap:'wrap', alignItems:'baseline' }}>
          <code style={{ color, fontFamily:'var(--font-mono)', fontSize:11, flexShrink:0 }}>{cmd}</code>
          <span style={{ color:'var(--text-muted)', fontSize:12 }}>{desc}</span>
        </div>
      ))}
    </div>
  );
}
