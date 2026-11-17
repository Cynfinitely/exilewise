/**
 * Downloads the Covens league viscera list from poewiki.net into
 * data/snapshot/poe1-viscera.json, with icons in public/poe1/viscera/.
 *
 * Run with: npm run data:viscera
 *
 * Source: https://www.poewiki.net/wiki/Viscera (CC BY-NC-SA 3.0). The page
 * tables are parsed by src/lib/poe1/viscera/wikiParse.ts; act numbers and
 * area levels come from the wiki's Cargo `areas` table; icons are 64px
 * thumbnails served from this site so pages never hotlink the wiki.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  parseVisceraWikitext,
  slugify,
} from '../src/lib/poe1/viscera/wikiParse';
import type { Viscera, VisceraSnapshot } from '../src/lib/poe1/viscera/types';

const API = 'https://www.poewiki.net/w/api.php';
const PAGE = 'Viscera';
const USER_AGENT = 'exilewise/0.1 (+https://exilewise.com)';
const SNAPSHOT = path.join(
  process.cwd(),
  'data',
  'snapshot',
  'poe1-viscera.json'
);
const ICON_DIR = path.join(process.cwd(), 'public', 'poe1', 'viscera');
const ICON_MAX_BYTES = 200_000;
/** Atlas maps are "act 11" in the wiki's area table. */
const MAP_ACT = 11;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Paced GET with backoff on 429: the wiki rate-limits bursts. */
async function politeFetch(url: string | URL): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    await sleep(350);
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (res.status !== 429 || attempt >= 5) return res;
    const wait = Number(res.headers.get('retry-after')) || 5 * (attempt + 1);
    console.warn(`  rate limited, waiting ${wait}s…`);
    await sleep(wait * 1000);
  }
}

async function api(params: Record<string, string>): Promise<unknown> {
  const url = new URL(API);
  for (const [k, v] of Object.entries({
    ...params,
    format: 'json',
    formatversion: '2',
  })) {
    url.searchParams.set(k, v);
  }
  const res = await politeFetch(url);
  if (!res.ok) throw new Error(`wiki ${res.status} for ${params.action}`);
  return res.json();
}

async function fetchWikitext(): Promise<string> {
  const data = (await api({
    action: 'parse',
    page: PAGE,
    prop: 'wikitext',
  })) as {
    parse?: { wikitext?: string };
  };
  const text = data.parse?.wikitext;
  if (!text) throw new Error('wiki: no wikitext in response');
  return text;
}

interface AreaRow {
  name: string;
  act: number;
  isMap: boolean;
  areaLevel: number;
}

async function fetchAreas(names: string[]): Promise<AreaRow[]> {
  const out: AreaRow[] = [];
  for (let i = 0; i < names.length; i += 40) {
    const batch = names.slice(i, i + 40).map(n => `"${n.replace(/"/g, '')}"`);
    const data = (await api({
      action: 'cargoquery',
      tables: 'areas',
      fields:
        'areas.name=name,areas.act=act,areas.is_map_area=is_map,areas.area_level=level',
      where: `areas.name IN (${batch.join(',')})`,
      limit: '500',
    })) as { cargoquery?: { title: Record<string, string> }[] };
    for (const { title } of data.cargoquery ?? []) {
      out.push({
        name: title.name,
        act: Number(title.act),
        isMap: title.is_map === '1' || Number(title.act) === MAP_ACT,
        areaLevel: Number(title.level),
      });
    }
  }
  return out;
}

/** Fills act/areaLevel/kind of Fate-boss sources from the area table. */
function applyAreas(list: Viscera[], areas: AreaRow[]): void {
  for (const v of list) {
    for (const s of v.sources) {
      if (s.kind !== 'campaign' && s.kind !== 'map') continue;
      const rows = areas.filter(a => a.name === s.where);
      const campaign = rows
        .filter(
          a =>
            !a.isMap &&
            a.act >= 1 &&
            a.act <= 10 &&
            (s.act == null || a.act === s.act)
        )
        .sort((a, b) => a.act - b.act || a.areaLevel - b.areaLevel);
      if (campaign[0]) {
        s.kind = 'campaign';
        s.act = campaign[0].act;
        s.areaLevel = campaign[0].areaLevel;
      } else if (rows.length && rows.every(a => a.isMap || a.act < 1)) {
        s.kind = 'map';
        s.act = null;
        s.areaLevel = null;
      }
    }
  }
}

const exists = (p: string) =>
  fs.stat(p).then(
    () => true,
    () => false
  );

async function downloadIcons(list: Viscera[]): Promise<void> {
  await fs.mkdir(ICON_DIR, { recursive: true });
  const files = [
    ...new Set(list.map(v => v.icon).filter((f): f is string => !!f)),
  ];
  const local = new Map<string, string>();

  for (let i = 0; i < files.length; i += 40) {
    const batch = files.slice(i, i + 40);
    const data = (await api({
      action: 'query',
      titles: batch.map(f => `File:${f}`).join('|'),
      prop: 'imageinfo',
      iiprop: 'url',
      iiurlwidth: '64',
    })) as {
      query?: {
        pages?: {
          title: string;
          imageinfo?: { thumburl?: string; url?: string }[];
        }[];
      };
    };
    for (const page of data.query?.pages ?? []) {
      const info = page.imageinfo?.[0];
      const src = info?.thumburl ?? info?.url;
      if (!src) continue;
      const file = page.title.replace(/^File:/, '');
      const name = `${slugify(file.replace(/ inventory icon\.png$/i, ''))}.png`;
      const target = path.join(ICON_DIR, name);
      if (await exists(target)) {
        local.set(file, `/poe1/viscera/${name}`);
        continue;
      }
      const res = await politeFetch(src);
      const type = res.headers.get('content-type') ?? '';
      if (!res.ok || !type.startsWith('image/png')) {
        console.warn(`  icon skipped (${res.status} ${type}): ${file}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength > ICON_MAX_BYTES) {
        console.warn(`  icon too large, skipped: ${file}`);
        continue;
      }
      await fs.writeFile(target, buf);
      local.set(file, `/poe1/viscera/${name}`);
    }
  }

  for (const v of list) {
    // The wiki normalises the first letter and spaces in file titles.
    const key =
      v.icon &&
      [...local.keys()].find(
        k => k.toLowerCase() === v.icon!.toLowerCase().replace(/_/g, ' ')
      );
    v.icon = key ? local.get(key)! : null;
  }
}

async function main() {
  console.log('Fetching wiki page…');
  const viscera = parseVisceraWikitext(await fetchWikitext());
  console.log(`  parsed ${viscera.length} viscera`);

  const zones = [
    ...new Set(
      viscera.flatMap(v =>
        v.sources
          .filter(s => s.kind === 'campaign' || s.kind === 'map')
          .map(s => s.where)
      )
    ),
  ];
  console.log(`Looking up ${zones.length} zones…`);
  applyAreas(viscera, await fetchAreas(zones));

  console.log('Downloading icons…');
  await downloadIcons(viscera);
  console.log(
    `  ${viscera.filter(v => v.icon).length}/${viscera.length} with icons`
  );

  const snapshot: VisceraSnapshot = {
    source: 'https://www.poewiki.net/wiki/Viscera',
    license: 'CC BY-NC-SA 3.0',
    fetchedAt: new Date().toISOString(),
    league: 'Covens',
    viscera,
  };
  await fs.writeFile(SNAPSHOT, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Wrote ${path.relative(process.cwd(), SNAPSHOT)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
