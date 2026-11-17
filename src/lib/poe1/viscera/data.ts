import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type { WickermanSlots } from '@/lib/user/localStore';
import type { TradeRef } from './trade';
import { VISCERA_SLOTS, type VisceraSnapshot } from './types';

/** data/snapshot/poe1-viscera.json, produced by `npm run data:viscera`. */
let cache: VisceraSnapshot | null = null;

const SNAPSHOT_DIR = path.join(process.cwd(), 'data', 'snapshot');

/** Viscera with their trade-site references (`npm run data:viscera-trade`). */
export function getVisceraSnapshot(): VisceraSnapshot {
  if (cache) return cache;
  const snap = JSON.parse(
    fs.readFileSync(path.join(SNAPSHOT_DIR, 'poe1-viscera.json'), 'utf8')
  ) as VisceraSnapshot;
  const trade = JSON.parse(
    fs.readFileSync(path.join(SNAPSHOT_DIR, 'poe1-viscera-trade.json'), 'utf8')
  ) as { refs: Record<string, TradeRef> };
  for (const v of snap.viscera) v.trade = trade.refs[v.id] ?? null;
  cache = snap;
  return cache;
}

/**
 * Parses a `?wm=` share value (ids in slot order). Unknown ids, or ids in the
 * wrong slot, are dropped; returns null when nothing valid remains.
 */
export function parseShareParam(
  raw: string | undefined,
  snapshot: VisceraSnapshot
): WickermanSlots | null {
  if (!raw || raw.length > 400) return null;
  const ids = raw.split(',');
  const out: WickermanSlots = {};
  VISCERA_SLOTS.forEach((slot, i) => {
    const v = snapshot.viscera.find(x => x.id === ids[i]);
    if (v && v.slot === slot) out[slot] = v.id;
  });
  return Object.keys(out).length ? out : null;
}
