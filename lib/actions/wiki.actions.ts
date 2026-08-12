'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { readFile, writeFile, unlink } from 'fs/promises';
import matter from 'gray-matter';
import { wikiConfig } from '@/lib/config/wiki.config';
import { canonicalizeSlug, isValidSlug } from '@/lib/utils/slug.utils';
import {
  getNewContentFilePath,
  getUniqueMarkdownContentFiles,
  resolveContentFile,
  resolveContentFiles,
} from '@/lib/utils/content-file.utils';
import {
  normalizeWikiFrontmatter,
  parseMarkdownFile,
  serializeToMarkdown,
} from '@/lib/utils/markdown.utils';
import { matchesWikiItem, matchesSearch } from '@/lib/utils/search.utils';
import type { WikiPage, WikiListItem } from '@/lib/types/wiki.types';

const userFacingActionMessages = new Set([
  'Invalid slug',
  'Page already exists',
  'Page not found',
  '슬러그, 제목, 내용을 모두 입력해주세요',
  '제목과 내용을 입력해주세요',
  '문서가 변경되었습니다. 최신 내용을 다시 불러온 뒤 수정해주세요.',
]);

function getFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

function isKnownActionError(error: unknown): error is Error {
  return error instanceof Error && userFacingActionMessages.has(error.message);
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

/**
 * Wiki 페이지 목록 조회
 */
export async function getWikiList(): Promise<WikiListItem[]> {
  try {
    const markdownFiles = await getUniqueMarkdownContentFiles();
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
          console.error(`Error reading file ${file}:`, error);
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
      return null;
    }

    const contentFile = await resolveContentFile(slug);
    if (!contentFile) {
      return null;
    }

    const content = await readFile(contentFile.filePath, 'utf-8');
    return await parseMarkdownFile(content, contentFile.slug);
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

    const existingFile = await resolveContentFile(slug);
    if (existingFile) {
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
    try {
      await writeFile(getNewContentFilePath(slug), markdown, { encoding: 'utf-8', flag: 'wx' });
    } catch (error) {
      if (isErrnoException(error) && error.code === 'EEXIST') {
        throw new Error('Page already exists');
      }
      throw error;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating wiki page:', error);
    }
    if (isKnownActionError(error)) {
      throw error;
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
    expectedUpdatedAt?: string;
  },
): Promise<void> {
  try {
    if (!isValidSlug(slug)) {
      throw new Error('Invalid slug');
    }

    const contentFile = await resolveContentFile(slug);
    if (!contentFile) {
      throw new Error('Page not found');
    }

    const existingContent = await readFile(contentFile.filePath, 'utf-8');
    const existingPage = await parseMarkdownFile(existingContent, contentFile.slug);

    if (
      updates.expectedUpdatedAt &&
      existingPage.frontmatter.updatedAt !== updates.expectedUpdatedAt
    ) {
      throw new Error('문서가 변경되었습니다. 최신 내용을 다시 불러온 뒤 수정해주세요.');
    }

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
    await writeFile(contentFile.filePath, markdown, 'utf-8');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating wiki page:', error);
    }
    if (isKnownActionError(error)) {
      throw error;
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

    const contentFiles = await resolveContentFiles(slug);
    if (contentFiles.length === 0) {
      throw new Error('Page not found');
    }

    for (const file of contentFiles) {
      await unlink(file.filePath);
    }
    revalidatePath('/', 'layout');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting wiki page:', error);
    }
    if (isKnownActionError(error)) {
      throw error;
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

    const markdownFiles = await getUniqueMarkdownContentFiles();
    const results: WikiListItem[] = [];

    for (const file of markdownFiles) {
      try {
        const raw = await readFile(file.filePath, 'utf-8');
        const { data, content: body } = matter(raw);
        const slug = file.slug;
        const frontmatter = normalizeWikiFrontmatter(data as Record<string, unknown>);

        const item: WikiListItem = {
          slug,
          title: frontmatter.title,
          description: frontmatter.description,
          category: frontmatter.category,
          tags: frontmatter.tags,
          updatedAt: frontmatter.updatedAt,
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
 * Wiki 페이지 생성 액션
 */
export async function createWikiPageAction(formData: FormData): Promise<string> {
  return await createWikiPageFromFormData(formData);
}

/**
 * FormData에서 Wiki 페이지 생성
 */
async function createWikiPageFromFormData(formData: FormData): Promise<string> {
  const slug = canonicalizeSlug(getFormString(formData, 'slug'));
  const title = getFormString(formData, 'title');
  const content = getFormString(formData, 'content');
  const category = getFormString(formData, 'category') || undefined;

  if (!slug || !title || !content) {
    throw new Error('슬러그, 제목, 내용을 모두 입력해주세요');
  }

  await createWikiPage(slug, title, content, {
    category,
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
  const title = getFormString(formData, 'title');
  const content = getFormString(formData, 'content');
  const category = getFormString(formData, 'category') || undefined;
  const expectedUpdatedAt = getFormString(formData, 'expectedUpdatedAt') || undefined;

  if (!title || !content) {
    throw new Error('제목과 내용을 입력해주세요');
  }

  await updateWikiPage(slug, {
    title,
    content,
    expectedUpdatedAt,
    frontmatter: {
      category,
    },
  });
  revalidatePath('/', 'layout');
}
