import React from 'react';
import { CopyButton } from '../ui';

/* ── ContentSection ───────────────────────────────────── */
export function ContentSection({ section, color, delay = 0 }) {
  return (
    <div style={{
      marginBottom: 32,
      animation: 'fadeInUp 0.4s ease',
      animationDelay: `${delay}ms`,
      animationFillMode: 'both',
    }}>
      {section.type === 'text'         && <TextSection section={section} color={color} />}
      {section.type === 'analogy'      && <AnalogySection section={section} color={color} />}
      {section.type === 'code'         && <CodeSection section={section} />}
      {section.type === 'keypoints'    && <KeypointsSection section={section} color={color} />}
      {section.type === 'command_table' && <CommandTableSection section={section} color={color} />}
      {section.type === 'warning'      && <WarningSection section={section} />}
      {section.type === 'tip'          && <TipSection section={section} />}
      {section.type === 'visual_diagram' && <VisualDiagram diagram={section} color={color} />}
    </div>
  );
}

/* ── Text ─────────────────────────────────────────────── */
function TextSection({ section, color }) {
  return (
    <div>
      {section.heading && (
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,2.5vw,22px)',
          fontWeight: 700, color: 'var(--text-primary)',
          marginBottom: 12, borderLeft: `3px solid ${color}`, paddingLeft: 14,
        }}>{section.heading}</h2>
      )}
      <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.8 }}>
        {section.content}
      </p>
    </div>
  );
}

/* ── Analogy ──────────────────────────────────────────── */
function AnalogySection({ section, color }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}12, ${color}06)`,
      border: `1px solid ${color}30`,
      borderRadius: 'var(--radius-lg)',
      padding: '22px 24px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: -10, left: 20,
        background: color, color: '#000',
        padding: '2px 12px', borderRadius: 20,
        fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
      }}>💡 ANALOGY</div>
      <p style={{
        color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.8,
        marginTop: 8, fontStyle: 'italic',
      }}>{section.content}</p>
    </div>
  );
}

/* ── Code Block ───────────────────────────────────────── */
function CodeSection({ section }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      <div style={{
        background: 'var(--bg-card)', padding: '8px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {section.label || 'terminal'}
        </span>
        <CopyButton text={section.content} />
      </div>
      <pre style={{
        padding: '20px', fontFamily: 'var(--font-mono)', fontSize: 13,
        color: 'var(--green)', lineHeight: 1.7,
        overflowX: 'auto', margin: 0,
      }}>
        <code>{section.content}</code>
      </pre>
    </div>
  );
}

/* ── Key Points ───────────────────────────────────────── */
function KeypointsSection({ section, color }) {
  return (
    <div>
      {section.heading && (
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
          color: 'var(--text-primary)', marginBottom: 14,
        }}>{section.heading}</h2>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {section.points.map((point, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
            padding: '13px 17px', border: '1px solid var(--border)',
            animation: 'fadeInRight 0.3s ease',
            animationDelay: `${i * 60}ms`, animationFillMode: 'both',
          }}>
            <span style={{ color, fontSize: 15, flexShrink: 0, marginTop: 2 }}>→</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Command Table ────────────────────────────────────── */
function CommandTableSection({ section, color }) {
  return (
    <div>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
        color: 'var(--text-primary)', marginBottom: 14,
      }}>{section.heading}</h2>
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {section.commands.map((cmd, i) => (
          <div key={i} style={{
            display: 'flex', gap: 0, flexWrap: 'wrap',
            borderBottom: i < section.commands.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ padding: '13px 16px', minWidth: 220, background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>
              <code style={{ color, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{cmd.command}</code>
            </div>
            <div style={{ padding: '13px 16px', flex: 1 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{cmd.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Warning ──────────────────────────────────────────── */
function WarningSection({ section }) {
  return (
    <div style={{
      background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.3)',
      borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', gap: 12,
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
      <div>
        <div style={{ color: 'var(--red)', fontWeight: 700, marginBottom: 5, fontSize: 13 }}>Warning</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{section.content}</p>
      </div>
    </div>
  );
}

/* ── Tip ──────────────────────────────────────────────── */
function TipSection({ section }) {
  return (
    <div style={{
      background: 'var(--green-glow)', border: '1px solid rgba(0,255,136,0.2)',
      borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', gap: 12,
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
      <div>
        <div style={{ color: 'var(--green)', fontWeight: 700, marginBottom: 5, fontSize: 13 }}>Pro Tip</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{section.content}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   VISUAL DIAGRAMS
═══════════════════════════════════════════════════════ */
function VisualDiagram({ diagram, color }) {
  if (diagram.name === 'three-trees')            return <ThreeTreesDiagram color={color} />;
  if (diagram.name === 'distributed-vs-central') return <DistributedDiagram />;
  if (diagram.name === 'git-objects')            return <GitObjectsDiagram />;
  if (diagram.name === 'merge-types')            return <MergeTypesDiagram />;
  if (diagram.name === 'semver')                 return <SemVerDiagram />;
  if (diagram.name === 'git-hooks-flow')         return <GitHooksFlowDiagram />;
  if (diagram.name === 'conventional-commits')   return <ConventionalCommitsDiagram />;
  return null;
}

function ThreeTreesDiagram({ color }) {
  const trees = [
    { label: 'Working Directory', icon: '📝', desc: 'Your actual files. Where you write and edit code.', color: '#ff6b6b', cmd: 'edit files' },
    { label: 'Staging Area (Index)', icon: '🎯', desc: 'Your "shopping cart". Choose what goes into the next snapshot.', color: '#ffb347', cmd: 'git add' },
    { label: 'Repository (.git)', icon: '🗄️', desc: 'Permanent history. Every snapshot stored forever.', color: '#51cf66', cmd: 'git commit' },
  ];
  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
        🌳 The Three Trees of Git
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        {trees.map((tree, i) => (
          <React.Fragment key={tree.label}>
            {i > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: tree.color + '20', color: tree.color,
                borderRadius: 20, padding: '3px 10px',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                alignSelf: 'center', whiteSpace: 'nowrap',
              }}>{i === 1 ? '→ git add' : '→ git commit'}</div>
            )}
            <div style={{
              background: tree.color + '10', border: `2px solid ${tree.color}35`,
              borderRadius: 'var(--radius-lg)', padding: '16px 14px',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{tree.icon}</div>
              <div style={{ fontWeight: 700, color: tree.color, fontSize: 12, marginBottom: 6 }}>{tree.label}</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5 }}>{tree.desc}</p>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function DistributedDiagram() {
  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
        🌐 Distributed vs Centralized VCS
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { title: 'Centralized (SVN)', icon: '🏢', desc: 'One central server. Everyone must connect. Server dies — work stops.', color: '#ff6b6b', label: '❌ Single point of failure' },
          { title: 'Distributed (Git)', icon: '🌐', desc: 'Every developer has the FULL copy. Work offline. Every clone is a backup.', color: '#51cf66', label: '✓ Resilient & offline-capable' },
        ].map(item => (
          <div key={item.title} style={{
            background: item.color + '10', border: `1px solid ${item.color}30`,
            borderRadius: 'var(--radius-lg)', padding: 18,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 700, color: item.color, marginBottom: 8, fontSize: 14 }}>{item.title}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{item.desc}</p>
            <span style={{ background: item.color + '18', color: item.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GitObjectsDiagram() {
  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
        🔬 Git's Internal Object Model
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { type: 'COMMIT', hash: '9fceb02...', desc: 'Points to a Tree + parent commit(s) + author, date, message', color: '#4dabf7', icon: '📦' },
          { type: 'TREE',   hash: '7c8d3f1...', desc: 'A directory listing — maps filenames to Blob hashes',           color: '#cc5de8', icon: '🌳' },
          { type: 'BLOB',   hash: 'a1b2c3d...', desc: 'The raw file content. Named by SHA-1 hash of its content.',    color: '#51cf66', icon: '📄' },
        ].map(obj => (
          <div key={obj.type} style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            background: obj.color + '10', border: `1px solid ${obj.color}30`,
            borderRadius: 'var(--radius-md)', padding: '14px 16px',
          }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{obj.icon}</span>
            <div>
              <span style={{ color: obj.color, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12 }}>{obj.type}</span>
              <code style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, marginLeft: 8 }}>{obj.hash}</code>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{obj.desc}</p>
            </div>
          </div>
        ))}
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, textAlign: 'center', padding: 6 }}>
          Commit → Tree → Blobs (each named by SHA-1 hash of its content)
        </p>
      </div>
    </div>
  );
}

function MergeTypesDiagram() {
  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
        🔀 Fast-Forward vs Three-Way Merge
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: '#4dabf718', border: '1px solid #4dabf730', borderRadius: 'var(--radius-lg)', padding: 16 }}>
          <div style={{ fontWeight: 700, color: '#4dabf7', marginBottom: 8, fontSize: 13 }}>⚡ Fast-Forward</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
            main has no new commits since branching — Git just moves the pointer forward. Clean, linear history.
          </p>
          <svg viewBox="0 0 200 55" style={{ width: '100%', height: 55 }}>
            {[0,1,2,3].map(i => (
              <g key={i}>
                <circle cx={18+i*55} cy={28} r={12} fill={i<2?'#1a2035':'#4dabf718'} stroke="#4dabf7" strokeWidth={1.5}/>
                <text x={18+i*55} y={32} textAnchor="middle" fill="#4dabf7" fontSize={9} fontFamily="monospace">C{i+1}</text>
                {i<3 && <line x1={30+i*55} y1={28} x2={51+i*55} y2={28} stroke="#4dabf760" strokeWidth={1.5}/>}
              </g>
            ))}
            <text x={182} y={20} fill="#4dabf7" fontSize={8} fontFamily="monospace">←main</text>
          </svg>
        </div>
        <div style={{ background: '#cc5de818', border: '1px solid #cc5de830', borderRadius: 'var(--radius-lg)', padding: 16 }}>
          <div style={{ fontWeight: 700, color: '#cc5de8', marginBottom: 8, fontSize: 13 }}>🔀 Three-Way Merge</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
            Both branches diverged — Git creates a merge commit with two parents.
          </p>
          <svg viewBox="0 0 200 78" style={{ width: '100%', height: 78 }}>
            <circle cx={28} cy={40} r={10} fill="#1a2035" stroke="#cc5de8" strokeWidth={1.5}/>
            <text x={28} y={44} textAnchor="middle" fill="#cc5de8" fontSize={8} fontFamily="monospace">C1</text>
            <line x1={38} y1={36} x2={68} y2={22} stroke="#4dabf760" strokeWidth={1.5}/>
            <line x1={38} y1={44} x2={68} y2={58} stroke="#cc5de860" strokeWidth={1.5}/>
            <circle cx={78} cy={20} r={10} fill="#1a2035" stroke="#4dabf7" strokeWidth={1.5}/>
            <text x={78} y={24} textAnchor="middle" fill="#4dabf7" fontSize={8} fontFamily="monospace">C2</text>
            <circle cx={78} cy={58} r={10} fill="#1a2035" stroke="#cc5de8" strokeWidth={1.5}/>
            <text x={78} y={62} textAnchor="middle" fill="#cc5de8" fontSize={8} fontFamily="monospace">C3</text>
            <line x1={88} y1={22} x2={138} y2={38} stroke="#4dabf760" strokeWidth={1.5}/>
            <line x1={88} y1={56} x2={138} y2={42} stroke="#cc5de860" strokeWidth={1.5}/>
            <circle cx={148} cy={40} r={12} fill="#cc5de820" stroke="#cc5de8" strokeWidth={2}/>
            <text x={148} y={44} textAnchor="middle" fill="#cc5de8" fontSize={9} fontFamily="monospace">M</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PHASE 4 — NEW DIAGRAMS
═══════════════════════════════════════════════════════ */

/* ── SemVer Diagram ─────────────────────────────────── */
function SemVerDiagram() {
  const bumps = [
    { from: 'v1.1.0', to: 'v2.0.0', bump: 'MAJOR', rule: 'Breaking change — not backwards compatible', safe: false, color: '#ff6b6b' },
    { from: 'v1.0.0', to: 'v1.1.0', bump: 'MINOR', rule: 'New feature, fully backwards compatible',    safe: true,  color: '#63E6BE' },
    { from: 'v1.0.0', to: 'v1.0.1', bump: 'PATCH', rule: 'Bug fix only, backwards compatible',         safe: true,  color: '#4dabf7' },
  ];
  return (
    <div>
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>
        🏷️ Semantic Versioning — MAJOR.MINOR.PATCH
      </h3>

      {/* Large number breakdown */}
      <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'20px 24px', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'center', gap:0 }}>
        {[
          { num:'2', label:'MAJOR', sublabel:'breaking', color:'#ff6b6b' },
          { num:'.', label:null, color:'var(--text-muted)' },
          { num:'4', label:'MINOR', sublabel:'new feature', color:'#63E6BE' },
          { num:'.', label:null, color:'var(--text-muted)' },
          { num:'1', label:'PATCH', sublabel:'bug fix', color:'#4dabf7' },
        ].map((p, i) => (
          <div key={i} style={{ textAlign:'center', minWidth: p.label ? 70 : 20 }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(36px,6vw,56px)', fontWeight:900, color:p.color, lineHeight:1 }}>{p.num}</div>
            {p.label && <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:p.color, marginTop:3, textTransform:'uppercase', letterSpacing:1 }}>{p.label}</div>}
            {p.sublabel && <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text-muted)', marginTop:1 }}>{p.sublabel}</div>}
          </div>
        ))}
      </div>

      {/* Bump rules */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
        {bumps.map(b => (
          <div key={b.bump} style={{ display:'flex', gap:10, alignItems:'center', background:b.color+'0e', border:`1px solid ${b.color}28`, borderRadius:'var(--radius-md)', padding:'11px 16px', flexWrap:'wrap' }}>
            <code style={{ color:b.color, fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, flexShrink:0 }}>{b.from} → {b.to}</code>
            <span style={{ background:b.color+'22', color:b.color, fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, padding:'2px 9px', borderRadius:20, flexShrink:0 }}>{b.bump}</span>
            <span style={{ color:'var(--text-secondary)', fontSize:13, flex:1 }}>{b.rule}</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:b.safe?'var(--green)':'var(--red)', flexShrink:0 }}>{b.safe ? '✓ safe to upgrade' : '⚠ read changelog'}</span>
          </div>
        ))}
      </div>

      {/* Pre-release labels */}
      <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'14px 18px' }}>
        <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Pre-release identifiers</div>
        {[
          { tag:'v1.0.0-alpha.1', desc:'Early unstable preview — may change at any time' },
          { tag:'v1.0.0-beta.3',  desc:'Feature complete, still being tested'             },
          { tag:'v1.0.0-rc.1',    desc:'Release candidate — probably stable, final checks' },
        ].map(p => (
          <div key={p.tag} style={{ display:'flex', gap:12, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
            <code style={{ color:'var(--amber)', fontFamily:'var(--font-mono)', fontSize:12, flexShrink:0 }}>{p.tag}</code>
            <span style={{ color:'var(--text-muted)', fontSize:12 }}>{p.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Git Hooks Flow Diagram ─────────────────────────── */
function GitHooksFlowDiagram() {
  const teal = '#20C997';
  const groups = [
    {
      trigger: 'git commit',
      hooks: [
        { name:'pre-commit',          color:'#ff6b6b', common:true,  desc:'Lint staged files, run quick checks — exit 1 to abort' },
        { name:'prepare-commit-msg',  color:'#ffb347', common:false, desc:'Auto-populate commit message template'                },
        { name:'commit-msg',          color:teal,      common:true,  desc:'Validate the commit message format — exit 1 to abort' },
        { name:'post-commit',         color:'#4dabf7', common:false, desc:'Notify, log, or trigger other tools after commit'     },
      ],
    },
    {
      trigger: 'git push',
      hooks: [
        { name:'pre-push',   color:'#cc5de8', common:true,  desc:'Run full test suite — exit 1 to abort the push' },
        { name:'post-push',  color:'#4dabf7', common:false, desc:'Deploy, notify (typically server-side)'          },
      ],
    },
  ];
  return (
    <div>
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>
        🪝 Git Hook Execution Flow
      </h3>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {groups.map(g => (
          <div key={g.trigger} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
            <div style={{ background:'var(--bg-card)', padding:'9px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
              <span>⌨️</span>
              <code style={{ color:teal, fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700 }}>{g.trigger}</code>
              <span style={{ color:'var(--text-muted)', fontSize:12 }}>→ hooks fire in order:</span>
            </div>
            <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:9 }}>
              {g.hooks.map((h, i) => (
                <div key={h.name}>
                  {i > 0 && <div style={{ height:1, background:'var(--border)', margin:'0 0 9px' }} />}
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    <span style={{ color:h.color, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, background:h.color+'14', border:`1px solid ${h.color}28`, padding:'3px 10px', borderRadius:20, flexShrink:0 }}>{h.name}</span>
                    <span style={{ color:'var(--text-secondary)', fontSize:13, flex:1 }}>{h.desc}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:h.common?teal:'var(--text-muted)', flexShrink:0 }}>{h.common ? '★ commonly used' : '○ optional'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:10, background:'rgba(255,107,107,0.06)', border:'1px solid rgba(255,107,107,0.18)', borderRadius:'var(--radius-md)', padding:'10px 14px', display:'flex', gap:10 }}>
        <span style={{ flexShrink:0 }}>💡</span>
        <span style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.6 }}>
          Any hook that exits with a non-zero code (<code style={{ color:'var(--red)', fontFamily:'var(--font-mono)' }}>exit 1</code>) aborts the entire Git operation. This is how hooks enforce quality gates.
        </span>
      </div>
    </div>
  );
}

/* ── Conventional Commits Diagram ───────────────────── */
function ConventionalCommitsDiagram() {
  const teal = '#12B886';
  const types = [
    { type:'feat',     bump:'MINOR', color:'#63E6BE', icon:'✨', desc:'New feature for the user'               },
    { type:'fix',      bump:'PATCH', color:'#4dabf7', icon:'🐛', desc:'Bug fix for the user'                   },
    { type:'docs',     bump:'—',     color:'#888',    icon:'📚', desc:'Documentation changes only'             },
    { type:'style',    bump:'—',     color:'#888',    icon:'🎨', desc:'Formatting only, no logic change'       },
    { type:'refactor', bump:'—',     color:'#ffb347', icon:'♻️', desc:'Restructure code, no fix or feature'    },
    { type:'test',     bump:'—',     color:'#888',    icon:'🧪', desc:'Adding or updating tests'               },
    { type:'chore',    bump:'—',     color:'#888',    icon:'🔧', desc:'Build, CI, tooling, dependencies'       },
    { type:'feat!',    bump:'MAJOR', color:'#ff6b6b', icon:'💥', desc:'Breaking change (! or BREAKING CHANGE)' },
  ];
  const bumpBg   = { MAJOR:'rgba(255,107,107,0.1)', MINOR:'rgba(18,184,134,0.1)', PATCH:'rgba(77,171,247,0.1)', '—':'var(--bg-card)' };
  const bumpClr  = { MAJOR:'#ff6b6b', MINOR:teal, PATCH:'#4dabf7', '—':'var(--text-muted)' };
  const bumpBdr  = { MAJOR:'rgba(255,107,107,0.22)', MINOR:'rgba(18,184,134,0.22)', PATCH:'rgba(77,171,247,0.22)', '—':'var(--border)' };

  return (
    <div>
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>
        📝 Conventional Commits — Anatomy & Type Reference
      </h3>

      {/* Live anatomy */}
      <div style={{ background:'#050810', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-lg)', padding:'18px 22px', marginBottom:16 }}>
        <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Message structure</div>
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'baseline', gap:0, marginBottom:12 }}>
          {[
            { text:'feat',        color:'#63E6BE', label:'type (required)' },
            { text:'(',           color:'var(--text-muted)', label:null },
            { text:'auth',        color:'#4dabf7', label:'scope (optional)' },
            { text:')',           color:'var(--text-muted)', label:null },
            { text:':',           color:'var(--text-muted)', label:null },
            { text:' add OAuth2', color:'#cc5de8', label:'description (required)' },
          ].map((p, i) => (
            <span key={i} style={{ fontFamily:'var(--font-mono)', fontSize:'clamp(15px,2.5vw,22px)', fontWeight:700, color:p.color }}>{p.text}</span>
          ))}
        </div>
        <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
          {[
            { color:'#63E6BE', label:'type',        hint:'required' },
            { color:'#4dabf7', label:'scope',       hint:'optional' },
            { color:'#cc5de8', label:'description', hint:'required, ≤72 chars, imperative mood' },
          ].map(p => (
            <div key={p.label}>
              <div style={{ color:p.color, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700 }}>{p.label}</div>
              <div style={{ color:'var(--text-muted)', fontSize:10, marginTop:1 }}>{p.hint}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Type table */}
      <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
        <div style={{ background:'var(--bg-card)', padding:'8px 16px', borderBottom:'1px solid var(--border)' }}>
          <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1 }}>Type reference</span>
        </div>
        {types.map((t, i) => (
          <div key={t.type} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 16px', borderBottom: i < types.length-1 ? '1px solid var(--border)' : 'none', flexWrap:'wrap' }}>
            <span style={{ fontSize:15, flexShrink:0 }}>{t.icon}</span>
            <code style={{ color:t.color, fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, flexShrink:0, minWidth:65 }}>{t.type}</code>
            <span style={{ color:'var(--text-secondary)', fontSize:13, flex:1 }}>{t.desc}</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, padding:'2px 9px', borderRadius:20, flexShrink:0, background:bumpBg[t.bump], color:bumpClr[t.bump], border:`1px solid ${bumpBdr[t.bump]}` }}>
              {t.bump === '—' ? 'no bump' : `${t.bump} bump`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
