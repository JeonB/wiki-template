import { WIKI_MARKDOWN_EXTENSIONS } from '@/lib/config/wiki.constants';

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-');
}

export function normalizeSlugForSave(input: string): string {
  return normalizeSlug(input).replace(/^-+/, '').replace(/-+$/, '');
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0;
}

export function filenameToSlug(filename: string): string {
  const extension = WIKI_MARKDOWN_EXTENSIONS.find((ext) => filename.endsWith(ext)) ?? '';
  const name = extension ? filename.slice(0, -extension.length) : filename;

  return normalizeSlugForSave(name);
}
