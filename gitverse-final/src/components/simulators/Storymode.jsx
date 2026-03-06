import React, { useState, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════
   STORY MODE — Narrated visual scenario
   A comic-strip-style animated story showing the
   PROBLEM that Git solves, for absolute beginners.
   "Before Git" horror story → "With Git" redemption.
═══════════════════════════════════════════════════════ */

const STORIES = [
  {
    id: 'before-git',
    title: '😱 Before Git — A Horror Story',
    subtitle: 'What happens to developers without version control',
    color: '#ff6b6b',
    frames: [
      {
        icon: '👩‍💻',
        speaker: 'Emma (Developer)',
        bg: '#ff6b6b',
        situation: 'Monday, 9am',
        narration: 'Emma starts a new website project. She creates a folder on her desktop.',
        files: ['website_v1.html'],
        action: null,
        thought: '"This will be easy!"',
      },
      {
        icon: '👩‍💻',
        speaker: 'Emma',
        bg: '#ff6b6b',
        situation: 'Tuesday',
        narration: 'She makes changes. Not sure if the new design is better, so she saves both.',
        files: ['website_v1.html', 'website_v2.html', 'website_v2_BETTER.html'],
        action: null,
        thought: '"Just in case..."',
      },
      {
        icon: '👩‍💻',
        speaker: 'Emma',
        bg: '#e03131',
        situation: 'Wednesday',
        narration: 'Her coworker Jake also edits the file. They email files back and forth.',
        files: ['website_v2_BETTER.html', 'website_Jake_edits.html', 'website_FINAL.html', 'website_FINAL_v2.html'],
        action: '📧 Emailing files...',
        thought: '"Which version is newest?!"',
      },
      {
        icon: '😱',
        speaker: 'Emma + Jake',
        bg: '#c92a2a',
        situation: 'Friday, 5pm',
        narration: 'The client wants the design from Tuesday. Nobody can find it. Jake overwrote it. The backup is corrupted.',
        files: ['website_FINAL_v2.html', 'website_FINAL_FINAL.html', 'website_FINAL_FINAL_v2_JAKE.html', 'website_backup_CORRUPTED.html', '😭'],
        action: '💀 3 hours of lost work',
        thought: '"There has to be a better way!"',
      },
    ],
  },
  {
    id: 'with-git',
    title: '✨ With Git — The Same Week',
    subtitle: 'How Git transforms the exact same scenario',
    color: '#51cf66',
    frames: [
      {
        icon: '👩‍💻',
        speaker: 'Emma (Developer)',
        bg: '#2f9e44',
        situation: 'Monday, 9am',
        narration: 'Emma initializes a Git repository. One folder, clean and simple.',
        files: ['index.html'],
        terminal: 'git init\ngit add .\ngit commit -m "Initial website"',
        thought: '"Git is watching over my work."',
      },
      {
        icon: '👩‍💻',
        speaker: 'Emma',
        bg: '#2f9e44',
        situation: 'Tuesday',
        narration: 'She tries the new design and commits it. Git remembers the old one automatically.',
        files: ['index.html'],
        terminal: 'git commit -m "Try new hero design"',
        commit: { hash: 'a3f2e', msg: 'Try new hero design' },
        thought: '"The old version is safe — I can always go back."',
      },
      {
        icon: '👨‍💻',
        speaker: 'Jake',
        bg: '#1e7e34',
        situation: 'Wednesday',
        narration: "Jake clones the repo, creates his own branch. Their changes can't conflict.",
        files: ['index.html'],
        terminal: 'git clone [url]\ngit switch -c jake/navigation',
        branch: 'jake/navigation',
        thought: '"I have my own safe space to work."',
      },
      {
        icon: '🎉',
        speaker: 'Emma + Jake',
        bg: '#0a8a4a',
        situation: 'Friday, 5pm',
        narration: "Jake opens a Pull Request. Emma reviews it, approves, and merges. Perfect history. Client wants Tuesday's design? Two commands.",
        files: ['index.html'],
        terminal: 'git log --oneline\ngit checkout a3f2e -- index.html',
        thought: '"We can see everything. Nothing is ever lost."',
        win: true,
      },
    ],
  },
];

export default function StoryMode({ color = '#51cf66' }) {
  const [storyIdx,  setStoryIdx]  = useState(0);
  const [frameIdx,  setFrameIdx]  = useState(0);
  const [animating, setAnimating] = useState(false);

  const story = STORIES[storyIdx];
  const frame = story.frames[frameIdx];
  const isLast = frameIdx === story.frames.length - 1;

  const goNext = () => {
    if (isLast) {
      if (storyIdx < STORIES.length - 1) {
        setStoryIdx(i => i + 1);
        setFrameIdx(0);
      }
      return;
    }
    setAnimating(true);
    setTimeout(() => { setFrameIdx(i => i + 1); setAnimating(false); }, 200);
  };

  const goPrev = () => {
    if (frameIdx > 0) { setFrameIdx(i => i - 1); return; }
    if (storyIdx > 0) { setStoryIdx(i => i - 1); setFrameIdx(STORIES[storyIdx-1].frames.length - 1); }
  };

  const reset = () => { setStoryIdx(0); setFrameIdx(0); };

  const isBeforeGit = story.id === 'before-git';

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
          🎬 Story Mode
        </h3>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>
          See the problem Git solves — told as a story. No experience needed.
        </p>
      </div>

      {/* Story selector */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {STORIES.map((s, i) => (
          <button key={s.id} onClick={() => { setStoryIdx(i); setFrameIdx(0); }} style={{
            flex:1, background: storyIdx===i ? s.color+'20':'var(--bg-elevated)',
            border: `2px solid ${storyIdx===i ? s.color+'60':'var(--border)'}`,
            color: storyIdx===i ? s.color : 'var(--text-muted)',
            borderRadius:'var(--radius-lg)', padding:'10px 14px', cursor:'pointer',
            fontFamily:'var(--font-mono)', fontSize:12, fontWeight: storyIdx===i ? 700:400,
            transition:'all 0.2s',
          }}>
            {s.title}
          </button>
        ))}
      </div>

      {/* Frame progress dots */}
      <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:16 }}>
        {story.frames.map((_, i) => (
          <div key={i} onClick={() => setFrameIdx(i)} style={{ width: i===frameIdx ? 24:8, height:8, borderRadius:4, background: i<=frameIdx ? story.color : 'var(--border)', cursor:'pointer', transition:'all 0.3s' }} />
        ))}
      </div>

      {/* Comic frame */}
      <div style={{
        background: `linear-gradient(135deg,${frame.bg}22,${frame.bg}08)`,
        border: `2px solid ${frame.bg}50`,
        borderRadius:'var(--radius-xl)', overflow:'hidden', marginBottom:16,
        opacity: animating ? 0 : 1, transition:'opacity 0.2s',
        animation: !animating ? 'fadeInUp 0.3s ease' : 'none',
      }}>
        {/* Situation bar */}
        <div style={{ background:frame.bg+'30', padding:'8px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:frame.bg==='#c92a2a'||frame.bg==='#e03131'?'#ffb3b3':frame.bg, fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700 }}>
            📅 {frame.situation}
          </span>
          <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10 }}>
            Frame {frameIdx+1} of {story.frames.length}
          </span>
        </div>

        <div style={{ padding:'20px 22px' }}>
          <div style={{ display:'flex', gap:16, alignItems:'flex-start', marginBottom:16, flexWrap:'wrap' }}>
            {/* Character */}
            <div style={{ textAlign:'center', flexShrink:0 }}>
              <div style={{ fontSize:48, lineHeight:1, marginBottom:4 }}>{frame.icon}</div>
              <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10 }}>{frame.speaker}</div>
            </div>

            {/* Speech bubble */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'14px 18px', position:'relative', marginBottom:10 }}>
                <p style={{ color:'var(--text-primary)', fontSize:15, lineHeight:1.6, margin:0 }}>
                  {frame.narration}
                </p>
              </div>
              {frame.thought && (
                <div style={{ color:'var(--text-muted)', fontSize:13, fontStyle:'italic', paddingLeft:8 }}>
                  💭 {frame.thought}
                </div>
              )}
            </div>
          </div>

          {/* File system visualization */}
          {frame.files && (
            <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'14px 18px', marginBottom:14 }}>
              <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
                {isBeforeGit ? '📁 Desktop/my-website/' : '📁 my-website/ (Git repo)'}
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {frame.files.map((f, i) => (
                  <div key={i} style={{
                    background: f==='😭' ? 'rgba(255,107,107,0.1)' : isBeforeGit && i > 0 ? 'rgba(255,183,71,0.1)' : 'rgba(0,255,136,0.08)',
                    border: `1px solid ${f==='😭' ? 'rgba(255,107,107,0.3)' : isBeforeGit && i > 0 ? 'rgba(255,183,71,0.3)' : 'rgba(0,255,136,0.2)'}`,
                    borderRadius:8, padding:'6px 12px', display:'flex', gap:6, alignItems:'center',
                  }}>
                    <span style={{ fontSize:14 }}>{f==='😭' ? '😭' : '📄'}</span>
                    <span style={{ color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:11 }}>{f}</span>
                  </div>
                ))}
              </div>
              {isBeforeGit && frame.files.length > 2 && (
                <div style={{ marginTop:8, color:'var(--red)', fontSize:12, fontStyle:'italic' }}>
                  ⚠️ Which one is the real latest version? Nobody knows.
                </div>
              )}
            </div>
          )}

          {/* Terminal (with-git frames) */}
          {frame.terminal && (
            <div style={{ background:'#050810', border:'1px solid var(--border-bright)', borderRadius:'var(--radius-lg)', padding:'12px 16px', marginBottom:14 }}>
              <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, marginBottom:6 }}>terminal</div>
              <pre style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#51cf66', margin:0, lineHeight:1.7 }}>
                {frame.terminal.split('\n').map((line, i) => (
                  <div key={i}><span style={{ color:'var(--text-muted)' }}>$ </span>{line}</div>
                ))}
              </pre>
            </div>
          )}

          {/* Action banner */}
          {frame.action && (
            <div style={{ background: isBeforeGit ? 'rgba(255,107,107,0.08)':'rgba(0,255,136,0.08)', border:`1px solid ${isBeforeGit?'rgba(255,107,107,0.3)':'rgba(0,255,136,0.2)'}`, borderRadius:'var(--radius-md)', padding:'10px 16px', display:'flex', gap:10, alignItems:'center' }}>
              <span style={{ fontSize:16 }}>💥</span>
              <span style={{ color:isBeforeGit?'var(--red)':'var(--green)', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700 }}>{frame.action}</span>
            </div>
          )}

          {frame.win && (
            <div style={{ background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.25)', borderRadius:'var(--radius-lg)', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:8 }}>🎉</div>
              <div style={{ color:'var(--green)', fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, marginBottom:6 }}>Zero lost work. Total clarity.</div>
              <div style={{ color:'var(--text-secondary)', fontSize:14 }}>This is why every professional developer uses Git.</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
        <button onClick={goPrev} disabled={frameIdx===0 && storyIdx===0}
          style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)', borderRadius:'var(--radius-md)', padding:'10px 18px', fontFamily:'var(--font-mono)', fontSize:13, cursor: frameIdx===0 && storyIdx===0 ? 'default':'pointer', opacity: frameIdx===0 && storyIdx===0 ? 0.4:1 }}>
          ← Back
        </button>

        <button onClick={goNext}
          style={{ flex:1, background: story.color, color:'#000', border:'none', borderRadius:'var(--radius-md)', padding:'10px 24px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor:'pointer', transition:'opacity 0.15s' }}>
          {isLast && storyIdx === STORIES.length-1 ? '🎓 Finished! Learn Git →' : isLast ? `Next: ${STORIES[storyIdx+1].title} →` : 'Next →'}
        </button>

        <button onClick={reset} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:'var(--radius-md)', padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:11, cursor:'pointer' }}>↩ Restart</button>
      </div>
    </div>
  );
}
