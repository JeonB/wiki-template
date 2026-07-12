import { spawn } from 'child_process';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import net from 'net';

const HOST = '127.0.0.1';

function markdown(title, body) {
  return `---\ntitle: ${title}\ncategory: Regression\ncreatedAt: "2026-01-01T00:00:00.000Z"\nupdatedAt: "2026-01-01T00:00:00.000Z"\n---\n\n# ${title}\n\n${body}\n`;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function getFreePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, HOST, resolve);
  });
  const address = server.address();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  if (typeof address === 'object' && address !== null) {
    return address.port;
  }

  throw new Error('Failed to allocate a test port');
}

async function waitForServer(baseUrl) {
  const deadline = Date.now() + 60_000;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/readme`);
      if (response.status === 200) {
        return;
      }
      lastError = new Error(`Unexpected status ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw lastError ?? new Error('Timed out waiting for Next dev server');
}

async function fetchText(url, init) {
  const response = await fetch(url, init);
  return {
    response,
    text: await response.text(),
  };
}

async function main() {
  const contentDir = await mkdtemp(join(tmpdir(), 'wiki-persistence-'));
  const port = await getFreePort();
  const baseUrl = `http://${HOST}:${port}`;
  const child = spawn(
    'pnpm',
    ['exec', 'next', 'dev', '--hostname', HOST, '--port', String(port)],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        CONTENT_DIR: contentDir,
        NEXT_TELEMETRY_DISABLED: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let serverOutput = '';
  child.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await Promise.all([
      writeFile(join(contentDir, 'README.md'), markdown('Seed README', 'Uppercase README must resolve.')),
      writeFile(join(contentDir, 'guide.markdown'), markdown('Markdown Extension', 'Markdown extension must resolve.')),
      writeFile(join(contentDir, 'My Page.md'), markdown('Duplicate Mixed', 'This duplicate should be hidden.')),
      writeFile(join(contentDir, 'my-page.md'), markdown('Duplicate Lower', 'Canonical lowercase file should win.')),
    ]);

    await waitForServer(baseUrl);

    const readme = await fetchText(`${baseUrl}/readme`);
    assert(readme.response.status === 200, `Expected /readme 200, got ${readme.response.status}`);
    assert(readme.text.includes('Seed README'), 'Expected /readme to render README.md content');

    const markdownExtension = await fetchText(`${baseUrl}/guide`);
    assert(
      markdownExtension.response.status === 200,
      `Expected /guide 200, got ${markdownExtension.response.status}`,
    );
    assert(
      markdownExtension.text.includes('Markdown Extension'),
      'Expected /guide to render guide.markdown content',
    );

    const nonCanonicalSlug = await fetchText(`${baseUrl}/readme---`);
    assert(
      nonCanonicalSlug.response.status === 200,
      `Expected /readme--- to render canonical content, got ${nonCanonicalSlug.response.status}`,
    );
    assert(
      nonCanonicalSlug.text.includes('Seed README'),
      'Expected /readme--- to render README.md content',
    );

    const home = await fetchText(baseUrl);
    assert(home.response.status === 200, `Expected / 200, got ${home.response.status}`);
    assert(home.text.includes('Duplicate Lower'), 'Expected canonical duplicate file to be listed');
    assert(!home.text.includes('Duplicate Mixed'), 'Expected normalized duplicate slug to be de-duped');

    process.stdout.write('wiki persistence regression checks passed\n');
  } finally {
    if (child.pid) {
      child.kill('SIGTERM');
    }
    await new Promise((resolve) => {
      child.once('exit', resolve);
      setTimeout(resolve, 2_000);
    });
    await rm(contentDir, { recursive: true, force: true });

    if (process.env.DEBUG_WIKI_PERSISTENCE_TEST === '1') {
      console.warn(serverOutput);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
