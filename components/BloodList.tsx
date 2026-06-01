"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BloodSummary } from "@/lib/prayers";

function readBookmark(slug: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(`bookmark:blood:${slug}`);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function BloodList({ sections }: { sections: BloodSummary[] }) {
  const [bookmarks, setBookmarks] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    for (const s of sections) map[s.slug] = readBookmark(s.slug);
    setBookmarks(map);
  }, [sections]);

  return (
    <ul className="space-y-3">
      {sections.map((s) => {
        if (s.placeholder) {
          return (
            <li
              key={s.slug}
              className="block rounded-xl border border-dashed border-cream-300 bg-cream-50 p-4 opacity-60"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink-800">
                    {s.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-700/60">
                    {s.subtitle}
                  </p>
                </div>
                <span className="text-xs text-ink-700/40">준비 중</span>
              </div>
            </li>
          );
        }
        const bookmark = bookmarks[s.slug] ?? 0;
        return (
          <li key={s.slug}>
            <Link
              href={`/blood/${s.slug}`}
              className="block rounded-xl border border-cream-200 bg-white/60 p-4 shadow-sm transition active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-bold text-ink-800">
                    {s.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-700/60">
                    {s.subtitle} · {s.slideCount}장
                  </p>
                  {bookmark > 0 && (
                    <p className="mt-1 text-xs text-clay-600">
                      이어서 보기 · {bookmark + 1} / {s.slideCount}
                    </p>
                  )}
                </div>
                <span className="text-xl text-clay-500">→</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
