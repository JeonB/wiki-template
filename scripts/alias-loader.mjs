import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const root = process.cwd();

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const base = join(root, specifier.slice(2));
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts')]) {
      try {
        return await nextResolve(pathToFileURL(candidate).href, context);
      } catch {
        // try next candidate
      }
    }
  }

  return nextResolve(specifier, context);
}
