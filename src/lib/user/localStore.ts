/**
 * Saved plans and favorite bases, kept in the visitor's browser (localStorage).
 * The site is public, so nothing per-user lives in the shared database.
 *
 * Every function takes the storage to use, so tests can pass an in-memory one.
 * A missing or throwing storage (private mode, blocked site data) reads as
 * empty; writes report failure by returning false.
 */
import { z } from 'zod';
import type { CraftPlan } from '@/lib/craft/types';
import { VISCERA_SLOTS, type VisceraSlot } from '@/lib/poe1/viscera/types';

export const PLANS_KEY = 'exilewise:plans:v1';
export const FAVORITES_KEY = 'exilewise:favorites:v1';

/** Fired on `window` after this tab writes, so hooks re-read the store. */
export const CHANGE_EVENT = 'exilewise:storage';

export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

export interface SavedPlan {
  id: string;
  name: string;
  baseId: string | null;
  createdAt: number;
  plan: CraftPlan;
}

export interface FavoriteBase {
  baseId: string;
  name: string;
  itemClass: string;
  createdAt: number;
}

const savedPlanSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  baseId: z.string().nullable(),
  createdAt: z.number(),
  plan: z.custom<CraftPlan>(
    v =>
      typeof v === 'object' &&
      v !== null &&
      Array.isArray((v as CraftPlan).methods) &&
      Array.isArray((v as CraftPlan).desiredPrefixes) &&
      Array.isArray((v as CraftPlan).desiredSuffixes)
  ),
});

const favoriteSchema = z.object({
  baseId: z.string().min(1),
  name: z.string(),
  itemClass: z.string(),
  createdAt: z.number(),
});

/** `window.localStorage`, or null when unavailable (SSR, blocked storage). */
export function browserStorage(): KeyValueStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readRaw(
  storage: KeyValueStorage | null,
  key: string
): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** Parses a stored list, dropping entries that don't match the schema. */
function parseList<T>(raw: string | null, schema: z.ZodType<T>): T[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data.flatMap(entry => {
    const parsed = schema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
}

function write(
  storage: KeyValueStorage | null,
  key: string,
  value: unknown
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    return false;
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
  return true;
}

/* ------------------------------- plans -------------------------------- */

export function parsePlans(raw: string | null): SavedPlan[] {
  return parseList(raw, savedPlanSchema).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export function readPlans(storage: KeyValueStorage | null): SavedPlan[] {
  return parsePlans(readRaw(storage, PLANS_KEY));
}

/** Saves a plan and returns it, or null when the browser refused the write. */
export function savePlan(
  storage: KeyValueStorage | null,
  name: string,
  plan: CraftPlan,
  now: number = Date.now()
): SavedPlan | null {
  const entry: SavedPlan = {
    id: crypto.randomUUID(),
    name,
    baseId: plan.baseId || null,
    createdAt: now,
    plan,
  };
  const ok = write(storage, PLANS_KEY, [entry, ...readPlans(storage)]);
  return ok ? entry : null;
}

export function deletePlan(
  storage: KeyValueStorage | null,
  id: string
): boolean {
  return write(
    storage,
    PLANS_KEY,
    readPlans(storage).filter(p => p.id !== id)
  );
}

/* ----------------------------- favorites ------------------------------ */

export function parseFavorites(raw: string | null): FavoriteBase[] {
  return parseList(raw, favoriteSchema).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export function readFavorites(storage: KeyValueStorage | null): FavoriteBase[] {
  return parseFavorites(readRaw(storage, FAVORITES_KEY));
}

/**
 * Adds or removes a favorite. Returns the new state, or null when the write
 * failed (the stored state is then unchanged).
 */
export function toggleFavorite(
  storage: KeyValueStorage | null,
  base: Omit<FavoriteBase, 'createdAt'>,
  now: number = Date.now()
): boolean | null {
  const current = readFavorites(storage);
  const exists = current.some(f => f.baseId === base.baseId);
  const next = exists
    ? current.filter(f => f.baseId !== base.baseId)
    : [{ ...base, createdAt: now }, ...current];
  return write(storage, FAVORITES_KEY, next) ? !exists : null;
}

/* ------------------------- PoE 1 Wickerman ---------------------------- */

export const WICKERMAN_KEY = 'exilewise:poe1:wickerman:v1';

/** Viscera id per Wickerman slot. */
export type WickermanSlots = Partial<Record<VisceraSlot, string>>;

const visceraId = z.string().regex(/^[a-z0-9-]{1,80}$/);

/** Keeps each valid slot on its own: one bad entry doesn't drop the rest. */
export function parseWickerman(raw: string | null): WickermanSlots {
  if (!raw) return {};
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof data !== 'object' || data === null) return {};
  const out: WickermanSlots = {};
  for (const slot of VISCERA_SLOTS) {
    const id = visceraId.safeParse((data as Record<string, unknown>)[slot]);
    if (id.success) out[slot] = id.data;
  }
  return out;
}

export function saveWickerman(
  storage: KeyValueStorage | null,
  slots: WickermanSlots
): boolean {
  return write(storage, WICKERMAN_KEY, slots);
}
