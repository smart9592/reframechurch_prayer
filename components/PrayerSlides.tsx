"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Slide } from "@/lib/prayers";

type Props = {
  slides: Slide[];
  docTitle: string;
  docSubtitle: string;
  bookmarkKey: string;
  backHref: string;
  backLabel: string;
};

type FontSize = "small" | "medium" | "large";
const FONT_KEY = "settings:fontSize";
const BODY_SIZE: Record<FontSize, string> = { small: "text-base", medium: "text-lg", large: "text-xl" };
const TITLE_SIZE: Record<FontSize, string> = { small: "text-xl", medium: "text-2xl", large: "text-3xl" };

const SECTION_HEADERS = new Set([
  "시작하는 기도", "첫 번째 파수", "두 번째 파수", "세 번째 파수",
]);

function resolveDisplay(slide: Slide) {
  const title = slide.title.replace(/:$/, "").trim();
  const subtitle = slide.subtitle.replace(/:$/, "").trim();
  const isRepeat = /기도 \(/.test(slide.title);
  const isShortLabel = subtitle.length > 0 && subtitle.length < 60 && !subtitle.startsWith("(");
  const subtitleIsBody = subtitle.length >= 60;
  const bodyLines = subtitleIsBody && subtitle ? [subtitle, ...slide.body] : slide.body;

  if (SECTION_HEADERS.has(slide.title)) {
    return { sectionHeader: title, labelText: isShortLabel ? subtitle : "", bodyLines };
  }
  if (isRepeat) {
    return { sectionHeader: "", labelText: isShortLabel ? subtitle : "", bodyLines: slide.body };
  }
  if (subtitle.startsWith("(")) {
    return { sectionHeader: title, labelText: "", bodyLines: slide.body };
  }
  return { sectionHeader: "", labelText: title, bodyLines };
}

export default function PrayerSlides({ slides, docTitle, bookmarkKey, backHref, backLabel }: Props) {
  const [index, setIndex] = useState(0);
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [ready, setReady] = useState(false);
  const total = slides.length;

  useEffect(() => {
    const savedIdx = window.localStorage.getItem(bookmarkKey);
    if (savedIdx) {
      const n = parseInt(savedIdx, 10);
      if (Number.isFinite(n) && n >= 0 && n < total) setIndex(n);
    }
    const savedFont = window.localStorage.getItem(FONT_KEY) as FontSize | null;
    if (savedFont && ["small", "medium", "large"].includes(savedFont)) setFontSize(savedFont);
    setReady(true);
  }, [bookmarkKey, total]);

  useEffect(() => { if (ready) window.localStorage.setItem(bookmarkKey, String(index)); }, [index, bookmarkKey, ready]);
  useEffect(() => { if (ready) window.localStorage.setItem(FONT_KEY, fontSize); }, [fontSize, ready]);

  const goPrev = useCallback(() => { setIndex((i) => Math.max(0, i - 1)); window.scrollTo({ top: 0 }); }, []);
  const goNext = useCallback(() => { setIndex((i) => Math.min(total - 1, i + 1)); window.scrollTo({ top: 0 }); }, [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowLeft") goPrev(); else if (e.key === "ArrowRight") goNext(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { if (dx < 0) goNext(); else goPrev(); }
  };

  const cycleFont = () => setFontSize((f) => f === "small" ? "medium" : f === "medium" ? "large" : "small");
  const fontLabelClass = fontSize === "small" ? "text-sm" : fontSize === "medium" ? "text-base" : "text-lg";
  const slide = slides[index];
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;
  const { sectionHeader, labelText, bodyLines } = resolveDisplay(slide);

  return (
    <div className="no-overscroll flex min-h-dvh flex-col" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <header className="sticky top-0 z-10 border-b border-cream-200/60 bg-cream-50/85 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href={backHref} className="flex items-center gap-1 text-sm text-clay-600 active:text-clay-500">
              <span className="text-lg leading-none">←</span>
              <span className="truncate">{backLabel}</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs tabular-nums text-ink-700/60">{index + 1} / {total}</span>
              <button onClick={cycleFont} className="flex h-8 w-8 items-center justify-center rounded-full border border-cream-200 bg-white/70 active:bg-cream-100" aria-label="글자 크기 조절">
                <span className={`font-bold text-ink-800 ${fontLabelClass}`}>가</span>
              </button>
            </div>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream-200">
            <div className="h-full bg-clay-400 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <article className="flex-1 px-5 py-8">
        <div className="mx-auto max-w-md">
          <p className="mb-3 text-xs uppercase tracking-wider text-clay-600/80">{docTitle}</p>
          {sectionHeader && (
            <h2 className={`font-serif font-bold leading-tight text-ink-800 ${TITLE_SIZE[fontSize]}`}>
              {sectionHeader}
            </h2>
          )}
          {labelText && (
            <p className={`font-serif font-semibold text-clay-700 mt-1 ${sectionHeader ? "text-base" : TITLE_SIZE[fontSize]}`}>
              &lt;{labelText}&gt;
            </p>
          )}
          <div className={`mt-6 space-y-5 text-ink-800 ${BODY_SIZE[fontSize]}`}>
            {bodyLines.map((p, i) => <p key={i} className="prayer-body">{p}</p>)}
          </div>
          {slide.continues && <p className="mt-8 text-right text-sm text-clay-600/80">이어집니다 →</p>}
        </div>
      </article>

      <nav className="sticky bottom-0 border-t border-cream-200/60 bg-cream-50/85 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3">
          <button onClick={goPrev} disabled={index === 0} className="flex h-12 flex-1 items-center justify-center rounded-xl border border-cream-200 bg-white/60 text-ink-800 transition active:scale-[0.98] disabled:opacity-40">← 이전</button>
          <button onClick={goNext} disabled={index === total - 1} className="flex h-12 flex-1 items-center justify-center rounded-xl bg-clay-500 text-white transition active:scale-[0.98] disabled:opacity-40">다음 →</button>
        </div>
      </nav>
    </div>
  );
}
