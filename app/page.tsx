import Link from "next/link";
import RecommendedPrayer from "@/components/RecommendedPrayer";

export default function Home() {
  return (
    <main className="mx-auto max-w-md px-5 pb-16 pt-10">
      <header className="mb-10 text-center">
        <h1 className="font-serif text-3xl font-bold text-ink-800">
          기도의 시간
        </h1>
        <p className="mt-2 text-sm text-ink-700/70">
          시편기도와 보혈기도를 위한 조용한 공간
        </p>
      </header>

      <RecommendedPrayer />

      <section className="mt-8 space-y-4">
        <Link
          href="/hours"
          className="block rounded-2xl border border-cream-200 bg-white/60 p-6 shadow-sm transition active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-ink-800">
                시편기도
              </h2>
              <p className="mt-1 text-sm text-ink-700/70">
                일곱 시간의 정시기도
              </p>
            </div>
            <span className="text-2xl text-clay-500">→</span>
          </div>
        </Link>

        <Link
          href="/blood"
          className="block rounded-2xl border border-cream-200 bg-white/60 p-6 shadow-sm transition active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-ink-800">
                보혈기도
              </h2>
              <p className="mt-1 text-sm text-ink-700/70">
                예수님의 보혈 선포 기도문
              </p>
            </div>
            <span className="text-2xl text-clay-500">→</span>
          </div>
        </Link>
      </section>

      <footer className="mt-16 text-center text-xs text-ink-700/50">
        조용히, 천천히 기도하세요.
      </footer>
    </main>
  );
}
