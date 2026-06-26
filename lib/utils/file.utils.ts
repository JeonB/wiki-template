import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { wikiConfig } from '@/lib/config/wiki.config';
import { filenameToSlug, isValidSlug, normalizeSlug, normalizeSlugForSave } from '@/lib/utils/slug.utils';

export { filenameToSlug, isValidSlug, normalizeSlug, normalizeSlugForSave };

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

/**
 * 마크다운 파일 여부 확인
 */
export function isMarkdownFile(filename: string): boolean {
  return wikiConfig.allowedExtensions.some((extension) => filename.endsWith(extension));
}

/**
 * 기존 문서 파일 경로 조회
 */
export async function findExistingFilePath(slug: string): Promise<string | null> {
  const defaultFilePath = getFilePath(slug);

  if (existsSync(defaultFilePath)) {
    return defaultFilePath;
  }

  if (!existsSync(wikiConfig.contentDir)) {
    return null;
  }

  const files = await readdir(wikiConfig.contentDir);
  const matchedFile = files.find((file) => isMarkdownFile(file) && filenameToSlug(file) === slug);

  return matchedFile ? join(wikiConfig.contentDir, matchedFile) : null;
}
