import { splitStat } from './totals';
import type { Viscera } from './types';

/**
 * Links to the official trade site (pathofexile.com/trade) that open a
 * search for one exact viscera, filtered to Instant Buyout listings and
 * sorted cheapest first.
 *
 * On the trade site every tier of a family shares one item type ("Scorched
 * Arm" covers Lesser/Normal/Greater). The tier is pinned by its first stat:
 * the stat id plus a minimum of the tier's lowest roll, so a Normal search
 * (20-30% to Ignite) skips Lesser ones (10-15%). Stat ids are resolved at
 * data-refresh time (scripts/refresh-viscera-trade.ts), never at runtime.
 */

const TRADE_SEARCH = 'https://www.pathofexile.com/trade/search';
/** Trade "status" option meaning Instant Buyout (merchant listings). */
export const INSTANT_BUYOUT = 'securable';

export interface TradeRef {
  /** Trade item type: the family base type. */
  type: string;
  /** Same stat as explicit and implicit ids (matching either is enough). */
  statIds: string[];
  /** Lowest roll of this tier for that stat, or null to match any. */
  min: number | null;
}

/** Ids keyed by stat text template ("#% chance to Ignite"). */
export type StatIndex = Map<string, string[]>;

/** Builds the trade reference for one viscera, or null when unknown. */
export function resolveTrade(
  v: Pick<Viscera, 'name' | 'family' | 'effects'>,
  tradeTypes: ReadonlySet<string>,
  stats: StatIndex
): TradeRef | null {
  const type = [v.family, v.name].find(t => tradeTypes.has(t));
  if (!type) return null;
  const first = v.effects[0];
  if (!first) return { type, statIds: [], min: null };
  const { template, values } = splitStat(first);
  const ids = stats.get(template) ?? [];
  if (!ids.length) return { type, statIds: [], min: null };
  // "Adds # to # …" is filtered on the average of the two numbers.
  const lows = values.map(([lo]) => lo);
  const min =
    lows.length === 0
      ? null
      : lows.length === 2 && /^Adds # to #/.test(template)
        ? (lows[0] + lows[1]) / 2
        : lows[0];
  return { type, statIds: ids, min };
}

/** Trade leagues where viscera exist: the selected one if it is a Covens league. */
export function tradeLeague(selected: string): string {
  return /covens/i.test(selected) ? selected : 'Covens';
}

export function tradeUrl(ref: TradeRef, league: string): string {
  const query: Record<string, unknown> = {
    status: { option: INSTANT_BUYOUT },
    type: ref.type,
  };
  if (ref.statIds.length) {
    const value = ref.min == null ? {} : { min: ref.min };
    query.stats = [
      {
        type: 'count',
        value: { min: 1 },
        filters: ref.statIds.map(id => ({ id, value })),
      },
    ];
  }
  const q = JSON.stringify({ query, sort: { price: 'asc' } });
  return `${TRADE_SEARCH}/${encodeURIComponent(league)}?q=${encodeURIComponent(q)}`;
}
