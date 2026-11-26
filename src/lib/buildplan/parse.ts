import type { GameId } from '@/lib/games/config';
import type {
  BuildGem,
  BuildItem,
  BuildSkillGroup,
  BuildStatKey,
  BuildStats,
  BuildSummary,
} from './types';

/**
 * Reads the parts of a decoded Path of Building XML export the planner
 * needs. Pure string work (no DOM, no network) so it is unit-testable.
 * Only the *active* tree, skill set and item set are read: PoB exports
 * often carry leveling sets the player is not using.
 */

const MAX_MODS = 12;
const MAX_NOTES = 2_000;
const MAX_ITEMS = 60;

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&');
}

/** Removes PoB colour codes (^1, ^xRRGGBB). */
export function stripColors(s: string): string {
  return s.replace(/\^x[0-9a-fA-F]{6}|\^\d/g, '');
}

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([A-Za-z_][\w:.-]*)="([^"]*)"/g)) {
    out[m[1]] = decodeEntities(m[2]);
  }
  return out;
}

/** Inner text of the first `<tag ...>...</tag>` block, with its open tag. */
function block(
  xml: string,
  tag: string
): { open: Record<string, string>; body: string } | null {
  const m = xml.match(new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return m ? { open: attrs(m[1] ?? ''), body: m[2] } : null;
}

/** Every `<tag ...>...</tag>` (or self-closing) block. */
function blocks(
  xml: string,
  tag: string
): { open: Record<string, string>; body: string }[] {
  const re = new RegExp(
    `<${tag}(\\s[^>]*?)?(?:/>|>([\\s\\S]*?)</${tag}>)`,
    'g'
  );
  return [...xml.matchAll(re)].map(m => ({
    open: attrs(m[1] ?? ''),
    body: m[2] ?? '',
  }));
}

function num(v: string | undefined): number | null {
  if (v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Picks the set whose `id` is `active`, else the first one. */
function activeSet<T extends { open: Record<string, string> }>(
  sets: T[],
  active: string | undefined
): T | undefined {
  return sets.find(s => s.open.id === active) ?? sets[0];
}

const STAT_SOURCES: Record<BuildStatKey, string[]> = {
  life: ['Life'],
  energyShield: ['EnergyShield'],
  mana: ['Mana'],
  ward: ['Ward'],
  ehp: ['TotalEHP'],
  maxHitPhys: ['PhysicalMaximumHitTaken'],
  armour: ['Armour'],
  evasion: ['Evasion'],
  block: ['EffectiveBlockChance'],
  spellBlock: ['EffectiveSpellBlockChance'],
  suppression: ['EffectiveSpellSuppressionChance'],
  fireRes: ['FireResist'],
  coldRes: ['ColdResist'],
  lightningRes: ['LightningResist'],
  chaosRes: ['ChaosResist'],
  movement: ['EffectiveMovementSpeedMod'],
  // Largest of PoB's damage summaries: minion, DoT and hit builds use different ones.
  dps: ['FullDPS', 'CombinedDPS', 'TotalDPS', 'TotalDotDPS', 'WithPoisonDPS'],
};

function readStats(buildBody: string): BuildStats {
  const raw = new Map<string, number>();
  for (const s of blocks(buildBody, 'PlayerStat')) {
    const v = num(s.open.value);
    if (s.open.stat && v !== null) raw.set(s.open.stat, v);
  }
  const stats = {} as BuildStats;
  for (const [key, sources] of Object.entries(STAT_SOURCES) as [
    BuildStatKey,
    string[],
  ][]) {
    const values = sources
      .map(s => raw.get(s))
      .filter((v): v is number => v !== undefined);
    stats[key] = values.length ? Math.max(...values) : null;
  }
  if (stats.movement !== null) {
    // PoB stores the multiplier (1.35); show the percentage bonus.
    stats.movement = Math.round((stats.movement - 1) * 1000) / 10;
  }
  return stats;
}

function isSupport(gem: Record<string, string>): boolean {
  return (
    /SupportGem|\/Support/i.test(gem.gemId ?? '') ||
    /^Support/.test(gem.skillId ?? '')
  );
}

function readSkills(xml: string): {
  groups: BuildSkillGroup[];
  title: string;
} {
  const skills = block(xml, 'Skills');
  if (!skills) return { groups: [], title: '' };
  const sets = blocks(skills.body, 'SkillSet');
  const set = activeSet(sets, skills.open.activeSkillSet);
  const body = set ? set.body : skills.body;

  const groups: BuildSkillGroup[] = [];
  for (const s of blocks(body, 'Skill')) {
    const gems: BuildGem[] = blocks(s.body, 'Gem')
      .map(g => ({
        name: stripColors(g.open.nameSpec ?? g.open.skillId ?? '').trim(),
        level: num(g.open.level) ?? 1,
        quality: num(g.open.quality) ?? 0,
        enabled: g.open.enabled !== 'false',
        support: isSupport(g.open),
      }))
      .filter(g => g.name);
    groups.push({
      label: stripColors(s.open.label ?? '').trim(),
      slot: s.open.slot || null,
      enabled: s.open.enabled !== 'false',
      inFullDps: s.open.includeInFullDPS === 'true',
      gems,
    });
  }
  return { groups, title: stripColors(set?.open.title ?? '').trim() };
}

const ITEM_KEY = /^[A-Za-z][A-Za-z ]*:\s/;

/** Header names, rarity, links and explicit mods from one PoB item text. */
export function readItemText(text: string): Omit<BuildItem, 'slot'> | null {
  // Drop nested XML (<ModRange .../>) before decoding entities.
  const lines = decodeEntities(text.replace(/<[^>]*>/g, ''))
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  const rarityLine = lines.findIndex(l => /^Rarity:/i.test(l));
  if (rarityLine < 0) return null;
  const rarity = lines[rarityLine].replace(/^Rarity:\s*/i, '').toUpperCase();

  const header: string[] = [];
  let i = rarityLine + 1;
  for (; i < lines.length && !ITEM_KEY.test(lines[i]); i++) {
    header.push(lines[i]);
  }

  let links = 0;
  let implicits = 0;
  let modsStart = -1;
  for (let j = i; j < lines.length; j++) {
    const sockets = lines[j].match(/^Sockets:\s*(.+)$/i);
    if (sockets) {
      links = Math.max(
        0,
        ...sockets[1].split(/\s+/).map(g => g.split('-').length)
      );
    }
    const imp = lines[j].match(/^Implicits:\s*(\d+)/i);
    if (imp) {
      implicits = Number(imp[1]);
      modsStart = j + 1 + implicits;
      break;
    }
  }

  const selected = lines
    .find(l => /^Selected Variant:/i.test(l))
    ?.replace(/^Selected Variant:\s*/i, '');
  /** Unique items list every variant's lines; keep the selected one's. */
  const inVariant = (l: string) => {
    const v = l.match(/\{variant:([\d,]+)\}/);
    return !v || !selected || v[1].split(',').includes(selected);
  };

  const mods =
    modsStart < 0
      ? []
      : lines
          .slice(modsStart)
          .filter(l => !ITEM_KEY.test(l) && !l.startsWith('^') && inVariant(l))
          .map(l => l.replace(/^(\{[^}]*\})+/, '').trim())
          // Long prose lines are the author's notes, not mods.
          .filter(l => l && l.length <= 140 && l.split(/\s+/).length <= 18)
          .slice(0, MAX_MODS);

  const first = header[0] ?? '';
  const base = header.length > 1 ? header[header.length - 1] : first;
  // PoB's placeholder for an unnamed rare tells nobody anything.
  const name = first === 'New Item' ? base : first;
  if (!name) return null;
  return { rarity, name, base, mods, links };
}

function readItems(
  xml: string,
  jewelSockets: string[]
): {
  items: BuildItem[];
  title: string;
} {
  const section = block(xml, 'Items');
  if (!section) return { items: [], title: '' };

  const texts = new Map<string, string>();
  for (const it of blocks(section.body, 'Item')) {
    if (it.open.id) texts.set(it.open.id, it.body);
  }

  const sets = blocks(section.body, 'ItemSet');
  const set = activeSet(sets, section.open.activeItemSet);
  const slotSource = set ? set.body : section.body;

  const items: BuildItem[] = [];
  const add = (slot: string, itemId: string | undefined) => {
    if (!itemId || itemId === '0' || items.length >= MAX_ITEMS) return;
    const text = texts.get(itemId);
    const parsed = text ? readItemText(text) : null;
    if (parsed) items.push({ slot, ...parsed });
  };

  for (const s of blocks(slotSource, 'Slot')) {
    const name = s.open.name ?? '';
    // Weapon swap gear is not part of the build's power.
    if (!name || /Swap/i.test(name)) continue;
    add(name, s.open.itemId);
  }
  for (const id of jewelSockets) add('Jewel', id);
  return { items, title: stripColors(set?.open.title ?? '').trim() };
}

function readTree(xml: string) {
  const tree = block(xml, 'Tree');
  const specs = tree ? blocks(tree.body, 'Spec') : [];
  // activeSpec is a 1-based position, not an id.
  const index = Math.max(0, (num(tree?.open.activeSpec) ?? 1) - 1);
  const spec = specs[index] ?? specs[0];
  if (!spec) {
    return {
      nodes: [] as number[],
      masteries: 0,
      version: null,
      url: null,
      title: '',
      jewels: [] as string[],
    };
  }
  const nodes = (spec.open.nodes ?? '')
    .split(',')
    .map(n => Number(n))
    .filter(n => Number.isInteger(n) && n > 0);
  const masteries = (spec.open.masteryEffects ?? '').match(/\{/g)?.length ?? 0;
  const urlText = block(spec.body, 'URL')?.body.trim() ?? '';
  const url = /^https:\/\/(www\.)?pathofexile\.com\/[\w/-]+/.test(urlText)
    ? urlText
    : null;
  const jewels = blocks(spec.body, 'Socket')
    .map(s => s.open.itemId)
    .filter((id): id is string => !!id && id !== '0');
  return {
    nodes,
    masteries,
    version: spec.open.treeVersion ?? null,
    url,
    title: stripColors(spec.open.title ?? '').trim(),
    jewels,
  };
}

/** Parses decoded PoB XML into a build summary (null if it is not a build). */
export function parseBuildXml(xml: string, game: GameId): BuildSummary | null {
  const build = block(xml, 'Build');
  if (!build) return null;
  const b = build.open;

  const tree = readTree(xml);
  const { groups, title: skillsTitle } = readSkills(xml);
  const { items, title: itemsTitle } = readItems(xml, tree.jewels);

  const mainIndex = (num(b.mainSocketGroup) ?? 1) - 1;
  const main =
    groups[mainIndex]?.gems.find(g => !g.support && g.enabled) ??
    groups
      .filter(g => g.inFullDps)
      .flatMap(g => g.gems)
      .find(g => !g.support && g.enabled) ??
    // Leveling sets often point at a label-only group: take the first skill.
    groups
      .filter(g => g.enabled)
      .flatMap(g => g.gems)
      .find(g => !g.support && g.enabled);

  const pantheon = [b.pantheonMajorGod, b.pantheonMinorGod]
    .filter(p => p && p !== 'None')
    .join(' + ');
  const notes = stripColors(decodeEntities(block(xml, 'Notes')?.body ?? ''))
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_NOTES);

  return {
    game,
    level: num(b.level) ?? 1,
    className: b.className || 'Unknown',
    ascendancy:
      b.ascendClassName && b.ascendClassName !== 'None'
        ? b.ascendClassName
        : null,
    mainSkill: main?.name ?? null,
    bandit: b.bandit && b.bandit !== 'None' ? b.bandit : null,
    pantheon: pantheon || null,
    setTitles: { tree: tree.title, skills: skillsTitle, items: itemsTitle },
    treeVersion: tree.version,
    treeNodes: tree.nodes,
    masteries: tree.masteries,
    treeUrl: tree.url,
    stats: readStats(build.body),
    skills: groups.filter(g => g.gems.length > 0),
    items,
    notes,
  };
}
