import { NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveItem } from '@/lib/import/resolveItem';
import { importPobText } from '@/lib/import/pob';
import { decodePobCode } from '@/lib/import/pobParse';
import { parseGoalList, solve } from '@/lib/craft';
import { guardJsonPost } from '@/lib/security/api';
import { getSelectedLeague } from '@/lib/games/selection';

export const dynamic = 'force-dynamic';

/** PoB codes for big builds run to a few hundred KB of base64. */
const MAX_TEXT = 400_000;
/** Plain item text (one item) is a few KB at most. */
const MAX_ITEM_TEXT = 20_000;

const bodySchema = z.object({
  text: z.string().max(MAX_TEXT),
  /** Parse + resolve only — skip the crafting plan. */
  parseOnly: z.boolean().optional(),
});

export async function POST(request: Request) {
  const guard = await guardJsonPost(request, {
    name: 'import',
    schema: bodySchema,
    maxBytes: MAX_TEXT + 1_000,
    perMinute: 20,
  });
  if (!guard.ok) return guard.response;

  try {
    const text = guard.body.text.trim();
    if (!text) {
      return NextResponse.json(
        { error: 'No item text provided.' },
        { status: 400 }
      );
    }

    if (decodePobCode(text)) {
      const pob = await importPobText(text);
      return NextResponse.json({ pob });
    }

    if (text.length > MAX_ITEM_TEXT) {
      return NextResponse.json(
        { error: 'That item text is too long. Paste a single item.' },
        { status: 413 }
      );
    }

    const resolved = await resolveItem(text);
    const league = await getSelectedLeague('poe2');
    const plan =
      !guard.body.parseOnly && resolved.baseId && resolved.desiredGroups.length
        ? await solve({
            baseId: resolved.baseId,
            itemLevel: resolved.itemLevel,
            goal: parseGoalList(resolved.desiredGroups.join(',')),
            league,
          })
        : null;

    return NextResponse.json({ resolved, plan });
  } catch (err) {
    // Log the detail server-side; clients get a fixed message.
    console.error('[api/import POST]', err);
    return NextResponse.json(
      { error: 'Failed to parse item' },
      { status: 500 }
    );
  }
}
