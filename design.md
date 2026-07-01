# Design Guide

회사 내부 Wiki를 위한 **wiki-template** 디자인 방향성과 반복 패턴 정리 문서입니다.
토큰의 단일 출처는 `app/globals.css`이며, UI 프리미티브는 `components/ui/`(shadcn/ui)를 따릅니다.

라이브 예시는 개발 서버(`pnpm dev` → `http://localhost:3000`)에서 확인할 수 있습니다.  
향후 `content/design-system.md` 위키 페이지로 dogfooding하는 것을 권장합니다.

---

## 1. 디자인 방향성

### 목표

- **내부 위키** — 부서원이 빠르게 찾고, 읽고, 기여하는 문서 허브
- **읽기 우선(reading-first)** — 마크다운 본문이 화면의 주인공; 크롬은 최소화
- **라이트·다크 동등 지원** — `next-themes` + CSS 변수; 어느 한쪽만 잘 보이면 안 됨
- **토큰 기반 일관성** — 페이지마다 임의 색·간격을 쓰지 않고 시맨틱 토큰과 `components/ui` variant로 의미를 표현

### 핵심 원칙

1. **색·테두리·그림자는 토큰으로만** — `slate-200`, `gray-500` 같은 raw Tailwind 색상은 본문·UI 모두에서 피한다.
2. **`variant` = 의미(역할)**, **`size` = 밀도(시각적 계층)** — Button 등 shadcn 컴포넌트 규칙을 따른다.
3. **페이지(`app/`)는 레이아웃만** — `flex`, `grid`, `max-w`, `p-*` 등 구조·간격만 담당한다. 색·타이포 직접 정의 금지.
4. **접근성 기본값은 컴포넌트 내부** — 포커스 링, `aria-label`, Dialog 포커스 트랩 등은 `components/ui`·도메인 컴포넌트에서 보장한다.
5. **새 UI는 기존 패턴 조합** — 비슷한 UI가 있으면 복사·조합하고, 3회 이상 반복될 때만 `components/ui` 또는 `components/wiki`로 추출한다.

### 스타일링 아키텍처

```text
app/globals.css              ← CSS 변수 + @theme 토큰 (단일 출처)
        ↓
components/ui/               ← shadcn/ui 프리미티브 (Button, Card, Dialog …)
        ↓
components/layout/           ← 앱 크롬 (Nav, Sidebar, ThemeToggle)
components/wiki/             ← 위키 도메인 (Viewer, List, Search, Form)
        ↓
app/(wiki)/                  ← 라우트·페이지 조합 (레이아웃 클래스만)
```

| 레이어 | 경로 | 용도 |
| --- | --- | --- |
| 토큰 | `app/globals.css` | 색, radius, font — `:root` / `.dark` |
| UI 프리미티브 | `components/ui/` | 범용 컴포넌트, variant로 의미 표현 |
| 레이아웃 | `components/layout/` | Nav, Sidebar, 모바일 토글 |
| 도메인 | `components/wiki/` | 문서 목록·뷰어·검색·폼 |
| 페이지 | `app/(wiki)/` | 데이터 fetch + 컴포넌트 배치 |

`cn()` (`lib/utils.ts`)은 `clsx` + `tailwind-merge`로 클래스 병합에 사용합니다.

---

## 2. 컬러 시스템

### 2.1 단일 출처

모든 시맨틱 색은 `app/globals.css`의 CSS 변수에서 정의됩니다.

```css
/* 라이트 (:root) / 다크 (.dark) — hsl 값 */
--background, --foreground
--card, --card-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring
--radius
```

Tailwind v4 `@theme inline` 블록이 위 변수를 `--color-*`로 매핑합니다.  
**토큰 변경은 `globals.css`만 수정**하고, 컴포넌트·페이지에서 hex/hsl을 직접 쓰지 않습니다.

### 2.2 시맨틱 역할

| 토큰 | 용도 |
| --- | --- |
| `background` / `foreground` | 페이지·본문 기본 배경·텍스트 |
| `card` | Card, 패널, 문서 카드 |
| `primary` | 주요 CTA, 링크 강조, "첫 문서 작성하기" |
| `secondary` | 카테고리 배지, 보조 배경 |
| `muted` / `muted-foreground` | 보조 텍스트, 메타 정보, 비활성 nav |
| `accent` | 사이드바·nav 활성·호버 배경 |
| `destructive` | 삭제 버튼, 오류 메시지, 위험 확인 |
| `border` / `input` / `ring` | 테두리, 입력 필드, 포커스 링 |

### 2.3 피드백·상태 박스

오류·경고 등 상태 박스는 아래 패턴을 따릅니다 (`delete-wiki-dialog.tsx` 참고).

```text
border border-destructive bg-destructive/10 text-destructive
```

성공·정보 알림이 필요해지면 동일 패턴으로 `--success`, `--warning` 토큰을 `globals.css`에 추가한 뒤 사용합니다.

### 2.4 브랜드 색 커스터마이징

현재 `baseColor: neutral`(shadcn 기본)입니다. 회사 브랜드 색을 반영할 때:

1. `app/globals.css`의 `--primary` (및 필요 시 `--ring`)만 조정
2. 라이트·다크 **양쪽**에서 대비(contrast) 확인
3. `components/ui/button.tsx` 등 개별 파일의 색 하드코딩은 하지 않음

---

## 3. 타이포그래피

### 3.1 폰트

| 역할 | 변수 | Tailwind |
| --- | --- | --- |
| 본문·UI | `--font-geist-sans` | `font-sans` (기본) |
| 코드 | `--font-geist-mono` | `font-mono` |

`app/layout.tsx`에서 Geist / Geist Mono를 로드합니다.

### 3.2 UI 텍스트 계층

| 용도 | 클래스 예시 | 사용처 |
| --- | --- | --- |
| 페이지 제목 | `text-3xl font-semibold` | 문서 뷰어 h1 |
| Nav 브랜드 | `text-lg font-semibold` | Wiki 로고 |
| 본문 UI | `text-sm` | Sidebar 링크, 버튼 |
| 메타·캡션 | `text-xs text-muted-foreground` | 수정일, 카드 하단 |
| 빈 상태 | `text-lg text-muted-foreground` | 문서 없음 |

### 3.3 마크다운 본문 (prose)

문서 본문은 `@tailwindcss/typography`의 `prose` 클래스를 사용합니다.

```text
wiki-content prose dark:prose-invert prose-headings:scroll-mt-20 max-w-none
```

- **`.wiki-content`** — 목차 앵커용 `scroll-margin-top` (`globals.css`)
- **`prose-headings:scroll-mt-20`** — sticky nav 아래 제목이 가려지지 않도록
- **`max-w-none`** — Wiki 레이아웃 폭에 맞춤 (prose 기본 max-width 해제)

> **기술 부채:** `wiki-viewer.tsx`에 `prose-slate`, `prose-pre:bg-slate-*` 하드코딩이 남아 있습니다.  
> 토큰 기반으로 교체할 때 `--muted` / 위키 전용 `--wiki-code-bg` 변수를 도입하세요.

---

## 4. 간격·레이아웃

### 4.1 앱 셸

```text
┌─────────────────────────────────────────────┐
│ WikiNav (border-b, container, py-3~4)       │
├──────────┬──────────────────────────────────┤
│ Sidebar  │ Main content                     │
│ lg:w-64  │ flex-1 min-w-0                     │
│ sticky   │ px-4 py-6 → sm:px-6 → lg:p-10     │
└──────────┴──────────────────────────────────┘
```

- **Sidebar:** `lg` 이상에서만 표시; 모바일은 `Sheet` + `MobileSidebarToggle`
- **Nav 높이 기준:** Sidebar `top-20`, `h-[calc(100vh-5rem)]`

### 4.2 페이지 패딩

| 브레이크포인트 | 패딩 |
| --- | --- |
| 기본 | `px-4 py-6` |
| `sm` | `px-6 py-8` |
| `lg` | `p-10` |

새 Wiki 페이지는 위 패턴을 그대로 사용합니다.

### 4.3 문서 목록 그리드

```text
grid gap-4 md:grid-cols-2 lg:grid-cols-3
```

Card는 `h-full transition-shadow hover:shadow-md`로 클릭 가능함을 표현합니다.

### 4.4 radius

전역 `--radius: 0.5rem`. Button·Input·Card·Dialog는 shadcn 기본(`rounded-md`, `rounded-lg`)을 따릅니다.  
카테고리 배지는 `rounded-full`.

---

## 5. 컴포넌트 계층

### 5.1 `components/ui/` — 프리미티브

현재 포함 컴포넌트:

| 컴포넌트 | 용도 |
| --- | --- |
| `Button` | CTA, 폼 제출, 아이콘 버튼 |
| `Card` | 문서 목록 카드 |
| `Dialog` | 삭제 확인, 검색(필요 시) |
| `Sheet` | 모바일 사이드바 |
| `Input`, `Textarea` | 문서 작성·편집 폼 |
| `Skeleton` | 로딩 상태 |

shadcn/ui(`components.json`, style: `new-york`)로 추가·업데이트합니다.

```bash
pnpm dlx shadcn@latest add badge   # 예: 배지 컴포넌트 추가
```

**규칙:** `components/ui/` 파일은 shadcn CLI 업데이트를 고려해 **최소한만** 커스터마이징합니다.  
위키 전용 스타일은 `components/wiki/`에서 `className` prop으로 확장합니다.

### 5.2 Button variant 가이드

| variant | 의미 | 예시 |
| --- | --- | --- |
| `default` | 주요 긍정 액션 | "새 문서", "저장" |
| `outline` | 보조·취소 | Dialog "취소" |
| `ghost` | 낮은 강조·툴바 | 검색, 테마 토글 |
| `destructive` | 되돌릴 수 없는 위험 | "삭제" |
| `secondary` | (필요 시) 보조 CTA | — |
| `link` | 인라인 텍스트 링크 스타일 | — |

| size | 용도 |
| --- | --- |
| `default` | 일반 버튼 |
| `sm` | Nav, 툴바 |
| `lg` | (필요 시) 페이지 히어로 CTA |
| `icon` | 아이콘만 |

### 5.3 `components/layout/` — 앱 크롬

| 컴포넌트 | 역할 |
| --- | --- |
| `WikiNav` | 상단 바, 검색·새 문서·테마 토글 |
| `WikiSidebar` | 카테고리별 문서 트리, 활성 링크 |
| `ThemeToggle` | 라이트/다크/system |
| `MobileSidebarToggle` | 모바일 Sheet 사이드바 |
| `MobileTocToggle` | 모바일 목차 |

Nav·Sidebar 활성 상태 패턴:

```text
bg-accent text-accent-foreground font-medium   ← active
text-muted-foreground hover:bg-accent          ← default
```

### 5.4 `components/wiki/` — 도메인

| 컴포넌트 | 역할 |
| --- | --- |
| `WikiList` | 홈 문서 카드 그리드, 빈 상태 |
| `WikiViewer` | Frontmatter 헤더 + prose 본문 |
| `WikiEditor` | 마크다운 편집 |
| `WikiSearch` | 전역 검색 Dialog |
| `CategoryFilter` | 카테고리 필터 칩 |
| `TableOfContents` | 문서 내 목차 |
| `Breadcrumbs` | 경로 표시 |
| `DeleteWikiDialog` | 삭제 확인 |
| `NewWikiForm` / `EditWikiForm` | CRUD 폼 |

---

## 6. 반복 패턴 (레시피)

### 6.1 문서 카드 (목록)

```text
Link → Card (hover:shadow-md)
  CardHeader → CardTitle (line-clamp-2)
  CardContent → category badge (rounded-full bg-secondary) + updatedAt (text-muted-foreground)
```

### 6.2 문서 뷰어

```text
article
  header (mb-8)
    h1 (text-3xl font-semibold)
    meta row (text-sm text-muted-foreground)
      category badge (rounded-full bg-secondary)
  .wiki-content.prose (본문 HTML)
```

### 6.3 삭제 확인 Dialog

```text
DialogTrigger → Button variant="destructive"
DialogContent
  DialogHeader (제목 + 설명)
  [optional] error box (destructive tint)
  DialogFooter → outline "취소" + destructive "삭제"
```

### 6.4 빈 상태

```text
py-12 text-center
  p (text-muted-foreground text-lg)
  Link (text-primary hover:underline) → CTA
```

### 6.5 카테고리 배지

현재 인라인 span으로 구현:

```text
rounded-full bg-secondary px-2 py-1 text-xs
```

3곳 이상에서 동일하면 `WikiBadge` 또는 shadcn `Badge`로 추출합니다.

### 6.6 아이콘

- 라이브러리: **lucide-react** (`components.json` iconLibrary)
- Nav·버튼 내 아이콘: `h-4 w-4`, 버튼과 함께 쓸 때 `mr-2`
- shadcn Button은 `[&_svg]:size-4` 내장

---

## 7. 다크 모드

- **구현:** `next-themes` + `ThemeProvider` (`components/providers/theme-provider.tsx`)
- **CSS:** `@custom-variant dark (&:where(.dark, .dark *))` — class 기반 토글
- **본문:** `dark:prose-invert`로 prose 색 반전
- **검증 체크리스트:** Nav, Sidebar, Card, Dialog, 코드블록, Input/Form, Skeleton

---

## 8. Do / Don't

### Do

- 색·배경은 `bg-background`, `text-muted-foreground`, `border-border` 등 토큰 클래스 사용
- 새 인터랙션은 `Button` variant로 의미 표현
- 반복 UI는 `components/wiki/` 패턴 재사용
- 폼 필드에 `name` 속성 명시 (접근성·브라우저 autofill)
- 아이콘-only 버튼에 `aria-label` 제공

### Don't

- `slate-*`, `gray-*`, `zinc-*` 등 팔레트 직접 사용 (prose 포함)
- 페이지에서 `bg-primary` 등 토큰을 임의로 재정의
- `components/ui/`에 위키 비즈니스 로직 추가
- 인라인 `style={{ ... }}` (Tailwind로 처리)
- destructive 없이 삭제·되돌릴 수 없는 액션 제공

---

## 9. 확장 로드맵

우선순위 순으로 진행합니다. 한 번에 전부 하지 않아도 됩니다.

| 단계 | 작업 | 완료 기준 |
| --- | --- | --- |
| 1 | 이 문서(`design.md`) 합의 | 원칙 3~5개 팀(또는 본인) 공유 |
| 2 | `--primary` 브랜드 색 반영 | 라이트·다크 CTA 대비 OK |
| 3 | `wiki-viewer` prose 토큰화 | `slate-*` grep 0건 (wiki 도메인) |
| 4 | `content/design-system.md` | 위키에서 토큰·컴포넌트 예시 열람 가능 |
| 5 | 반복 패턴 추출 | Badge, EmptyState 등 2~3개 |
| 6 | (선택) Storybook 또는 `/design` 페이지 | 컴포넌트 15개+ 또는 팀 협업 시 |

---

## 10. 참고

- shadcn/ui 설정: `components.json`
- 전역 토큰: `app/globals.css`
- 클래스 병합: `lib/utils.ts` → `cn()`
- 성숙한 DS 참고 예시: [saas-interface-kit/design.md](../saas-interface-kit/design.md) (B2B 콘솔 규모; 구조만 참고)

---

*이 문서는 living document입니다. 패턴을 추가·변경할 때 해당 섹션과 실제 코드를 함께 업데이트하세요.*
