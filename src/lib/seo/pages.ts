import type { MetadataRoute } from 'next';

/**
 * Every indexable page, in one place. Page metadata (`pageMetadata`), the
 * sitemap and tests/seo.test.ts all read this list, so a page added here is
 * described, listed and checked consistently. Rules: docs/agent-rules/seo.md.
 */

export interface SeoPage {
  /** Absolute path, no trailing slash ('' is not used: home is '/'). */
  path: string;
  /** Full <title>, 30–60 characters, main keyword first. */
  title: string;
  /** Meta description, 110–160 characters, written for the search snippet. */
  description: string;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]['changeFrequency']
  >;
  /** 0–1, relative importance inside this site. */
  priority: number;
  /** Alt text for the page's social share image. */
  ogImageAlt: string;
}

export const SEO_PAGES = [
  {
    path: '/',
    title: 'PoE Covens Viscera & Wickerman Planner · Exilewise',
    description:
      'Free Path of Exile 3.30 Covens companion: every viscera, where it drops, a Wickerman planner with combined stats, build suggestions and instant-buy links.',
    changeFrequency: 'weekly',
    priority: 1,
    ogImageAlt: 'Exilewise: Path of Exile Covens viscera and Wickerman planner',
  },
  {
    path: '/poe1/viscera',
    title: 'PoE Viscera List & Wickerman Planner (Covens 3.30)',
    description:
      'All 436 Path of Exile Covens viscera with drop bosses, acts and maps. Filter by slot and tier, plan your Wickerman, see total stats and buy them instantly.',
    changeFrequency: 'weekly',
    priority: 0.9,
    ogImageAlt: 'Every Path of Exile Covens viscera and the Wickerman planner',
  },
  {
    path: '/videos',
    title: 'Path of Exile Videos by Cyn · Exilewise',
    description:
      'Path of Exile videos from Cyn: Covens league starts, farming tests with divines per hour, and build guides. New YouTube uploads appear here automatically.',
    changeFrequency: 'daily',
    priority: 0.7,
    ogImageAlt: 'Latest Path of Exile videos from the Cyn YouTube channel',
  },
] as const satisfies readonly SeoPage[];

export type SeoPath = (typeof SEO_PAGES)[number]['path'];

export function seoPage(path: SeoPath): SeoPage {
  const page = SEO_PAGES.find(p => p.path === path);
  if (!page) throw new Error(`No SEO entry for ${path}`);
  return page;
}
