import { z } from 'zod';
import type { CraftPlan } from '@/lib/craft/types';

/** Plans re-priced per request; the client sends its newest ones. */
export const REPRICE_LIMIT = 20;

const planSchema = z.custom<CraftPlan>(
  v =>
    typeof v === 'object' &&
    v !== null &&
    Array.isArray((v as CraftPlan).methods)
);

/** Body of `POST /api/plans/reprice`. */
export const repriceSchema = z.object({
  plans: z
    .array(z.object({ id: z.string().min(1).max(64), plan: planSchema }))
    .max(REPRICE_LIMIT),
});

/** A saved plan's cheapest-method cost then vs at today's prices. */
export interface PlanDrift {
  savedCostExalted: number;
  nowCostExalted: number;
  divinePriceExalted: number;
}

export type RepriceRequest = z.infer<typeof repriceSchema>;
