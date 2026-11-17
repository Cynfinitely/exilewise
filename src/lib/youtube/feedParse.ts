import { VIDEO_ID, type Video, type VideoGame } from './channel';

/**
 * Parses the channel's public Atom feed
 * (youtube.com/feeds/videos.xml?channel_id=…). Pure string work so it is
 * unit-tested; every field is treated as untrusted text.
 */

function decode(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, n) =>
      String.fromCodePoint(parseInt(n, 16))
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function tag(xml: string, name: string): string | null {
  const m = xml.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`)
  );
  return m ? decode(m[1]).trim() : null;
}

/** PoE 2 if the video says so; PoE 1 for 3.x patches and PoE 1 leagues. */
export function gameOf(title: string, description: string): VideoGame {
  const text = `${title}\n${description}`;
  if (/#?poe ?2\b|path ?of ?exile ?2\b/i.test(text)) return 'poe2';
  if (/\b3\.\d{2}\b|covens|#pathofexile\b|poe ?1\b/i.test(text)) return 'poe1';
  return null;
}

const DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const COMPACT = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function parseFeed(xml: string): Video[] {
  const out: Video[] = [];
  for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const id = tag(entry, 'yt:videoId');
    const title = tag(entry, 'title');
    const published = tag(entry, 'published');
    if (!id || !VIDEO_ID.test(id) || !title || !published) continue;
    const when = new Date(published);
    if (Number.isNaN(when.getTime())) continue;
    const description = (tag(entry, 'media:description') ?? '').slice(0, 2000);
    const viewsAttr = entry.match(/<media:statistics\s+views="(\d+)"/);
    const views = viewsAttr ? Number(viewsAttr[1]) : null;
    out.push({
      id,
      title: title.slice(0, 200),
      description,
      published: when.toISOString(),
      publishedLabel: DATE.format(when),
      views,
      viewsLabel: views == null ? null : `${COMPACT.format(views)} views`,
      game: gameOf(title, description),
    });
  }
  return out.sort((a, b) => b.published.localeCompare(a.published));
}
