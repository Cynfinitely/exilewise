import 'server-only';
import { z } from 'zod';
import type { GameId, LeagueOption } from './config';

/**
 * Live league lists. PoE 1 from poe.ninja's index state, PoE 2 from
 * poe2scout. Both are memoized in process for an hour and fall back to a
 * built-in list when the upstream is down, so the nav never blocks on them.
 */

const USER_AGENT = 'exilewise/0.1 (+https://exilewise.com)';
const TTL_MS = 60 * 60 * 1000;
const TIMEOUT_MS = 4_000;

const PERMANENT = new Set(['Standard', 'Hardcore']);

function option(id: string, label: string, current: boolean): LeagueOption {
  return {
    id,
    label,
    hardcore: /^(HC |Hardcore)/i.test(id) || id === 'Hardcore',
    current,
  };
}

/** Used until the first successful fetch, and whenever the upstream fails. */
export const FALLBACK_LEAGUES: Record<GameId, LeagueOption[]> = {
  poe1: [
    option('Covens', 'Covens', true),
    option('Hardcore Covens', 'HC Covens', true),
    option('Standard', 'Standard', false),
    option('Hardcore', 'Hardcore', false),
  ],
  poe2: [
    option('Forbidden Rites', 'Forbidden Rites', true),
    option('HC Forbidden Rites', 'HC Forbidden Rites', true),
    option('Standard', 'Standard', false),
    option('Hardcore', 'Hardcore', false),
  ],
};

const ninjaSchema = z.object({
  economyLeagues: z
    .array(
      z.object({
        name: z.string().min(1).max(64),
        displayName: z.string().max(64).optional(),
        isPrivate: z.boolean().optional(),
      })
    )
    .max(50),
});

const scoutSchema = z
  .array(
    z.object({
      Value: z.string().min(1).max(64),
      IsCurrent: z.boolean().optional().default(false),
    })
  )
  .max(100);

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`${res.status} from ${new URL(url).host}`);
  return res.json();
}

/** Current leagues first (softcore before hardcore), then the permanent ones. */
function order(list: LeagueOption[]): LeagueOption[] {
  const rank = (l: LeagueOption) => (l.current ? 0 : 2) + (l.hardcore ? 1 : 0);
  return [...list].sort((a, b) => rank(a) - rank(b));
}

async function fetchPoe1(): Promise<LeagueOption[]> {
  const data = ninjaSchema.parse(
    await getJson('https://poe.ninja/poe1/api/data/index-state')
  );
  return order(
    data.economyLeagues
      .filter(l => !l.isPrivate)
      .map(l => {
        const label = (l.displayName || l.name).replace(/^Hardcore /, 'HC ');
        return option(l.name, label, !PERMANENT.has(l.name));
      })
  );
}

async function fetchPoe2(): Promise<LeagueOption[]> {
  const data = scoutSchema.parse(
    await getJson('https://api.poe2scout.com/poe2/Leagues')
  );
  return order(
    data
      .filter(l => l.IsCurrent || PERMANENT.has(l.Value))
      .map(l => option(l.Value, l.Value, l.IsCurrent))
  );
}

const memo = new Map<
  GameId,
  { at: number; leagues: Promise<LeagueOption[]> }
>();

async function load(game: GameId): Promise<LeagueOption[]> {
  try {
    const list = await (game === 'poe1' ? fetchPoe1() : fetchPoe2());
    return list.length ? list : FALLBACK_LEAGUES[game];
  } catch (err) {
    console.warn(`[leagues] ${game} fetch failed, using fallback: ${err}`);
    // Retry sooner than the full TTL after a failure.
    memo.set(game, {
      at: Date.now() - TTL_MS + 5 * 60_000,
      leagues: Promise.resolve(FALLBACK_LEAGUES[game]),
    });
    return FALLBACK_LEAGUES[game];
  }
}

export function getLeagueOptions(game: GameId): Promise<LeagueOption[]> {
  const hit = memo.get(game);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.leagues;
  const leagues = load(game);
  memo.set(game, { at: Date.now(), leagues });
  return leagues;
}

/** The league used when the visitor has not picked one. */
export function defaultLeague(game: GameId, options: LeagueOption[]): string {
  if (game === 'poe2') {
    const pinned = process.env.POE2_LEAGUE?.trim();
    if (pinned && options.some(o => o.id === pinned)) return pinned;
  }
  return (
    options.find(o => o.current && !o.hardcore)?.id ??
    options[0]?.id ??
    'Standard'
  );
}
