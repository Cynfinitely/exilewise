import type { TradeRef } from './trade';

/** Covens league (PoE 1, 3.30) viscera, as stored in data/snapshot/poe1-viscera.json. */

export const VISCERA_SLOTS = [
  'Head',
  'Torso',
  'Upper Limb',
  'Lower Limb',
] as const;
export type VisceraSlot = (typeof VISCERA_SLOTS)[number];

/**
 * lesser/normal/greater: regular Fate boss drops. pinnacle/uber: Grim Fate
 * pinnacle bosses and their uber versions. queen: the Coven Queen's Crown.
 */
export const VISCERA_TIERS = [
  'lesser',
  'normal',
  'greater',
  'pinnacle',
  'uber',
  'queen',
] as const;
export type VisceraTier = (typeof VISCERA_TIERS)[number];

export type VisceraSourceKind = 'campaign' | 'map' | 'pinnacle' | 'queen';

export interface VisceraSource {
  boss: string;
  /** Zone for Fate bosses; the boss key (fragments, invitation) for pinnacles. */
  where: string;
  kind: VisceraSourceKind;
  /** Campaign act (1-10), when known. */
  act: number | null;
  /** Monster level of the zone, when known. */
  areaLevel: number | null;
}

export interface Viscera {
  id: string;
  name: string;
  /** Name without the Lesser/Greater prefix or "(variant)" suffix. */
  family: string;
  slot: VisceraSlot;
  tier: VisceraTier;
  levelReq: number;
  /** Stat lines as shown in game. */
  effects: string[];
  sources: VisceraSource[];
  /** Site path of the icon (public/), or null. */
  icon: string | null;
  flavour: string | null;
  /** Official trade-site search target, joined in at load time. */
  trade?: TradeRef | null;
}

export interface VisceraSnapshot {
  source: string;
  license: string;
  fetchedAt: string;
  league: string;
  viscera: Viscera[];
}
