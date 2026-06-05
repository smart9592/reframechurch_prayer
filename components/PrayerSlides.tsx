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
const HEADER_SIZE: Record<FontSize, string> = { small: "text-xl", medium: "text-2xl", large: "text-3xl" };
const LABEL_SIZE: Record<FontSize, string> = { small: "text-base", medium: "text-lg", large: "text-xl" };

// 파싱 잔여물 제거 패턴
const GARBAGE = /^(제\d+시 기도|자정 기도)\s*[\(\（]/;

function cleanBody(lines: string[]): string[] {
  return lines
    .map(l => l.trim())
    .filter(l => l && l !== "End" && !GARBAGE.test(l));
}

// ── 새 display 규칙 ────────────────────────────────────────────────────────
// 1. title === "시작하는 기도" → h2 유지 + subtitle 또는 body 첫줄을 <꺾쇠>
// 2. 그 외 모든 title      → 꺾쇠 없이 plain h2
function processSlide(slide: Slide) {
  if (slide.title === "시작하는 기도") {
    let label = "";
    let body = cleanBody(slide.body);

    // subtitle이 짧은 라벨이면 사용
    if (slide.subtitle && !slide.subtitle.startsWith("(")) {
      label = slide.subtitle.replace(/:$/, "").trim();
    }

    // subtitle 없으면 body 첫 줄에서 라벨 추출
    if (!label && body.length > 0) {
      const lines = body[0].split("\n");
      const firstLine = lines[0].trim();
      if (firstLine.length < 25 && !firstLine.endsWith(".") && !firstLine.endsWith(":")) {
        label = firstLine;
        const rest = lines.slice(1).join("\n").trim();
        body = rest ? [rest, ...body.slice(1)] : body.slice(1);
      }
    }

    return { header: "시작하는 기도", label, body };
  }

  // 그 외: plain 제목, 꺾쇠 없음
  let body = cleanBody(slide.body);

  // subtitle이 긴 본문이면 body 앞에 붙임 (괄호 시작은 제외)
  if (slide.subtitle && !slide.subtitle.startsWith("(") && slide.subtitle.trim()) {
    const cleanSub = slide.subtitle.replace(/제\d+시 기도[^"]*$/, "").trim();
    if (cleanSub) body = [cleanSub, ...body];
  }

  return {
    header: slide.title.replace(/:$/, "").trim(),
    label: "",
    body,
  };
}

export default function PrayerSlides({
  slides,
  docTitle,
  bookmarkKey,
  backHref,
  backLabel,
}: Props) {
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

  useEffect(() => {
    if (ready) window.localStorage.setItem(bookmarkKey, String(index));
  }, [index, bookmarkKey, ready]);

  useEffect(() => {
    if (ready) window.localStorage.setItem(FONT_KEY, fontSize);
  }, [fontSize, ready]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0 });
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(total - 1, i + 1));
    window.scrollTo({ top: 0 });
  }, [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  const cycleFont = () =>
    setFontSize((f) => (f === "small" ? "medium" : f === "medium" ? "large" : "small"));
  const fontLabelClass =
    fontSize === "small" ? "text-sm" : fontSize === "medium" ? "text-base" : "text-lg";

  const slide = slides[index];
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;
  const { header, label, body } = processSlide(slide);

  return (
    <div
      className="no-overscroll flex min-h-dvh flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 상단 바 */}
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
                <span className={`font-bold text-ink-800 ${fontLabelClass}`}>가</span>
              </button>
            </div>
          </div>
          {/* 진행 바 */}
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full bg-clay-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* 본문 */}
      <article className="flex-1 px-5 py-8">
        <div className="mx-auto max-w-md">
          {/* 기도 이름 라벨 */}
          <p className="mb-3 text-xs uppercase tracking-wider text-clay-600/80">
            {docTitle}
          </p>

          {/* 헤더 */}
          {header && (
            <h2 className={`font-serif font-bold leading-tight text-ink-800 ${HEADER_SIZE[fontSize]}`}>
              {header}
            </h2>
          )}

          {/* <꺾쇠> 라벨 — 시작하는 기도 하위에만 표시 */}
          {label && (
            <p className={`font-serif font-semibold text-clay-700 mt-1 ${LABEL_SIZE[fontSize]}`}>
              &lt;{label}&gt;
            </p>
          )}

          {/* 본문 */}
          <div className={`mt-6 space-y-5 text-ink-800 ${BODY_SIZE[fontSize]}`}>
            {body.map((p, i) => (
              <p key={i} className="prayer-body">
                {p}
              </p>
            ))}
          </div>

          {slide.continues && (
            <p className="mt-8 text-right text-sm text-clay-600/80">이어집니다 →</p>
          )}
        </div>
      </article>

      {/* 하단 버튼 */}
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
