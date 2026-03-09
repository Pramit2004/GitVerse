import React from 'react';
import { StagingSimulator, TerminalSimulator } from '../simulators/Simulators-index';
import CommitGraphVisualizer from '../simulators/Commitgraphvisualizer';
import MergeConflictSimulator from '../simulators/Mergeconflictsimulator';
import PRSimulator            from '../simulators/Prsimulator';
import ManualMergeSimulator   from '../simulators/Manualmergesimulator';
import GitignorePlayground    from '../simulators/Gitignoreplayground';
import TagsSimulator          from '../simulators/Tagssimulator';
import CommitLintSimulator    from '../simulators/Commitlintsimulator';
import GitUniverseMap        from '../simulators/Gituniversemap';
import SnapshotTimeMachine   from '../simulators/Snapshottimemachine';
import BranchGarden          from '../simulators/Branchgarden';
import GitCommandMap          from '../simulators/Gitcommandmap';
import TeamSimulator          from '../simulators/Teamsimulator';
import StoryMode              from '../simulators/Storymode';
import LiveTerminal           from '../simulators/Liveterminal';

export default function PracticeTab({ practice, color, chapterId }) {
  // ── Chapter → simulator routing ────────────────────
  // ch.1 now uses StoryMode (see Phase 6 routes below)
  if (chapterId === 4)                    return <StagingSimulator       color={color} />;
  if (chapterId === 5 || chapterId === 6) return <LiveTerminal            color={color} />;
  if (chapterId === 8) return <CommitGraphVisualizer color={color} />;
  if (chapterId === 10)                   return <MergeConflictSimulator color={color} />;
  if (chapterId === 12)                   return <PRSimulator            color={color} />;
  if (chapterId === 17)                   return <GitignorePlayground    color={color} />;
  if (chapterId === 19)                   return <TagsSimulator          color={color} />;
  if (chapterId === 22)                   return <CommitLintSimulator    color={color} />;
  // Phase 6 — new visual simulators
  if (chapterId === 1)                    return <StoryMode              color={color} />;
  if (chapterId === 2)                    return <GitUniverseMap         color={color} />;
  if (chapterId === 3)                    return <GitUniverseMap         color={color} />;
  if (chapterId === 4)                    return <GitCommandMap           color={color} />;
  if (chapterId === 7)                    return <SnapshotTimeMachine    color={color} />;
  if (chapterId === 11 || chapterId === 12) return <TeamSimulator        color={color} />;
  if (chapterId === 9) return <BranchGarden            color={color} />;

  // ── Generic: step list + terminal ──────────────────
  return (
    <div>
      {practice?.steps?.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>
            ⚡ Practice Exercise
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {practice.steps.map((step, i) => (
              <div key={i} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'16px 18px', display:'flex', gap:14, alignItems:'flex-start', animation:'fadeInUp 0.3s ease', animationDelay:`${i*70}ms`, animationFillMode:'both' }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:color+'28', color, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontWeight:700, fontSize:12, flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'var(--text-primary)', fontWeight:600, marginBottom:4, fontSize:14 }}>{step.title}</div>
                  <p style={{ color:'var(--text-secondary)', fontSize:13, lineHeight:1.6, marginBottom:step.command?8:0 }}>{step.desc}</p>
                  {step.command && (
                    <code style={{ display:'inline-block', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'3px 10px', color, fontFamily:'var(--font-mono)', fontSize:12 }}>{step.command}</code>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <TerminalSimulator color={color} />
    </div>
  );
}
