import 'server-only';
import { z } from 'zod';
import type { BuildSummary, PricedEntry, PriceReport } from './types';

/**
 * Live prices for the target build's uniques and notable gems, from
 * poe.ninja's PoE 1 economy API. Memoized per league for 15 minutes; when
 * poe.ninja is unreachable the planner still works, just without prices.
 */

const USER_AGENT = 'exilewise/0.1 (+https://exilewise.com)';
const TTL_MS = 15 * 60 * 1000;
const TIMEOUT_MS = 8_000;
/** Gems cheaper than this are noise in a plan (any 20/20 gem). */
const MIN_GEM_CHAOS = 10;

const TYPES = [
  'UniqueWeapon',
  'UniqueArmour',
  'UniqueAccessory',
  'UniqueFlask',
  'UniqueJewel',
  'SkillGem',
] as const;

const lineSchema = z.object({
  name: z.string().max(120),
  links: z.number().nullish(),
  variant: z.string().max(80).nullish(),
  gemLevel: z.number().nullish(),
  gemQuality: z.number().nullish(),
  corrupted: z.boolean().nullish(),
  chaosValue: z.number(),
  divineValue: z.number().nullish(),
  listingCount: z.number().nullish(),
});
type Line = z.infer<typeof lineSchema>;

const overviewSchema = z.object({ lines: z.array(z.unknown()).max(20_000) });

interface LeaguePrices {
  uniques: Map<string, Line[]>;
  gems: Map<string, Line[]>;
  divineInChaos: number | null;
  at: number;
}

const cache = new Map<string, LeaguePrices>();
const inflight = new Map<string, Promise<LeaguePrices>>();

async function fetchType(league: string, type: string): Promise<Line[]> {
  const url = `https://poe.ninja/poe1/api/economy/stash/current/item/overview?league=${encodeURIComponent(league)}&type=${type}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`poe.ninja ${type}: ${res.status}`);
  const { lines } = overviewSchema.parse(await res.json());
  return lines.flatMap(l => {
    const p = lineSchema.safeParse(l);
    return p.success ? [p.data] : [];
  });
}

function group(lines: Line[]): Map<string, Line[]> {
  const map = new Map<string, Line[]>();
  for (const l of lines) {
    const list = map.get(l.name);
    if (list) list.push(l);
    else map.set(l.name, [l]);
  }
  return map;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

async function load(league: string): Promise<LeaguePrices> {
  const results = await Promise.all(TYPES.map(t => fetchType(league, t)));
  const gems = results.pop() ?? [];
  const uniques = results.flat();
  const ratios = uniques
    .filter(l => (l.divineValue ?? 0) >= 1 && (l.listingCount ?? 0) >= 10)
    .map(l => l.chaosValue / (l.divineValue as number));
  return {
    uniques: group(uniques),
    gems: group(gems),
    divineInChaos: median(ratios),
    at: Date.now(),
  };
}

async function pricesFor(league: string): Promise<LeaguePrices> {
  const hit = cache.get(league);
  if (hit && Date.now() - hit.at < TTL_MS) return hit;
  let p = inflight.get(league);
  if (!p) {
    p = load(league).finally(() => inflight.delete(league));
    inflight.set(league, p);
  }
  const fresh = await p;
  cache.set(league, fresh);
  return fresh;
}

/** Cheapest well-listed line, preferring lines with enough listings. */
function cheapest(lines: Line[]): Line | undefined {
  const listed = lines.filter(l => (l.listingCount ?? 0) >= 3);
  return [...(listed.length ? listed : lines)].sort(
    (a, b) => a.chaosValue - b.chaosValue
  )[0];
}

function priceUnique(
  p: LeaguePrices,
  name: string,
  links: number
): Line | undefined {
  const lines = p.uniques.get(name);
  if (!lines) return undefined;
  if (links >= 5) {
    const linked = lines.filter(l => l.links === links);
    if (linked.length) return cheapest(linked);
  }
  return (
    cheapest(lines.filter(l => !l.links || l.links < 5)) ?? cheapest(lines)
  );
}

/**
 * Gems worth pricing: corrupted 21/20 or 20/23 rolls and the rare ones.
 * Ordinary gems are bought for a few chaos and levelled by the player.
 */
const RARE_GEM = /^(Awakened |Empower|Enlighten|Enhance)/;

function priceGem(
  p: LeaguePrices,
  name: string,
  level: number,
  quality: number
): Line | undefined {
  const corrupt = level > 20 || quality > 20;
  if (!corrupt && !RARE_GEM.test(name)) return undefined;
  const all = p.gems.get(name) ?? p.gems.get(`${name} Support`);
  if (!all) return undefined;
  // Vaal gems are always corrupted; others must match the roll asked for.
  const lines = all.filter(
    l => name.startsWith('Vaal ') || !!l.corrupted === corrupt
  );
  const exact = lines.filter(
    l => l.gemLevel === level && (l.gemQuality ?? 0) === quality
  );
  if (exact.length) return cheapest(exact);
  const atLevel = lines.filter(l => l.gemLevel === level);
  return atLevel.length ? cheapest(atLevel) : undefined;
}

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

export async function priceBuild(
  current: BuildSummary,
  target: BuildSummary,
  league: string
): Promise<PriceReport> {
  const empty: PriceReport = {
    available: false,
    league,
    divineInChaos: null,
    entries: [],
    unpriced: [],
    note: null,
  };
  if (target.game !== 'poe1') {
    return { ...empty, note: 'Live prices for PoE 2 builds are coming soon.' };
  }

  let p: LeaguePrices;
  try {
    p = await pricesFor(league);
  } catch (err) {
    console.error('[buildplan/prices]', err);
    return {
      ...empty,
      note: 'poe.ninja prices could not be loaded right now; the AI will estimate costs.',
    };
  }

  const ownedUniques = new Set(
    current.items.filter(i => i.rarity === 'UNIQUE').map(i => i.name)
  );
  const entries: PricedEntry[] = [];
  const unpriced: string[] = [];
  const seen = new Set<string>();

  for (const item of target.items.filter(i => i.rarity === 'UNIQUE')) {
    const key = `${item.name}|${item.links >= 5 ? item.links : 0}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const line = priceUnique(p, item.name, item.links);
    if (!line) {
      unpriced.push(item.name);
      continue;
    }
    entries.push({
      name: item.name,
      kind: 'unique',
      detail:
        [line.links && line.links >= 5 ? `${line.links}L` : null, line.variant]
          .filter(Boolean)
          .join(', ') || null,
      chaos: round(line.chaosValue, 0),
      divine: round(line.divineValue ?? 0),
      owned: ownedUniques.has(item.name),
    });
  }

  const currentGems = new Map<string, number>();
  for (const g of current.skills.flatMap(s => s.gems)) {
    currentGems.set(g.name, Math.max(currentGems.get(g.name) ?? 0, g.level));
  }
  for (const gem of target.skills
    .filter(s => s.enabled)
    .flatMap(s => s.gems)
    .filter(g => g.enabled)) {
    if (seen.has(`gem|${gem.name}`)) continue;
    seen.add(`gem|${gem.name}`);
    const line = priceGem(p, gem.name, gem.level, gem.quality);
    if (!line || line.chaosValue < MIN_GEM_CHAOS) continue;
    entries.push({
      name: gem.name,
      kind: 'gem',
      detail: line.variant ?? `${gem.level}/${gem.quality}`,
      chaos: round(line.chaosValue, 0),
      divine: round(line.divineValue ?? 0),
      owned: (currentGems.get(gem.name) ?? 0) >= gem.level,
    });
  }

  entries.sort((a, b) => b.chaos - a.chaos);
  return {
    available: true,
    league,
    divineInChaos: p.divineInChaos ? round(p.divineInChaos, 0) : null,
    entries,
    unpriced,
    note: null,
  };
}
