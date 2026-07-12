import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { wikiConfig } from '@/lib/config/wiki.config';
import { getFilePath, isMarkdownFilename } from '@/lib/utils/file.utils';
import { filenameToSlug, isValidSlug } from '@/lib/utils/slug.utils';

export interface WikiContentFile {
  filename: string;
  filePath: string;
  slug: string;
}

function getContentFileRank(file: WikiContentFile): number {
  const mdFilename = `${file.slug}.md`;
  const markdownFilename = `${file.slug}.markdown`;
  const lowerFilename = file.filename.toLowerCase();

  if (file.filename === mdFilename) return 0;
  if (file.filename === markdownFilename) return 1;
  if (lowerFilename === mdFilename) return 2;
  if (lowerFilename === markdownFilename) return 3;
  return 4;
}

function sortContentFiles(a: WikiContentFile, b: WikiContentFile): number {
  const rankDiff = getContentFileRank(a) - getContentFileRank(b);
  if (rankDiff !== 0) return rankDiff;
  return a.filename.localeCompare(b.filename, 'en');
}

export async function getMarkdownContentFiles(): Promise<WikiContentFile[]> {
  if (!existsSync(wikiConfig.contentDir)) {
    return [];
  }

  const files = await readdir(wikiConfig.contentDir);
  return files
    .filter(isMarkdownFilename)
    .map((filename) => ({
      filename,
      filePath: join(wikiConfig.contentDir, filename),
      slug: filenameToSlug(filename),
    }))
    .filter((file) => isValidSlug(file.slug))
    .sort(sortContentFiles);
}

export async function getUniqueMarkdownContentFiles(): Promise<WikiContentFile[]> {
  const files = await getMarkdownContentFiles();
  const bySlug = new Map<string, WikiContentFile>();

  for (const file of files) {
    if (!bySlug.has(file.slug)) {
      bySlug.set(file.slug, file);
    }
  }

  return Array.from(bySlug.values());
}

export async function resolveContentFile(slug: string): Promise<WikiContentFile | null> {
  const files = await resolveContentFiles(slug);
  return files[0] ?? null;
}

export async function resolveContentFiles(slug: string): Promise<WikiContentFile[]> {
  if (!isValidSlug(slug)) {
    return [];
  }

  const files = await getMarkdownContentFiles();
  return files.filter((file) => file.slug === slug);
}

export function getNewContentFilePath(slug: string): string {
  return getFilePath(slug);
}
