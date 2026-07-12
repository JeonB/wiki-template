function stripExtension(filename: string): string {
  const pathSegments = filename.split(/[\\/]/);
  const basename = pathSegments[pathSegments.length - 1] ?? filename;
  const extensionIndex = basename.lastIndexOf('.');
  return extensionIndex > 0 ? basename.slice(0, extensionIndex) : basename;
}

/**
 * 파일명을 슬러그로 변환
 */
export function filenameToSlug(filename: string): string {
  return stripExtension(filename)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * 슬러그가 유효한지 확인
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0;
}

/**
 * 사용자 입력을 슬러그 형식으로 정규화 (입력 중 실시간 적용용)
 * 영문 소문자, 숫자, 하이픈만 허용하고 연속된 하이픈을 하나로 통합.
 * 앞뒤 하이픈은 입력 시 제거하지 않아, 'getting-' 입력 중 하이픈이 사라지지 않도록 함.
 * 저장 시 앞뒤 하이픈은 createWikiPageFromFormData 등에서 별도 제거.
 */
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-');
}

export function canonicalizeSlug(input: string): string {
  return normalizeSlug(input).replace(/^-+/, '').replace(/-+$/, '');
}
