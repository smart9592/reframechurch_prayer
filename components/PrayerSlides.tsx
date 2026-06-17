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

const SECTION_HEADERS = new Set([
  "시작하는 기도", "첫 번째 파수", "두 번째 파수", "세 번째 파수",
]);

function processSlide(slide: Slide) {
  if (slide.title === "시작하는 기도" || SECTION_HEADERS.has(slide.title)) {
    let label = "";
    let body = [...slide.body];

    // subtitle이 짧은 라벨이면 꺾쇠로
    if (slide.subtitle && !slide.subtitle.startsWith("(")) {
      label = slide.subtitle.replace(/:$/, "").trim();
    }
    // subtitle 없으면 body 첫줄에서 추출
    if (!label && body.length > 0 && body[0].includes("\n")) {
      const [first, ...rest] = body[0].split("\n");
      if (first.trim().length < 25) {
        label = first.trim().replace(/:$/, "");
        body[0] = rest.join("\n").trim();
        if (!body[0]) body.shift();
      }
    }
    return { header: slide.title, label, body };
  }

  // 그 외: plain 제목, 꺾쇠 없음
  let body = [...slide.body];
  if (slide.subtitle && !slide.subtitle.startsWith("(")) {
    body = [slide.subtitle.replace(/:$/, ""), ...body];
  }
  return { header: slide.title.replace(/:$/, "").trim(), label: "", body };
}

export default function PrayerSlides({
  slides, docTitle, bookmarkKey, backHref, backLabel,
}: Props) {
  const [index, setIndex] = useState(0);
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveMsg, setSaveMsg] = useState("");
  const total = slides.length;

  // 폰트 크기만 복원, 위치는 항상 첫 페이지부터
  useEffect(() => {
    const savedFont = window.localStorage.getItem(FONT_KEY) as FontSize | null;
    if (savedFont && ["small", "medium", "large"].includes(savedFont)) {
      setFontSize(savedFont);
    }
    // 저장된 북마크 위치 표시용으로만 읽기
    const raw = window.localStorage.getItem(bookmarkKey);
    const n = raw ? parseInt(raw, 10) : null;
    if (n !== null && Number.isFinite(n) && n > 0 && n < total) setSavedAt(n);
  }, [bookmarkKey, total]);

  useEffect(() => {
    window.localStorage.setItem(FONT_KEY, fontSize);
  }, [fontSize]);

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
      if (dx < 0) goNext(); else goPrev();
    }
  };

  // 현재 위치 저장 버튼
  const handleSave = () => {
    window.localStorage.setItem(bookmarkKey, String(index));
    setSavedAt(index);
    setSaveMsg(`${index + 1}번째 슬라이드 저장됨`);
    setTimeout(() => setSaveMsg(""), 2000);
  };

  // 저장된 위치로 이동
  const goToSaved = () => {
    if (savedAt !== null) {
      setIndex(savedAt);
      window.scrollTo({ top: 0 });
    }
  };

  const cycleFont = () =>
    setFontSize((f) => f === "small" ? "medium" : f === "medium" ? "large" : "small");
  const fontLabelClass =
    fontSize === "small" ? "text-sm" : fontSize === "medium" ? "text-base" : "text-lg";

  const slide = slides[index];
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;
  const { header, label, body } = processSlide(slide);

  return (
    <div className="no-overscroll flex min-h-dvh flex-col"
         onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* 상단 바 */}
      <header className="sticky top-0 z-10 border-b border-cream-200/60 bg-cream-50/85 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href={backHref}
              className="flex items-center gap-1 text-sm text-clay-600 active:text-clay-500">
              <span className="text-lg leading-none">←</span>
              <span className="truncate">{backLabel}</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs tabular-nums text-ink-700/60">{index + 1} / {total}</span>
              <button onClick={cycleFont}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-cream-200 bg-white/70 active:bg-cream-100"
                aria-label="글자 크기 조절">
                <span className={`font-bold text-ink-800 ${fontLabelClass}`}>가</span>
              </button>
            </div>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream-200">
            <div className="h-full bg-clay-400 transition-all duration-300"
                 style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* 저장 위치 이어보기 배너 (저장된 위치가 있고 현재 위치와 다를 때) */}
        {savedAt !== null && savedAt !== index && (
          <div className="border-t border-cream-200/60 bg-cream-100/80 px-4 py-2">
            <div className="mx-auto flex max-w-md items-center justify-between">
              <span className="text-xs text-ink-700/70">
                📌 {savedAt + 1}번째 슬라이드에서 저장됨
              </span>
              <button onClick={goToSaved}
                className="text-xs font-medium text-clay-600 underline underline-offset-2">
                이어보기
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 본문 */}
      <article className="flex-1 px-5 py-8">
        <div className="mx-auto max-w-md">
          <p className="mb-3 text-xs uppercase tracking-wider text-clay-600/80">{docTitle}</p>

          {header && (
            <h2 className={`font-serif font-bold leading-tight text-ink-800 ${HEADER_SIZE[fontSize]}`}>
              {header}
            </h2>
          )}

          {label && (
            <p className={`font-serif font-semibold text-clay-700 mt-1 ${
              SECTION_HEADERS.has(slide.title) ? LABEL_SIZE[fontSize] : HEADER_SIZE[fontSize]
            }`}>
              &lt;{label}&gt;
            </p>
          )}

          <div className={`mt-6 space-y-5 text-ink-800 ${BODY_SIZE[fontSize]}`}>
            {body.map((p, i) => (
              <p key={i} className="prayer-body">{p}</p>
            ))}
          </div>

          {slide.continues && (
            <p className="mt-8 text-right text-sm text-clay-600/80">이어집니다 →</p>
          )}
        </div>
      </article>

      {/* 하단 버튼 */}
      <nav className="sticky bottom-0 border-t border-cream-200/60 bg-cream-50/85 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3 space-y-2">
          {/* 저장 버튼 */}
          <div className="flex justify-center">
            <button onClick={handleSave}
              className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-white/70 px-4 py-1.5 text-xs font-medium text-ink-700/80 transition active:scale-[0.98]">
              📌 현재 위치 저장
              {saveMsg && (
                <span className="ml-1 text-clay-600">{saveMsg}</span>
              )}
            </button>
          </div>
          {/* 이전/다음 */}
          <div className="flex gap-2">
            <button onClick={goPrev} disabled={index === 0}
              className="flex h-12 flex-1 items-center justify-center rounded-xl border border-cream-200 bg-white/60 text-ink-800 transition active:scale-[0.98] disabled:opacity-40">
              ← 이전
            </button>
            <button onClick={goNext} disabled={index === total - 1}
              className="flex h-12 flex-1 items-center justify-center rounded-xl bg-clay-500 text-white transition active:scale-[0.98] disabled:opacity-40">
              다음 →
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
