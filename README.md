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
- **마크다운**: remark, remark-rehype, remark-gfm, rehype-sanitize
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

- **환경 변수 (권장)**: 배포 시 `CONTENT_DIR`을 설정하면 문서 저장 경로를 덮어씁니다.  
  예: `CONTENT_DIR=/app/content` (Docker), `CONTENT_DIR=/data/wiki-content` (VPS)
- **코드 수정**: `lib/config/wiki.config.ts`에서 `contentDir` 기본값을 수정할 수도 있습니다.

## 배포

### 중요: 배포 플랫폼 제한

이 프로젝트는 **파일시스템 기반**으로 문서를 저장합니다. 문서 생성/수정/삭제 시 `content/` 디렉토리에 직접 쓰기를 수행합니다.

- **Vercel**: 지원하지 않음. Vercel 서버리스 함수는 읽기 전용 파일시스템을 사용하므로 문서 쓰기 동작이 불가능합니다.
- **권장 플랫폼**: Docker, VPS, Railway, Render 등 파일시스템 쓰기를 지원하는 환경

### 데이터 유지 (content 경로·쓰기 권한·볼륨)

문서가 서버 재시작 후에도 유지되려면 다음을 지켜야 합니다.

| 항목 | 설명 |
|------|------|
| **저장 경로** | 기본값은 프로젝트 루트의 `content/`. 배포 시 `CONTENT_DIR` 환경 변수로 변경 가능 (예: Docker 내 `/app/content`). |
| **쓰기 권한** | 앱이 실행되는 사용자(또는 프로세스)가 해당 경로에 **쓰기 권한**이 있어야 합니다. Docker 이미지는 `content/`에 대해 `nextjs` 사용자 소유로 설정되어 있습니다. |
| **볼륨 마운트** | Docker 사용 시 반드시 **볼륨 마운트**로 호스트의 디렉터리를 컨테이너의 content 경로에 연결하세요. 마운트하지 않으면 컨테이너만의 파일시스템에 저장되어 재시작 시 사라집니다. |

### Docker 배포 (권장)

```bash
# Docker 이미지 빌드
docker build -t wiki-template .

# 컨테이너 실행 (볼륨 마운트로 데이터 유지)
docker run -p 3000:3000 -v $(pwd)/content:/app/content wiki-template
```

- `-v $(pwd)/content:/app/content`: 호스트의 `content/` 디렉터리를 컨테이너의 `/app/content`(기본 `CONTENT_DIR`)에 마운트합니다. 문서는 호스트에 저장되므로 컨테이너를 지워도 유지됩니다.
- 컨테이너 내부에서 `nextjs`(uid 1001) 사용자가 해당 경로에 쓰기하므로, 호스트의 `content/` 디렉터리 권한이 너무 제한적이면 쓰기 실패할 수 있습니다. 필요 시 `chmod 755 content` 또는 `chown 1001:1001 content` 등으로 조정하세요.

### 온프레미스 서버에서 Docker 운영

위 Docker 배포와 동일하게 구성하면 됩니다. 온프레미스에서도 다음만 지키면 됩니다.

- **볼륨 마운트**: 반드시 `-v 호스트경로:/app/content`로 실행해 문서가 호스트 디스크에 저장되도록 하세요. 예: `-v /opt/wiki/content:/app/content`
- **쓰기 권한**: 호스트의 마운트 경로(`/opt/wiki/content` 등)에 컨테이너 내 nextjs(uid 1001)가 쓸 수 있어야 합니다. `chown 1001:1001 /opt/wiki/content` 또는 `chmod 777`(보안상 비권장) 등으로 맞춰 주세요.
- **재시작 정책**: 서버 재부팅 시 컨테이너가 다시 떠야 하면 `docker run`에 `--restart unless-stopped`를 붙이거나, docker-compose / Kubernetes 등으로 재시작 정책을 설정하면 됩니다.

### 기타 배포 옵션

- **Railway, Render**: Dockerfile 기반 배포 후 Persistent Disk/Volume을 **`/app/content`에 마운트** (또는 원하는 경로에 마운트한 뒤 `CONTENT_DIR`로 지정).
- **VPS (AWS EC2, GCP, DigitalOcean 등)**: Docker 사용 시 위와 동일하게 볼륨 마운트. 직접 실행 시 `pnpm build && pnpm start`로 루트의 `content/`에 쓰기 권한만 확인하면 됩니다.

### 주의사항

- `content/` 디렉토리는 Git에 포함되어야 합니다 (문서 파일 저장).
- 배포 환경에서 **content 경로에 쓰기 권한**이 있어야 하며, Docker는 **반드시 볼륨 마운트**로 같은 경로를 유지해야 데이터가 보존됩니다.

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