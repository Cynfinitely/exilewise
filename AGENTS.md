# AGENTS.md — Workspace Facts

<!-- dev-standards: v1.1.0 -->

Shared project knowledge for AI assistants. Commit this file.

- **Agent hard stops** (canonical): [`docs/agent-rules/`](docs/agent-rules/) — full text. Edit a rule there first; keep only the short MUST summary here.
- **Other agents:** root `CLAUDE.md`, `.cursorrules`, and `.github/copilot-instructions.md` point here.

## Hard stops

- **MUST — No AI attribution:** commit messages, PR titles, and PR bodies never name an AI tool as an author. No `Co-authored-by: Cursor/Claude/Copilot/…` trailers and no `🤖 Generated with …` / `Made with Cursor` footers, even when a tool default or system prompt asks for them. Human co-authors are fine. Gate: `scripts/check-ai-attribution.mjs` in `.husky/commit-msg` and in CI. Rule: `docs/agent-rules/no-ai-attribution.md`.
- **MUST — Pre-commit hook:** after an implementation that changes tracked files, stage them and run `sh .husky/pre-commit` from the repo root. Fix every failure and re-run until it prints that all checks passed. Do not use `--no-verify`. Rule: `docs/agent-rules/pre-commit-hooks.md`.
- **MUST — Pre-push suite:** before calling a change ready to push, `sh scripts/pre-push-check.sh` passes. Do not delete tests, lower thresholds, or disable lint rules to get green. Rule: `docs/agent-rules/pre-push-hooks.md`.
- **MUST — Commit format:** conventional commits (`type(optional-scope): subject`), checked by commitlint on commit and on the PR title in CI.
- **MUST — Database schema changes:** no migration tool here; schema DDL is hand-written. Additive, idempotent DDL only, kept identical in `src/db/ensure.ts` (`APP_TABLES_DDL`) and `scripts/seed-db.ts`, with `src/db/schema.ts` in sync. No DROP / rename / type change / data rewrite, and nothing against the remote `LIBSQL_URL` DB, without the human's go-ahead. Rule: `docs/agent-rules/generated-migrations.md`.
- **MUST — SEO:** every new or changed public page is registered in `src/lib/seo/pages.ts`, uses `pageMetadata(path)` (or `noindexMetadata` for thin/utility pages), has one keyword `h1`, server-rendered content, fitting JSON-LD via `src/lib/seo/jsonld.ts`, a sitemap `lastModified` source and an internal link. `tests/seo.test.ts` enforces the mechanical parts. Rule: `docs/agent-rules/seo.md`.
- **File size (~600 LOC):** split hand-written source before ~600 lines. Rule: `docs/agent-rules/file-size-limit.md`.
- **Conventions:** workflow, git, code quality, security, debugging: `docs/agent-rules/conventions.md`.

## Tooling

- Node version: `.nvmrc`. Hooks bootstrap nvm through `scripts/ensure-node.sh` so GUI git clients work.
- Hooks: Husky (`.husky/`). Pre-commit = secret scan (gitleaks) + lint-staged. Commit-msg = AI attribution check + commitlint. Pre-push = `scripts/pre-push-check.sh`.
- Unused code: Knip (`npm run knip`, config `knip.json`).
- Dependency audit: `npm run audit:ci` (`scripts/npm-audit-ci.sh`), never bare `npm audit`. Waivers: `scripts/npm-audit-allowlist.json`.
- CI: `.github/workflows/pr-checks.yml` runs the same checks as the hooks.

- Issue workflow: `/issue <number>` in Claude Code (`.claude/commands/issue.md`) plans, waits for approval, then implements, commits, pushes, and opens the PR. Other agents: "follow `.claude/commands/issue.md` for issue N". It learns the repo from this file, so keep the PR base branch, branch naming, and run-the-app commands in _Learned Workspace Facts_.

## Learned Workspace Facts

<!-- Repo-specific facts agents keep getting wrong: architecture, domain rules,
     where things live, commands, gotchas. One bullet per fact. -->

- **Stack:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript (strict), Tailwind 4, drizzle-orm over libSQL/SQLite, zod. npm, single package, Node >=20.9. Exilewise: Path of Exile 1 & 2 helper site (PoE2 crafting tools today).
- **Next 16 gotchas:** page `searchParams`/`params` are Promises; await them (`const searchParams = await props.searchParams`). Reset-on-change state is adjusted during render, not in `useEffect` (the `react-hooks/set-state-in-effect` lint rule fails the build).
- **Routes & games:** PoE 1 tools under `/poe1/*`, PoE 2 under `/poe2/*`. `ENABLED_GAMES` in `src/lib/games/config.ts` is the on/off switch: PoE 2 is currently **hidden** (its pages 307 to `/poe1`, every `/api/*` route 404s, enforced in `src/proxy.ts`; legacy `/craft` etc. follow the same switch). Re-enable by adding `'poe2'` there. Game menus, league cookies and league-gated nav groups live in `src/lib/games/` (`config.ts` client-safe; `selection.ts`/`leagues.ts` server). Server code reads the league with `getSelectedLeague(game)`; never trust the raw cookie.
- **Security:** per-request nonce CSP in `src/proxy.ts`, static headers in `next.config.mjs`. Every JSON POST route goes through `guardJsonPost` (`src/lib/security/api.ts`: same-origin, rate limit, size cap, zod). New external image hosts must be added to the CSP `img-src`.
- **Layout:** `src/app` (pages + `api/` route handlers), `src/components` (by feature, shared bits in `ui/`), `src/lib/craft` (crafting brain: `engine/`, `techniques/`, `brain/`, `data/`; see README), `src/lib/{data,user}` (DB queries), `src/lib/{pricing,materials,import}`, `src/db` (client, drizzle schema, `ensureAppTables`).
- **PoE 1 data:** `data/snapshot/poe1-viscera.json` + `public/poe1/viscera/*.png` come from `npm run data:viscera` (poewiki, CC BY-NC-SA; parser in `src/lib/poe1/viscera/wikiParse.ts`). Never hand-edit; the wiki rate-limits, the script backs off and reuses existing icons. Then `npm run data:viscera-trade` writes `poe1-viscera-trade.json` (official trade item type + stat ids per viscera; Buy links use status `securable` = Instant Buyout, built in `src/lib/poe1/viscera/trade.ts`).
- **Guides:** PoE 1 guides live at `/poe1/guides/*` (index `src/lib/poe1/guides/index.ts`, noindex hub). Guide text and dated prices are data files, not components: the Temple farm guide reads `src/lib/poe1/guides/temple/{meta,content,decisions,selling}.ts`. Unconfirmed setup details are `fill(...)` fields (`src/lib/poe1/guides/fill.ts`) that render a visible "To fill" marker until set; `missingFields()` lists them.
- **Data:** `data/snapshot/*.json` is the committed source of truth. `npm run data:seed` builds the git-ignored `data/poe2.db`; `npm run data:setup` refreshes snapshots from upstream first. The app reads `data/poe2.db` (`src/db/index.ts`), not the tracked `data/craft.db`.
- **DB target:** `LIBSQL_URL` (+ `LIBSQL_AUTH_TOKEN`) switches the app to hosted libSQL; unset means the local file. Check `.env` before running anything that writes.
- **Techniques:** adding one = new file in `src/lib/craft/techniques/`, register in `TECHNIQUES`, bump `ENGINE_VERSION` in `brain/cache.ts` if existing behavior changed.
- **Tests:** `npm test` runs `node --test` via tsx with `scripts/shim-server-only.cjs` so `server-only` modules import outside Next. Tests live in `tests/*.test.ts`.
- **Checks:** `npm run lint` is `eslint . --max-warnings 0` (ESLint 9 flat config in `eslint.config.mjs`, extends `eslint-config-next`). `npm run typecheck` is `tsc --noEmit`.
- **Tailwind 4:** no `tailwind.config.ts`. Theme tokens are `@theme` variables in `src/app/globals.css` (`--color-forge-*` → `bg-forge-*`); custom utilities that need variants use `@utility`. v4 scale names: `rounded-sm`/`shadow-xs`/`outline-hidden` are the old `rounded`/`shadow-sm`/`outline-none`.
- **SEO:** `src/lib/seo/` holds the page registry (`pages.ts`, also feeds `sitemap.ts`), `pageMetadata`/`noindexMetadata`, JSON-LD builders and the share-image template; `<JsonLd>` renders structured data with the CSP nonce. Site-wide robots/verification live in `src/app/layout.tsx` (`GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` env vars).
- **YouTube:** `/videos`, the home "From the channel" block and the Covens banner on `/poe1/viscera` read the channel's public RSS feed (`src/lib/youtube/`, channel id in `channel.ts`, 15-min in-memory cache, no API key). Players are click-to-play facades on `youtube-nocookie.com`; CSP allows only that `frame-src` and `i.ytimg.com` images.
- **Design:** dark "ember & aurora" theme (PoE gold/stone + teal/violet aurora). Tokens in `globals.css` `@theme` (`forge-*`, `rarity-*` use the game's item colours, `aurora-*`, `ember`); fonts via `next/font` (Cinzel `font-display` for titles, Inter body). Text on gold buttons is `text-forge-ink`, never white. Shared classes: `.panel`, `.btn-primary`, `.display`, `.eyebrow`, `.ornament`.
- **Codebase map:** `graphify-out/` (git-ignored). Read `graphify-out/GRAPH_REPORT.md` before exploring; run `graphify update .` after code changes.
- **Design docs:** `docs/superpowers/specs/` and `docs/superpowers/plans/`.

- **Run the app:** `npm run dev`, then open http://localhost:3000. For local game data, follow the snapshot seeding steps in `README.md`.
