import type { BuildItem, BuildStatKey, BuildSummary } from './types';

/** What changes between the current and the target build. Pure, client-safe. */

export const STAT_LABELS: Record<
  BuildStatKey,
  { label: string; unit: '' | '%' }
> = {
  life: { label: 'Life', unit: '' },
  energyShield: { label: 'Energy shield', unit: '' },
  mana: { label: 'Mana', unit: '' },
  ward: { label: 'Ward', unit: '' },
  ehp: { label: 'Effective HP', unit: '' },
  maxHitPhys: { label: 'Max physical hit', unit: '' },
  armour: { label: 'Armour', unit: '' },
  evasion: { label: 'Evasion', unit: '' },
  block: { label: 'Attack block', unit: '%' },
  spellBlock: { label: 'Spell block', unit: '%' },
  suppression: { label: 'Spell suppression', unit: '%' },
  fireRes: { label: 'Fire res', unit: '%' },
  coldRes: { label: 'Cold res', unit: '%' },
  lightningRes: { label: 'Lightning res', unit: '%' },
  chaosRes: { label: 'Chaos res', unit: '%' },
  movement: { label: 'Movement speed', unit: '%' },
  dps: { label: 'DPS (PoB)', unit: '' },
};

export interface StatGap {
  key: BuildStatKey;
  label: string;
  unit: '' | '%';
  current: number | null;
  target: number | null;
  /** target − current (null if either is unknown). */
  delta: number | null;
}

export interface GemUpgrade {
  name: string;
  from: { level: number; quality: number };
  to: { level: number; quality: number };
}

export type ItemStatus = 'same' | 'similar' | 'swap' | 'new' | 'drop';

export interface ItemGap {
  slot: string;
  status: ItemStatus;
  current: Pick<BuildItem, 'name' | 'base' | 'rarity' | 'links'> | null;
  target: Pick<BuildItem, 'name' | 'base' | 'rarity' | 'links'> | null;
  /** Target needs more linked sockets than the current item has. */
  needsLinks: number | null;
}

export interface BuildGap {
  levelDelta: number;
  classChange: 'none' | 'ascendancy' | 'class';
  stats: StatGap[];
  gems: { added: string[]; removed: string[]; upgrades: GemUpgrade[] };
  items: ItemGap[];
  tree: {
    current: number;
    target: number;
    toAllocate: number;
    toRemove: number;
    masteries: { current: number; target: number };
    versionChange: boolean;
  };
}

function activeGems(b: BuildSummary) {
  const map = new Map<string, { level: number; quality: number }>();
  for (const g of b.skills.filter(s => s.enabled)) {
    for (const gem of g.gems.filter(x => x.enabled)) {
      const prev = map.get(gem.name);
      if (!prev || gem.level > prev.level) {
        map.set(gem.name, { level: gem.level, quality: gem.quality });
      }
    }
  }
  return map;
}

const pick = (i: BuildItem | undefined) =>
  i ? { name: i.name, base: i.base, rarity: i.rarity, links: i.links } : null;

function compareItem(
  slot: string,
  cur: BuildItem | undefined,
  tgt: BuildItem | undefined
): ItemGap {
  let status: ItemStatus;
  if (!tgt) status = 'drop';
  else if (!cur) status = 'new';
  else if (tgt.rarity === 'UNIQUE') {
    status = cur.rarity === 'UNIQUE' && cur.name === tgt.name ? 'same' : 'swap';
  } else {
    status =
      cur.rarity !== 'UNIQUE' && cur.base === tgt.base ? 'similar' : 'swap';
  }
  const needsLinks =
    tgt && tgt.links >= 5 && (cur?.links ?? 0) < tgt.links ? tgt.links : null;
  return { slot, status, current: pick(cur), target: pick(tgt), needsLinks };
}

/** Jewels have no fixed slot: match uniques by name, rares by base. */
function compareJewels(cur: BuildItem[], tgt: BuildItem[]): ItemGap[] {
  const pool = [...cur];
  const out: ItemGap[] = [];
  for (const t of tgt) {
    const i = pool.findIndex(c =>
      t.rarity === 'UNIQUE' ? c.name === t.name : c.base === t.base
    );
    const match = i >= 0 ? pool.splice(i, 1)[0] : undefined;
    out.push(compareItem('Jewel', match, t));
  }
  for (const c of pool) out.push(compareItem('Jewel', c, undefined));
  return out;
}

const SLOT_ORDER = [
  'Weapon 1',
  'Weapon 2',
  'Helmet',
  'Body Armour',
  'Gloves',
  'Boots',
  'Amulet',
  'Ring 1',
  'Ring 2',
  'Ring 3',
  'Belt',
];

function slotRank(slot: string): number {
  const i = SLOT_ORDER.indexOf(slot);
  if (i >= 0) return i;
  if (/^Flask/.test(slot)) return 50;
  if (slot === 'Jewel' || /Abyssal/.test(slot)) return 60;
  return 40;
}

export function compareBuilds(
  current: BuildSummary,
  target: BuildSummary
): BuildGap {
  const stats: StatGap[] = (Object.keys(STAT_LABELS) as BuildStatKey[])
    .map(key => {
      const c = current.stats[key];
      const t = target.stats[key];
      return {
        key,
        ...STAT_LABELS[key],
        current: c,
        target: t,
        delta: c !== null && t !== null ? t - c : null,
      };
    })
    // Hide stats neither build uses (ward on a life build, etc.).
    .filter(s => (s.current ?? 0) !== 0 || (s.target ?? 0) !== 0);

  const cg = activeGems(current);
  const tg = activeGems(target);
  const added = [...tg.keys()].filter(n => !cg.has(n));
  const removed = [...cg.keys()].filter(n => !tg.has(n));
  const upgrades: GemUpgrade[] = [];
  for (const [name, to] of tg) {
    const from = cg.get(name);
    if (from && (from.level < to.level || from.quality < to.quality)) {
      upgrades.push({ name, from, to });
    }
  }

  const bySlot = (b: BuildSummary) =>
    new Map(
      b.items.filter(i => i.slot !== 'Jewel').map(i => [i.slot, i] as const)
    );
  const ci = bySlot(current);
  const ti = bySlot(target);
  const slots = [...new Set([...ti.keys(), ...ci.keys()])].sort(
    (a, b) => slotRank(a) - slotRank(b) || a.localeCompare(b)
  );
  const items = [
    ...slots.map(s => compareItem(s, ci.get(s), ti.get(s))),
    ...compareJewels(
      current.items.filter(i => i.slot === 'Jewel'),
      target.items.filter(i => i.slot === 'Jewel')
    ),
  ];

  const curNodes = new Set(current.treeNodes);
  const tgtNodes = new Set(target.treeNodes);
  const toAllocate = [...tgtNodes].filter(n => !curNodes.has(n)).length;
  const toRemove = [...curNodes].filter(n => !tgtNodes.has(n)).length;

  return {
    levelDelta: target.level - current.level,
    classChange:
      current.className !== target.className
        ? 'class'
        : current.ascendancy !== target.ascendancy && current.ascendancy
          ? 'ascendancy'
          : 'none',
    stats,
    gems: { added, removed, upgrades },
    items,
    tree: {
      current: curNodes.size,
      target: tgtNodes.size,
      toAllocate,
      toRemove,
      masteries: { current: current.masteries, target: target.masteries },
      versionChange:
        !!current.treeVersion &&
        !!target.treeVersion &&
        current.treeVersion !== target.treeVersion,
    },
  };
}
