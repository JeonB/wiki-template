/**
 * 태그를 정규화 (소문자 변환, 공백을 하이픈으로, 특수문자 제거)
 */
export function normalizeTag(tag: string, maxLength: number = 20): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .slice(0, maxLength);
}

/**
 * 태그가 유효한지 확인
 */
export function isValidTag(tag: string, maxLength: number = 20): boolean {
  const normalized = normalizeTag(tag, maxLength);
  return normalized.length > 0 && normalized.length <= maxLength;
}
