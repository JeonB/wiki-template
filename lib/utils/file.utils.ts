import { extname, join } from 'path';
import { wikiConfig } from '@/lib/config/wiki.config';
export { canonicalizeSlug, filenameToSlug, isValidSlug, normalizeSlug } from '@/lib/utils/slug.utils';

/**
 * 슬러그를 파일명으로 변환
 */
function slugToFilename(slug: string): string {
  return `${slug}.md`;
}

/**
 * 슬러그로 파일 경로 생성
 */
export function getFilePath(slug: string): string {
  return join(wikiConfig.contentDir, slugToFilename(slug));
}

export function isMarkdownFilename(filename: string): boolean {
  const allowedExtensions: readonly string[] = wikiConfig.allowedExtensions;
  return allowedExtensions.includes(extname(filename).toLowerCase());
}
