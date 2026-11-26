import type { GameId } from '@/lib/games/config';

/**
 * Build Planner data shapes. Client-safe: the API returns these as JSON and
 * the gap report and prompt are built from them in the browser.
 */

export interface BuildGem {
  name: string;
  level: number;
  quality: number;
  enabled: boolean;
  support: boolean;
}

export interface BuildSkillGroup {
  /** Label from PoB with colour codes removed ('' when unnamed). */
  label: string;
  /** Item slot the gems are socketed in, if any ('Body Armour'). */
  slot: string | null;
  enabled: boolean;
  /** PoB counts it in the full DPS figure. */
  inFullDps: boolean;
  gems: BuildGem[];
}

export interface BuildItem {
  /** PoB slot name ('Helmet', 'Ring 1', 'Jewel', 'Flask 2'). */
  slot: string;
  rarity: string;
  /** Unique or rare name; base name for magic/normal items. */
  name: string;
  base: string;
  /** Rolled explicit mod lines, capped. */
  mods: string[];
  /** Linked sockets in the largest group (0 when unknown). */
  links: number;
}

/** Headline PoB numbers; each is null when PoB did not export it. */
export type BuildStatKey =
  | 'life'
  | 'energyShield'
  | 'mana'
  | 'ward'
  | 'ehp'
  | 'maxHitPhys'
  | 'armour'
  | 'evasion'
  | 'block'
  | 'spellBlock'
  | 'suppression'
  | 'fireRes'
  | 'coldRes'
  | 'lightningRes'
  | 'chaosRes'
  | 'movement'
  | 'dps';

export type BuildStats = Record<BuildStatKey, number | null>;

export interface BuildSummary {
  game: GameId;
  level: number;
  className: string;
  ascendancy: string | null;
  /** First enabled active gem of PoB's main socket group. */
  mainSkill: string | null;
  bandit: string | null;
  pantheon: string | null;
  /** Titles of the active tree, skill and item sets ('' when unnamed). */
  setTitles: { tree: string; skills: string; items: string };
  treeVersion: string | null;
  /** Allocated passive node ids of the active tree. */
  treeNodes: number[];
  masteries: number;
  /** Official passive tree link of the active spec, when PoB has one. */
  treeUrl: string | null;
  stats: BuildStats;
  skills: BuildSkillGroup[];
  items: BuildItem[];
  /** Build author's notes, colour codes removed, capped. */
  notes: string;
}

export interface PricedEntry {
  name: string;
  kind: 'unique' | 'gem';
  /** Extra detail matched ('6L', '21/20c'). */
  detail: string | null;
  chaos: number;
  divine: number;
  /** Already in the current build (no need to buy). */
  owned: boolean;
}

export interface PriceReport {
  available: boolean;
  league: string;
  /** Chaos per divine, from the same snapshot. */
  divineInChaos: number | null;
  entries: PricedEntry[];
  /** Target uniques poe.ninja had no price for. */
  unpriced: string[];
  /** Why prices are missing, when `available` is false. */
  note: string | null;
}

export interface BuildPlanResponse {
  current: BuildSummary;
  target: BuildSummary;
  prices: PriceReport;
}
