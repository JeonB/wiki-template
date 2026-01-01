import { join } from 'path';
import { cwd } from 'process';

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
