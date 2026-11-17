import { SubscribeButton } from '@/components/videos/SubscribeButton';
import { VideoGallery } from '@/components/videos/VideoGallery';
import { CHANNEL } from '@/lib/youtube/channel';
import { getLatestVideos } from '@/lib/youtube/feed';
import { JsonLd } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd, videoListJsonLd } from '@/lib/seo/jsonld';

export const metadata = pageMetadata('/videos');

export default async function VideosPage() {
  const videos = await getLatestVideos();
  return (
    <div className="space-y-12">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Videos', path: '/videos' },
          ]),
          ...(videos.length ? [videoListJsonLd(videos)] : []),
        ]}
      />
      <header className="pt-2 text-center">
        <p className="eyebrow">YouTube · {CHANNEL.handle}</p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">Videos</h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-forge-muted">
          League starts, farming tests and build guides from {CHANNEL.name}.
          Every new upload shows up here on its own.
        </p>
        <div className="mt-6 flex justify-center">
          <SubscribeButton />
        </div>
        <div className="ornament mx-auto mt-8 max-w-md">
          <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-forge-gold" />
        </div>
      </header>
      {videos.length ? (
        <VideoGallery videos={videos} list="grid" filters />
      ) : (
        <p className="panel-inset p-6 text-center text-forge-muted">
          Videos couldn&apos;t be loaded right now.{' '}
          <a
            href={CHANNEL.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-forge-rust-strong underline-offset-4 hover:underline"
          >
            Watch them on YouTube
          </a>
          .
        </p>
      )}
    </div>
  );
}
