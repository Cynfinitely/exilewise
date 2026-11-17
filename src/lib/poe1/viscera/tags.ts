import type { Viscera } from './types';

/**
 * Build tags inferred from viscera stat text, for filters and suggestions.
 * Keyword rules, not a stat parser: good enough to say "this helps a cold
 * spell build", reviewed against every stat line on the wiki page.
 */

export type TagGroup = 'damage' | 'style' | 'defence' | 'utility';

export interface TagDef {
  id: string;
  label: string;
  group: TagGroup;
  match: RegExp;
}

export const TAGS: TagDef[] = [
  // Damage types
  {
    id: 'fire',
    label: 'Fire',
    group: 'damage',
    match: /\bFire\b|Ignit|Burning|Scorch/i,
  },
  {
    id: 'cold',
    label: 'Cold',
    group: 'damage',
    match: /\bCold\b|Freez|Frozen|Chill|Shatter|Brittle/i,
  },
  {
    id: 'lightning',
    label: 'Lightning',
    group: 'damage',
    match: /Lightning|Shock|\bSap/i,
  },
  {
    id: 'chaos',
    label: 'Chaos',
    group: 'damage',
    match: /Chaos|Wither|Poison/i,
  },
  {
    id: 'physical',
    label: 'Physical',
    group: 'damage',
    match: /Physical(?! Damage taken| Damage from Hits taken)|Bleed|Impale/i,
  },
  {
    id: 'elemental',
    label: 'Elemental',
    group: 'damage',
    match: /Elemental (Damage|Ailment)|Random Element|Exposure/i,
  },
  // Play style
  {
    id: 'attack',
    label: 'Attacks',
    group: 'style',
    match:
      /Attack|Melee|Strike|Weapon|Bow\b|Claw|Bludgeon|Sword|Axe|Mace|Dagger|Staff|Wand|Retaliation/i,
  },
  {
    id: 'spell',
    label: 'Spells',
    group: 'style',
    match: /Spell|Cast Speed|\bCast\b/i,
  },
  {
    id: 'minion',
    label: 'Minions',
    group: 'style',
    match: /Minion|Spectre|Zombie|Skeleton|Golem|Wisp|Summon|Raised/i,
  },
  {
    id: 'projectile',
    label: 'Projectiles',
    group: 'style',
    match: /Projectile|Pierce|\bChain|Arrow|\bFork/i,
  },
  {
    id: 'area',
    label: 'Area',
    group: 'style',
    match: /Area of Effect|Area Skills|\bArea\b/i,
  },
  { id: 'crit', label: 'Critical', group: 'style', match: /Critical/i },
  {
    id: 'dot',
    label: 'Damage over time',
    group: 'style',
    match: /over Time|Ignite|Poison|Bleed|Wither|Corrupted Blood|Degen/i,
  },
  {
    id: 'totem',
    label: 'Totems, traps & mines',
    group: 'style',
    match: /Totem|Trap|Mine\b|Mines\b|Brand/i,
  },
  {
    id: 'aura',
    label: 'Auras & curses',
    group: 'style',
    match: /Aura|Curse|Hex|Mark\b|Herald|Reservation|Banner/i,
  },
  // Defence
  { id: 'life', label: 'Life', group: 'defence', match: /\bLife\b/i },
  {
    id: 'es',
    label: 'Energy shield',
    group: 'defence',
    match: /Energy Shield/i,
  },
  { id: 'mana', label: 'Mana', group: 'defence', match: /\bMana\b/i },
  {
    id: 'mitigation',
    label: 'Armour, evasion & block',
    group: 'defence',
    match:
      /Armour|Evasion|Evade|Block|Suppress|Fortif|Endurance Charge|Damage taken|taken as|Avoid|Dodge/i,
  },
  {
    id: 'resist',
    label: 'Resistances',
    group: 'defence',
    match: /Resistance/i,
  },
  // Utility
  {
    id: 'speed',
    label: 'Speed',
    group: 'utility',
    match:
      /Movement Speed|Attack Speed|Cast Speed|Action Speed|Cooldown Recovery|Skill Speed/i,
  },
  {
    id: 'charges',
    label: 'Charges',
    group: 'utility',
    match: /Frenzy Charge|Power Charge|Endurance Charge|\bCharges\b/i,
  },
  { id: 'flask', label: 'Flasks', group: 'utility', match: /Flask/i },
  {
    id: 'recovery',
    label: 'Leech & recovery',
    group: 'utility',
    match: /Leech|Regenerat|Recover|Recoup|Gain .* on Kill|on Hit/i,
  },
  {
    id: 'loot',
    label: 'Light & loot',
    group: 'utility',
    match: /Light Radius|Rarity|Quantity|Experience/i,
  },
];

export const TAG_GROUP_LABELS: Record<TagGroup, string> = {
  damage: 'Damage type',
  style: 'Play style',
  defence: 'Defence',
  utility: 'Utility',
};

const TAG_BY_ID = new Map(TAGS.map(t => [t.id, t]));

export function tagLabel(id: string): string {
  return TAG_BY_ID.get(id)?.label ?? id;
}

export function tagGroup(id: string): TagGroup | undefined {
  return TAG_BY_ID.get(id)?.group;
}

/**
 * Lines about damage you take ("+2% to maximum Fire Resistance", "Ignite
 * Duration on you") are defence, not a damage type or play style: a fire
 * resistance viscera is no pick for a fire build.
 */
const DEFENSIVE_LINE =
  /Resistance|taken|on you\b|against you|you take|inflicted on you|Avoid/i;

/** Tag ids for one viscera, in TAGS order. */
export function tagsFor(v: Pick<Viscera, 'effects'>): string[] {
  const all = v.effects.join('\n');
  const offensive = v.effects.filter(l => !DEFENSIVE_LINE.test(l)).join('\n');
  return TAGS.filter(t =>
    t.match.test(t.group === 'damage' || t.group === 'style' ? offensive : all)
  ).map(t => t.id);
}

export interface BuildPreset {
  id: string;
  label: string;
  tags: string[];
}

/** One-click starting points for "suggest for my build". */
export const BUILD_PRESETS: BuildPreset[] = [
  { id: 'minion', label: 'Minion summoner', tags: ['minion', 'life', 'aura'] },
  {
    id: 'ignite',
    label: 'Fire / ignite',
    tags: ['fire', 'dot', 'spell', 'life'],
  },
  {
    id: 'cold-crit',
    label: 'Cold crit spells',
    tags: ['cold', 'spell', 'crit', 'es'],
  },
  {
    id: 'lightning',
    label: 'Lightning spells',
    tags: ['lightning', 'spell', 'crit', 'life'],
  },
  {
    id: 'bow',
    label: 'Bow / projectile attacks',
    tags: ['attack', 'projectile', 'physical', 'elemental', 'life'],
  },
  {
    id: 'melee',
    label: 'Melee physical',
    tags: ['attack', 'physical', 'area', 'life', 'mitigation'],
  },
  { id: 'poison', label: 'Poison / chaos DoT', tags: ['chaos', 'dot', 'life'] },
  {
    id: 'totem',
    label: 'Totems, traps & mines',
    tags: ['totem', 'spell', 'area', 'life'],
  },
];
