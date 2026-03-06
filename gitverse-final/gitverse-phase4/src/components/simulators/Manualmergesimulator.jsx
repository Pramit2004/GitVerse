import React, { useState } from 'react';

/* ── The scenario ───────────────────────────────────── */
const YOUR_BLOCKS = [
  { id:'y1', text:'# AwesomeProject',                            keep:true,  note:'Title — keep it (skip in Bob\'s copy)' },
  { id:'y2', text:'A tool for managing tasks efficiently.',       keep:true,  note:'Original description' },
  { id:'y3', text:'## Installation\n`npm install awesomeproject`',keep:true,  note:'Installation section — must keep' },
  { id:'y4', text:'## License\nMIT',                             keep:true,  note:'License — keep at the end' },
];
const THEIR_BLOCKS = [
  { id:'b1', text:'# AwesomeProject',                             keep:false, note:'Duplicate title — skip this one' },
  { id:'b2', text:'Now with real-time sync and dark mode!',        keep:true,  note:'New features — add this after description' },
  { id:'b3', text:'## Usage\n`awesomeproject --start`',           keep:true,  note:'New Usage section — add after Installation' },
  { id:'b4', text:'## Contributing\nPull requests welcome!',      keep:true,  note:'New Contributing section' },
];
// Optimal final order
const OPTIMAL = ['y1','y2','b2','y3','b3','b4','y4'];
const ALL_BLOCKS = [...YOUR_BLOCKS, ...THEIR_BLOCKS];

export default function ManualMergeSimulator({ color }) {
  const [phase, setPhase]   = useState('intro');   // intro | merge | result
  const [merged, setMerged] = useState([]);         // block ids in order
  const [dragIdx, setDragIdx] = useState(null);

  const available = ALL_BLOCKS.filter(b => !merged.includes(b.id));

  function addBlock(id) { setMerged(p => [...p, id]); }
  function removeBlock(id) { setMerged(p => p.filter(x => x !== id)); }
  function reorder(from, to) {
    setMerged(p => {
      const a = [...p];
      const [item] = a.splice(from, 1);
      a.splice(to, 0, item);
      return a;
    });
  }

  const score = merged.filter(id => OPTIMAL.includes(id)).length;
  const perfect = merged.length === OPTIMAL.length && merged.every((id, i) => id === OPTIMAL[i]);

  /* ── Intro ──────────────────────────────────────────── */
  if (phase === 'intro') return (
    <Wrap>
      <Header title="📄 Manual Merge Simulator" />
      <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.7, marginBottom:20 }}>
        Before Git existed, merging meant reading two files side-by-side and manually choosing what to keep.
        This simulator shows you exactly that — and why Git was such a revolutionary invention.
      </p>
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>
        <strong style={{ color:'var(--text-primary)' }}>Scenario:</strong> Alice and Bob both updated <code style={{ color, fontFamily:'var(--font-mono)' }}>README.md</code> independently. Combine them into one great document.
      </p>

      {/* Preview both versions */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
        {[
          { label:"Alice's version", emoji:'👩‍💻', blocks:YOUR_BLOCKS   },
          { label:"Bob's version",   emoji:'👨‍💻', blocks:THEIR_BLOCKS  },
        ].map(v => (
          <div key={v.label} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
            <div style={{ background:'var(--bg-card)', padding:'8px 14px', borderBottom:'1px solid var(--border)', display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:18 }}>{v.emoji}</span>
              <span style={{ color:'var(--text-secondary)', fontSize:12, fontWeight:600 }}>{v.label}</span>
            </div>
            <div style={{ padding:12 }}>
              {v.blocks.map(b => (
                <div key={b.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:6, padding:'7px 10px', marginBottom:6 }}>
                  <pre style={{ color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:11, margin:0, whiteSpace:'pre-wrap' }}>{b.text}</pre>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <TipBox>💡 Tip: Bob's version has a duplicate title and some new sections. You'll need to decide what to keep and in what order.</TipBox>

      <div style={{ marginTop:20 }}>
        <Btn color={color} onClick={() => setPhase('merge')}>Start Merging →</Btn>
      </div>
    </Wrap>
  );

  /* ── Result ─────────────────────────────────────────── */
  if (phase === 'result') return (
    <Wrap>
      <Header title="📄 Merge Result" />
      <ResultBanner perfect={perfect} score={score} max={OPTIMAL.length} color={color} />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:16 }}>
        <div>
          <SectionLabel>Your result</SectionLabel>
          {merged.map(id => {
            const b = ALL_BLOCKS.find(x => x.id === id);
            const good = OPTIMAL.includes(id);
            return (
              <div key={id} style={{ background: good?'rgba(0,255,136,0.05)':'rgba(255,107,107,0.05)', border:`1px solid ${good?'rgba(0,255,136,0.18)':'rgba(255,107,107,0.18)'}`, borderRadius:6, padding:'7px 10px', marginBottom:5 }}>
                <pre style={{ color: good?'var(--green)':'var(--red)', fontFamily:'var(--font-mono)', fontSize:11, margin:0, whiteSpace:'pre-wrap' }}>{b.text}</pre>
              </div>
            );
          })}
        </div>
        <div>
          <SectionLabel>Optimal result</SectionLabel>
          {OPTIMAL.map(id => {
            const b = ALL_BLOCKS.find(x => x.id === id);
            return (
              <div key={id} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:6, padding:'7px 10px', marginBottom:5 }}>
                <pre style={{ color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:11, margin:0, whiteSpace:'pre-wrap' }}>{b.text}</pre>
                <div style={{ color:'var(--text-muted)', fontSize:10, marginTop:4 }}>💡 {b.note}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop:20 }}>
        <Btn color={color} onClick={() => { setPhase('intro'); setMerged([]); }}>Try Again</Btn>
      </div>
    </Wrap>
  );

  /* ── Merge workspace ─────────────────────────────────── */
  return (
    <Wrap>
      <Header title="📄 Merge Workspace" />
      <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:18 }}>
        Click blocks to add them to your merged document. Drag blocks in the right pane to reorder. Skip duplicates.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {/* Left: source blocks */}
        <div>
          <SectionLabel style={{ marginBottom:10 }}>📚 Available Blocks ({available.length})</SectionLabel>

          {[
            { label:"Alice's blocks", emoji:'👩‍💻', blocks:YOUR_BLOCKS   },
            { label:"Bob's blocks",   emoji:'👨‍💻', blocks:THEIR_BLOCKS  },
          ].map(v => {
            const vAvail = v.blocks.filter(b => available.find(a => a.id === b.id));
            if (!vAvail.length) return null;
            return (
              <div key={v.label} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7 }}>
                  <span style={{ fontSize:16 }}>{v.emoji}</span>
                  <span style={{ color:'var(--text-secondary)', fontSize:12, fontWeight:600 }}>{v.label}</span>
                </div>
                {vAvail.map(b => (
                  <div key={b.id} onClick={() => addBlock(b.id)}
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'9px 12px', marginBottom:6, cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=color+'60'; e.currentTarget.style.transform='translateX(2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; }}>
                    <pre style={{ color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:11, margin:0, whiteSpace:'pre-wrap', marginBottom:4 }}>{b.text}</pre>
                    <span style={{ color, fontSize:10, fontFamily:'var(--font-mono)' }}>+ click to add</span>
                  </div>
                ))}
              </div>
            );
          })}

          {available.length === 0 && (
            <div style={{ color:'var(--text-muted)', fontSize:13, textAlign:'center', padding:'24px 0', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)' }}>All blocks added!</div>
          )}
        </div>

        {/* Right: merged document */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <SectionLabel>📝 Merged Document ({merged.length}/{OPTIMAL.length})</SectionLabel>
          </div>

          <div style={{ minHeight:180, background:'var(--bg-elevated)', border:`2px dashed ${merged.length?color+'40':'var(--border)'}`, borderRadius:'var(--radius-lg)', padding: merged.length?10:16, transition:'border-color 0.2s' }}>
            {merged.length === 0 && (
              <div style={{ color:'var(--text-muted)', fontSize:13, textAlign:'center', paddingTop:36 }}>Click blocks on the left to build your merged file</div>
            )}
            {merged.map((id, i) => {
              const b = ALL_BLOCKS.find(x => x.id === id);
              return (
                <div key={id}
                  draggable
                  onDragStart={() => setDragIdx(i)}
                  onDragOver={e => { e.preventDefault(); }}
                  onDrop={() => { if (dragIdx !== null && dragIdx !== i) reorder(dragIdx, i); setDragIdx(null); }}
                  onDragEnd={() => setDragIdx(null)}
                  style={{ background: dragIdx===i?'transparent':'var(--bg-card)', border:`1px solid ${dragIdx===i?color:'var(--border)'}`, borderRadius:'var(--radius-md)', padding:'8px 10px', marginBottom:6, cursor:'grab', opacity: dragIdx===i?0.4:1, display:'flex', gap:8, alignItems:'flex-start', transition:'opacity 0.15s' }}>
                  <span style={{ color:'var(--text-muted)', fontSize:12, flexShrink:0, marginTop:1 }}>⋮⋮</span>
                  <pre style={{ color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:11, margin:0, whiteSpace:'pre-wrap', flex:1 }}>{b.text}</pre>
                  <button onClick={() => removeBlock(id)} style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:14, flexShrink:0, padding:'0 2px' }}>×</button>
                </div>
              );
            })}
          </div>

          <button onClick={() => setPhase('result')} disabled={merged.length===0}
            style={{ marginTop:10, width:'100%', background: merged.length?color:'var(--bg-card)', color: merged.length?'#000':'var(--text-muted)', border:'none', borderRadius:'var(--radius-md)', padding:12, fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor: merged.length?'pointer':'default' }}>
            Finish Merge →
          </button>
        </div>
      </div>
    </Wrap>
  );
}

/* ── Sub-components ─────────────────────────────────── */
function Wrap({ children }) { return <div style={{ animation:'fadeInUp 0.3s ease' }}>{children}</div>; }
function Header({ title }) { return <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:12 }}>{title}</h3>; }
function SectionLabel({ children, style={} }) { return <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1, ...style }}>{children}</div>; }
function TipBox({ children }) { return <div style={{ background:'var(--green-glow)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'var(--radius-md)', padding:'10px 14px', color:'var(--green)', fontSize:13, lineHeight:1.6 }}>{children}</div>; }
function Btn({ color, onClick, children }) { return <button onClick={onClick} style={{ background:color, color:'#000', border:'none', borderRadius:'var(--radius-md)', padding:'11px 24px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor:'pointer' }}>{children}</button>; }
function ResultBanner({ perfect, score, max, color }) {
  return (
    <div style={{ background: perfect?'var(--green-glow)':'rgba(255,183,71,0.08)', border:`1px solid ${perfect?'rgba(0,255,136,0.25)':'rgba(255,183,71,0.25)'}`, borderRadius:'var(--radius-xl)', padding:'22px 24px', textAlign:'center' }}>
      <div style={{ fontSize:48, marginBottom:8 }}>{perfect?'🎉':'💡'}</div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color: perfect?'var(--green)':'var(--amber)', marginBottom:6 }}>
        {perfect ? 'Perfect merge!' : `${score}/${max} correct blocks`}
      </div>
      <p style={{ color:'var(--text-secondary)', fontSize:13 }}>
        {perfect ? 'You combined both versions flawlessly.' : 'Compare your result with the optimal on the right.'}
      </p>
    </div>
  );
}
