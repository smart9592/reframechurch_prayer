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

const BODY_SIZE: Record<FontSize, string> = {
  small: "text-base",
  medium: "text-lg",
  large: "text-xl",
};

const TITLE_SIZE: Record<FontSize, string> = {
  small: "text-xl",
  medium: "text-2xl",
  large: "text-3xl",
};

export default function PrayerSlides({
  slides,
  docTitle,
  docSubtitle,
  bookmarkKey,
  backHref,
  backLabel,
}: Props) {
  const [index, setIndex] = useState(0);
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [ready, setReady] = useState(false);
  const total = slides.length;

  // Load bookmark + font size on mount
  useEffect(() => {
    const savedIdx = window.localStorage.getItem(bookmarkKey);
    if (savedIdx) {
      const n = parseInt(savedIdx, 10);
      if (Number.isFinite(n) && n >= 0 && n < total) setIndex(n);
    }
    const savedFont = window.localStorage.getItem(FONT_KEY) as FontSize | null;
    if (savedFont && ["small", "medium", "large"].includes(savedFont)) {
      setFontSize(savedFont);
    }
    setReady(true);
  }, [bookmarkKey, total]);

  // Save bookmark on index change
  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(bookmarkKey, String(index));
  }, [index, bookmarkKey, ready]);

  // Save font size
  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(FONT_KEY, fontSize);
  }, [fontSize, ready]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(total - 1, i + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [total]);

  // Keyboard arrows (desktop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  // Touch swipe
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  const cycleFont = () => {
    setFontSize((f) => (f === "small" ? "medium" : f === "medium" ? "large" : "small"));
  };

  const fontLabel = fontSize === "small" ? "가" : fontSize === "medium" ? "가" : "가";
  const fontLabelClass =
    fontSize === "small" ? "text-sm" : fontSize === "medium" ? "text-base" : "text-lg";

  const slide = slides[index];
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;

  return (
    <div
      className="no-overscroll flex min-h-dvh flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-cream-200/60 bg-cream-50/85 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={backHref}
              className="flex items-center gap-1 text-sm text-clay-600 active:text-clay-500"
            >
              <span className="text-lg leading-none">←</span>
              <span className="truncate">{backLabel}</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs tabular-nums text-ink-700/60">
                {index + 1} / {total}
              </span>
              <button
                onClick={cycleFont}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-cream-200 bg-white/70 active:bg-cream-100"
                aria-label="글자 크기 조절"
              >
                <span className={`font-bold text-ink-800 ${fontLabelClass}`}>
                  {fontLabel}
                </span>
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full bg-clay-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Slide content */}
      <article className="flex-1 px-5 py-8">
        <div className="mx-auto max-w-md">
          <p className="mb-2 text-xs uppercase tracking-wider text-clay-600/80">
            {docTitle}
          </p>
          {slide.title && (
            <h2
              className={`font-serif font-bold leading-tight text-ink-800 ${TITLE_SIZE[fontSize]}`}
            >
              {slide.title}
            </h2>
          )}
          {slide.subtitle && (
            <p className="mt-1 text-sm text-ink-700/70">{slide.subtitle}</p>
          )}

          <div className={`mt-6 space-y-5 text-ink-800 ${BODY_SIZE[fontSize]}`}>
            {slide.body.map((p, i) => (
              <p key={i} className="prayer-body">
                {p}
              </p>
            ))}
          </div>

          {slide.continues && (
            <p className="mt-8 text-right text-sm text-clay-600/80">
              이어집니다 →
            </p>
          )}
        </div>
      </article>

      {/* Bottom controls */}
      <nav className="sticky bottom-0 border-t border-cream-200/60 bg-cream-50/85 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={goPrev}
            disabled={index === 0}
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-cream-200 bg-white/60 text-ink-800 transition active:scale-[0.98] disabled:opacity-40"
          >
            ← 이전
          </button>
          <button
            onClick={goNext}
            disabled={index === total - 1}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-clay-500 text-white transition active:scale-[0.98] disabled:opacity-40"
          >
            다음 →
          </button>
        </div>
      </nav>
    </div>
  );
}
