import { join } from 'path';
import { cwd } from 'process';

/** 빈 카테고리 표시 라벨 (일관성 유지용) */
export const UNCATEGORIZED_LABEL = '미분류';

export const wikiConfig = {
  contentDir: join(cwd(), 'content'),
  allowedExtensions: ['.md', '.markdown'] as const,
  defaultFrontmatter: {
    title: 'Untitled',
    description: '',
    category: '',
    tags: [],
  },
} as const;
