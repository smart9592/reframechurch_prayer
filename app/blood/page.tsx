import Link from "next/link";
import { bloodSections } from "@/lib/prayers";
import BloodList from "@/components/BloodList";

export default function BloodPage() {
  return (
    <main className="mx-auto max-w-md px-5 pb-16 pt-6">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-clay-600">← 홈으로</Link>
      </div>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-ink-800">보혈기도</h1>
        <p className="mt-1 text-sm text-ink-700/70">예수님의 보혈 선포 기도문</p>
      </header>
      <BloodList sections={bloodSections} />
    </main>
  );
}
