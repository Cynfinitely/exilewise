import { OG_SIZE, renderOgImage } from '@/lib/seo/ogImage';
import { seoPage } from '@/lib/seo/pages';

export const alt = seoPage('/').ogImageAlt;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOgImage({
    eyebrow: 'Path of Exile 1 & 2',
    title: 'Tools for every exile',
    subtitle:
      'Planners, item data and farming guides. Pick your game and league.',
  });
}
