import 'server-only';
import { getPrices } from '@/lib/pricing/poe2scout';
import { makePriceBook, type PriceBook } from '../engine/prices';

const MEMO_MS = 60_000;
/** One memoized book per league (a handful of leagues at most). */
const memo = new Map<string, { at: number; book: Promise<PriceBook> }>();

async function load(league: string | undefined): Promise<PriceBook> {
  try {
    const data = await getPrices(league);
    return makePriceBook({
      live: new Map(data.items.map(i => [i.apiId, i.priceExalted])),
      names: new Map(data.items.map(i => [i.apiId, i.name])),
      divinePriceExalted: data.divinePrice,
      fetchedAt: data.fetchedAt,
      league: data.league,
    });
  } catch {
    return makePriceBook({ live: new Map() });
  }
}

/**
 * Currency prices for a league (poe2scout cache, fallback table when
 * offline). Omit `league` for the current softcore league.
 */
export function loadPriceBook(league?: string): Promise<PriceBook> {
  const key = league ?? '';
  const now = Date.now();
  const hit = memo.get(key);
  if (hit && now - hit.at < MEMO_MS) return hit.book;
  const book = load(league);
  memo.set(key, { at: now, book });
  return book;
}
