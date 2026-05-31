# AGENTS.md

## Cursor Cloud specific instructions

### Product

Single Next.js 16 app (`wiki-template`): file-based internal wiki. Markdown lives under `content/`; CRUD uses Server Actions and the local filesystem. No database, auth, or separate API service.

### Services

| Service | Port | Notes |
|---------|------|--------|
| Next.js dev (`pnpm dev`) | 3000 | Only service required for local E2E |

Optional: Docker (`docker build` + `docker run` / `docker compose`) for production-like runs. Compose expects a pre-built `wiki-template:latest` image.

### Standard commands

See `README.md` and `package.json` scripts:

- Install: `pnpm install`
- Dev: `pnpm dev` → http://localhost:3000
- Lint: `pnpm lint`
- Prod run: `pnpm build` then `pnpm start`

There is no automated test suite in this repo (no Jest/Playwright/Vitest).

### Environment variables

None required for local dev. Optional: `CONTENT_DIR` (default `./content`), `PORT` (default `3000`).

### Non-obvious gotchas

- **Package manager**: Use **pnpm** (`pnpm-lock.yaml`). CI workflow uses `npm ci` but local/Docker docs use pnpm.
- **pnpm build scripts**: Fresh installs may warn that `sharp` build scripts were skipped. If image optimization fails, allow builds non-interactively (e.g. add `sharp` to `pnpm.onlyBuiltDependencies` in `package.json`) rather than running interactive `pnpm approve-builds`.
- **Filesystem writes**: Create/edit/delete require a writable `content/` directory. Not suitable for Vercel serverless (read-only FS).
- **Long-running dev server**: Start with tmux (e.g. session `next-dev-server`) so the process survives backgrounding; `pnpm dev` uses Turbopack HMR.
- **Hello-world E2E**: Home `/` → `/new` → create page → view `/{slug}` → confirm `content/{slug}.md` on disk.
