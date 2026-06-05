import Link from "next/link";
import RecommendedPrayer from "@/components/RecommendedPrayer";

export default function Home() {
  return (
    <main className="mx-auto max-w-md px-5 pb-16 pt-10">
      <header className="mb-10 text-center">
        <h1 className="font-serif text-3xl font-bold text-ink-800">
          기도의 시간
        </h1>
        {/* change 1: 부제 수정 */}
        <p className="mt-2 text-sm text-ink-700/70">
          시편기도 및 보혈기도
        </p>
      </header>

      {/* change 2: 시간 제거는 RecommendedPrayer 컴포넌트에서 처리 */}
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
              {/* change 3: 부제 수정 */}
              <p className="mt-1 text-sm text-ink-700/70">
                시편기도 매 시간 함께하는 주님의 기도
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
      {/* change 4: footer 문구 삭제 */}
    </main>
  );
}
