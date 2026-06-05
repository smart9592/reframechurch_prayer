import Link from "next/link";
import { hours } from "@/lib/prayers";
import HourList from "@/components/HourList";
export default function HoursPage() {
  return (
    <main className="mx-auto max-w-md px-5 pb-16 pt-6">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-clay-600">← 홈으로</Link>
      </div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-ink-800">시편기도</h1>
        <p className="mt-1 text-sm text-ink-700/70">시편기도 매 시간 함께하는 주님의 기도</p>
      </header>
      <HourList hours={hours} />
    </main>
  );
}
