import { SITE_NAME, SITE_URL } from '@/lib/site';
import {
  CHANNEL,
  embedUrl,
  thumbnailUrl,
  watchUrl,
  type Video,
} from '@/lib/youtube/channel';

/**
 * schema.org structured data (JSON-LD) builders. Keep them factual: only
 * describe what is visible on the page.
 */

export type JsonLdObject = Record<string, unknown>;

const abs = (path: string) => new URL(path, SITE_URL).toString();

const CREATOR = {
  '@type': 'Person',
  name: CHANNEL.name,
  url: CHANNEL.url,
  sameAs: [CHANNEL.url],
};

export function websiteJsonLd(description: string): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: abs('/'),
    description,
    inLanguage: 'en',
    publisher: CREATOR,
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function webAppJsonLd(opts: {
  name: string;
  path: string;
  description: string;
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    url: abs(opts.path),
    description: opts.description,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: CREATOR,
  };
}

/** A guide or article page. Dates are ISO strings (YYYY-MM-DD is fine). */
export function articleJsonLd(opts: {
  headline: string;
  path: string;
  description: string;
  dateModified: string;
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    url: abs(opts.path),
    mainEntityOfPage: abs(opts.path),
    dateModified: opts.dateModified,
    inLanguage: 'en',
    author: CREATOR,
    publisher: CREATOR,
  };
}

/** VideoObject without @context, for nesting inside a list. */
function videoObject(v: Video): JsonLdObject {
  return {
    '@type': 'VideoObject',
    name: v.title,
    // Google requires a description; fall back to the title.
    description: (v.description || v.title).slice(0, 500),
    thumbnailUrl: [thumbnailUrl(v.id)],
    uploadDate: v.published,
    contentUrl: watchUrl(v.id),
    embedUrl: embedUrl(v.id).split('?')[0],
    author: CREATOR,
    ...(v.views != null
      ? {
          interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: { '@type': 'WatchAction' },
            userInteractionCount: v.views,
          },
        }
      : {}),
  };
}

export function videoJsonLd(v: Video): JsonLdObject {
  return { '@context': 'https://schema.org', ...videoObject(v) };
}

export function videoListJsonLd(videos: Video[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: videos.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: videoObject(v),
    })),
  };
}

/** JSON for a <script type="application/ld+json">; `<` is escaped so text from feeds can't close the tag. */
export function serializeJsonLd(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
