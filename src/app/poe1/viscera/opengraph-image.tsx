import { getVisceraSnapshot } from '@/lib/poe1/viscera/data';
import { OG_SIZE, renderOgImage } from '@/lib/seo/ogImage';
import { seoPage } from '@/lib/seo/pages';

export const alt = seoPage('/poe1/viscera').ogImageAlt;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  const count = getVisceraSnapshot().viscera.length;
  return renderOgImage({
    eyebrow: 'PoE 3.30 · Covens league',
    title: `All ${count} viscera`,
    subtitle:
      'Drop bosses and acts, tier filters, Wickerman planner with combined stats and instant-buy links.',
  });
}
