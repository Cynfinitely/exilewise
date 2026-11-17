import { OG_SIZE, renderOgImage } from '@/lib/seo/ogImage';
import { seoPage } from '@/lib/seo/pages';
import { CHANNEL } from '@/lib/youtube/channel';

export const alt = seoPage('/videos').ogImageAlt;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOgImage({
    eyebrow: `YouTube · ${CHANNEL.handle}`,
    title: `Path of Exile videos by ${CHANNEL.name}`,
    subtitle:
      'League starts, farming tests with divines per hour, and build guides.',
  });
}
