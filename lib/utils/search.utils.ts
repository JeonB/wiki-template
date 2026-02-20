import type { WikiListItem } from '@/lib/types/wiki.types';

/**
 * 검색어를 정규화 (소문자 변환, 공백 제거)
 */
export function normalizeSearchQuery(query: string): string {
  return query.toLowerCase().trim();
}

/**
 * 검색어가 텍스트에 포함되어 있는지 확인
 */
export function matchesSearch(text: string | undefined, query: string): boolean {
  if (!text) return false;
  const normalizedText = normalizeSearchQuery(text);
  const normalizedQuery = normalizeSearchQuery(query);
  return normalizedText.includes(normalizedQuery);
}

/**
 * Wiki 항목이 검색어와 일치하는지 확인
 */
export function matchesWikiItem(item: WikiListItem, query: string): boolean {
  if (!query) return true;

  const normalizedQuery = normalizeSearchQuery(query);

  // 제목 검색
  if (matchesSearch(item.title, normalizedQuery)) return true;

  // 설명 검색
  if (item.description && matchesSearch(item.description, normalizedQuery)) return true;

  // 카테고리 검색
  if (item.category && matchesSearch(item.category, normalizedQuery)) return true;

  // 태그 검색
  if (item.tags && item.tags.length > 0) {
    const tagMatch = item.tags.some((tag) => matchesSearch(tag, normalizedQuery));
    if (tagMatch) return true;
  }

  return false;
}

/**
 * 검색 결과 하이라이트를 위한 텍스트 분할
 */
export function highlightText(text: string, query: string): Array<{ text: string; highlight: boolean }> {
  if (!query) return [{ text, highlight: false }];

  const normalizedQuery = normalizeSearchQuery(query);
  const normalizedText = text.toLowerCase();
  const index = normalizedText.indexOf(normalizedQuery);

  if (index === -1) return [{ text, highlight: false }];

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  const result: Array<{ text: string; highlight: boolean }> = [];

  if (before) result.push({ text: before, highlight: false });
  if (match) result.push({ text: match, highlight: true });
  if (after) {
    const afterParts = highlightText(after, query);
    result.push(...afterParts);
  }

  return result;
}
