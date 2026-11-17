/**
 * Maps every viscera in data/snapshot/poe1-viscera.json to its official
 * trade-site item type and stat ids, written to
 * data/snapshot/poe1-viscera-trade.json. The site builds Instant Buyout
 * links from it without calling GGG at runtime.
 *
 * Run with: npm run data:viscera-trade (after data:viscera)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  resolveTrade,
  type StatIndex,
  type TradeRef,
} from '../src/lib/poe1/viscera/trade';
import type { VisceraSnapshot } from '../src/lib/poe1/viscera/types';

const API = 'https://www.pathofexile.com/api/trade/data';
const USER_AGENT = 'exilewise/0.1 (+https://exilewise.com)';
const DIR = path.join(process.cwd(), 'data', 'snapshot');

async function get<T>(name: string): Promise<T> {
  const res = await fetch(`${API}/${name}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`trade data ${name}: ${res.status}`);
  return (await res.json()) as T;
}

type Items = { result: { id: string; entries: { type: string }[] }[] };
type Stats = {
  result: { id: string; entries: { id: string; text: string }[] }[];
};

async function main() {
  const snap = JSON.parse(
    await fs.readFile(path.join(DIR, 'poe1-viscera.json'), 'utf8')
  ) as VisceraSnapshot;

  const items = await get<Items>('items');
  const viscera = items.result.find(c => c.id === 'viscera');
  if (!viscera) throw new Error('trade data has no "viscera" category');
  const types = new Set(viscera.entries.map(e => e.type));

  const stats = await get<Stats>('stats');
  const index: StatIndex = new Map();
  for (const group of stats.result) {
    if (group.id !== 'explicit' && group.id !== 'implicit') continue;
    for (const e of group.entries) {
      const ids = index.get(e.text) ?? [];
      ids.push(e.id);
      index.set(e.text, ids);
    }
  }

  const refs: Record<string, TradeRef> = {};
  const missing: string[] = [];
  let typeOnly = 0;
  for (const v of snap.viscera) {
    const ref = resolveTrade(v, types, index);
    if (!ref) {
      missing.push(v.name);
      continue;
    }
    if (!ref.statIds.length) typeOnly += 1;
    refs[v.id] = ref;
  }

  await fs.writeFile(
    path.join(DIR, 'poe1-viscera-trade.json'),
    `${JSON.stringify({ source: `${API}/{items,stats}`, fetchedAt: new Date().toISOString(), refs }, null, 2)}\n`
  );
  console.log(
    `${Object.keys(refs).length}/${snap.viscera.length} linked (${typeOnly} by type only).`
  );
  if (missing.length) console.log(`No trade type for: ${missing.join(', ')}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
