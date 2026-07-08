'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { readFile, writeFile, unlink, readdir, rename, rm } from 'fs/promises';
import { createHash, randomUUID } from 'crypto';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import matter from 'gray-matter';
import { wikiConfig } from '@/lib/config/wiki.config';
import { getFilePath, filenameToSlug, isValidSlug } from '@/lib/utils/file.utils';
import { parseMarkdownFile, serializeToMarkdown } from '@/lib/utils/markdown.utils';
import { matchesWikiItem, matchesSearch } from '@/lib/utils/search.utils';
import type { WikiPage, WikiListItem } from '@/lib/types/wiki.types';

const STALE_PAGE_ERROR_MESSAGE = '문서가 열린 뒤 수정되었습니다. 페이지를 새로고침한 후 다시 시도해주세요.';
const MISSING_REVISION_ERROR_MESSAGE = '문서 수정 정보가 만료되었습니다. 페이지를 새로고침한 후 다시 시도해주세요.';
const wikiPageLocks = new Map<string, Promise<void>>();

interface WikiFileEntry {
  filename: string;
  filePath: string;
  slug: string;
  rank: number;
}

function isMarkdownFile(filename: string): boolean {
  const allowedExtensions: readonly string[] = wikiConfig.allowedExtensions;
  return allowedExtensions.includes(extname(filename).toLowerCase());
}

function getContentRevision(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function getFileRank(filename: string, slug: string): number {
  if (filename === `${slug}.md`) return 0;
  if (filename === `${slug}.markdown`) return 1;

  const lowerFilename = filename.toLowerCase();
  if (lowerFilename === `${slug}.md`) return 2;
  if (lowerFilename === `${slug}.markdown`) return 3;

  return 4;
}

async function getWikiFileEntries(): Promise<WikiFileEntry[]> {
  if (!existsSync(wikiConfig.contentDir)) {
    return [];
  }

  const files = await readdir(wikiConfig.contentDir);
  return files
    .filter(isMarkdownFile)
    .map((filename) => {
      const slug = filenameToSlug(filename);
      return {
        filename,
        filePath: join(wikiConfig.contentDir, filename),
        slug,
        rank: getFileRank(filename, slug),
      };
    })
    .filter((entry) => isValidSlug(entry.slug))
    .sort((a, b) => {
      if (a.slug !== b.slug) return a.slug.localeCompare(b.slug);
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.filename.localeCompare(b.filename);
    });
}

async function getUniqueWikiFileEntries(): Promise<WikiFileEntry[]> {
  const entries = await getWikiFileEntries();
  const uniqueEntries = new Map<string, WikiFileEntry>();

  for (const entry of entries) {
    if (!uniqueEntries.has(entry.slug)) {
      uniqueEntries.set(entry.slug, entry);
    }
  }

  return [...uniqueEntries.values()];
}

async function resolveWikiFilePath(slug: string): Promise<string | null> {
  const entry = (await getUniqueWikiFileEntries()).find((candidate) => candidate.slug === slug);
  return entry?.filePath ?? null;
}

async function resolveWikiFilePaths(slug: string): Promise<string[]> {
  return (await getWikiFileEntries())
    .filter((entry) => entry.slug === slug)
    .map((entry) => entry.filePath);
}

async function writeWikiFileAtomically(filePath: string, content: string): Promise<void> {
  const tempFilePath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;

  try {
    await writeFile(tempFilePath, content, { encoding: 'utf-8', flag: 'wx' });
    await rename(tempFilePath, filePath);
  } catch (error) {
    await rm(tempFilePath, { force: true }).catch(() => undefined);
    throw error;
  }
}

async function withWikiPageLock<T>(slug: string, task: () => Promise<T>): Promise<T> {
  const previousLock = wikiPageLocks.get(slug) ?? Promise.resolve();
  let releaseCurrentLock: () => void = () => {};
  const currentLock = new Promise<void>((resolve) => {
    releaseCurrentLock = resolve;
  });
  const queuedLock = previousLock.catch(() => undefined).then(() => currentLock);
  wikiPageLocks.set(slug, queuedLock);

  await previousLock;

  try {
    return await task();
  } finally {
    releaseCurrentLock();
    if (wikiPageLocks.get(slug) === queuedLock) {
      wikiPageLocks.delete(slug);
    }
  }
}

function rethrowUserFacingUpdateError(error: unknown): void {
  if (
    error instanceof Error &&
    (error.message === STALE_PAGE_ERROR_MESSAGE || error.message === MISSING_REVISION_ERROR_MESSAGE)
  ) {
    throw error;
  }
}

/**
 * Wiki 페이지 목록 조회
 */
export async function getWikiList(): Promise<WikiListItem[]> {
  try {
    const markdownFiles = await getUniqueWikiFileEntries();

    const items: WikiListItem[] = [];

    for (const file of markdownFiles) {
      try {
        const content = await readFile(file.filePath, 'utf-8');
        const slug = file.slug;
        const parsed = await parseMarkdownFile(content, slug);

        items.push({
          slug,
          title: parsed.frontmatter.title,
          description: parsed.frontmatter.description,
          category: parsed.frontmatter.category,
          tags: parsed.frontmatter.tags,
          updatedAt: parsed.frontmatter.updatedAt,
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Error reading file ${file.filename}:`, error);
        }
        // 개별 파일 오류는 무시하고 계속 진행
      }
    }

    // 업데이트 날짜 기준으로 정렬 (최신순)
    items.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    return items;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting wiki list:', error);
    }
    throw new Error('Failed to get wiki list');
  }
}

/**
 * Wiki 페이지 조회
 */
export async function getWikiPage(slug: string): Promise<WikiPage | null> {
  try {
    if (!isValidSlug(slug)) {
      throw new Error('Invalid slug');
    }

    const filePath = await resolveWikiFilePath(slug);

    if (!filePath) {
      return null;
    }

    const content = await readFile(filePath, 'utf-8');
    const page = await parseMarkdownFile(content, slug);
    return {
      ...page,
      revision: getContentRevision(content),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting wiki page:', error);
    }
    throw new Error('Failed to get wiki page');
  }
}

/**
 * Wiki 페이지 생성
 */
async function createWikiPage(
  slug: string,
  title: string,
  content: string,
  frontmatter?: Partial<WikiPage['frontmatter']>,
): Promise<void> {
  try {
    if (!isValidSlug(slug)) {
      throw new Error('Invalid slug');
    }

    const filePath = getFilePath(slug);
    const existingFilePath = await resolveWikiFilePath(slug);

    if (existingFilePath) {
      throw new Error('Page already exists');
    }

    const page: WikiPage = {
      slug,
      frontmatter: {
        ...wikiConfig.defaultFrontmatter,
        ...frontmatter,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      content,
    };

    const markdown = serializeToMarkdown(page);
    await writeFile(filePath, markdown, { encoding: 'utf-8', flag: 'wx' });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating wiki page:', error);
    }
    throw new Error('Failed to create wiki page');
  }
}

/**
 * Wiki 페이지 업데이트
 */
async function updateWikiPage(
  slug: string,
  updates: {
    title?: string;
    content?: string;
    frontmatter?: Partial<WikiPage['frontmatter']>;
    expectedRevision: string;
  },
): Promise<void> {
  try {
    if (!isValidSlug(slug)) {
      throw new Error('Invalid slug');
    }

    if (!updates.expectedRevision) {
      throw new Error(MISSING_REVISION_ERROR_MESSAGE);
    }

    const filePath = await resolveWikiFilePath(slug);

    if (!filePath) {
      throw new Error('Page not found');
    }

    const existingContent = await readFile(filePath, 'utf-8');
    if (getContentRevision(existingContent) !== updates.expectedRevision) {
      throw new Error(STALE_PAGE_ERROR_MESSAGE);
    }

    const existingPage = await parseMarkdownFile(existingContent, slug);

    const updatedPage: WikiPage = {
      ...existingPage,
      frontmatter: {
        ...existingPage.frontmatter,
        ...(updates.title && { title: updates.title }),
        ...updates.frontmatter,
        updatedAt: new Date().toISOString(),
      },
      content: updates.content !== undefined ? updates.content : existingPage.content,
    };

    const markdown = serializeToMarkdown(updatedPage);
    await writeWikiFileAtomically(filePath, markdown);
  } catch (error) {
    rethrowUserFacingUpdateError(error);
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating wiki page:', error);
    }
    throw new Error('Failed to update wiki page');
  }
}

/**
 * Wiki 페이지 삭제
 */
export async function deleteWikiPage(slug: string): Promise<void> {
  try {
    if (!isValidSlug(slug)) {
      throw new Error('Invalid slug');
    }

    const filePaths = await resolveWikiFilePaths(slug);

    if (filePaths.length === 0) {
      throw new Error('Page not found');
    }

    await Promise.all(filePaths.map((filePath) => unlink(filePath)));
    revalidatePath('/', 'layout');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting wiki page:', error);
    }
    throw new Error('Failed to delete wiki page');
  }
}

/**
 * Wiki 페이지 검색 (제목, 설명, 태그, 카테고리, 본문 내용 포함)
 */
export async function searchWikiPages(query: string): Promise<WikiListItem[]> {
  try {
    const q = query.trim();
    if (!q) return [];

    const markdownFiles = await getUniqueWikiFileEntries();
    const results: WikiListItem[] = [];

    for (const file of markdownFiles) {
      try {
        const raw = await readFile(file.filePath, 'utf-8');
        const { data, content: body } = matter(raw);
        const slug = file.slug;

        const item: WikiListItem = {
          slug,
          title: data.title || 'Untitled',
          description: data.description,
          category: data.category,
          tags: Array.isArray(data.tags) ? data.tags : [],
          updatedAt: data.updatedAt || data.date || new Date().toISOString(),
        };

        const metaMatch = matchesWikiItem(item, q);
        const contentMatch = matchesSearch((body ?? '').trim(), q);
        if (metaMatch || contentMatch) {
          results.push(item);
        }
      } catch {
        // 개별 파일 오류는 무시
      }
    }

    results.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    return results;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error searching wiki pages:', error);
    }
    throw new Error('Failed to search wiki pages');
  }
}

/**
 * Wiki 페이지 생성 액션 (redirect 포함)
 */
export async function createWikiPageAction(formData: FormData): Promise<void> {
  const slug = await createWikiPageFromFormData(formData);
  redirect(`/${slug}`);
}

/**
 * FormData에서 Wiki 페이지 생성
 */
async function createWikiPageFromFormData(formData: FormData): Promise<string> {
  const slug = ((formData.get('slug') as string) ?? '')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const category = (formData.get('category') as string) || undefined;

  if (!slug || !title || !content) {
    throw new Error('슬러그, 제목, 내용을 모두 입력해주세요');
  }

  await withWikiPageLock(slug, async () => {
    await createWikiPage(slug, title, content, {
      category,
    });
  });
  revalidatePath('/', 'layout');
  return slug;
}

/**
 * Wiki 페이지 업데이트 액션 (redirect 포함)
 */
export async function updateWikiPageAction(slug: string, formData: FormData): Promise<void> {
  await updateWikiPageFromFormData(slug, formData);
  redirect(`/${slug}`);
}

/**
 * FormData에서 Wiki 페이지 업데이트
 */
async function updateWikiPageFromFormData(
  slug: string,
  formData: FormData,
): Promise<void> {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const category = (formData.get('category') as string) || undefined;
  const revision = (formData.get('revision') as string) || '';

  if (!title || !content) {
    throw new Error('제목과 내용을 입력해주세요');
  }

  await withWikiPageLock(slug, async () => {
    await updateWikiPage(slug, {
      title,
      content,
      expectedRevision: revision,
      frontmatter: {
        category,
      },
    });
  });
  revalidatePath('/', 'layout');
}
