#!/usr/bin/env python3
import json, re
from pathlib import Path

DATA = Path("/home/claude/site/data")
OUT  = DATA / "prayers"
OUT.mkdir(exist_ok=True)

def parse_slides(text: str, typo_fix=False) -> list:
    parts = re.split(r"^## Slide \d+\s*$", text, flags=re.MULTILINE)
    slides = []
    for raw in parts[1:]:
        raw = raw.strip()
        if not raw:
            continue
        continues = False
        if "이어집니다" in raw:
            raw = re.sub(r"\s*이어집니다\s*→?\s*", "", raw).strip()
            continues = True
        if typo_fix:
            raw = raw.replace("악에서 구하시옵고서", "악에서 구하시옵소서")
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", raw) if p.strip()]
        if not paragraphs:
            continue
        head_lines = [l.strip() for l in paragraphs[0].split("\n") if l.strip()]
        title    = head_lines[0] if head_lines else ""
        subtitle = head_lines[1] if len(head_lines) > 1 else ""
        extra    = head_lines[2:]
        body = []
        if extra:
            body.append("\n".join(extra))
        for p in paragraphs[1:]:
            body.append(p)
        slides.append({"title": title, "subtitle": subtitle,
                       "body": body, "continues": continues})
    return slides

# ── Hourly prayers ──────────────────────────────────────────────────────
HOURS = [
    ("prime",    "제1시 기도",  "아침기도, 오전 6시",    "06:00",  6, "txt_hour_14.txt", True),
    ("terce",    "제3시 기도",  "오전 9시",              "09:00",  9, "txt_hour_15.txt", False),
    ("sext",     "제6시 기도",  "정오 12시",             "12:00", 12, "txt_hour_17.txt", False),
    ("none",     "제9시 기도",  "오후 3시",              "15:00", 15, "txt_hour_18.txt", False),
    ("vespers",  "제11시 기도", "저녁기도, 오후 5시",    "17:00", 17, "txt_hour_12.txt", False),
    ("compline", "제12시 기도", "자기 전 기도, 오후 6시","18:00", 18, "txt_hour_13.txt", False),
    ("midnight", "자정 기도",   "밤 12시",               "00:00",  0, "txt_hour_11.txt", False),
]

hours_index = []
for slug, title, subtitle, tl, h24, fname, fix in HOURS:
    text   = (DATA / fname).read_text(encoding="utf-8")
    slides = parse_slides(text, typo_fix=fix)
    doc    = {"slug": slug, "title": title, "subtitle": subtitle,
              "timeLabel": tl, "hour24": h24, "slides": slides}
    (OUT / f"hour-{slug}.json").write_text(
        json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    hours_index.append({"slug": slug, "title": title, "subtitle": subtitle,
                        "timeLabel": tl, "hour24": h24, "slideCount": len(slides)})
    print(f"  hour-{slug}: {len(slides)} slides")

(OUT / "hours-index.json").write_text(
    json.dumps(hours_index, ensure_ascii=False, indent=2), encoding="utf-8")

# ── Blood prayers ───────────────────────────────────────────────────────
BLOOD = [
    ("section-a",  "섹션 A",   "예수님의 보혈 선포 기도문 도입부",         "txt_blood_1.txt", False),
    ("section-b1", "섹션 B-1", "내 영혼과 속사람에 임한 보혈의 능력 (1)",  "txt_blood_3.txt", False),
    ("section-b2", "섹션 B-2", "내 영혼과 속사람에 임한 보혈의 능력 (2)",  "txt_blood_4.txt", False),
    ("section-c",  "섹션 C",   "(준비 중)",                               None,             True),
    ("section-d",  "섹션 D",   "주위 환경과 관계에 임한 보혈의 능력",      "txt_blood_5.txt", False),
    ("section-e",  "섹션 E",   "몸·장막·시간에 임한 보혈의 능력 + 결론",   "txt_blood_6.txt", False),
]

blood_index = []
for slug, title, subtitle, fname, placeholder in BLOOD:
    if placeholder:
        doc = {"slug": slug, "title": title, "subtitle": subtitle,
               "placeholder": True, "slideCount": 0, "slides": []}
    else:
        text   = (DATA / fname).read_text(encoding="utf-8")
        slides = parse_slides(text)
        doc    = {"slug": slug, "title": title, "subtitle": subtitle,
                  "placeholder": False, "slideCount": len(slides), "slides": slides}
        print(f"  blood-{slug}: {len(slides)} slides")
    (OUT / f"blood-{slug}.json").write_text(
        json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    blood_index.append({"slug": slug, "title": title, "subtitle": subtitle,
                        "placeholder": placeholder,
                        "slideCount": doc.get("slideCount", 0)})

(OUT / "blood-index.json").write_text(
    json.dumps(blood_index, ensure_ascii=False, indent=2), encoding="utf-8")

print("✓ done")
