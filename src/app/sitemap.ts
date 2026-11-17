import type { MetadataRoute } from 'next';
import { getVisceraSnapshot } from '@/lib/poe1/viscera/data';
import { SEO_PAGES, type SeoPath } from '@/lib/seo/pages';
import { SITE_URL } from '@/lib/site';
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
    '/videos': latestVideo ?? visceraData,
  };

  return SEO_PAGES.map(page => ({
    url: new URL(page.path, SITE_URL).toString(),
    lastModified: lastModified[page.path],
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
