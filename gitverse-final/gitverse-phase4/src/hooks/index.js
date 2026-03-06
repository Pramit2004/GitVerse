import { useState, useEffect, useCallback, useRef } from 'react';
import { CHAPTERS } from '../data/chapters';
import { getChapterContent } from '../data/chapterContent';

/* ── useReadingProgress ───────────────────────────────── */
export function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.round((scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return progress;
}

/* ── useKeyboard ──────────────────────────────────────── */
export function useKeyboard(handlers) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't fire when typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const handler = handlers[e.key];
      if (handler) { e.preventDefault(); handler(e); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

/* ── useSearch ────────────────────────────────────────── */
export function useSearch(query) {
  const results = [];
  if (!query || query.trim().length < 2) return results;

  const q = query.toLowerCase();

  CHAPTERS.forEach(chapter => {
    const content = getChapterContent(chapter.id);
    const titleMatch = chapter.title.toLowerCase().includes(q);
    const subtitleMatch = content?.subtitle?.toLowerCase().includes(q);

    // Search section content
    const sectionMatches = [];
    content?.sections?.forEach(section => {
      const text = [section.heading, section.content, ...(section.points || [])].join(' ').toLowerCase();
      if (text.includes(q)) {
        sectionMatches.push(section.heading || section.type);
      }
    });

    // Search quiz questions
    const quizMatches = content?.quiz?.filter(q2 =>
      q2.question.toLowerCase().includes(q)
    ).length || 0;

    if (titleMatch || subtitleMatch || sectionMatches.length > 0 || quizMatches > 0) {
      results.push({
        chapter,
        titleMatch,
        subtitleMatch,
        sectionMatches,
        quizMatches,
        relevance: (titleMatch ? 10 : 0) + (subtitleMatch ? 5 : 0) + sectionMatches.length + quizMatches,
      });
    }
  });

  return results.sort((a, b) => b.relevance - a.relevance);
}

/* ── useLocalStorage ──────────────────────────────────── */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch { return defaultValue; }
  });

  const set = useCallback((val) => {
    setValue(val);
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key]);

  return [value, set];
}

/* ── useMediaQuery ────────────────────────────────────── */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/* ── useIsMobile ──────────────────────────────────────── */
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}
