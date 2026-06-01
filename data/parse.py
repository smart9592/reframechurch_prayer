#!/usr/bin/env python3
"""Parse prayer text files into structured JSON for the Next.js site."""

import json
import re
from pathlib import Path

RAW_DIR = Path(__file__).parent / "raw"
OUT_DIR = Path(__file__).parent / "prayers"
OUT_DIR.mkdir(exist_ok=True)


def parse_slides(text: str) -> list[dict]:
    """Split extracted text into per-slide dicts."""
    slides = []
    # Split on "## Slide N" markers
    parts = re.split(r"^## Slide \d+\s*$", text, flags=re.MULTILINE)
    # First chunk is before any slide marker — skip
    for raw in parts[1:]:
        raw = raw.strip()
        if not raw:
            continue
        # Detect "continues" marker
        continues = False
        if "이어집니다" in raw:
            raw = re.sub(r"\s*이어집니다\s*→?\s*", "", raw).strip()
            continues = True

        # Split into paragraphs by blank lines
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", raw) if p.strip()]
        if not paragraphs:
            continue

        # First paragraph: title (line 1) + optional subtitle (line 2+)
        head_lines = [l.strip() for l in paragraphs[0].split("\n") if l.strip()]
        title = head_lines[0] if head_lines else ""
        subtitle = head_lines[1] if len(head_lines) > 1 else ""
        # Body: rest of paragraphs, plus any extra head lines beyond title+subtitle
        extra_head = head_lines[2:]
        body_paragraphs = []
        if extra_head:
            body_paragraphs.append("\n".join(extra_head))
        for p in paragraphs[1:]:
            body_paragraphs.append(p)

        slides.append({
            "title": title,
            "subtitle": subtitle,
            "body": body_paragraphs,
            "continues": continues,
        })
    return slides


# ===== Hourly prayers =====
HOURLY = [
    ("prime",     "제1시 기도",   "아침기도, 오전 6시",   "06:00",  6, "prayer_14.txt"),
    ("terce",     "제3시 기도",   "오전 9시",             "09:00",  9, "prayer_15.txt"),
    ("sext",      "제6시 기도",   "정오 12시",            "12:00", 12, "prayer_17.txt"),
    ("none",      "제9시 기도",   "오후 3시",             "15:00", 15, "prayer_18.txt"),
    ("vespers",   "제11시 기도",  "저녁기도, 오후 5시",   "17:00", 17, "prayer_12.txt"),
    ("compline",  "제12시 기도",  "자기 전 기도, 오후 6시","18:00", 18, "prayer_13.txt"),
    ("midnight",  "자정 기도",    "밤 12시",              "00:00",  0, "prayer_11.txt"),
]

hours_index = []
for slug, title, subtitle, time_label, hour24, filename in HOURLY:
    text = (RAW_DIR / filename).read_text(encoding="utf-8")
    slides = parse_slides(text)
    out = {
        "slug": slug,
        "title": title,
        "subtitle": subtitle,
        "timeLabel": time_label,
        "hour24": hour24,
        "slides": slides,
    }
    (OUT_DIR / f"hour-{slug}.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    hours_index.append({
        "slug": slug,
        "title": title,
        "subtitle": subtitle,
        "timeLabel": time_label,
        "hour24": hour24,
        "slideCount": len(slides),
    })
    print(f"  hour-{slug}.json — {len(slides)} slides")

(OUT_DIR / "hours-index.json").write_text(
    json.dumps(hours_index, ensure_ascii=False, indent=2), encoding="utf-8"
)

# ===== Blood-of-Jesus prayers =====
# Section A and B-1 (and conclusion) duplicated in prayer_2; use focused files where possible.
BLOOD = [
    ("section-a",   "섹션 A", "예수님의 보혈 선포 기도문 도입부", "prayer_1.txt",  False),
    ("section-b1",  "섹션 B-1", "내 영혼과 속사람에 임한 보혈의 능력 (1)", "prayer_3.txt",  False),
    ("section-b2",  "섹션 B-2", "내 영혼과 속사람에 임한 보혈의 능력 (2)", "prayer_4.txt",  False),
    ("section-c",   "섹션 C", "(준비 중)", None, True),
    ("section-d",   "섹션 D", "주위 환경과 관계에 임한 보혈의 능력", "prayer_5.txt",  False),
    ("section-e",   "섹션 E", "몸·장막·시간에 임한 보혈의 능력 + 결론", "prayer_6.txt",  False),
]

blood_index = []
for slug, title, subtitle, filename, placeholder in BLOOD:
    if placeholder:
        out = {
            "slug": slug,
            "title": title,
            "subtitle": subtitle,
            "placeholder": True,
            "slides": [],
        }
        slide_count = 0
    else:
        text = (RAW_DIR / filename).read_text(encoding="utf-8")
        slides = parse_slides(text)
        out = {
            "slug": slug,
            "title": title,
            "subtitle": subtitle,
            "placeholder": False,
            "slides": slides,
        }
        slide_count = len(slides)
    (OUT_DIR / f"blood-{slug}.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    blood_index.append({
        "slug": slug,
        "title": title,
        "subtitle": subtitle,
        "placeholder": placeholder,
        "slideCount": slide_count,
    })
    print(f"  blood-{slug}.json — {slide_count} slides{' (placeholder)' if placeholder else ''}")

(OUT_DIR / "blood-index.json").write_text(
    json.dumps(blood_index, ensure_ascii=False, indent=2), encoding="utf-8"
)

print("\n✓ All prayer data written to", OUT_DIR)
