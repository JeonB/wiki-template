# Wiki Template

회사 생활에 필요한 정보 제공용 Wiki 템플릿 프로젝트입니다. 마크다운 파일 기반으로 문서를 관리하며, 부서원 누구나 참여할 수 있는 형태로 구성되어 있습니다.

## 특징

- **파일 기반 저장**: 모든 문서는 마크다운 파일(`.md`)로 `content/` 디렉토리에 저장됩니다.
- **Git 버전 관리**: 문서 파일을 Git으로 관리할 수 있어 변경 이력을 추적할 수 있습니다.
- **인증 없음**: 누구나 읽기, 쓰기, 수정, 삭제가 가능합니다.
- **템플릿 형태**: 이직 후에도 재사용 가능한 템플릿 형태로 구성되어 있습니다.
- **마크다운 지원**: 표준 마크다운 문법과 GFM(GitHub Flavored Markdown)을 지원합니다.
- **카테고리 및 태그**: Frontmatter를 통해 문서를 분류할 수 있습니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **마크다운**: remark, remark-html, remark-gfm
- **스타일링**: Tailwind CSS Typography

## 시작하기

### 설치

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인할 수 있습니다.

### 문서 작성

1. 웹 인터페이스를 통해 문서 작성/수정/삭제 가능
2. 또는 `content/` 디렉토리에 직접 마크다운 파일을 추가/수정할 수 있습니다

### 문서 형식

각 마크다운 파일은 Frontmatter로 메타데이터를 포함합니다:

```markdown
---
title: 문서 제목
description: 문서 설명
category: 카테고리
tags:
  - 태그1
  - 태그2
createdAt: '2024-01-01T00:00:00.000Z'
updatedAt: '2024-01-01T00:00:00.000Z'
---

# 문서 내용

마크다운 형식으로 작성합니다.
```

## 프로젝트 구조

```
wiki-template/
├── app/
│   ├── (wiki)/              # Wiki 라우트 그룹
│   │   ├── layout.tsx       # Wiki 레이아웃
│   │   ├── page.tsx         # 문서 목록 페이지
│   │   ├── new/
│   │   │   └── page.tsx     # 새 문서 작성 페이지
│   │   └── [slug]/
│   │       ├── page.tsx     # 문서 읽기 페이지
│   │       └── edit/
│   │           └── page.tsx # 문서 편집 페이지
│   └── layout.tsx
├── components/
│   ├── wiki/                # Wiki 컴포넌트
│   │   ├── wiki-viewer.tsx  # 문서 뷰어
│   │   ├── wiki-editor.tsx  # 문서 에디터
│   │   ├── wiki-list.tsx    # 문서 목록
│   │   ├── edit-wiki-form.tsx
│   │   ├── new-wiki-form.tsx
│   │   └── delete-wiki-dialog.tsx
│   ├── layout/
│   │   └── wiki-nav.tsx     # Wiki 네비게이션
│   └── ui/                  # shadcn/ui 컴포넌트
├── content/                 # 마크다운 파일 저장소
│   ├── README.md
│   └── onboarding.md
├── lib/
│   ├── actions/
│   │   └── wiki.actions.ts  # 파일 CRUD 서버 액션
│   ├── config/
│   │   └── wiki.config.ts   # Wiki 설정
│   ├── types/
│   │   └── wiki.types.ts    # Wiki 타입 정의
│   └── utils/
│       ├── file.utils.ts    # 파일 유틸리티
│       └── markdown.utils.ts # 마크다운 유틸리티
└── README.md
```

## 설정

### 문서 저장 경로 변경

`lib/config/wiki.config.ts` 파일에서 `contentDir`을 수정할 수 있습니다:

```typescript
export const wikiConfig = {
  contentDir: join(cwd(), 'content'), // 여기를 수정
  // ...
};
```

## 배포

### Vercel 배포

1. GitHub에 저장소를 푸시합니다
2. [Vercel](https://vercel.com)에서 프로젝트를 import합니다
3. 배포 설정에서 Build Command는 `pnpm build`를 사용합니다

### Docker 배포

```bash
# Docker 이미지 빌드
docker build -t wiki-template .

# 컨테이너 실행
docker run -p 3000:3000 wiki-template
```

### 주의사항

- `content/` 디렉토리는 Git에 포함되어야 합니다 (문서 파일 저장)
- 배포 환경에서도 `content/` 디렉토리에 쓰기 권한이 필요합니다

## 사용자 정의

### 스타일 변경

- `app/globals.css`: 전역 스타일 및 테마 색상
- `components/ui/`: shadcn/ui 컴포넌트 커스터마이징

### 기능 확장

- 검색 기능 추가
- 카테고리별 필터링
- 문서 히스토리 (Git 기반)
- 이미지 업로드 기능
- 댓글 시스템

## 라이선스

이 프로젝트는 템플릿으로 제공되며, 자유롭게 수정하여 사용할 수 있습니다.

## 기여

버그 리포트나 기능 제안은 이슈로 등록해 주세요.