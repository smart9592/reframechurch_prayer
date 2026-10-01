// app/hours/midnight/page.tsx
//
// 자정 기도 전용 페이지.
// Next.js App Router에서 정적 세그먼트(midnight)가 동적 세그먼트([slug])보다
// 우선순위가 높으므로, 이 파일이 /hours/midnight 경로를 처리합니다.
//
// ?view 쿼리 파라미터로 화면을 전환합니다:
//   (없음)   → 시작 기도 (인트로, slides 0–12)
//   select   → 파수 선택 화면
//   pasu1    → 첫 번째 파수 (slides 13–57)
//   pasu2    → 두 번째 파수 (slides 58–76)
//   pasu3    → 세 번째 파수 (slides 77–108)

import { loadHour } from '@/lib/prayers'
import PrayerSlides from '@/components/PrayerSlides'
import Link from 'next/link'

// JSON 분석으로 확인한 파수 경계 인덱스
const FIRST_PASU_IDX  = 13  // "첫 번째 파수"
const SECOND_PASU_IDX = 58  // "두 번째 파수"
const THIRD_PASU_IDX  = 77  // "세 번째 파수"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata() {
  return { title: '자정 기도 | 기도의 시간' }
}

export default async function MidnightPage({ searchParams }: PageProps) {
  const params = await searchParams
  const view = typeof params.view === 'string' ? params.view : undefined

  const doc = await loadHour('midnight')
  if (!doc) return <div className="p-8 text-center text-[#8B6E56]">기도문을 불러올 수 없습니다.</div>
  const { slides } = doc

  const introSlides = slides.slice(0, FIRST_PASU_IDX)
  const pasu1Slides = slides.slice(FIRST_PASU_IDX,  SECOND_PASU_IDX)
  const pasu2Slides = slides.slice(SECOND_PASU_IDX, THIRD_PASU_IDX)
  const pasu3Slides = slides.slice(THIRD_PASU_IDX)

  // ── 파수 선택 화면 ────────────────────────────────────────────────────
  if (view === 'select') {
    return <PasuSelectView />
  }

  // ── 파수 본기도 ──────────────────────────────────────────────────────
  if (view === 'pasu1' || view === 'pasu2' || view === 'pasu3') {
    const n = view === 'pasu1' ? 1 : view === 'pasu2' ? 2 : 3
    const pasuSlides =
      view === 'pasu1' ? pasu1Slides
      : view === 'pasu2' ? pasu2Slides
      : pasu3Slides
    const pasuTitle =
      n === 1 ? '첫 번째 파수'
      : n === 2 ? '두 번째 파수'
      : '세 번째 파수'

    return (
      <PrayerSlides
        slides={pasuSlides}
        docTitle={pasuTitle}
        docSubtitle="자정 기도"
        bookmarkKey={`midnight-pasu${n}`}
        backHref="/hours/midnight?view=select"
        backLabel="파수 선택"
      />
    )
  }

return (
    <PrayerSlides
      slides={introSlides}
      docTitle="자정 기도"
      docSubtitle="밤 12시"
      bookmarkKey="midnight-intro"
      backHref="/hours"
      backLabel="기도의 시간"
      nextHref="/hours/midnight?view=select"
    />
  )
  )
}

// ── 파수 선택 화면 컴포넌트 ───────────────────────────────────────────────

const PASU_LIST = [
  {
    view:  'pasu1',
    label: '첫 번째 파수',
    time:  '자정 기도 I',
    desc:  '자정을 맞이하며 드리는 첫 번째 기도',
  },
  {
    view:  'pasu2',
    label: '두 번째 파수',
    time:  '자정 기도 II',
    desc:  '어둠 속에서 빛이신 주님을 바라보는 기도',
  },
  {
    view:  'pasu3',
    label: '세 번째 파수',
    time:  '자정 기도 III',
    desc:  '새벽이 밝아오기를 기다리는 마지막 기도',
  },
] as const

function PasuSelectView() {
  return (
    <div className="min-h-screen bg-[#FBF7F0] flex flex-col">

      {/* 상단 네비게이션 */}
      <div className="flex items-center px-5 py-4 border-b border-[#E4D2B1]">
        <Link
          href="/hours/midnight"
          className="text-[#8B6E56] hover:text-[#3D2F1F] transition-colors text-sm flex items-center gap-1.5"
        >
          <span aria-hidden>←</span>
          <span>시작 기도로</span>
        </Link>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-col items-center flex-1 px-5 py-12">
        <div className="w-full max-w-sm">

          {/* 헤더 */}
          <div className="text-center mb-10">
            <p className="text-[#B8956A] text-[11px] font-medium tracking-widest uppercase mb-3">
              자정 기도 · 밤 12시
            </p>
            <h1 className="text-[#3D2F1F] font-serif text-3xl mb-3">
              파수를 선택하세요
            </h1>
            <p className="text-[#8B6E56] text-sm leading-relaxed">
              파수꾼처럼 밤을 지키며<br />
              하나님을 기다립니다
            </p>
          </div>

          {/* 파수 카드 */}
          <div className="flex flex-col gap-3">
            {PASU_LIST.map(({ view, label, time, desc }) => (
              <Link
                key={view}
                href={`/hours/midnight?view=${view}`}
                className="block bg-[#F6EFE2] border border-[#E4D2B1] rounded-2xl px-5 py-5
                           hover:bg-[#EDE3D0] hover:border-[#B8956A] hover:shadow-sm
                           active:scale-[0.99]
                           transition-all duration-200 group"
              >
                <p className="text-[#B8956A] text-[11px] font-medium tracking-widest uppercase mb-1.5
                              group-hover:text-[#7A5C3B] transition-colors">
                  {time}
                </p>
                <p className="text-[#3D2F1F] font-serif text-xl mb-1.5">
                  {label}
                </p>
                <p className="text-[#8B6E56] text-sm leading-relaxed">
                  {desc}
                </p>
              </Link>
            ))}
          </div>

          {/* 하단 안내 */}
          <p className="text-center text-[#8B6E56] text-xs mt-8 leading-relaxed">
            각 파수는 독립적으로 기도하실 수 있습니다
          </p>

        </div>
      </div>
    </div>
  )
}
