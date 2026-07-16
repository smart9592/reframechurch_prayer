"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Slide, SlideWithSection } from "@/lib/prayers";

type SectionNav = { label: string; href?: string; onClick?: () => void };
type TocItem = { label: string; sublabel?: string; href?: string; onClick?: () => void };

type Props = {
  slides: (Slide | SlideWithSection)[];
  docTitle: string;
  docSubtitle: string;
  bookmarkKey: string;
  backHref: string;
  backLabel: string;
  homeHref?: string;
  initialIndex?: number;
  prevSection?: SectionNav;
  nextSection?: SectionNav;
  allSectionsList?: { title: string; slug: string }[];
  sectionStartMap?: Record<string, number>;
  tocItems?: TocItem[];
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
  if (SECTION_HEADERS.has(slide.title)) {
    let label = "";
    let body = [...slide.body];
    if (slide.subtitle && !slide.subtitle.startsWith("(")) {
      label = slide.subtitle.replace(/:$/, "").trim();
    }
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
  let body = [...slide.body];
  if (slide.subtitle && !slide.subtitle.startsWith("(")) {
    body = [slide.subtitle.replace(/:$/, ""), ...body];
  }
  return { header: slide.title.replace(/:$/, "").trim(), label: "", body };
}

function NavButton({ nav }: { nav: SectionNav }) {
  const style = {
    background: "none", border: "none", cursor: "pointer",
    color: "#B8956A", fontSize: "12px", fontWeight: 500,
    display: "flex", alignItems: "center", gap: "3px", padding: 0,
  } as React.CSSProperties;
  if (nav.href) {
    return <Link href={nav.href} style={{ ...style, textDecoration: "none" }}>{nav.label}</Link>;
  }
  return <button style={style} onClick={nav.onClick}>{nav.label}</button>;
}

// ── TOC 드로어 ───────────────────────────────────────────────────────────
function TOCDrawer({
  open, onClose, items, docTitle,
}: {
  open: boolean;
  onClose: () => void;
  items: TocItem[];
  docTitle: string;
}) {
  return (
    <>
      {open && (
        <div onClick={onClose} className="fixed inset-0 z-40 bg-black/30" />
      )}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-cream-50 shadow-xl"
        style={{
          width: "72%", maxWidth: "280px",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="flex items-center justify-between border-b border-cream-200 px-4 py-3">
          <span className="font-serif text-sm font-bold text-ink-800">목차</span>
          <button onClick={onClose} className="px-1 text-lg text-ink-700/50">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {items.map((item, i) => {
            const inner = (
              <>
                {item.sublabel && (
                  <p className="mb-0.5 text-[10px] font-medium text-ink-700/50">{item.sublabel}</p>
                )}
                <span className="font-serif text-sm font-bold text-ink-800 leading-snug">
                  {item.label}
                </span>
              </>
            );
            const cls = "w-full text-left border-l-[3px] border-transparent px-4 py-3 transition-colors hover:bg-cream-100 active:bg-cream-200";
            if (item.href) {
              return (
                <Link key={i} href={item.href} onClick={onClose}
                  className={cls + " block no-underline"}>
                  {inner}
                </Link>
              );
            }
            return (
              <button key={i} onClick={() => { item.onClick?.(); onClose(); }} className={cls}>
                {inner}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── 햄버거 아이콘 ────────────────────────────────────────────────────────
function HamburgerIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
      <rect y="0" width="14" height="1.5" rx="0.75" fill="#3D2F1F" />
      <rect y="5" width="14" height="1.5" rx="0.75" fill="#3D2F1F" />
      <rect y="10" width="14" height="1.5" rx="0.75" fill="#3D2F1F" />
    </svg>
  );
}

export default function PrayerSlides({
  slides, docTitle, bookmarkKey, backHref, backLabel,
  homeHref, initialIndex = 0,
  prevSection: prevSectionProp, nextSection: nextSectionProp,
  allSectionsList, sectionStartMap,
  tocItems,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [tocOpen, setTocOpen] = useState(false);
  const total = slides.length;

  const isAllMode = !!allSectionsList && !!sectionStartMap;
  const currentSlide = slides[index] as SlideWithSection;
  const currentSectionTitle = isAllMode
    ? (currentSlide.sectionTitle || docTitle)
    : docTitle;

  const currentSectionIdx = isAllMode
    ? (allSectionsList?.findIndex(s => s.title === currentSectionTitle) ?? -1)
    : -1;

  const prevSection: SectionNav | undefined = isAllMode && currentSectionIdx > 0
    ? {
        label: `← ${allSectionsList![currentSectionIdx - 1].title}`,
        onClick: () => {
          const t = allSectionsList![currentSectionIdx - 1].title;
          setIndex(sectionStartMap![t] ?? 0);
          window.scrollTo({ top: 0 });
        },
      }
    : prevSectionProp;

  const nextSection: SectionNav | undefined = isAllMode && currentSectionIdx < (allSectionsList?.length ?? 0) - 1
    ? {
        label: `${allSectionsList![currentSectionIdx + 1].title} →`,
        onClick: () => {
          const t = allSectionsList![currentSectionIdx + 1].title;
          setIndex(sectionStartMap![t] ?? 0);
          window.scrollTo({ top: 0 });
        },
      }
    : nextSectionProp;

  // 전체보기 모드일 때 TOC 자동 생성 (섹션 클릭 → 슬라이드 점프)
  const autoTocItems: TocItem[] | undefined = isAllMode
    ? allSectionsList!.map(s => ({
        label: s.title,
        onClick: () => {
          setIndex(sectionStartMap![s.title] ?? 0);
          window.scrollTo({ top: 0 });
        },
      }))
    : undefined;

  // 명시적 tocItems 우선, 없으면 자동 생성
  const effectiveTocItems = tocItems ?? autoTocItems;

  useEffect(() => {
    const savedFont = window.localStorage.getItem(FONT_KEY) as FontSize | null;
    if (savedFont && ["small", "medium", "large"].includes(savedFont)) setFontSize(savedFont);
    const raw = window.localStorage.getItem(bookmarkKey);
    const n = raw ? parseInt(raw, 10) : null;
    if (n !== null && Number.isFinite(n) && n > 0 && n < total) setSavedAt(n);
  }, [bookmarkKey, total]);

  useEffect(() => { window.localStorage.setItem(FONT_KEY, fontSize); }, [fontSize]);

  const goPrev = useCallback(() => {
    setIndex(i => Math.max(0, i - 1));
    window.scrollTo({ top: 0 });
  }, []);

  const goNext = useCallback(() => {
    setIndex(i => Math.min(total - 1, i + 1));
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

  const handleSave = () => {
    window.localStorage.setItem(bookmarkKey, String(index));
    setSavedAt(index);
    setSaveMsg(`${index + 1}번째 슬라이드 저장됨`);
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const goToSaved = () => {
    if (savedAt !== null) { setIndex(savedAt); window.scrollTo({ top: 0 }); }
  };

  const cycleFont = () =>
    setFontSize(f => f === "small" ? "medium" : f === "medium" ? "large" : "small");
  const fontLabelClass =
    fontSize === "small" ? "text-sm" : fontSize === "medium" ? "text-base" : "text-lg";

  const slide = slides[index];
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;
  const { header, label, body } = processSlide(slide);

  return (
    <div className="no-overscroll flex min-h-dvh flex-col"
         onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      <header className="sticky top-0 z-10 border-b border-cream-200/60 bg-cream-50/85 backdrop-blur">
        <div className="mx-auto max-w-md px-4">
          {/* 이전섹션 / 홈 / 다음섹션+햄버거 */}
          <div className="flex items-center justify-between pt-3 pb-1">
            <div className="flex-1 flex justify-start">
              {prevSection ? <NavButton nav={prevSection} /> : <div className="w-16" />}
            </div>
            <Link href={homeHref ?? "/"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-cream-200 bg-white/70 active:bg-cream-100 text-base"
              aria-label="홈으로">
              🏠
            </Link>
            <div className="flex-1 flex justify-end items-center gap-2">
              {effectiveTocItems && (
                <button
                  onClick={() => setTocOpen(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-cream-200 bg-white/70 active:bg-cream-100"
                  aria-label="목차">
                  <HamburgerIcon />
                </button>
              )}
            </div>
          </div>

          {/* 섹션명 + 슬라이드 번호 + 글자크기 */}
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-clay-700">
              {currentSectionTitle}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs tabular-nums text-ink-700/60">{index + 1} / {total}</span>
              <button onClick={cycleFont}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-cream-200 bg-white/70 active:bg-cream-100"
                aria-label="글자 크기">
                <span className={`font-bold text-ink-800 ${fontLabelClass}`}>가</span>
              </button>
            </div>
          </div>
        </div>

        <div className="h-0.5 bg-cream-200">
          <div className="h-full bg-clay-400 transition-all duration-300"
               style={{ width: `${progress}%` }} />
        </div>

        {savedAt !== null && savedAt !== index && (
          <div className="border-t border-cream-200/60 bg-cream-100/80 px-4 py-2">
            <div className="mx-auto flex max-w-md items-center justify-between">
              <span className="text-xs text-ink-700/70">📌 {savedAt + 1}번째 슬라이드에서 저장됨</span>
              <button onClick={goToSaved}
                className="text-xs font-medium text-clay-600 underline underline-offset-2">
                이어보기
              </button>
            </div>
          </div>
        )}
      </header>

      <article className="flex-1 px-5 py-8">
        <div className="mx-auto max-w-md">
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
            {body.map((p, i) => <p key={i} className="prayer-body">{p}</p>)}
          </div>
          {slide.continues && (
            <p className="mt-8 text-right text-sm text-clay-600/80">이어집니다 →</p>
          )}
        </div>
      </article>

      <nav className="sticky bottom-0 border-t border-cream-200/60 bg-cream-50/85 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3 space-y-2">
          <div className="flex justify-center">
            <button onClick={handleSave}
              className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-white/70 px-4 py-1.5 text-xs font-medium text-ink-700/80">
              📌 현재 위치 저장
              {saveMsg && <span className="ml-1 text-clay-600">{saveMsg}</span>}
            </button>
          </div>
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

      {effectiveTocItems && (
        <TOCDrawer
          open={tocOpen}
          onClose={() => setTocOpen(false)}
          items={effectiveTocItems}
          docTitle={docTitle}
        />
      )}
    </div>
  );
}
