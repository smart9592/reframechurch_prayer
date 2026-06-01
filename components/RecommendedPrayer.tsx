"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hours, getRecommendedHourSlug } from "@/lib/prayers";

export default function RecommendedPrayer() {
  const [slug, setSlug] = useState<string | null>(null);
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      setSlug(getRecommendedHourSlug(h));
      setTimeStr(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      );
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!slug) {
    return (
      <div className="rounded-2xl border border-cream-200 bg-cream-100 p-6">
        <div className="h-20 animate-pulse rounded bg-cream-200/60" />
      </div>
    );
  }

  const hour = hours.find((h) => h.slug === slug)!;

  return (
    <Link
      href={`/hours/${slug}`}
      className="block rounded-2xl border border-clay-400/40 bg-gradient-to-br from-cream-100 to-cream-200 p-6 shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-clay-600">
        <span>지금 이 시간의 기도</span>
        <span>{timeStr}</span>
      </div>
      <h3 className="mt-3 font-serif text-2xl font-bold text-ink-800">
        {hour.title}
      </h3>
      <p className="mt-1 text-sm text-ink-700/70">{hour.subtitle}</p>
      <p className="mt-4 text-sm font-medium text-clay-600">
        지금 시작하기 →
      </p>
    </Link>
  );
}
