import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const { serializeToMarkdown, parseMarkdownFile } = await import(
  pathToFileURL(join(process.cwd(), 'lib/utils/markdown.utils.ts')).href
);

const cases = [
  {
    name: 'frontmatter example at body start',
    content: '---\ntitle: example\n---\n\nThis documents frontmatter.',
  },
  {
    name: 'leading thematic break',
    content: '---\n\nAfter the rule',
  },
  {
    name: 'normal markdown',
    content: '# Hello\n\nWorld',
  },
  {
    name: 'thematic break in the middle',
    content: 'Before\n\n---\n\nAfter',
  },
];

for (const testCase of cases) {
  const serialized = serializeToMarkdown({
    slug: 'serialize-regression',
    frontmatter: {
      title: 'Serialize Regression',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    content: testCase.content,
  });

  const parsed = await parseMarkdownFile(serialized, 'serialize-regression');
  assert.equal(
    parsed.content,
    testCase.content.trim(),
    `Expected body to survive serialize/parse for case: ${testCase.name}`,
  );
  assert.equal(parsed.frontmatter.title, 'Serialize Regression');
}

process.stdout.write('wiki serialize regression checks passed\n');
