import { notFound } from "next/navigation";
import Link from "next/link";
import { loadHour, hours } from "@/lib/prayers";
import PrayerSlides from "@/components/PrayerSlides";

export async function generateStaticParams() {
  return hours.map((h) => ({ slug: h.slug }));
}

export default function HourSlidesPage({
  params,
}: {
  params: { slug: string };
}) {
  const doc = loadHour(params.slug);
  if (!doc) notFound();

  return (
    <PrayerSlides
      slides={doc.slides}
      docTitle={doc.title}
      docSubtitle={doc.subtitle}
      bookmarkKey={`bookmark:hour:${doc.slug}`}
      backHref="/hours"
      backLabel="시편기도"
    />
  );
}
