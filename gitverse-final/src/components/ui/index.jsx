import React, { useState, useEffect } from 'react';

/* ── ProgressRing ─────────────────────────────────────── */
export function ProgressRing({ progress, size = 48, color = 'var(--green)', strokeWidth = 3 }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (progress / 100);
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={size > 40 ? 11 : 9}
        fontFamily="var(--font-mono)" fontWeight="600">
        {progress}%
      </text>
    </svg>
  );
}

/* ── AnimatedCounter ──────────────────────────────────── */
export function AnimatedCounter({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = value / 40;
    const timer = setInterval(() => {
      current += step;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count}{suffix}</span>;
}

/* ── CopyButton ───────────────────────────────────────── */
export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button onClick={copy} style={{
      background: 'transparent',
      border: `1px solid ${copied ? 'var(--green)' : 'var(--border)'}`,
      color: copied ? 'var(--green)' : 'var(--text-muted)',
      padding: '3px 10px', borderRadius: 'var(--radius-sm)',
      cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11,
      transition: 'all var(--transition-fast)',
    }}>
      {copied ? '✓ copied' : 'copy'}
    </button>
  );
}

/* ── Badge ────────────────────────────────────────────── */
export function Badge({ children, color = 'var(--green)', style: extra = {} }) {
  return (
    <span style={{
      background: color + '25', color,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600,
      display: 'inline-block',
      ...extra,
    }}>
      {children}
    </span>
  );
}

/* ── Notification Toast ───────────────────────────────── */
export function Notification({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  const isSuccess = type === 'success';
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: isSuccess ? 'var(--green-glow)' : 'rgba(255,107,107,0.15)',
      border: `1px solid ${isSuccess ? 'rgba(0,255,136,0.3)' : 'rgba(255,107,107,0.4)'}`,
      color: isSuccess ? 'var(--green)' : 'var(--red)',
      padding: '12px 20px', borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-mono)', fontSize: 13,
      boxShadow: 'var(--shadow-md)',
      animation: 'fadeInUp 0.3s ease',
      maxWidth: 320,
    }}>
      {message}
    </div>
  );
}

/* ── ReadingProgressBar ───────────────────────────────── */
export function ReadingProgressBar({ progress, color = 'var(--green)' }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 3, zIndex: 200, background: 'var(--border)',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: `linear-gradient(90deg, ${color}, var(--blue))`,
        transition: 'width 0.1s linear',
        boxShadow: `0 0 8px ${color}60`,
      }} />
    </div>
  );
}

/* ── Kbd ──────────────────────────────────────────────── */
export function Kbd({ children }) {
  return (
    <kbd style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-bright)',
      borderRadius: 4, padding: '1px 6px',
      fontFamily: 'var(--font-mono)', fontSize: 11,
      color: 'var(--text-secondary)',
      boxShadow: '0 1px 0 var(--border-bright)',
    }}>
      {children}
    </kbd>
  );
}

/* ── Divider ──────────────────────────────────────────── */
export function Divider({ style: extra = {} }) {
  return (
    <div style={{
      height: 1, background: 'var(--border)',
      margin: '24px 0', ...extra,
    }} />
  );
}

/* ═══════════════════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
═══════════════════════════════════════════════════════ */
import { useApp } from '../../context/AppContext';

export function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', zIndex:9999, display:'flex', flexDirection:'column', gap:8, alignItems:'center', pointerEvents:'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background:'var(--bg-elevated)', border:`1px solid ${t.color}55`,
          borderRadius:40, padding:'9px 20px',
          display:'flex', gap:9, alignItems:'center',
          boxShadow:`0 4px 24px ${t.color}30, 0 0 0 1px ${t.color}22`,
          animation:'toastPop 0.35s cubic-bezier(0.22,1,0.36,1) both',
          pointerEvents:'none', whiteSpace:'nowrap',
        }}>
          <span style={{ fontSize:16 }}>{t.icon}</span>
          <span style={{ color:t.color, fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700 }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
