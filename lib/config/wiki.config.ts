import { join } from 'path';
import { cwd } from 'process';

/** 빈 카테고리 표시 라벨 (일관성 유지용) */
export const UNCATEGORIZED_LABEL = '미분류';

/**
 * 문서 저장 경로. 배포 시 CONTENT_DIR 환경 변수로 덮어쓸 수 있음.
 * Docker 볼륨 마운트 시 예: CONTENT_DIR=/app/content
 */
const contentDir = process.env.CONTENT_DIR ?? join(cwd(), 'content');

export const wikiConfig = {
  contentDir,
  allowedExtensions: ['.md', '.markdown'] as const,
  defaultFrontmatter: {
    title: 'Untitled',
    category: '',
  },
} as const;
