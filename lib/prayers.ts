import hoursIndex from "@/data/prayers/hours-index.json";
import bloodIndex from "@/data/prayers/blood-index.json";
import hourPrime    from "@/data/prayers/hour-prime.json";
import hourTerce    from "@/data/prayers/hour-terce.json";
import hourSext     from "@/data/prayers/hour-sext.json";
import hourNone     from "@/data/prayers/hour-none.json";
import hourVespers  from "@/data/prayers/hour-vespers.json";
import hourCompline from "@/data/prayers/hour-compline.json";
import hourMidnight from "@/data/prayers/hour-midnight.json";
import bloodA  from "@/data/prayers/blood-section-a.json";
import bloodB  from "@/data/prayers/blood-section-b.json";
import bloodC  from "@/data/prayers/blood-section-c.json";
import bloodD  from "@/data/prayers/blood-section-d.json";
import bloodE  from "@/data/prayers/blood-section-e.json";

export type Slide = { title: string; subtitle: string; body: string[]; continues: boolean; };
export type HourSummary = { slug: string; title: string; subtitle: string; timeLabel: string; hour24: number; slideCount: number; };
export type BloodSummary = { slug: string; title: string; subtitle: string; placeholder: boolean; slideCount: number; };
export type HourDoc = HourSummary & { slides: Slide[] };
export type BloodDoc = BloodSummary & { slides: Slide[] };

export const hours: HourSummary[] = hoursIndex as HourSummary[];
export const bloodSections: BloodSummary[] = bloodIndex as BloodSummary[];

const HOUR_MAP: Record<string, HourDoc> = {
  prime: hourPrime as HourDoc, terce: hourTerce as HourDoc,
  sext: hourSext as HourDoc, none: hourNone as HourDoc,
  vespers: hourVespers as HourDoc, compline: hourCompline as HourDoc,
  midnight: hourMidnight as HourDoc,
};

const BLOOD_MAP: Record<string, BloodDoc> = {
  "section-a": bloodA as BloodDoc,
  "section-b": bloodB as BloodDoc,
  "section-c": bloodC as BloodDoc,
  "section-d": bloodD as BloodDoc,
  "section-e": bloodE as BloodDoc,
};

export function loadHour(slug: string): HourDoc | null { return HOUR_MAP[slug] ?? null; }
export function loadBlood(slug: string): BloodDoc | null { return BLOOD_MAP[slug] ?? null; }

export function getRecommendedHourSlug(currentHour: number): string {
  const sorted = [...hours].sort((a, b) => a.hour24 - b.hour24);
  let best = sorted[sorted.length - 1];
  for (const h of sorted) { if (h.hour24 <= currentHour) best = h; }
  if (currentHour < 6) { const m = sorted.find((h) => h.hour24 === 0); if (m) best = m; }
  return best.slug;
}
