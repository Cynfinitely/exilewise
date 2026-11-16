import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

const ROUTES = ['', '/craft', '/items', '/materials', '/plans'];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(route => ({ url: `${SITE_URL}${route}` }));
}
