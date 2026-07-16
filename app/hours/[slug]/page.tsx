import { notFound } from "next/navigation";
import { loadHour, hours } from "@/lib/prayers";
import PrayerSlides from "@/components/PrayerSlides";

export async function generateStaticParams() {
  return hours.map((h) => ({ slug: h.slug }));
}

const HOUR_TOC = [
  { slug: "prime",    label: "제1시 기도",  sublabel: "아침기도, 오전 6시" },
  { slug: "terce",    label: "제3시 기도",  sublabel: "오전 9시" },
  { slug: "sext",     label: "제6시 기도",  sublabel: "정오 12시" },
  { slug: "none",     label: "제9시 기도",  sublabel: "오후 3시" },
  { slug: "vespers",  label: "제11시 기도", sublabel: "저녁기도, 오후 5시" },
  { slug: "compline", label: "제12시 기도", sublabel: "자기 전 기도, 오후 6시" },
  { slug: "midnight", label: "자정 기도",   sublabel: "밤 12시" },
];

export default async function HourSlidesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = loadHour(slug);
  if (!doc) notFound();

  const tocItems = HOUR_TOC.map(h => ({
    label: h.label,
    sublabel: h.sublabel,
    href: `/hours/${h.slug}`,
  }));

  return (
    <PrayerSlides
      slides={doc.slides}
      docTitle={doc.title}
      docSubtitle={doc.subtitle}
      bookmarkKey={`bookmark:hour:${doc.slug}`}
      backHref="/hours"
      backLabel="시편기도"
      homeHref="/hours"
      tocItems={tocItems}
    />
  );
}
