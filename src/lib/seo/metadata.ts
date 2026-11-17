import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';
import { seoPage, type SeoPath } from './pages';

/**
 * Complete metadata for an indexable page: its own title, description,
 * canonical URL, Open Graph and Twitter card. Pages must not inherit the
 * home page's social data, so every field is set here. The share image comes
 * from the nearest `opengraph-image.tsx` file convention.
 */
export function pageMetadata(path: SeoPath): Metadata {
  const page = seoPage(path);
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_US',
      url: page.path,
      title: page.title,
      description: page.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
    },
  };
}

/** For pages that should be reachable but not listed in search (thin hubs, tools). */
export function noindexMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: true },
  };
}
