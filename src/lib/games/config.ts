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
  /** Only shown when the selected league's name matches (league mechanics). */
  leagueMatch?: RegExp;
}

export interface GameNavGroup {
  label: string;
  links: GameNavItem[];
  /** Desktop bar shows the group as one dropdown named `label`. */
  menu?: boolean;
  /** Icon on the dropdown button (menu groups only). */
  icon?: NavIconName;
}

export interface GameLogo {
  /** Official logo in `public/games/` (from Wikipedia, © Grinding Gear Games). */
  src: string;
  width: number;
  height: number;
}

export interface GameMeta {
  id: GameId;
  name: string;
  short: string;
  /** One line for the game picker cards. */
  tagline: string;
  logo: GameLogo;
  /** Landing page of the game's section. */
  home: string;
  nav: GameNavGroup[];
}

export const GAMES: Record<GameId, GameMeta> = {
  poe1: {
    id: 'poe1',
    name: 'Path of Exile 1',
    short: 'PoE 1',
    tagline: 'Covens league viscera, the Wickerman planner and farming guides.',
    logo: { src: '/games/poe1-logo.png', width: 391, height: 255 },
    home: '/poe1',
    nav: [
      {
        label: 'Tools',
        links: [
          {
            href: '/poe1/build-planner',
            label: 'Build Planner',
            description: 'Compare your build with a goal, get an AI plan',
            icon: 'build',
          },
        ],
      },
      {
        label: 'Guides',
        menu: true,
        icon: 'guides',
        links: [
          {
            href: '/poe1/viscera',
            label: 'Covens: Viscera & Wickerman',
            description: 'Every viscera, Wickerman builder, build suggestions',
            icon: 'viscera',
            leagueMatch: /covens/i,
          },
          {
            href: '/poe1/guides/temple-of-atzoatl-farm',
            label: 'Temple of Atzoatl farm',
            description: 'Eight-Thread Cradle of Creation loop and profit',
            icon: 'guides',
          },
          {
            href: '/poe1/guides',
            label: 'All guides',
            description: 'Every PoE 1 guide and league companion',
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
    tagline:
      'Crafting planner, every mod on every base and live material prices.',
    logo: { src: '/games/poe2-logo.png', width: 766, height: 680 },
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
            href: '/poe2/build-planner',
            label: 'Build Planner',
            description: 'Compare your build with a goal, get an AI plan',
            icon: 'build',
          },
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

function inLeague(link: GameNavItem, league: string): boolean {
  return !link.leagueMatch || link.leagueMatch.test(league);
}

/** Menu groups for a game, with league-mechanic links filtered by league. */
export function navGroupsFor(game: GameId, league: string): GameNavGroup[] {
  return GAMES[game].nav
    .map(g => ({ ...g, links: g.links.filter(l => inLeague(l, league)) }))
    .filter(g => g.links.length > 0);
}

/** League-mechanic links left out of the menu for this league. */
export function hiddenLeagueLinks(game: GameId, league: string): GameNavItem[] {
  return GAMES[game].nav.flatMap(g =>
    g.links.filter(l => !inLeague(l, league))
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
