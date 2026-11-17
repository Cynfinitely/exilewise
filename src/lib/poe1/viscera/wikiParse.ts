import {
  VISCERA_SLOTS,
  type Viscera,
  type VisceraSlot,
  type VisceraSourceKind,
  type VisceraTier,
} from './types';

/**
 * Turns the poewiki "Viscera" page wikitext into structured rows. Pure string
 * work so it is unit-tested; scripts/refresh-viscera.ts adds the network parts
 * (act numbers from the wiki's area table, icons).
 */

/** One table as a grid of raw cell strings, rowspans expanded. */
export function parseWikiTable(table: string): string[][] {
  const rows: string[][] = [];
  // Cells still owed to later rows by a rowspan: column -> { text, left }.
  const carry = new Map<number, { text: string; left: number }>();

  const rowChunks = table
    .split(/\n\|-[^\n]*/)
    .map(c => c.trim())
    .filter(
      c => c.startsWith('|') && !c.startsWith('|+') && !c.startsWith('|}')
    );

  for (const chunk of rowChunks) {
    const body = chunk.replace(/\n\|\}[\s\S]*$/, '').replace(/^\|/, '');
    const cells = body.split('||').map(parseCell);
    const row: string[] = [];
    let col = 0;
    const take = () => {
      for (;;) {
        const owed = carry.get(col);
        if (!owed) return;
        row.push(owed.text);
        owed.left -= 1;
        if (owed.left === 0) carry.delete(col);
        col += 1;
      }
    };
    for (const cell of cells) {
      take();
      row.push(cell.text);
      if (cell.rowspan > 1)
        carry.set(col, { text: cell.text, left: cell.rowspan - 1 });
      col += 1;
    }
    take();
    rows.push(row);
  }
  return rows;
}

function parseCell(raw: string): { text: string; rowspan: number } {
  // `rowspan="3" | value` — attributes come before a single pipe.
  const m = raw.match(/^\s*((?:[a-z-]+="[^"]*"\s*)+)\|(?!\|)([\s\S]*)$/i);
  if (!m) return { text: raw.trim(), rowspan: 1 };
  const span = m[1].match(/rowspan="(\d+)"/i);
  return { text: m[2].trim(), rowspan: span ? Number(span[1]) : 1 };
}

/** Wiki markup to display text (links, item templates, line breaks). */
export function cleanWikiText(text: string): string {
  return (
    text
      .replace(/<ref[\s\S]*?<\/ref>/gi, '')
      .replace(/\{\{il\|(?:page=)?([^}|]+)[^}]*\}\}/g, '$1')
      .replace(/\{\{c\|[^|}]+\|([\s\S]*?)\}\}/g, '$1')
      .replace(/\[\[File:[^\]]*\]\]/g, '')
      .replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, '$1')
      .replace(/\[\[([^\]]+)\]\]/g, '$1')
      .replace(/'{2,}/g, '')
      // Source line wraps are spaces; only <br> starts a new line.
      .replace(/\s*\n\s*/g, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .split('\n')
      .map(l => l.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n')
  );
}

/** A line ending in one of these words was wrapped mid-stat on the wiki. */
// Case-sensitive: stat lines end in values or Capitalised Words, never in
// lower-case function words.
const CONTINUES =
  /(\bEnergy|\b(of|to|the|and|an?|your|with|for|from|as|at|in|on|by|up))$/;

/** Stat lines of a description cell, re-joining lines wrapped mid-stat. */
export function statLines(cell: string): string[] {
  const out: string[] = [];
  for (const line of cleanWikiText(cell).split('\n')) {
    const prev = out[out.length - 1];
    if (prev && CONTINUES.test(prev)) out[out.length - 1] = `${prev} ${line}`;
    else out.push(line);
  }
  return out;
}

/** "Foo inventory icon.png" from a [[File:...]] cell. */
export function iconFileName(cell: string): string | null {
  return cell.match(/\[\[File:([^|\]]+)/)?.[1]?.trim() ?? null;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function familyOf(name: string): string {
  return name
    .replace(/^(Lesser|Greater)\s+/, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim();
}

/** "The Coast (Act 6)" / "The Crypt Level 2 (Act 2)" → zone name + act. */
export function splitZone(where: string): { zone: string; act: number | null } {
  const m = where.match(/^(.*?)\s*\(Act (\d+)\)\s*$/);
  return m
    ? { zone: m[1].trim(), act: Number(m[2]) }
    : { zone: where.trim(), act: null };
}

/**
 * Zones in a location cell. One cell may list several ("A<br>B", "A, B"),
 * and "(Act N)" sits inside or after the link. Text outside links that is
 * not an act marker is an editor note ("t7 NE") and is dropped.
 */
export function parseZones(
  cell: string
): { zone: string; act: number | null }[] {
  return cell
    .split(/<br\s*\/?>|,\s*(?=\[\[)/i)
    .map(part => {
      const link = part.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
      const outside = part.match(/\]\]\s*\(Act (\d+)\)/);
      const name = link ? (link[2] ?? link[1]) : cleanWikiText(part);
      const { zone, act } = splitZone(name);
      return { zone, act: act ?? (outside ? Number(outside[1]) : null) };
    })
    .filter(z => z.zone);
}

/** Wiki typos seen in the slot column. */
const SLOT_ALIASES: Record<string, VisceraSlot> = {
  'lowr limb': 'Lower Limb',
  'uper limb': 'Upper Limb',
  chest: 'Torso',
};

function asSlot(s: string): VisceraSlot {
  const key = s.trim().toLowerCase().replace(/\s+/g, ' ');
  const slot =
    VISCERA_SLOTS.find(v => v.toLowerCase() === key) ?? SLOT_ALIASES[key];
  if (!slot) throw new Error(`Unknown viscera slot "${s}"`);
  return slot;
}

function regularTier(name: string): VisceraTier {
  if (name.startsWith('Lesser ')) return 'lesser';
  if (name.startsWith('Greater ')) return 'greater';
  return 'normal';
}

/** Splits the page into its three tables by section heading. */
function sectionTable(wikitext: string, heading: RegExp): string | null {
  const start = wikitext.search(heading);
  if (start < 0) return null;
  const rest = wikitext.slice(start);
  const open = rest.indexOf('{|');
  const close = rest.indexOf('\n|}', open);
  if (open < 0 || close < 0) return null;
  return rest.slice(open, close + 3);
}

/** Raw viscera before area lookups: `act`/`areaLevel` filled from "(Act N)" only. */
export function parseVisceraWikitext(wikitext: string): Viscera[] {
  const out: Viscera[] = [];
  const lines = (cell: string) => cleanWikiText(cell).split('\n');

  const regular = sectionTable(wikitext, /==\s*List of regular viscera/);
  const pinnacle = sectionTable(wikitext, /==\s*List of pinnacle viscera/);
  const queen = sectionTable(wikitext, /==\s*Coven Queen's Crown/);
  if (!regular || !pinnacle || !queen) {
    throw new Error('Viscera page layout changed: a table is missing.');
  }

  // Icon | Slot | Name | Req. Lv | Description | Boss | Location
  for (const r of parseWikiTable(regular)) {
    if (r.length < 7) continue;
    const name = cleanWikiText(r[2]);
    const tier = regularTier(name);
    const bosses = lines(r[5]);
    const zones = parseZones(r[6]);
    // "A<br>B" bosses pair with "X<br>Y" zones; otherwise all share them.
    const bossFor = (i: number) =>
      bosses.length === zones.length ? bosses[i] : bosses.join(' / ');
    // `kind` is refined from the wiki's area table by the refresh script;
    // until then campaign zones are the "(Act N)" / "The …" ones.
    const sources = zones.map(({ zone, act }, i) => ({
      boss: bossFor(i),
      where: zone,
      kind: (act || zone.startsWith('The ')
        ? 'campaign'
        : 'map') as VisceraSourceKind,
      act,
      areaLevel: null,
    }));
    out.push({
      id: slugify(name),
      name,
      family: familyOf(name),
      slot: asSlot(cleanWikiText(r[1])),
      tier,
      levelReq: Number.parseInt(cleanWikiText(r[3]), 10) || 1,
      effects: statLines(r[4]),
      sources,
      icon: iconFileName(r[0]),
      flavour: null,
    });
  }

  // Icon | Slot | Name | Req. Lv | Description | Boss | Boss Key
  for (const r of parseWikiTable(pinnacle)) {
    if (r.length < 7) continue;
    const name = cleanWikiText(r[2]);
    const bosses = lines(r[5]);
    const keys = lines(r[6]);
    out.push({
      id: slugify(name),
      name,
      family: familyOf(name),
      slot: asSlot(cleanWikiText(r[1])),
      tier: name.startsWith('Greater ') ? 'uber' : 'pinnacle',
      levelReq: Number.parseInt(cleanWikiText(r[3]), 10) || 1,
      effects: statLines(r[4]),
      sources: bosses.map((boss, i) => ({
        boss,
        where: keys[i] ?? keys[0] ?? '',
        kind: 'pinnacle' as const,
        act: null,
        areaLevel: null,
      })),
      icon: iconFileName(r[0]),
      flavour: null,
    });
  }

  // Icon | Slot | Name | Description | Boss | Boss Key | Flavour
  for (const r of parseWikiTable(queen)) {
    if (r.length < 7) continue;
    const name = cleanWikiText(r[2]);
    out.push({
      id: slugify(name),
      name,
      family: familyOf(name),
      slot: asSlot(cleanWikiText(r[1])),
      tier: 'queen',
      levelReq: 1,
      effects: [
        '2-3 random modifiers from Greater viscera, or their stronger "Queen" tier',
      ],
      sources: [
        {
          boss: cleanWikiText(r[4]),
          where: cleanWikiText(r[5]),
          kind: 'queen',
          act: null,
          areaLevel: null,
        },
      ],
      icon: iconFileName(r[0]),
      flavour: cleanWikiText(r[6]).replace(/\n/g, ' '),
    });
  }

  return mergeDuplicates(out);
}

/**
 * A viscera dropped by two bosses spans two table rows; fold them into one
 * entry with both sources. Ids stay unique: they key the Wickerman builder.
 */
function mergeDuplicates(list: Viscera[]): Viscera[] {
  const byId = new Map<string, Viscera>();
  for (const v of list) {
    const prev = byId.get(v.id);
    if (!prev) {
      byId.set(v.id, v);
      continue;
    }
    for (const src of v.sources) {
      if (
        !prev.sources.some(p => p.boss === src.boss && p.where === src.where)
      ) {
        prev.sources.push(src);
      }
    }
  }
  return [...byId.values()];
}
