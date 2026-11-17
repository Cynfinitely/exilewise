import type { MetadataRoute } from 'next';
import { ENABLED_GAMES } from '@/lib/games/config';
import { SITE_URL } from '@/lib/site';

/** Public pages per game; hidden games stay out of the sitemap. */
const GAME_ROUTES = {
  poe1: ['/poe1', '/poe1/viscera'],
  poe2: [
    '/poe2',
    '/poe2/craft',
    '/poe2/items',
    '/poe2/materials',
    '/poe2/plans',
  ],
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/videos', ...ENABLED_GAMES.flatMap(g => GAME_ROUTES[g])];
  return routes.map(route => ({ url: `${SITE_URL}${route}` }));
}
