import type { MetadataRoute } from 'next';
import { GUIDE as TEMPLE_GUIDE } from '@/lib/poe1/guides/temple/meta';
import { getVisceraSnapshot } from '@/lib/poe1/viscera/data';
import { SEO_PAGES, type SeoPath } from '@/lib/seo/pages';
import { SITE_URL } from '@/lib/site';

/** Bump when the Build Planner page's content changes. */
const BUILD_PLANNER_UPDATED = '2026-11-26';
import { getLatestVideos } from '@/lib/youtube/feed';

/**
 * Indexable pages from the SEO registry (src/lib/seo/pages.ts), each with
 * the date its content last changed so crawlers revisit when it matters.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const videos = await getLatestVideos();
  const latestVideo = videos[0] ? new Date(videos[0].published) : null;
  const visceraData = new Date(getVisceraSnapshot().fetchedAt);
  const newest = (...dates: (Date | null)[]) =>
    new Date(
      Math.max(...dates.filter((d): d is Date => !!d).map(d => d.getTime()))
    );

  const lastModified: Record<SeoPath, Date> = {
    '/': newest(visceraData, latestVideo),
    '/poe1/viscera': visceraData,
    '/poe1/build-planner': new Date(BUILD_PLANNER_UPDATED),
    '/poe1/guides/temple-of-atzoatl-farm': new Date(TEMPLE_GUIDE.updatedAt),
    '/videos': latestVideo ?? visceraData,
  };

  return SEO_PAGES.map(page => ({
    url: new URL(page.path, SITE_URL).toString(),
    lastModified: lastModified[page.path],
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
