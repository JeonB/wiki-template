import { join } from 'path';
import { cwd } from 'process';
import { UNCATEGORIZED_LABEL, WIKI_MARKDOWN_EXTENSIONS } from '@/lib/config/wiki.constants';

export { UNCATEGORIZED_LABEL };

/**
 * 문서 저장 경로. 배포 시 CONTENT_DIR 환경 변수로 덮어쓸 수 있음.
 * Docker 볼륨 마운트 시 예: CONTENT_DIR=/app/content
 */
const contentDir = process.env.CONTENT_DIR ?? join(cwd(), 'content');

export const wikiConfig = {
  contentDir,
  allowedExtensions: WIKI_MARKDOWN_EXTENSIONS,
  defaultFrontmatter: {
    title: 'Untitled',
    category: '',
  },
} as const;
