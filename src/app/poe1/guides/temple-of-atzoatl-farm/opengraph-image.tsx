import { OG_SIZE, renderOgImage } from '@/lib/seo/ogImage';
import { seoPage } from '@/lib/seo/pages';
import { GUIDE, GUIDE_PATH } from '@/lib/poe1/guides/temple/meta';

export const alt = seoPage(GUIDE_PATH).ogImageAlt;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOgImage({
    eyebrow: `PoE ${GUIDE.patch.slice(0, 4)} · Incursion farm guide`,
    title: 'Temple of Atzoatl farm',
    subtitle:
      'Eight Threads, three maps, one Cradle of Creation Temple. Architect and door choices, selling and a profit calculator.',
  });
}
