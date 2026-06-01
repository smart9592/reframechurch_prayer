import { notFound } from "next/navigation";
import { loadBlood, bloodSections } from "@/lib/prayers";
import PrayerSlides from "@/components/PrayerSlides";

export async function generateStaticParams() {
  return bloodSections
    .filter((s) => !s.placeholder)
    .map((s) => ({ slug: s.slug }));
}

export default function BloodSlidesPage({
  params,
}: {
  params: { slug: string };
}) {
  const doc = loadBlood(params.slug);
  if (!doc || doc.placeholder) notFound();

  return (
    <PrayerSlides
      slides={doc.slides}
      docTitle={doc.title}
      docSubtitle={doc.subtitle}
      bookmarkKey={`bookmark:blood:${doc.slug}`}
      backHref="/blood"
      backLabel="보혈기도"
    />
  );
}
