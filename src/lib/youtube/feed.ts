import 'server-only';
import { connection } from 'next/server';
import { CHANNEL, type Video } from './channel';
import { parseFeed } from './feedParse';

/**
 * Latest uploads from the channel's public RSS feed: no API key, new videos
 * appear within the cache window. Cached in memory; on a failed refresh the
 * last good list is kept, and the site never blocks long on YouTube.
 */

const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL.id}`;
const TTL_MS = 15 * 60 * 1000;
const RETRY_MS = 2 * 60 * 1000;
const TIMEOUT_MS = 4_000;
const MAX_BYTES = 1_000_000;

let cache: { at: number; videos: Video[] } | null = null;
let inflight: Promise<Video[]> | null = null;

async function fetchFeed(): Promise<Video[]> {
  const res = await fetch(FEED, {
    headers: { 'User-Agent': 'exilewise/0.1 (+https://exilewise.com)' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`YouTube feed ${res.status}`);
  const xml = await res.text();
  if (xml.length > MAX_BYTES) throw new Error('YouTube feed too large');
  return parseFeed(xml);
}

export async function getLatestVideos(): Promise<Video[]> {
  // Request-time only: never fetch (or cache a failure) while prerendering.
  await connection();
  if (cache && Date.now() - cache.at < TTL_MS) return cache.videos;
  inflight ??= fetchFeed()
    .then(videos => {
      cache = { at: Date.now(), videos };
      return videos;
    })
    .catch(err => {
      console.warn(`[youtube] feed refresh failed: ${err}`);
      const videos = cache?.videos ?? [];
      // Try again soon instead of hammering on every request.
      cache = { at: Date.now() - TTL_MS + RETRY_MS, videos };
      return videos;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
