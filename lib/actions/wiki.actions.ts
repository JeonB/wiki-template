'use server';

import { readFile, writeFile, unlink, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { wikiConfig } from '@/lib/config/wiki.config';
import { getFilePath, filenameToSlug, isValidSlug, slugToFilename } from '@/lib/utils/file.utils';
import { parseMarkdownFile, serializeToMarkdown } from '@/lib/utils/markdown.utils';
import type { WikiPage, WikiListItem } from '@/lib/types/wiki.types';

/**
 * Wiki 페이지 목록 조회
 */
export async function getWikiList(): Promise<WikiListItem[]> {
  try {
    if (!existsSync(wikiConfig.contentDir)) {
      return [];
    }

    const files = await readdir(wikiConfig.contentDir);
    const markdownFiles = files.filter((file) => file.endsWith('.md') || file.endsWith('.markdown'));

    const items: WikiListItem[] = [];

    for (const file of markdownFiles) {
      try {
        const filePath = join(wikiConfig.contentDir, file);
        const content = await readFile(filePath, 'utf-8');
        const slug = filenameToSlug(file);
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
        console.error(`Error reading file ${file}:`, error);
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
    console.error('Error getting wiki list:', error);
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

    const filePath = getFilePath(slug);

    if (!existsSync(filePath)) {
      return null;
    }

    const content = await readFile(filePath, 'utf-8');
    return await parseMarkdownFile(content, slug);
  } catch (error) {
    console.error('Error getting wiki page:', error);
    throw new Error('Failed to get wiki page');
  }
}

/**
 * Wiki 페이지 생성
 */
export async function createWikiPage(
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

    if (existsSync(filePath)) {
      throw new Error('Page already exists');
    }

    const page: WikiPage = {
      slug,
      frontmatter: {
        ...wikiConfig.defaultFrontmatter,
        ...frontmatter,
        title,
        tags: frontmatter?.tags ? [...frontmatter.tags] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      content,
    };

    const markdown = serializeToMarkdown(page);
    await writeFile(filePath, markdown, 'utf-8');
  } catch (error) {
    console.error('Error creating wiki page:', error);
    throw new Error('Failed to create wiki page');
  }
}

/**
 * Wiki 페이지 업데이트
 */
export async function updateWikiPage(
  slug: string,
  updates: {
    title?: string;
    content?: string;
    frontmatter?: Partial<WikiPage['frontmatter']>;
  },
): Promise<void> {
  try {
    if (!isValidSlug(slug)) {
      throw new Error('Invalid slug');
    }

    const filePath = getFilePath(slug);

    if (!existsSync(filePath)) {
      throw new Error('Page not found');
    }

    const existingContent = await readFile(filePath, 'utf-8');
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
    await writeFile(filePath, markdown, 'utf-8');
  } catch (error) {
    console.error('Error updating wiki page:', error);
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

    const filePath = getFilePath(slug);

    if (!existsSync(filePath)) {
      throw new Error('Page not found');
    }

    await unlink(filePath);
  } catch (error) {
    console.error('Error deleting wiki page:', error);
    throw new Error('Failed to delete wiki page');
  }
}
