import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { isAbsolute, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();

function resolveFileCandidate(basePath) {
  const candidates = [basePath, `${basePath}.ts`, `${basePath}.tsx`, join(basePath, 'index.ts')];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const resolved = resolveFileCandidate(join(root, specifier.slice(2)));
    if (resolved) {
      return { shortCircuit: true, url: resolved };
    }
  }

  if (
    (specifier.startsWith('./') || specifier.startsWith('../')) &&
    context.parentURL &&
    !specifier.endsWith('.js') &&
    !specifier.endsWith('.mjs') &&
    !specifier.endsWith('.ts') &&
    !specifier.endsWith('.tsx') &&
    !specifier.endsWith('.json')
  ) {
    const parentPath = fileURLToPath(context.parentURL);
    const resolved = resolveFileCandidate(join(dirname(parentPath), specifier));
    if (resolved) {
      return { shortCircuit: true, url: resolved };
    }
  }

  if (isAbsolute(specifier)) {
    const resolved = resolveFileCandidate(specifier);
    if (resolved) {
      return { shortCircuit: true, url: resolved };
    }
  }

  return nextResolve(specifier, context);
}
