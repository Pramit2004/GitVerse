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
  if (diagram.name === 'three-trees')         return <ThreeTreesDiagram color={color} />;
  if (diagram.name === 'distributed-vs-central') return <DistributedDiagram />;
  if (diagram.name === 'git-objects')         return <GitObjectsDiagram />;
  if (diagram.name === 'merge-types')         return <MergeTypesDiagram />;
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
