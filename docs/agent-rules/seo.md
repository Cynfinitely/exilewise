# SEO (repo hard stop)

exilewise.com lives on search traffic. Every change that adds or alters a public page keeps SEO correct. `tests/seo.test.ts` enforces the mechanical parts in `npm test` (pre-push and CI); the rest is this checklist.

## When you add a public page

1. **Register it** in `src/lib/seo/pages.ts` (`SEO_PAGES`): `path`, `title` (30–60 chars, main keyword first, unique), `description` (110–160 chars, unique, written for the search snippet), `changeFrequency`, `priority`, `ogImageAlt`.
2. **Use the helper**: `export const metadata = pageMetadata('/your/path');` (or `generateMetadata` built on it). Never hand-write `openGraph`/`twitter` per page, and never put page-specific social data in `src/app/layout.tsx`.
3. **Sitemap**: add the path to the `lastModified` map in `src/app/sitemap.ts` with the date its content really last changed (data snapshot, newest video, …). TypeScript fails until you do.
4. **One `h1`** carrying the page's main keyword, then `h2`/`h3` in order. No skipped levels for styling; use classes instead.
5. **Server-rendered content.** Text that should rank must be in the HTML, not only rendered after a click or client fetch. When a client widget pages or filters content, also render a crawlable version (see `VisceraIndex` on `/poe1/viscera`).
6. **Structured data** where a schema.org type honestly fits, via `src/lib/seo/jsonld.ts` and `<JsonLd>` (`src/components/seo/JsonLd.tsx`): `BreadcrumbList` for nested pages, `VideoObject` for videos, `WebApplication` for tools. Only describe what is visible on the page. Add a builder there rather than inline JSON, and never bypass `serializeJsonLd` (it escapes `<`).
7. **Share image**: the root `opengraph-image.tsx` covers every page. For a key landing page add a route-level `opengraph-image.tsx` using `renderOgImage` (`src/lib/seo/ogImage.tsx`), static (no request-time data).
8. **Link it** from the nav (`src/lib/games/config.ts` menus or `SiteNav`) or from an existing page with descriptive anchor text. Orphan pages don't rank.
9. **Images**: meaningful `alt` text for content images, `alt=""` for decoration. Remote image hosts must be added to the CSP `img-src` in `src/proxy.ts`.

## When a page should not be in search

Thin hubs, utility or account-like pages: `export const metadata = noindexMetadata('Title');` (noindex, follow) and keep them out of `SEO_PAGES`. Hidden games (`ENABLED_GAMES`) redirect and are skipped.

## Never

- Hidden or keyword-stuffed text, cloaking, or content shown to crawlers but not people.
- Duplicate titles/descriptions across pages.
- Query-string variants as separate pages: canonicals come from `pageMetadata` and drop the query (e.g. `?wm=` share links).
- Blocking crawlers from CSS/JS, or adding `noindex` to a registered page.

## Verify

`npm test`, then on a production build (`next build && next start`): curl the page and check `<title>`, meta description, `rel=canonical`, `og:*`/`twitter:*` (including `og:image`), that every `application/ld+json` block parses, and that `/sitemap.xml` lists the page. After deploy, run the URL through Google's Rich Results Test.

## Search Console

Verification codes come from env vars on Vercel: `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` (read in `src/app/layout.tsx`). After adding pages, resubmit `https://exilewise.com/sitemap.xml` if Search Console doesn't pick them up.
