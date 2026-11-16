import { NextResponse } from 'next/server';
import { repricePlan } from '@/lib/craft';
import {
  repriceSchema,
  type PlanDrift,
  type RepriceRequest,
} from '@/lib/user/repriceRequest';

export const dynamic = 'force-dynamic';

const REPRICE_CONCURRENCY = 4;

/** Run `fn` over `items` with at most `limit` calls in flight. */
async function forEachLimited<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const item = items[next++];
      await fn(item);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker)
  );
}

/**
 * Re-prices each plan's cheapest method at today's currency prices from its
 * stored shopping list (no re-simulation), so the Saved page can show drift.
 */
export async function POST(request: Request) {
  let body: RepriceRequest;
  try {
    body = repriceSchema.parse(await request.json());
  } catch (err) {
    console.error('[api/plans/reprice POST]', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const drift: Record<string, PlanDrift> = {};
  await forEachLimited(
    body.plans,
    REPRICE_CONCURRENCY,
    async ({ id, plan }) => {
      const savedCheapest = plan.methods[0];
      if (savedCheapest?.estCostExalted == null) return;
      try {
        const now = (await repricePlan(plan)).get(savedCheapest.id);
        if (now != null) {
          drift[id] = {
            savedCostExalted: savedCheapest.estCostExalted,
            nowCostExalted: now,
            divinePriceExalted: plan.divinePriceExalted ?? 0,
          };
        }
      } catch {
        /* drift is optional */
      }
    }
  );
  return NextResponse.json({ drift });
}
