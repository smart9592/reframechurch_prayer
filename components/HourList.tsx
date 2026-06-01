"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HourSummary } from "@/lib/prayers";
import { getRecommendedHourSlug } from "@/lib/prayers";

function readBookmark(slug: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(`bookmark:hour:${slug}`);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function HourList({ hours }: { hours: HourSummary[] }) {
  const [recSlug, setRecSlug] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Record<string, number>>({});

  useEffect(() => {
    setRecSlug(getRecommendedHourSlug(new Date().getHours()));
    const map: Record<string, number> = {};
    for (const h of hours) map[h.slug] = readBookmark(h.slug);
    setBookmarks(map);
  }, [hours]);

  return (
    <ul className="space-y-3">
      {hours.map((h) => {
        const isCurrent = h.slug === recSlug;
        const bookmark = bookmarks[h.slug] ?? 0;
        return (
          <li key={h.slug}>
            <Link
              href={`/hours/${h.slug}`}
              className={`block rounded-xl border p-4 shadow-sm transition active:scale-[0.99] ${
                isCurrent
                  ? "border-clay-400/60 bg-cream-100"
                  : "border-cream-200 bg-white/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-bold text-ink-800">
                      {h.title}
                    </h3>
                    {isCurrent && (
                      <span className="rounded-full bg-clay-400 px-2 py-0.5 text-[10px] font-medium text-white">
                        지금
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-700/60">
                    {h.subtitle} · {h.slideCount}장
                  </p>
                  {bookmark > 0 && (
                    <p className="mt-1 text-xs text-clay-600">
                      이어서 보기 · {bookmark + 1} / {h.slideCount}
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
