/** The Exilewise YouTube channel. Client-safe constants. */
export const CHANNEL = {
  id: 'UCHPOrc8ObCW93YsqsShywmA',
  handle: '@cyn7790',
  name: 'Cyn',
  url: 'https://www.youtube.com/@cyn7790',
  subscribeUrl: 'https://www.youtube.com/@cyn7790?sub_confirmation=1',
} as const;

export type VideoGame = 'poe1' | 'poe2' | null;

export interface Video {
  id: string;
  title: string;
  description: string;
  published: string;
  /** "16 Nov 2026", formatted on the server. */
  publishedLabel: string;
  views: number | null;
  /** "8.4K views", formatted on the server. */
  viewsLabel: string | null;
  game: VideoGame;
}

/** YouTube video ids are 11 url-safe characters; anything else is rejected. */
export const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/** Thumbnails come from YouTube's image host, built from a validated id. */
export function thumbnailUrl(id: string, size: 'hq' | 'mq' = 'hq'): string {
  return `https://i.ytimg.com/vi/${id}/${size}default.jpg`;
}

export function watchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Privacy-enhanced embed; only requested after the visitor presses play. */
export function embedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}
