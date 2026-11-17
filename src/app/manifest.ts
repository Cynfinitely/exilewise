import type { MetadataRoute } from 'next';
import { SITE_NAME } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} · Path of Exile companion`,
    short_name: SITE_NAME,
    description:
      'Path of Exile Covens viscera, a Wickerman planner and videos from Cyn.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0908',
    theme_color: '#0a0908',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
