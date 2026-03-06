import React, { useState, useRef } from 'react';
import { useApp, XP_REWARDS } from '../context/AppContext';
import { CHAPTERS } from '../data/chapters';

/* ── 30-question exam spanning all 7 parts ─────────────── */
const EXAM_QUESTIONS = [
  // Part 1 — Foundations
  { q:'What problem does Git primarily solve?', opts:['Makes code run faster','Tracks changes and enables collaboration without losing work','Compresses files','Connects to the internet'], ans:1, part:1 },
  { q:'What is the difference between Git and GitHub?', opts:['They are the same thing','Git is the version control tool; GitHub is a cloud platform that hosts Git repos','GitHub is faster','Git requires the internet, GitHub does not'], ans:1, part:1 },
  { q:'Who created Git?', opts:['Bill Gates','Linus Torvalds','Mark Zuckerberg','GitHub Inc'], ans:1, part:1 },

  // Part 2 — Core Git
  { q:'What does `git init` do?', opts:['Downloads a repo','Creates a new local Git repository','Installs Git','Connects to GitHub'], ans:1, part:2 },
  { q:'Which command stages ALL modified files?', opts:['git stage all','git commit .','git add .','git push'], ans:2, part:2 },
  { q:'What are Git\'s "three trees"?', opts:['Working directory, staging area, repository','Local, remote, cloud','Branch, merge, commit','Head, tail, body'], ans:0, part:2 },
  { q:'What does a commit actually store?', opts:['A diff of changed lines only','A complete snapshot of staged files','The entire hard drive','Only the commit message'], ans:1, part:2 },
  { q:'What does `git stash` do?', opts:['Deletes all changes','Temporarily saves uncommitted changes so you can switch branches','Commits without a message','Sends files to GitHub'], ans:1, part:2 },

  // Part 3 — Branching
  { q:'What is a Git branch?', opts:['A backup copy of the repo','A pointer to a specific commit, enabling parallel development','A remote repository','A type of merge'], ans:1, part:3 },
  { q:'What command creates AND switches to a new branch?', opts:['git branch new','git switch -c new','git checkout new','git create new'], ans:1, part:3 },
  { q:'What is a fast-forward merge?', opts:['A merge that creates a new merge commit','A merge where Git simply moves the branch pointer forward (no diverging history)','A merge that deletes branches','A merge using rebase'], ans:1, part:3 },
  { q:'A merge conflict occurs when:', opts:['Two branches have the same name','Two branches modified the same lines of the same file','You forget to commit','The internet is slow'], ans:1, part:3 },
  { q:'After resolving a merge conflict, what must you do?', opts:['Delete both branches','git add the resolved file, then git commit','Run git reset','Nothing, it auto-resolves'], ans:1, part:3 },

  // Part 4 — GitHub
  { q:'What does `git remote add origin <url>` do?', opts:['Creates a new branch named origin','Links your local repo to a GitHub repository','Downloads the repo','Deletes your local repo'], ans:1, part:4 },
  { q:'What is a Pull Request (PR)?', opts:['A request to download code','A proposal to merge your branch into another, enabling code review','A git command','A way to delete branches'], ans:1, part:4 },
  { q:'What is the GitHub Flow workflow?', opts:['Push directly to main always','Fork → clone → edit → push','Create branch → commit → PR → review → merge','Commit → stash → branch → merge'], ans:2, part:4 },
  { q:'`git fetch` vs `git pull` — what\'s the difference?', opts:['They are identical','fetch downloads without merging; pull downloads AND merges','pull is faster','fetch only works on Windows'], ans:1, part:4 },

  // Part 5 — Advanced
  { q:'What does `git rebase` do?', opts:['Deletes commits','Moves or replays commits onto a different base commit for a cleaner history','Creates a new branch','Merges two repos'], ans:1, part:5 },
  { q:'What does `git reset --hard HEAD~1` do?', opts:['Undoes the last commit AND discards all its changes permanently','Just unstages files','Deletes the branch','Creates a backup'], ans:0, part:5 },
  { q:'`git revert` vs `git reset` — key difference?', opts:['revert is faster','revert creates a NEW commit that undoes changes (safe for shared history); reset moves HEAD backwards','reset is safer','They are the same'], ans:1, part:5 },
  { q:'What does `git bisect` do?', opts:['Splits a commit into two','Uses binary search to find the commit that introduced a bug','Copies a branch','Shows line-by-line blame'], ans:1, part:5 },
  { q:'What does a .gitignore file do?', opts:['Deletes ignored files','Tells Git which files and patterns to not track','Makes files read-only','Commits files automatically'], ans:1, part:5 },

  // Part 6 — Real World
  { q:'In CI/CD, what triggers a GitHub Actions workflow?', opts:['Manual only','Events like push, pull_request, or schedule','Only on main branch','Only on Mondays'], ans:1, part:6 },
  { q:'What is a GitHub Pages deployment?', opts:['A paid GitHub feature','Hosting static websites directly from a GitHub repository for free','A type of PR','A backup system'], ans:1, part:6 },

  // Part 7 — Pro Practices
  { q:'What is Semantic Versioning (SemVer)?', opts:['A Git branch naming convention','MAJOR.MINOR.PATCH versioning — MAJOR=breaking, MINOR=features, PATCH=fixes','A GitHub feature','A way to name commits'], ans:1, part:7 },
  { q:'What is an annotated git tag vs a lightweight tag?', opts:['They are identical','Annotated tags store tagger name, date, message; lightweight is just a pointer','Lightweight tags are permanent','Annotated tags are for branches'], ans:1, part:7 },
  { q:'What do Git Hooks enable?', opts:['GUI for Git','Automatic scripts that run at Git events like pre-commit, pre-push','Cloud sync','Spell check in commits'], ans:1, part:7 },
  { q:'What is the Conventional Commits format?', opts:['A GitHub PR template','type(scope): description — e.g. feat(auth): add OAuth2','A branch naming rule','A .gitignore pattern'], ans:1, part:7 },
  { q:'What does `commitlint` do?', opts:['Spell-checks commit messages','Enforces a commit message convention by linting each commit','Generates changelogs','Merges branches'], ans:1, part:7 },
  { q:'SSH keys authenticate you to GitHub by:', opts:['Sending your password encrypted','Using a public/private key pair — GitHub holds your public key, you keep the private key','Biometric scan','IP address'], ans:1, part:7 },
];

const PASS_THRESHOLD = 0.8; // 80%

function CertificateCard({ name, score, total, date, level }) {
  return (
    <div style={{ background:'linear-gradient(135deg,#0a0e1a 0%,#141929 50%,#0a0e1a 100%)', border:'2px solid #00ff8855', borderRadius:'var(--radius-xl)', padding:'40px 48px', maxWidth:680, margin:'0 auto', position:'relative', overflow:'hidden', boxShadow:'0 0 60px rgba(0,255,136,0.15)' }}>
      {/* Corner decorations */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
        <div key={v+h} style={{ position:'absolute', [v]:16, [h]:16, width:30, height:30, borderTop: v==='top'?'2px solid #00ff88':undefined, borderBottom: v==='bottom'?'2px solid #00ff88':undefined, borderLeft: h==='left'?'2px solid #00ff88':undefined, borderRight: h==='right'?'2px solid #00ff88':undefined }} />
      ))}

      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🎓</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#00ff8899', textTransform:'uppercase', letterSpacing:3, marginBottom:8 }}>Certificate of Completion</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:13, color:'var(--text-muted)', marginBottom:24 }}>This certifies that</div>

        <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:900, color:'#00ff88', marginBottom:8, textShadow:'0 0 30px rgba(0,255,136,0.4)' }}>
          {name || 'Git Learner'}
        </div>

        <div style={{ fontFamily:'var(--font-display)', fontSize:14, color:'var(--text-secondary)', marginBottom:28, lineHeight:1.8 }}>
          has successfully completed<br/>
          <strong style={{ color:'var(--text-primary)', fontSize:18 }}>GitVerse — Complete Git & GitHub Mastery</strong><br/>
          scoring <strong style={{ color:'#00ff88' }}>{score}/{total} ({Math.round(score/total*100)}%)</strong> on the final assessment
        </div>

        <div style={{ display:'flex', gap:24, justifyContent:'center', marginBottom:28, flexWrap:'wrap' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#00ff88', fontFamily:'var(--font-display)', fontSize:22, fontWeight:900 }}>{score}/{total}</div>
            <div style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'var(--font-mono)' }}>Score</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#4dabf7', fontFamily:'var(--font-display)', fontSize:22, fontWeight:900 }}>22</div>
            <div style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'var(--font-mono)' }}>Chapters</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#cc5de8', fontFamily:'var(--font-display)', fontSize:22, fontWeight:900 }}>7</div>
            <div style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'var(--font-mono)' }}>Parts</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ffb347', fontFamily:'var(--font-display)', fontSize:22, fontWeight:900 }}>{level}</div>
            <div style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'var(--font-mono)' }}>Level</div>
          </div>
        </div>

        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', borderTop:'1px solid var(--border)', paddingTop:16 }}>
          ⚡ GitVerse · {date} · Verified Achievement
        </div>
      </div>
    </div>
  );
}

export default function CertificationPage() {
  const { earnXP, unlockAchievement, currentLevel, progress, completedCount } = useApp();
  const [phase,    setPhase]    = useState('intro'); // intro | exam | results | certificate
  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted,setSubmitted]= useState(false);
  const [answers,  setAnswers]  = useState([]);
  const [score,    setScore]    = useState(0);
  const [userName, setUserName] = useState('');
  const certRef = useRef(null);

  const q = EXAM_QUESTIONS[current];
  const total = EXAM_QUESTIONS.length;
  const passed = score >= Math.ceil(total * PASS_THRESHOLD);
  const completionDate = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  const submit = () => {
    if (selected === null) return;
    const correct = selected === q.ans;
    if (correct) setScore(s => s + 1);
    setAnswers(prev => [...prev, { selected, correct, q: q.q }]);
    setSubmitted(true);
  };

  const next = () => {
    const isLast = current + 1 >= total;
    if (isLast) {
      const finalScore = score + (selected === q.ans ? 1 : 0);
      const didPass    = finalScore >= Math.ceil(total * PASS_THRESHOLD);
      if (didPass) {
        earnXP(XP_REWARDS.chapterDone * 5, 'Certification exam passed!');
        unlockAchievement('certified');
      }
      setPhase('results');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setSubmitted(false);
    }
  };

  const partColors = { 1:'#ff6b6b', 2:'#51cf66', 3:'#4dabf7', 4:'#cc5de8', 5:'#f783ac', 6:'#74c0fc', 7:'#63e6be' };

  /* ── Intro ─────────────────────────────────────────────── */
  if (phase === 'intro') {
    return (
      <div style={{ maxWidth:680, margin:'0 auto', padding:'40px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:64, marginBottom:16 }}>🎓</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,5vw,42px)', fontWeight:900, marginBottom:12 }}>
            GitVerse Certification Exam
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:16, lineHeight:1.7, maxWidth:520, margin:'0 auto 24px' }}>
            30 questions spanning all 7 parts. Pass with 80% or higher to earn your shareable certificate. All your knowledge — tested in one go.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 }}>
          {[
            { label:'Questions', val:'30', icon:'❓', color:'#4dabf7' },
            { label:'Pass Rate',  val:'80%', icon:'🎯', color:'#51cf66' },
            { label:'Parts',      val:'All 7', icon:'📚', color:'#cc5de8' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:s.color }}>{s.val}</div>
              <div style={{ color:'var(--text-muted)', fontSize:12 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress warning */}
        {completedCount < 15 && (
          <div style={{ background:'rgba(255,183,71,0.08)', border:'1px solid rgba(255,183,71,0.3)', borderRadius:'var(--radius-lg)', padding:'14px 18px', marginBottom:20 }}>
            <span style={{ color:'#ffb347', fontSize:13 }}>⚠️ You've completed {completedCount}/22 chapters. For best results, complete more chapters before taking the exam.</span>
          </div>
        )}

        {/* Name input */}
        <div style={{ marginBottom:24 }}>
          <label style={{ display:'block', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:12, marginBottom:8 }}>
            Your name for the certificate:
          </label>
          <input
            value={userName} onChange={e => setUserName(e.target.value)}
            placeholder="Your full name..."
            style={{ width:'100%', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'12px 16px', color:'var(--text-primary)', fontFamily:'var(--font-body)', fontSize:15, outline:'none', boxSizing:'border-box' }}
          />
        </div>

        <button onClick={() => setPhase('exam')} style={{ width:'100%', background:'var(--green)', color:'#000', border:'none', borderRadius:'var(--radius-lg)', padding:'16px', fontFamily:'var(--font-display)', fontSize:18, fontWeight:900, cursor:'pointer' }}>
          Begin Certification Exam →
        </button>
      </div>
    );
  }

  /* ── Exam ──────────────────────────────────────────────── */
  if (phase === 'exam') {
    const partColor = partColors[q.part] || 'var(--green)';
    return (
      <div style={{ maxWidth:640, margin:'0 auto', padding:'32px 24px' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ background:partColor+'20', color:partColor, fontFamily:'var(--font-mono)', fontSize:10, padding:'3px 10px', borderRadius:20, fontWeight:700 }}>Part {q.part}</span>
            <span style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:12 }}>{current+1} / {total}</span>
          </div>
          <span style={{ color:'var(--green)', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700 }}>{score} pts</span>
        </div>

        {/* Progress bar */}
        <div style={{ background:'var(--bg-card)', borderRadius:20, height:6, marginBottom:28, overflow:'hidden' }}>
          <div style={{ height:'100%', background:`linear-gradient(90deg,${partColor},${partColor}aa)`, width:`${(current/total)*100}%`, transition:'width 0.4s ease', borderRadius:20 }} />
        </div>

        {/* Question */}
        <div style={{ background:'var(--bg-elevated)', border:`1px solid ${partColor}30`, borderRadius:'var(--radius-xl)', padding:'24px 28px', marginBottom:16 }}>
          <p style={{ color:'var(--text-primary)', fontSize:18, lineHeight:1.65, fontWeight:500 }}>{q.q}</p>
        </div>

        {/* Options */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
          {q.opts.map((opt, i) => {
            const isSel = selected === i;
            const isCorr = submitted && i === q.ans;
            const isWrong = submitted && isSel && i !== q.ans;
            return (
              <button key={i} onClick={() => !submitted && setSelected(i)} style={{
                background: isCorr?'rgba(0,255,136,0.1)':isWrong?'rgba(255,107,107,0.1)':isSel?`${partColor}14`:'var(--bg-elevated)',
                border:`2px solid ${isCorr?'var(--green)':isWrong?'var(--red)':isSel?partColor:'var(--border)'}`,
                borderRadius:'var(--radius-lg)', padding:'14px 18px', cursor:submitted?'default':'pointer',
                textAlign:'left', color:isCorr?'var(--green)':isWrong?'var(--red)':isSel?partColor:'var(--text-secondary)',
                fontSize:15, lineHeight:1.5, transition:'all 0.12s', display:'flex', gap:12, alignItems:'flex-start',
              }}>
                <span style={{ width:26, height:26, borderRadius:'50%', border:`2px solid currentColor`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700 }}>
                  {submitted && isCorr ? '✓' : submitted && isWrong ? '✗' : String.fromCharCode(65+i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {!submitted ? (
          <button onClick={submit} disabled={selected===null} style={{ background:selected!==null?partColor:'var(--bg-card)', color:selected!==null?'#000':'var(--text-muted)', border:'none', borderRadius:'var(--radius-md)', padding:'13px 32px', fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700, cursor:selected!==null?'pointer':'default', transition:'all 0.15s' }}>
            Submit Answer
          </button>
        ) : (
          <button onClick={next} style={{ background:partColor, color:'#000', border:'none', borderRadius:'var(--radius-md)', padding:'13px 32px', fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700, cursor:'pointer' }}>
            {current+1>=total ? 'See Results →' : 'Next Question →'}
          </button>
        )}
      </div>
    );
  }

  /* ── Results ───────────────────────────────────────────── */
  if (phase === 'results') {
    const pct = Math.round(score / total * 100);
    return (
      <div style={{ maxWidth:680, margin:'0 auto', padding:'40px 24px', textAlign:'center' }}>
        <div style={{ fontSize:72, marginBottom:16 }}>{passed ? '🏆' : '📚'}</div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,5vw,42px)', fontWeight:900, color: passed?'var(--green)':'var(--amber)', marginBottom:12 }}>
          {passed ? 'Certified!' : 'Almost There!'}
        </h1>
        <p style={{ color:'var(--text-secondary)', fontSize:18, marginBottom:8 }}>
          {score} / {total} correct — {pct}%
        </p>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:32 }}>
          {passed ? `You passed! Need 80%, you got ${pct}%.` : `You need 80% (${Math.ceil(total*0.8)} correct). You got ${score}. Review weak areas in your Dashboard and try again.`}
        </p>

        {/* Per-part breakdown */}
        <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'24px', marginBottom:28, textAlign:'left' }}>
          <div style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>By Part</div>
          {[1,2,3,4,5,6,7].map(part => {
            const partQs   = EXAM_QUESTIONS.filter(q => q.part === part);
            const partAns  = answers.slice(0, partQs.length + answers.filter((_,i) => EXAM_QUESTIONS[i]?.part < part).length).filter((_,i) => EXAM_QUESTIONS[i]?.part === part);
            const correct  = answers.filter((a, i) => EXAM_QUESTIONS[i]?.part === part && a.correct).length;
            const total_p  = partQs.length;
            const pctPart  = total_p ? Math.round(correct/total_p*100) : 0;
            const pColor   = partColors[part];
            return (
              <div key={part} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                <span style={{ color:pColor, fontFamily:'var(--font-mono)', fontSize:11, width:60, flexShrink:0 }}>Part {part}</span>
                <div style={{ flex:1, background:'var(--bg-card)', borderRadius:20, height:8, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:pColor, width:`${pctPart}%`, borderRadius:20, transition:'width 0.6s ease' }} />
                </div>
                <span style={{ color:pColor, fontFamily:'var(--font-mono)', fontSize:11, width:60, textAlign:'right', flexShrink:0 }}>{correct}/{total_p}</span>
              </div>
            );
          })}
        </div>

        {passed ? (
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => setPhase('certificate')} style={{ background:'var(--green)', color:'#000', border:'none', borderRadius:'var(--radius-lg)', padding:'14px 32px', fontFamily:'var(--font-display)', fontSize:16, fontWeight:900, cursor:'pointer' }}>
              🎓 View My Certificate →
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => { setPhase('exam'); setCurrent(0); setSelected(null); setSubmitted(false); setAnswers([]); setScore(0); }} style={{ background:'var(--amber)', color:'#000', border:'none', borderRadius:'var(--radius-lg)', padding:'14px 32px', fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700, cursor:'pointer' }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── Certificate ────────────────────────────────────────── */
  if (phase === 'certificate') {
    return (
      <div style={{ maxWidth:740, margin:'0 auto', padding:'40px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:900, color:'var(--green)', marginBottom:8 }}>Your Certificate</h1>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>Screenshot or print this page to save your certificate.</p>
        </div>
        <div ref={certRef}>
          <CertificateCard
            name={userName || 'Git Learner'}
            score={score}
            total={total}
            date={completionDate}
            level={currentLevel.title}
          />
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:24, flexWrap:'wrap' }}>
          <button onClick={() => window.print()} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)', borderRadius:'var(--radius-md)', padding:'10px 24px', fontFamily:'var(--font-mono)', fontSize:13, cursor:'pointer' }}>
            🖨️ Print Certificate
          </button>
          <button onClick={() => { setPhase('intro'); setCurrent(0); setSelected(null); setSubmitted(false); setAnswers([]); setScore(0); }} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:'var(--radius-md)', padding:'10px 24px', fontFamily:'var(--font-mono)', fontSize:13, cursor:'pointer' }}>
            ← Back
          </button>
        </div>
      </div>
    );
  }
}
