import 'server-only';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import {
  DEFAULT_GAME,
  ENABLED_GAMES,
  GAME_COOKIE,
  isGameEnabled,
  isGameId,
  leagueCookie,
  MAX_LEAGUE_NAME,
  type GameId,
  type LeagueOption,
} from './config';
import { defaultLeague, getLeagueOptions } from './leagues';

/**
 * Reads the visitor's game/league preference cookies. Cookie values are
 * untrusted: a league is only used when it is in the live league list,
 * otherwise the default league applies.
 */

export async function getSelectedLeague(game: GameId): Promise<string> {
  // Request-time only: never fetch league lists while prerendering.
  await connection();
  const [jar, options] = await Promise.all([cookies(), getLeagueOptions(game)]);
  const raw = jar.get(leagueCookie(game))?.value;
  if (raw && raw.length <= MAX_LEAGUE_NAME && options.some(o => o.id === raw)) {
    return raw;
  }
  return defaultLeague(game, options);
}

/** Game remembered from the last visit (for pages shared by both games). */
export async function getRememberedGame(): Promise<GameId> {
  const raw = (await cookies()).get(GAME_COOKIE)?.value;
  return isGameId(raw) && isGameEnabled(raw) ? raw : DEFAULT_GAME;
}

export interface GameLeagueState {
  options: LeagueOption[];
  selected: string;
}

/** League options and the selection for every game, for the site nav. */
export async function getNavState(): Promise<{
  rememberedGame: GameId;
  leagues: Partial<Record<GameId, GameLeagueState>>;
}> {
  await connection();
  const entries = await Promise.all(
    ENABLED_GAMES.map(async game => {
      const [options, selected] = await Promise.all([
        getLeagueOptions(game),
        getSelectedLeague(game),
      ]);
      return [game, { options, selected }] as const;
    })
  );
  return {
    rememberedGame: await getRememberedGame(),
    leagues: Object.fromEntries(entries) as Partial<
      Record<GameId, GameLeagueState>
    >,
  };
}
