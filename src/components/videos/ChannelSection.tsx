import Link from 'next/link';
import { CHANNEL, type Video } from '@/lib/youtube/channel';
import { getLatestVideos } from '@/lib/youtube/feed';
import { SubscribeButton } from './SubscribeButton';
import { VideoGallery } from './VideoGallery';
import { VideoPlayer } from './VideoPlayer';

/**
 * "From the channel" block. Pass `match` to show only matching videos (e.g.
 * Covens content on the viscera page); renders nothing when none match.
 */
export async function ChannelSection({
  eyebrow = 'From the channel',
  title = 'Watch Cyn play Path of Exile',
  intro = 'League starts, farming tests and build guides, straight from the maps. New uploads appear here automatically.',
  match,
  listCount = 4,
  compact = false,
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
  match?: (v: Video) => boolean;
  listCount?: number;
  /** One featured video in a slim banner, for tool pages. */
  compact?: boolean;
}) {
  const all = await getLatestVideos();
  const videos = match ? all.filter(match) : all;
  if (match && videos.length === 0) return null;

  if (compact && videos[0]) {
    const v = videos[0];
    return (
      <section
        aria-labelledby="channel-heading"
        className="panel grid items-center gap-5 overflow-hidden p-4 sm:p-5 md:grid-cols-[minmax(0,380px)_minmax(0,1fr)] md:gap-7"
      >
        <VideoPlayer video={v} />
        <div className="space-y-3">
          <p className="eyebrow">{eyebrow}</p>
          <h2
            id="channel-heading"
            className="text-lg font-semibold leading-snug text-forge-goldbright sm:text-xl"
          >
            {v.title}
          </h2>
          <p className="text-sm text-forge-muted">
            {v.publishedLabel}
            {v.viewsLabel ? ` · ${v.viewsLabel}` : ''}
          </p>
          <p className="text-sm leading-relaxed text-forge-muted">{intro}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <SubscribeButton />
            <Link href="/videos" className="btn tap h-11 rounded-full px-5">
              More videos
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="channel-heading" className="space-y-8">
      <div className="flex flex-col items-center gap-5 text-center md:flex-row md:items-end md:justify-between md:text-left">
        <div className="max-w-2xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2
            id="channel-heading"
            className="display mt-2 text-3xl sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-3 leading-relaxed text-forge-muted">{intro}</p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-center gap-3">
          <SubscribeButton />
          <Link href="/videos" className="btn tap h-11 rounded-full px-5">
            All videos
          </Link>
        </div>
      </div>
      {videos.length ? (
        <VideoGallery videos={videos} listCount={listCount} />
      ) : (
        <p className="panel-inset p-6 text-center text-forge-muted">
          Videos are taking a moment to load.{' '}
          <a
            href={CHANNEL.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-forge-rust-strong underline-offset-4 hover:underline"
          >
            Visit the channel on YouTube
          </a>
          .
        </p>
      )}
    </section>
  );
}
