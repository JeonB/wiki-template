# Wiki Template - Dockerfile
# 파일시스템 기반 content/ 저장소를 사용합니다.
# content/ 영속성을 위해 볼륨 마운트를 권장합니다.

FROM node:20-alpine AS base

# 1. 의존성 설치
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# 2. 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable pnpm && pnpm run build

# 3. 프로덕션 실행
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# standalone 출력 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# content/ 디렉터리 복사 (초기 문서)
COPY --from=builder /app/content ./content

# content/ 쓰기 권한 (문서 생성/수정/삭제용)
RUN chown -R nextjs:nodejs ./content

# content/ 영속성: -v $(pwd)/content:/app/content 로 볼륨 마운트
VOLUME ["/app/content"]

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
