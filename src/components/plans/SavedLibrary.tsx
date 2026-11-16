'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFavorites, useSavedPlans } from '@/lib/user/useLocalStore';
import { REPRICE_LIMIT, type PlanDrift } from '@/lib/user/repriceRequest';
import { SavedPlansList } from './SavedPlansList';

function Loading() {
  return (
    <p className="text-sm text-forge-muted" aria-busy="true">
      Loading…
    </p>
  );
}

/** Saved plans and favorite bases, read from this browser's storage. */
export function SavedLibrary() {
  const plans = useSavedPlans();
  const favorites = useFavorites();
  const [drift, setDrift] = useState<Record<string, PlanDrift>>({});

  // Re-price the newest plans whenever the set of plans changes.
  // `plans` is memoized on the stored string, so this only changes on writes.
  const recent = useMemo(() => plans?.slice(0, REPRICE_LIMIT), [plans]);
  useEffect(() => {
    if (!recent?.length) return;
    const controller = new AbortController();
    fetch('/api/plans/reprice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plans: recent.map(p => ({ id: p.id, plan: p.plan })),
      }),
      signal: controller.signal,
    })
      .then(res => (res.ok ? res.json() : null))
      .then((data: { drift?: Record<string, PlanDrift> } | null) => {
        if (data?.drift) setDrift(data.drift);
      })
      .catch(() => {
        /* drift is optional */
      });
    return () => controller.abort();
  }, [recent]);

  return (
    <>
      <section aria-labelledby="saved-plans-heading" className="space-y-2">
        <h2 id="saved-plans-heading" className="section-title">
          Saved crafting plans
        </h2>
        {plans === undefined ? (
          <Loading />
        ) : (
          <>
            {plans.length > REPRICE_LIMIT ? (
              <p className="text-xs text-forge-muted">
                Price drift shown for the {REPRICE_LIMIT} most recent plans.
              </p>
            ) : null}
            <SavedPlansList plans={plans} drift={drift} />
          </>
        )}
      </section>

      <section aria-labelledby="favorites-heading" className="space-y-2">
        <h2 id="favorites-heading" className="section-title">
          Favorite bases
        </h2>
        {favorites === undefined ? (
          <Loading />
        ) : favorites.length === 0 ? (
          <EmptyState
            title="No favorite bases yet"
            action={
              <Link href="/items" className="btn btn-primary tap">
                Browse items
              </Link>
            }
          >
            Star a base on the Items &amp; Mods page to keep it here.
          </EmptyState>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map(f => (
              <li key={f.baseId} className="min-w-0">
                <Link
                  href={`/items?base=${encodeURIComponent(f.baseId)}`}
                  className="panel flex min-h-11 min-w-0 items-center justify-between gap-3 px-4 py-3 transition-colors hover:border-forge-gold/50"
                >
                  <span
                    className="min-w-0 truncate font-medium text-rarity-normal"
                    title={f.name}
                  >
                    {f.name}
                  </span>
                  {f.itemClass ? (
                    <span className="shrink-0 text-xs text-forge-muted">
                      {f.itemClass}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
