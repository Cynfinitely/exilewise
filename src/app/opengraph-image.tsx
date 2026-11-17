import { OG_SIZE, renderOgImage } from '@/lib/seo/ogImage';
import { seoPage } from '@/lib/seo/pages';

export const alt = seoPage('/').ogImageAlt;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOgImage({
    eyebrow: 'Path of Exile · Covens league',
    title: 'Feed the Wickerman',
    subtitle:
      'Every viscera, where it drops, a Wickerman planner and picks for your build.',
  });
}
