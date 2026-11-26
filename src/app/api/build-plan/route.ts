import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseBuildXml } from '@/lib/buildplan/parse';
import { priceBuild } from '@/lib/buildplan/prices';
import { BuildSourceError, loadBuildXml } from '@/lib/buildplan/source';
import type { BuildPlanResponse } from '@/lib/buildplan/types';
import { GAME_IDS, isGameEnabled } from '@/lib/games/config';
import { getSelectedLeague } from '@/lib/games/selection';
import { guardJsonPost } from '@/lib/security/api';

export const dynamic = 'force-dynamic';

/** A raw PoB code for a big build is a few hundred KB; links are tiny. */
const MAX_INPUT = 600_000;

const bodySchema = z.object({
  game: z.enum(GAME_IDS),
  current: z.string().min(1).max(MAX_INPUT),
  target: z.string().min(1).max(MAX_INPUT),
});

/** Loads one build; errors name which side failed. */
async function load(
  input: string,
  side: 'current' | 'target',
  game: 'poe1' | 'poe2'
) {
  try {
    const xml = await loadBuildXml(input);
    const build = parseBuildXml(xml, game);
    if (!build) {
      throw new BuildSourceError('That PoB code has no build in it.');
    }
    return build;
  } catch (err) {
    if (err instanceof BuildSourceError) {
      const label = side === 'current' ? 'Current build' : 'Target build';
      throw new BuildSourceError(`${label}: ${err.message}`);
    }
    throw err;
  }
}

export async function POST(request: Request) {
  const guard = await guardJsonPost(request, {
    name: 'build-plan',
    schema: bodySchema,
    maxBytes: MAX_INPUT * 2 + 1_000,
    perMinute: 10,
  });
  if (!guard.ok) return guard.response;
  const { game, current, target } = guard.body;
  if (!isGameEnabled(game)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const [cur, tgt, league] = await Promise.all([
      load(current, 'current', game),
      load(target, 'target', game),
      getSelectedLeague(game),
    ]);
    const prices = await priceBuild(cur, tgt, league);
    const body: BuildPlanResponse = { current: cur, target: tgt, prices };
    return NextResponse.json(body);
  } catch (err) {
    if (err instanceof BuildSourceError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error('[api/build-plan POST]', err);
    return NextResponse.json(
      { error: 'Could not read those builds. Try again.' },
      { status: 500 }
    );
  }
}
