'use client';

import { useMemo, useSyncExternalStore } from 'react';
import {
  browserStorage,
  CHANGE_EVENT,
  FAVORITES_KEY,
  parseFavorites,
  parsePlans,
  parseWickerman,
  PLANS_KEY,
  WICKERMAN_KEY,
  readRaw,
  type FavoriteBase,
  type SavedPlan,
  type WickermanSlots,
} from './localStore';

function subscribe(onChange: () => void): () => void {
  // `storage` covers other tabs; CHANGE_EVENT covers writes in this tab.
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * The raw stored string for `key`. Strings compare by value, so the snapshot
 * is stable between renders. `undefined` means "not read yet" (server render
 * and hydration), letting callers show a loading state instead of "empty".
 */
function useRaw(key: string): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => readRaw(browserStorage(), key),
    () => undefined
  );
}

export function useSavedPlans(): SavedPlan[] | undefined {
  const raw = useRaw(PLANS_KEY);
  return useMemo(
    () => (raw === undefined ? undefined : parsePlans(raw)),
    [raw]
  );
}

export function useFavorites(): FavoriteBase[] | undefined {
  const raw = useRaw(FAVORITES_KEY);
  return useMemo(
    () => (raw === undefined ? undefined : parseFavorites(raw)),
    [raw]
  );
}

export function useWickerman(): WickermanSlots | undefined {
  const raw = useRaw(WICKERMAN_KEY);
  return useMemo(
    () => (raw === undefined ? undefined : parseWickerman(raw)),
    [raw]
  );
}
