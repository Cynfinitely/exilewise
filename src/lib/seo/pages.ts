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
    title: 'Path of Exile Tools & Guides for PoE 1 and 2 · Exilewise',
    description:
      'Free Path of Exile 1 and 2 tools: Covens viscera list, Wickerman planner and farming guides with profit calculators. PoE 2 crafting tools coming soon.',
    changeFrequency: 'weekly',
    priority: 1,
    ogImageAlt: 'Exilewise: Path of Exile 1 and 2 tools, planners and guides',
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
    path: '/poe1/build-planner',
    title: 'PoE Build Planner: Compare PoB & Get an AI Upgrade Plan',
    description:
      'Compare your Path of Building with your goal build: stat, gear, gem and tree gap with live prices, then an AI prompt for a step-by-step upgrade plan.',
    changeFrequency: 'monthly',
    priority: 0.8,
    ogImageAlt:
      'Exilewise Build Planner: compare two Path of Building exports and get an AI upgrade plan',
  },
  {
    path: '/poe1/guides/temple-of-atzoatl-farm',
    title: 'Temple of Atzoatl Farm Guide: 8-Thread Cradle (3.30)',
    description:
      'PoE 3.30 Temple of Atzoatl farm: an 8-Thread, three-map Incursion loop for Cradle of Creation, Architect and door choices, selling tips and a profit calculator.',
    changeFrequency: 'weekly',
    priority: 0.8,
    ogImageAlt:
      'Temple of Atzoatl farm guide: eight Threads, three maps, one Cradle of Creation Temple',
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
