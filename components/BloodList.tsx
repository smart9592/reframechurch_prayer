"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BloodSummary, SlideWithSection } from "@/lib/prayers";
import { getAllBloodSlides } from "@/lib/prayers";

function readBookmark(slug: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(`bookmark:blood:${slug}`);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// 키워드 주변 스니펫 추출
function getSnippet(text: string, keyword: string): string {
  const lower = text.toLowerCase();
  const kl = keyword.toLowerCase();
  const i = lower.indexOf(kl);
  if (i === -1) return text.slice(0, 80);
  const start = Math.max(0, i - 20);
  const end = Math.min(text.length, i + keyword.length + 40);
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

// 키워드 하이라이트
function Highlight({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <span>
      {parts.map((p, i) =>
        p.toLowerCase() === keyword.toLowerCase()
          ? <mark key={i} className="bg-amber-200 rounded px-px">{p}</mark>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

export default function BloodList({ sections }: { sections: BloodSummary[] }) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [allSlides, setAllSlides] = useState<(SlideWithSection & { globalIdx: number })[]>([]);

  useEffect(() => {
    const map: Record<string, number> = {};
    for (const s of sections) map[s.slug] = readBookmark(s.slug);
    setBookmarks(map);
    // 전체 슬라이드 로드
    const slides = getAllBloodSlides();
    setAllSlides(slides.map((s, i) => ({ ...s, globalIdx: i })));
  }, [sections]);

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  const searchResults = isSearching
    ? allSlides.filter(s => {
        const q = trimmedQuery.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.body.join(" ").toLowerCase().includes(q);
      })
    : [];

  const goToSlide = (idx: number) => {
    router.push(`/blood/all?start=${idx}`);
  };

  return (
    <div>
      {/* 검색바 */}
      <div className="relative mb-5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40 text-base">🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="기도문 검색 (예: 마음, 허리, 평화...)"
          className="w-full rounded-xl border border-cream-200 bg-white/80 py-2.5 pl-9 pr-9 text-sm text-ink-800 outline-none focus:border-clay-400"
        />
        {query && (
          <button onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/40 text-sm">
            ✕
          </button>
        )}
      </div>

      {/* 검색 결과 */}
      {isSearching && (
        <div>
          <p className="mb-3 text-xs text-ink-700/50">
            {searchResults.length > 0
              ? `"${trimmedQuery}" 검색 결과 ${searchResults.length}개`
              : `"${trimmedQuery}"에 해당하는 결과가 없어요`}
          </p>
          <ul className="space-y-3">
            {searchResults.map((s, i) => {
              const bodyText = s.body.join(" ").replace(/\n/g, " ");
              const snippet = getSnippet(bodyText, trimmedQuery);
              return (
                <li key={i}>
                  <button onClick={() => goToSlide(s.globalIdx)}
                    className="w-full text-left rounded-xl border border-cream-200 bg-white/70 p-4 shadow-sm transition active:scale-[0.99]">
                    <span className="inline-block mb-1.5 rounded-md bg-cream-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-clay-700">
                      {s.sectionTitle}
                    </span>
                    <p className="font-serif text-sm font-bold text-ink-800 leading-snug mb-1">
                      <Highlight text={s.title} keyword={trimmedQuery} />
                    </p>
                    <p className="text-xs text-ink-700/60 leading-relaxed">
                      <Highlight text={snippet} keyword={trimmedQuery} />
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 기본 목록 */}
      {!isSearching && (
        <>
          {/* 전체 보기 버튼 */}
          <Link href="/blood/all"
            className="mb-5 flex items-center justify-between rounded-2xl border border-clay-400/40 bg-gradient-to-br from-cream-100 to-cream-200 p-5 shadow-sm transition active:scale-[0.99]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-clay-600 mb-1">
                도입부 → 결론
              </p>
              <h2 className="font-serif text-xl font-bold text-ink-800">전체 보기</h2>
              <p className="mt-0.5 text-sm text-ink-700/70">처음부터 끝까지 연속으로 기도하기</p>
            </div>
            <span className="text-2xl text-clay-500">→</span>
          </Link>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-700/40">
            섹션별 보기
          </p>
          <ul className="space-y-3">
            {sections.map(s => {
              if (s.placeholder) return (
                <li key={s.slug} className="rounded-xl border border-dashed border-cream-300 bg-cream-50 p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-ink-800">{s.title}</h3>
                      <p className="mt-0.5 text-xs text-ink-700/60">{s.subtitle}</p>
                    </div>
                    <span className="text-xs text-ink-700/40">준비 중</span>
                  </div>
                </li>
              );
              const bookmark = bookmarks[s.slug] ?? 0;
              return (
                <li key={s.slug}>
                  <Link href={`/blood/${s.slug}`}
                    className="block rounded-xl border border-cream-200 bg-white/60 p-4 shadow-sm transition active:scale-[0.99]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-serif text-lg font-bold text-ink-800">{s.title}</h3>
                        <p className="mt-0.5 text-xs text-ink-700/60">{s.subtitle}</p>
                        {bookmark > 0 && (
                          <p className="mt-1 text-xs text-clay-600">이어서 보기 · {bookmark + 1}번째 슬라이드</p>
                        )}
                      </div>
                      <span className="text-xl text-clay-500">→</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
