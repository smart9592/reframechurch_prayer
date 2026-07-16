import { getAllBloodSlides, bloodSections } from "@/lib/prayers";
import PrayerSlides from "@/components/PrayerSlides";

export default async function BloodAllPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { start } = await searchParams;
  const initialIndex = start ? Math.max(0, parseInt(start, 10)) : 0;
  const slides = getAllBloodSlides();

  const sectionStartMap: Record<string, number> = {};
  let cur = "";
  slides.forEach((s, i) => {
    if (s.sectionTitle !== cur) {
      sectionStartMap[s.sectionTitle] = i;
      cur = s.sectionTitle;
    }
  });

  return (
    <PrayerSlides
      slides={slides}
      docTitle="보혈기도"
      docSubtitle=""
      bookmarkKey="bookmark:blood:all"
      backHref="/blood"
      backLabel="보혈기도"
      homeHref="/blood"
      initialIndex={initialIndex}
      allSectionsList={bloodSections
        .filter(s => !s.placeholder)
        .map(s => ({ title: s.title, slug: s.slug }))}
      sectionStartMap={sectionStartMap}
    />
  );
}
