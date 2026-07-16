import { notFound } from "next/navigation";
import { loadBlood, bloodSections } from "@/lib/prayers";
import PrayerSlides from "@/components/PrayerSlides";

export async function generateStaticParams() {
  return bloodSections.filter((s) => !s.placeholder).map((s) => ({ slug: s.slug }));
}

export default async function BloodSlidesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = loadBlood(slug);
  if (!doc || doc.placeholder) notFound();

  const visibleSections = bloodSections.filter((s) => !s.placeholder);
  const idx = visibleSections.findIndex((s) => s.slug === slug);
  const prevSec = idx > 0 ? visibleSections[idx - 1] : null;
  const nextSec = idx < visibleSections.length - 1 ? visibleSections[idx + 1] : null;

  const tocItems = visibleSections.map(s => ({
    label: s.title,
    sublabel: s.subtitle,
    href: `/blood/${s.slug}`,
  }));

  return (
    <PrayerSlides
      slides={doc.slides}
      docTitle={doc.title}
      docSubtitle={doc.subtitle}
      bookmarkKey={`bookmark:blood:${doc.slug}`}
      backHref="/blood"
      backLabel="보혈기도"
      homeHref="/blood"
      prevSection={prevSec ? { label: `← ${prevSec.title}`, href: `/blood/${prevSec.slug}` } : undefined}
      nextSection={nextSec ? { label: `${nextSec.title} →`, href: `/blood/${nextSec.slug}` } : undefined}
      tocItems={tocItems}
    />
  );
}
