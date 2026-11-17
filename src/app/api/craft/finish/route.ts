import { NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveItem } from '@/lib/import/resolveItem';
import { parseGoalList, solve } from '@/lib/craft';
import { guardJsonPost } from '@/lib/security/api';
import { getSelectedLeague } from '@/lib/games/selection';

export const dynamic = 'force-dynamic';

const shortText = z.string().min(1).max(200);

const bodySchema = z
  .object({
    /** Pasted in-game item text — the item's current mods are inferred. */
    text: z.string().max(20_000).optional(),
    /** Explicit input instead of text. */
    baseId: shortText.optional(),
    itemLevel: z.number().int().min(1).max(100).optional(),
    current: z
      .array(
        z.object({
          group: shortText,
          side: z.enum(['prefix', 'suffix']),
          level: z.number().int().min(0).max(100),
          fractured: z.boolean().optional(),
          desecrated: z.boolean().optional(),
        })
      )
      .max(12)
      .optional(),
    /** Desired FINAL mod set (goal entries: "Group", "Group@<minLevel>", "~d", "~o"). */
    desiredGroups: z.array(shortText).min(1).max(12),
    /** Cost of another copy of the item (restart cost), in Exalted. */
    baseCostExalted: z.number().min(0).max(1_000_000_000).optional(),
  })
  .strict();

export async function POST(request: Request) {
  const guard = await guardJsonPost(request, {
    name: 'craft-finish',
    schema: bodySchema,
    maxBytes: 32_000,
    perMinute: 20,
  });
  if (!guard.ok) return guard.response;
  const body = guard.body;

  try {
    const goal = parseGoalList(body.desiredGroups.join(','));
    if (goal.length === 0) {
      return NextResponse.json(
        { error: 'desiredGroups is required (the FINAL mod set to reach).' },
        { status: 400 }
      );
    }

    let baseId = body.baseId ?? null;
    let itemLevel = body.itemLevel ?? 82;
    let current = body.current ?? [];
    let resolved = null;

    if (body.text?.trim()) {
      resolved = await resolveItem(body.text.trim());
      if (!resolved.baseId) {
        return NextResponse.json(
          {
            error: resolved.warnings[0] ?? 'Could not resolve the pasted item.',
          },
          { status: 422 }
        );
      }
      baseId = resolved.baseId;
      itemLevel = resolved.itemLevel;
      current = resolved.matched.map(m => ({
        group: m.group,
        side: m.kind,
        level: m.tierLevel,
        desecrated: m.desecrated || undefined,
      }));
    }

    if (!baseId) {
      return NextResponse.json(
        { error: 'Provide either pasted item `text` or `baseId` + `current`.' },
        { status: 400 }
      );
    }

    const plan = await solve({
      baseId,
      itemLevel,
      goal,
      current,
      baseCost: body.baseCostExalted,
      league: await getSelectedLeague('poe2'),
    });
    if (!plan) {
      return NextResponse.json(
        { error: 'Unknown base item.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ plan, resolved });
  } catch (err) {
    // Log the detail server-side; clients get a fixed message.
    console.error('[api/craft/finish POST]', err);
    return NextResponse.json(
      { error: 'Failed to plan finish' },
      { status: 500 }
    );
  }
}
