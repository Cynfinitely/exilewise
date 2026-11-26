'use client';

import { useMemo, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Field } from '@/components/ui/Field';
import { compareBuilds } from '@/lib/buildplan/gap';
import { buildPrompt } from '@/lib/buildplan/prompt';
import { defaultSituation, type Situation } from '@/lib/buildplan/situation';
import type { BuildPlanResponse } from '@/lib/buildplan/types';
import type { GameId } from '@/lib/games/config';
import { GapReport } from './GapReport';
import { PromptPanel } from './PromptPanel';
import { SituationForm } from './SituationForm';

const MAX_INPUT = 600_000;

function Step({
  n,
  title,
  intro,
  children,
}: {
  n: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  const id = `step-${n}`;
  return (
    <section aria-labelledby={id} className="panel space-y-6 p-5 sm:p-7">
      <header className="flex items-baseline gap-4">
        <span aria-hidden className="display text-2xl text-forge-gold/70">
          {n}
        </span>
        <div>
          <h2 id={id} className="display text-xl sm:text-2xl">
            {title}
          </h2>
          {intro ? (
            <p className="mt-1 text-sm text-forge-muted">{intro}</p>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}

/** Current build → target build → situation → AI prompt. */
export function BuildPlanner({
  game,
  league,
}: {
  game: GameId;
  league: string;
}) {
  const [current, setCurrent] = useState('');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BuildPlanResponse | null>(null);
  const [loaded, setLoaded] = useState({ current: '', target: '' });
  const [situation, setSituation] = useState<Situation>(() =>
    defaultSituation(league)
  );

  const gap = useMemo(
    () => (result ? compareBuilds(result.current, result.target) : null),
    [result]
  );
  const prompt = useMemo(
    () =>
      result && gap ? buildPrompt({ ...result, gap, situation, league }) : '',
    [result, gap, situation, league]
  );
  const stale =
    !!result && (loaded.current !== current || loaded.target !== target);

  const read = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current.trim() || !target.trim()) {
      setError('Paste both builds: the one you have and the one you want.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/build-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game, current, target }),
      });
      const data = (await res.json().catch(() => null)) as
        (BuildPlanResponse & { error?: undefined }) | { error: string } | null;
      if (!res.ok || !data || 'error' in data) {
        setError(
          (data && 'error' in data && data.error) ||
            'Something went wrong. Try again.'
        );
        return;
      }
      setResult(data);
      setLoaded({ current, target });
    } catch {
      setError('Could not reach Exilewise. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Step
        n="I"
        title="Your two builds"
        intro="Paste a pobb.in, pastebin or poe.ninja link, or the Path of Building code itself."
      >
        <form onSubmit={read} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Where you are now"
              hint="In PoB: Import/Export → Generate. Import your character first."
            >
              <textarea
                className="input font-mono text-xs"
                rows={3}
                maxLength={MAX_INPUT}
                placeholder="https://pobb.in/… or PoB code"
                value={current}
                onChange={e => setCurrent(e.target.value)}
                spellCheck={false}
              />
            </Field>
            <Field
              label="Where you want to be"
              hint="A guide’s PoB, a poe.ninja character or your own plan."
            >
              <textarea
                className="input font-mono text-xs"
                rows={3}
                maxLength={MAX_INPUT}
                placeholder="https://pobb.in/… or PoB code"
                value={target}
                onChange={e => setTarget(e.target.value)}
                spellCheck={false}
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary h-11 rounded-full px-6 font-display text-xs font-bold uppercase tracking-[0.16em]"
            >
              {loading
                ? 'Reading builds…'
                : result
                  ? 'Read again'
                  : 'Compare builds'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setCurrent(target);
                setTarget(current);
              }}
            >
              Swap
            </button>
            {stale ? (
              <span className="text-sm text-warn-fg">
                Builds changed: compare again to update.
              </span>
            ) : null}
          </div>
          {error ? (
            <Alert tone="danger" title="Couldn’t read the builds">
              {error}
            </Alert>
          ) : null}
        </form>
      </Step>

      {result && gap ? (
        <Step
          n="II"
          title="What changes"
          intro="Everything that differs between the two builds, with live prices."
        >
          <GapReport {...result} gap={gap} />
        </Step>
      ) : null}

      <Step
        n={result ? 'III' : 'II'}
        title="Your situation"
        intro="All optional. The more you fill in, the better the plan fits you."
      >
        <SituationForm value={situation} onChange={setSituation} />
      </Step>

      <Step
        n={result ? 'IV' : 'III'}
        title="Your AI prompt"
        intro="Paste it into any AI chat to get a step-by-step plan."
      >
        {prompt ? (
          <PromptPanel prompt={prompt} />
        ) : (
          <p className="text-sm text-forge-muted">
            Compare your builds first. The prompt appears here and updates as
            you change your answers.
          </p>
        )}
      </Step>
    </div>
  );
}
