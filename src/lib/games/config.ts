import type { NavIconName } from '@/components/ui/NavIcons';

/**
 * Games, their menus and the cookies that remember the visitor's choices.
 * Client-safe: no server imports. League lists are fetched server-side
 * (`leagues.ts`) and passed down.
 */

export const GAME_IDS = ['poe1', 'poe2'] as const;
export type GameId = (typeof GAME_IDS)[number];

export function isGameId(v: unknown): v is GameId {
  return v === 'poe1' || v === 'poe2';
}

/**
 * Games visitors can reach. PoE 2 is hidden while it is reworked: its pages
 * redirect to PoE 1 and its API answers 404 (see src/proxy.ts). Add 'poe2'
 * back here to bring it back.
 */
export const ENABLED_GAMES: readonly GameId[] = ['poe1'];

export function isGameEnabled(game: GameId): boolean {
  return ENABLED_GAMES.includes(game);
}

/** Game the site falls back to (home redirects, unknown cookies). */
export const DEFAULT_GAME: GameId = ENABLED_GAMES[0];

export interface LeagueOption {
  /** Exact league name used by the price APIs (e.g. "Hardcore Covens"). */
  id: string;
  /** Short label for the selector. */
  label: string;
  hardcore: boolean;
  /** The current challenge league (vs. Standard/Hardcore or older events). */
  current: boolean;
}

export interface GameNavItem {
  href: string;
  label: string;
  description: string;
  icon: NavIconName;
}

export interface GameNavGroup {
  label: string;
  links: GameNavItem[];
  /** Only shown when the selected league's name matches (league mechanics). */
  leagueMatch?: RegExp;
}

export interface GameMeta {
  id: GameId;
  name: string;
  short: string;
  /** Landing page of the game's section. */
  home: string;
  nav: GameNavGroup[];
}

export const GAMES: Record<GameId, GameMeta> = {
  poe1: {
    id: 'poe1',
    name: 'Path of Exile 1',
    short: 'PoE 1',
    home: '/poe1',
    nav: [
      {
        label: 'Covens league',
        leagueMatch: /covens/i,
        links: [
          {
            href: '/poe1/viscera',
            label: 'Viscera',
            description: 'Every viscera, Wickerman builder, build suggestions',
            icon: 'viscera',
          },
        ],
      },
      {
        label: 'Guides',
        links: [
          {
            href: '/poe1/guides',
            label: 'Guides',
            description: 'Farming guides: Temple of Atzoatl and more',
            icon: 'guides',
          },
        ],
      },
    ],
  },
  poe2: {
    id: 'poe2',
    name: 'Path of Exile 2',
    short: 'PoE 2',
    home: '/poe2',
    nav: [
      {
        label: 'Browse',
        links: [
          {
            href: '/poe2/items',
            label: 'Items & Mods',
            description: 'Bases and every mod that can roll',
            icon: 'items',
          },
          {
            href: '/poe2/materials',
            label: 'Materials',
            description: 'Currencies, essences, omens, prices',
            icon: 'materials',
          },
        ],
      },
      {
        label: 'Plan',
        links: [
          {
            href: '/poe2/craft',
            label: 'Planner',
            description: 'Find the cheapest way to craft an item',
            icon: 'craft',
          },
          {
            href: '/poe2/plans',
            label: 'Saved Plans',
            description: 'Reopen plans with today’s prices',
            icon: 'plans',
          },
        ],
      },
    ],
  },
};

/** Menu groups for a game, with league-mechanic groups filtered by league. */
export function navGroupsFor(game: GameId, league: string): GameNavGroup[] {
  return GAMES[game].nav.filter(
    g => !g.leagueMatch || g.leagueMatch.test(league)
  );
}

/** Game a pathname belongs to, or null for shared pages (home, 404). */
export function gameFromPath(pathname: string): GameId | null {
  const seg = pathname.split('/')[1];
  return isGameId(seg) && isGameEnabled(seg) ? seg : null;
}

export const GAME_COOKIE = 'ew_game';
export const leagueCookie = (game: GameId) => `ew_league_${game}`;
/** One year: these are preferences, not credentials. */
export const PREF_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Longest league name accepted from a cookie before validation. */
export const MAX_LEAGUE_NAME = 64;
