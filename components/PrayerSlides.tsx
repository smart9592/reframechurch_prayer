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

// change 6+8: 슬라이드 제목 표시 로직
// - 시작하는 기도 / 파수 등 섹션 헤더는 h2로 표시, subtitle은 <>로 표기
// - 본기도 슬라이드 (제Xsi 기도 (...)가 title인 경우) subtitle을 <>로 표기
// - 그 외 의미있는 title은 <>로 표기
const SECTION_HEADERS = new Set([
  "시작하는 기도",
  "첫 번째 파수",
  "두 번째 파수",
  "세 번째 파수",
]);

function resolveSlideDisplay(slide: Slide): {
  sectionHeader: string;   // 일반 h2 (섹션명, <> 없음)
  labelText: string;       // <> 로 감쌀 라벨
  bodyLines: string[];     // 본문
} {
  const title = slide.title.replace(/:$/, "").trim();
  const subtitle = slide.subtitle.replace(/:$/, "").trim();
  const isRepeatTitle = /기도 \(/.test(slide.title); // "제1시 기도 (아침기도..." 패턴
  const isSubtitleLabel = subtitle.length > 0 && subtitle.length < 60 && !subtitle.startsWith("(");

  // body에 subtitle을 앞에 추가해야 하는 경우 (subtitle이 긴 본문일 때)
  const subtitleIsBody = subtitle.length >= 60;
  const bodyLines = subtitleIsBody && subtitle
    ? [subtitle, ...slide.body]
    : slide.body;

  if (SECTION_HEADERS.has(slide.title)) {
    // 시작하는 기도 등: h2 유지, subtitle을 <> 라벨로
    return {
      sectionHeader: title,
      labelText: isSubtitleLabel ? subtitle : "",
      bodyLines,
    };
  }

  if (isRepeatTitle) {
    // 본기도 슬라이드: title이 기도명 반복 → subtitle을 <> 라벨로만
    return {
      sectionHeader: "",
      labelText: isSubtitleLabel ? subtitle : "",
      bodyLines: slide.body,
    };
  }

  // 인트로 슬라이드 (부제가 괄호로 시작하는 경우)
  if (subtitle.startsWith("(") || title === docTitle(slide)) {
    return {
      sectionHeader: title,
      labelText: "",
      bodyLines: slide.body,
    };
  }

  // 그 외 의미있는 title (기도문, 복음서, 주기도문 등) → <> 라벨
  return {
    sectionHeader: "",
    labelText: title || "",
    bodyLines: subtitleIsBody && subtitle ? [subtitle, ...slide.body] : slide.body,
  };
}

// 슬라이드 컨텍스트에서 docTitle 필요 없어서 더미로 처리
function docTitle(_slide: Slide): string { return ""; }

export default function PrayerSlides({
  slides,
  docTitle: prayerTitle,
  docSubtitle,
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
    if (savedFont && ["small", "medium", "large"].includes(savedFont)) {
      setFontSize(savedFont);
    }
    setReady(true);
  }, [bookmarkKey, total]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(bookmarkKey, String(index));
  }, [index, bookmarkKey, ready]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(FONT_KEY, fontSize);
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
    setFontSize((f) =>
      f === "small" ? "medium" : f === "medium" ? "large" : "small"
    );
  };

  const fontLabelClass =
    fontSize === "small" ? "text-sm" : fontSize === "medium" ? "text-base" : "text-lg";

  const slide = slides[index];
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;
  const { sectionHeader, labelText, bodyLines } = resolveSlideDisplay(slide);

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
                <span className={`font-bold text-ink-800 ${fontLabelClass}`}>
                  가
                </span>
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
          {/* 기도 이름 (작은 라벨) */}
          <p className="mb-3 text-xs uppercase tracking-wider text-clay-600/80">
            {prayerTitle}
          </p>

          {/* 섹션 헤더 (시작하는 기도 등, <> 없음) */}
          {sectionHeader && (
            <h2 className={`font-serif font-bold leading-tight text-ink-800 ${TITLE_SIZE[fontSize]}`}>
              {sectionHeader}
            </h2>
          )}

          {/* change 6+8: 내용 라벨을 <>로 표기 */}
          {labelText && (
            <p className={`font-serif font-semibold text-clay-700 mt-1 ${
              sectionHeader ? "text-base" : TITLE_SIZE[fontSize]
            }`}>
              &lt;{labelText}&gt;
            </p>
          )}

          {/* 본문 */}
          <div className={`mt-6 space-y-5 text-ink-800 ${BODY_SIZE[fontSize]}`}>
            {bodyLines.map((p, i) => (
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
