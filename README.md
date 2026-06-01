# 기도의 시간 — 시편기도 · 보혈기도

조용한 베이지 톤의 모바일 친화형 기도 사이트.
Next.js (App Router) + Tailwind CSS, Vercel 배포용.

## ✨ 기능

- **시편기도 (7개 시간)** — 제1시 / 제3시 / 제6시 / 제9시 / 제11시 / 제12시 / 자정
- **보혈기도 (6개 섹션)** — 섹션 A / B-1 / B-2 / C(준비 중) / D / E
- **슬라이드 방식** — 좌우 스와이프, 화살표 버튼, 키보드(←/→) 지원
- **북마크** — 마지막 위치 자동 저장 (브라우저 localStorage)
- **현재 시간 추천** — 홈에서 지금 시각에 맞는 기도 자동 안내
- **글자 크기 조절** — 작게 / 중간 / 크게 (설정 유지됨)

## 🚀 로컬에서 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 열기.

## 📦 빌드

```bash
npm run build
npm run start
```

## 🌐 Vercel 배포 (3분 완성)

1. **GitHub 저장소 생성**
   - 새 저장소 만들기 (예: `prayer-site`)
   - 이 폴더의 파일들을 푸시:
     ```bash
     git init
     git add .
     git commit -m "initial commit"
     git branch -M main
     git remote add origin https://github.com/내계정/prayer-site.git
     git push -u origin main
     ```

2. **Vercel에서 가져오기**
   - [vercel.com](https://vercel.com) 로그인 → **New Project**
   - GitHub 저장소 선택 → **Import**
   - 설정은 그대로 두고 **Deploy** 클릭
   - 1~2분 후 `https://prayer-site-xxx.vercel.app` 형태의 URL 발급

3. **push할 때마다 자동 재배포** — 끝!

## 📂 폴더 구조

```
prayer-site/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx            # 홈 (시간 추천 + 두 입구)
│   ├── hours/              # 시편기도
│   │   ├── page.tsx        # 시간 목록
│   │   └── [slug]/page.tsx # 슬라이드 뷰
│   └── blood/              # 보혈기도
│       ├── page.tsx        # 섹션 목록
│       └── [slug]/page.tsx # 슬라이드 뷰
├── components/             # 재사용 컴포넌트
│   ├── PrayerSlides.tsx    # 메인 슬라이드 뷰어
│   ├── RecommendedPrayer.tsx
│   ├── HourList.tsx
│   └── BloodList.tsx
├── lib/
│   └── prayers.ts          # 데이터 로딩 + 시간 추천 로직
├── data/
│   └── prayers/            # 기도문 JSON
│       ├── hours-index.json
│       ├── hour-*.json     # 시간별 기도
│       ├── blood-index.json
│       └── blood-section-*.json
├── tailwind.config.ts
├── next.config.js
└── package.json
```

## 🎨 색상 (Tailwind)

베이지 톤 팔레트:
- `cream-50` ~ `cream-300` — 배경/카드
- `clay-400` ~ `clay-600` — 강조/버튼
- `ink-700` ~ `ink-900` — 본문 텍스트

`tailwind.config.ts`에서 자유롭게 조정 가능.

## 📝 섹션 C 채우기

`data/prayers/blood-section-c.json`이 빈 자리로 준비되어 있어요.
내용이 생기면 다음처럼 채우세요:

```json
{
  "slug": "section-c",
  "title": "섹션 C",
  "subtitle": "(섹션 부제목)",
  "placeholder": false,
  "slides": [
    {
      "title": "...",
      "subtitle": "...",
      "body": ["...", "..."],
      "continues": false
    }
  ]
}
```

`data/prayers/blood-index.json`에서도 `"placeholder": false`로 바꾸고 `slideCount` 업데이트.

## 🛠 PPTX → JSON 다시 만들기

원본 PPTX를 수정한 경우, `data/parse.py`로 다시 생성:

```bash
cd data
python3 parse.py
```

(원본 텍스트는 `data/raw/`에 있음 — `.gitignore`로 제외됨)

## 📱 모바일 사용 팁

- 화면 좌우 스와이프 → 슬라이드 이동
- 우상단 "가" 버튼 → 글자 크기 순환
- 한 번 보고 나가도 다시 들어오면 마지막 슬라이드부터 시작

---

조용히, 천천히 기도하세요. 🕯
