import type { TocItem } from '@/lib/types/wiki.types';

/**
 * 텍스트를 URL-safe한 ID로 변환
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 마크다운 컨텐츠에서 제목(Heading) 추출
 */
export function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  const seenIds = new Set<string>();

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugify(text);

    // 중복 ID 처리
    let uniqueId = id;
    let counter = 1;
    while (seenIds.has(uniqueId)) {
      uniqueId = `${id}-${counter}`;
      counter++;
    }
    seenIds.add(uniqueId);

    headings.push({
      id: uniqueId,
      text,
      level,
    });
  }

  return headings;
}

/**
 * HTML 컨텐츠에 제목에 ID 추가
 */
export function addIdsToHeadings(html: string, headings: TocItem[]): string {
  if (headings.length === 0) return html;

  let result = html;
  let processedCount = 0;

  // 각 제목 레벨별로 처리
  for (let level = 1; level <= 6; level++) {
    const levelHeadings = headings.filter((h) => h.level === level);
    if (levelHeadings.length === 0) continue;

    // 해당 레벨의 모든 h 태그 찾기
    const regex = new RegExp(`<h${level}([^>]*)>([^<]+)</h${level}>`, 'gi');
    result = result.replace(regex, (match, attrs, text) => {
      // 이미 id가 있으면 건너뛰기
      if (attrs && attrs.includes('id=')) {
        return match;
      }

      // 텍스트를 정규화하여 매칭
      const normalizedText = text.trim();
      const heading = levelHeadings.find(
        (h) => h.text === normalizedText || h.text.includes(normalizedText) || normalizedText.includes(h.text),
      );

      if (heading && processedCount < headings.length) {
        processedCount++;
        return `<h${level}${attrs} id="${heading.id}">${text}</h${level}>`;
      }

      // 매칭되지 않으면 slugify하여 ID 생성
      const fallbackId = slugify(normalizedText);
      return `<h${level}${attrs} id="${fallbackId}">${text}</h${level}>`;
    });
  }

  return result;
}

