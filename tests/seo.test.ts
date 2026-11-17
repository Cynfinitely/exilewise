import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { pageMetadata } from '../src/lib/seo/metadata';
import { SEO_PAGES } from '../src/lib/seo/pages';
import {
  breadcrumbJsonLd,
  serializeJsonLd,
  videoJsonLd,
  videoListJsonLd,
  websiteJsonLd,
} from '../src/lib/seo/jsonld';
import type { Video } from '../src/lib/youtube/channel';

/**
 * SEO guard rails (docs/agent-rules/seo.md). Runs in `npm test`, so it
 * gates pre-push and CI: a new public page without proper SEO fails here.
 */

const APP = path.join(process.cwd(), 'src', 'app');
/** Route folders of games hidden by ENABLED_GAMES: redirected, never indexed. */
const HIDDEN = [path.join(APP, 'poe2')];

function pageFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return HIDDEN.includes(full) ? [] : pageFiles(full);
    return e.name === 'page.tsx' ? [full] : [];
  });
}

test('every SEO page has a unique, well-sized title and description', () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const p of SEO_PAGES) {
    assert.ok(
      p.title.length >= 30 && p.title.length <= 60,
      `title length ${p.title.length}: ${p.title}`
    );
    assert.ok(
      p.description.length >= 110 && p.description.length <= 160,
      `description length ${p.description.length} for ${p.path}`
    );
    assert.ok(!titles.has(p.title), `duplicate title ${p.title}`);
    assert.ok(
      !descriptions.has(p.description),
      `duplicate description for ${p.path}`
    );
    titles.add(p.title);
    descriptions.add(p.description);
    assert.match(p.path, /^\/([a-z0-9-]+(\/[a-z0-9-]+)*)?$/, `path ${p.path}`);
    assert.ok(p.priority > 0 && p.priority <= 1);
    assert.ok(p.ogImageAlt.length >= 10);
  }
});

test('pageMetadata gives each page its own canonical and social data', () => {
  for (const p of SEO_PAGES) {
    const m = pageMetadata(p.path);
    assert.deepEqual(m.title, { absolute: p.title });
    assert.equal(m.description, p.description);
    assert.equal(m.alternates?.canonical, p.path);
    const og = m.openGraph as {
      url?: string;
      title?: string;
      description?: string;
    };
    assert.equal(og.url, p.path);
    assert.equal(og.title, p.title);
    assert.equal(og.description, p.description);
    assert.equal((m.twitter as { card?: string }).card, 'summary_large_image');
  }
});

test('every public page declares SEO metadata', () => {
  const missing = pageFiles(APP).filter(file => {
    const src = fs.readFileSync(file, 'utf8');
    return !/pageMetadata\(|noindexMetadata\(|generateMetadata/.test(src);
  });
  assert.deepEqual(
    missing.map(f => path.relative(process.cwd(), f)),
    [],
    'Use pageMetadata(path) (and register the path in src/lib/seo/pages.ts) or noindexMetadata(title).'
  );
});

test('every registered SEO path has a page that uses pageMetadata for it', () => {
  for (const p of SEO_PAGES) {
    const file = path.join(APP, p.path === '/' ? '' : p.path, 'page.tsx');
    assert.ok(fs.existsSync(file), `no page for ${p.path}`);
    assert.match(
      fs.readFileSync(file, 'utf8'),
      new RegExp(`pageMetadata\\('${p.path.replace(/\//g, '\\/')}'\\)`)
    );
  }
});

const video: Video = {
  id: 'SCJX7QejlfQ',
  title: 'Red Altars </script><script>alert(1)</script>',
  description: '',
  published: '2026-11-16T06:51:14.000Z',
  publishedLabel: '16 Nov 2026',
  views: 8373,
  viewsLabel: '8.4K views',
  game: 'poe1',
};

test('JSON-LD cannot break out of its script tag', () => {
  const json = serializeJsonLd(videoJsonLd(video));
  assert.ok(!json.includes('<'), 'unescaped < in JSON-LD');
  assert.equal(JSON.parse(json).name, video.title);
});

test('JSON-LD builders emit the fields search engines require', () => {
  const v = videoJsonLd(video);
  assert.equal(v['@context'], 'https://schema.org');
  assert.equal(v['@type'], 'VideoObject');
  for (const key of [
    'name',
    'description',
    'thumbnailUrl',
    'uploadDate',
    'embedUrl',
    'contentUrl',
  ]) {
    assert.ok(v[key], `VideoObject.${key}`);
  }
  const list = videoListJsonLd([video]) as {
    itemListElement: { item: Record<string, unknown> }[];
  };
  assert.equal(list.itemListElement[0].item['@type'], 'VideoObject');
  const crumbs = breadcrumbJsonLd([{ name: 'Home', path: '/' }]) as {
    itemListElement: { item: string }[];
  };
  assert.match(crumbs.itemListElement[0].item, /^https:\/\//);
  assert.equal(websiteJsonLd('x')['@type'], 'WebSite');
});
