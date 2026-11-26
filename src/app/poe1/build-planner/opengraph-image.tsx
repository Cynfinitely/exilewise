import { OG_SIZE, renderOgImage } from '@/lib/seo/ogImage';
import { seoPage } from '@/lib/seo/pages';

export const alt = seoPage('/poe1/build-planner').ogImageAlt;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOgImage({
    eyebrow: 'Path of Exile · Build Planner',
    title: 'From your build to your goal',
    subtitle:
      'Compare two Path of Building exports, see the gap with live prices and get an AI upgrade plan.',
  });
}
