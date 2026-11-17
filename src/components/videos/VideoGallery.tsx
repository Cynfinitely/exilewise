'use client';

import { useMemo, useRef, useState } from 'react';
import {
  thumbnailUrl,
  watchUrl,
  type Video,
  type VideoGame,
} from '@/lib/youtube/channel';
import { VideoPlayer } from './VideoPlayer';

const GAME_LABEL: Record<Exclude<VideoGame, null>, string> = {
  poe1: 'PoE 1',
  poe2: 'PoE 2',
};

function Meta({ v }: { v: Video }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 text-xs text-forge-muted">
      {v.game ? (
        <span className="rounded-sm border border-forge-gold/40 px-1.5 font-display text-2xs font-semibold tracking-[0.12em] text-forge-rust-strong">
          {GAME_LABEL[v.game]}
        </span>
      ) : null}
      <time dateTime={v.published}>{v.publishedLabel}</time>
      {v.viewsLabel ? <span aria-hidden>·</span> : null}
      {v.viewsLabel ? <span>{v.viewsLabel}</span> : null}
    </span>
  );
}

type Filter = 'all' | 'poe1' | 'poe2';

/**
 * Featured player plus a pickable list. `list="side"` stacks the list next
 * to the player (home page); `list="grid"` puts a filterable grid below it.
 */
export function VideoGallery({
  videos,
  list = 'side',
  listCount = 4,
  filters = false,
}: {
  videos: Video[];
  list?: 'side' | 'grid';
  listCount?: number;
  filters?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const shown = useMemo(
    () => (filter === 'all' ? videos : videos.filter(v => v.game === filter)),
    [videos, filter]
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = shown.find(v => v.id === selectedId) ?? shown[0];
  const playerRef = useRef<HTMLDivElement>(null);

  if (!selected) return null;
  const rest = shown
    .filter(v => v.id !== selected.id)
    .slice(0, list === 'side' ? listCount : undefined);

  const pick = (id: string) => {
    setSelectedId(id);
    // On narrow screens the player is above the list: bring it into view.
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const counts = {
    all: videos.length,
    poe1: videos.filter(v => v.game === 'poe1').length,
    poe2: videos.filter(v => v.game === 'poe2').length,
  };

  return (
    <div className="space-y-6">
      {filters ? (
        <div
          role="radiogroup"
          aria-label="Filter videos by game"
          className="flex flex-wrap justify-center gap-2"
        >
          {(['all', 'poe1', 'poe2'] as const)
            .filter(f => f === 'all' || counts[f] > 0)
            .map(f => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={filter === f}
                onClick={() => {
                  setFilter(f);
                  setSelectedId(null);
                }}
                className={`tap h-9 rounded-full border px-4 text-sm transition-colors ${
                  filter === f
                    ? 'border-forge-gold/80 bg-forge-gold/15 text-forge-rust-strong'
                    : 'border-forge-border text-forge-muted hover:border-forge-gold/50 hover:text-forge-goldbright'
                }`}
              >
                {f === 'all' ? 'All videos' : GAME_LABEL[f]}{' '}
                <span className="text-forge-muted">({counts[f]})</span>
              </button>
            ))}
        </div>
      ) : null}

      <div
        className={
          list === 'side' && rest.length
            ? 'grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]'
            : list === 'side'
              ? 'mx-auto max-w-4xl'
              : 'space-y-6'
        }
      >
        <div ref={playerRef} className="scroll-mt-24 space-y-3">
          <VideoPlayer key={selected.id} video={selected} priority />
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold leading-snug text-forge-goldbright sm:text-xl">
              {selected.title}
            </h3>
            <Meta v={selected} />
            <a
              href={watchUrl(selected.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="tap inline-flex items-center gap-1.5 text-sm text-forge-rust-strong underline-offset-4 hover:underline"
            >
              Watch on YouTube, like and comment <span aria-hidden>↗</span>
            </a>
          </div>
        </div>

        {rest.length ? (
          <ul
            className={
              list === 'side'
                ? 'space-y-3'
                : 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'
            }
          >
            {rest.map(v => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => pick(v.id)}
                  className={`group w-full rounded-xl text-left transition-colors ${
                    list === 'side'
                      ? 'flex items-start gap-3 p-1.5 hover:bg-forge-panel2/60'
                      : 'space-y-2'
                  }`}
                  aria-label={`Play ${v.title}`}
                >
                  <span
                    className={`relative block shrink-0 overflow-hidden rounded-lg border border-forge-border bg-black ${
                      list === 'side'
                        ? 'aspect-video w-36 sm:w-40'
                        : 'aspect-video w-full'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail */}
                    <img
                      src={thumbnailUrl(v.id, 'mq')}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="h-8 w-8 fill-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100"
                      >
                        <path d="M8 5.5v13l11-6.5z" />
                      </svg>
                    </span>
                  </span>
                  <span className="block min-w-0 space-y-1">
                    <span className="line-clamp-2 block text-sm font-medium leading-snug text-forge-goldbright group-hover:text-forge-rust-strong">
                      {v.title}
                    </span>
                    <Meta v={v} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
