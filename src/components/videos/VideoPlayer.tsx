'use client';

import { useState } from 'react';
import { embedUrl, thumbnailUrl, type Video } from '@/lib/youtube/channel';

/**
 * Click-to-play facade: a thumbnail until the visitor presses play, then the
 * privacy-enhanced YouTube player. Nothing loads from YouTube's player (or
 * sets its cookies) before that click, and pages stay fast.
 */
export function VideoPlayer({
  video,
  priority = false,
}: {
  video: Pick<Video, 'id' | 'title'>;
  priority?: boolean;
}) {
  const [playing, setPlaying] = useState<string | null>(null);
  const active = playing === video.id;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-forge-gold/30 bg-black shadow-[0_24px_60px_-28px_rgb(240_138_60/0.45)]">
      {active ? (
        <iframe
          src={embedUrl(video.id)}
          title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(video.id)}
          className="group absolute inset-0 h-full w-full"
          aria-label={`Play video: ${video.title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail */}
          <img
            src={thumbnailUrl(video.id)}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-forge-gold/70 bg-forge-bg/70 shadow-[0_0_30px_rgb(240_138_60/0.55)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="ml-1 h-7 w-7 fill-forge-gold sm:h-8 sm:w-8"
            >
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
