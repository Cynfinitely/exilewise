'use client';

import { useId } from 'react';
import { Field } from '@/components/ui/Field';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import {
  CRAFTING_LABELS,
  DETAIL_LABELS,
  EXPERIENCE_LABELS,
  GOALS,
  PAIN_POINTS,
  PRIORITY_LABELS,
  RISK_LABELS,
  type Situation,
} from '@/lib/buildplan/situation';

function options<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map(value => ({
    value,
    label: labels[value],
  }));
}

function Checks({
  legend,
  all,
  value,
  onChange,
}: {
  legend: string;
  all: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="label mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {all.map(item => {
          const on = value.includes(item);
          return (
            <label
              key={item}
              className={`tap inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors has-focus-visible:ring-2 has-focus-visible:ring-forge-gold/60 ${
                on
                  ? 'border-forge-gold/60 bg-forge-panel2 text-forge-goldbright'
                  : 'border-forge-border text-forge-muted hover:text-forge-goldbright'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={on}
                onChange={() =>
                  onChange(
                    on ? value.filter(v => v !== item) : [...value, item]
                  )
                }
              />
              <span aria-hidden>{on ? '✓' : '+'}</span>
              {item}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Choice<T extends string>({
  label,
  labels,
  value,
  onChange,
}: {
  label: string;
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="label">{label}</p>
      <SegmentedControl
        label={label}
        value={value}
        onChange={onChange}
        options={options(labels)}
      />
    </div>
  );
}

/** "Your situation" questions; every answer is optional. */
export function SituationForm({
  value,
  onChange,
}: {
  value: Situation;
  onChange: (next: Situation) => void;
}) {
  const budgetId = useId();
  const set = <K extends keyof Situation>(key: K, v: Situation[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex min-w-0 flex-col gap-1">
          <label htmlFor={budgetId} className="label">
            Budget you can spend now
          </label>
          <div className="flex gap-2">
            <input
              id={budgetId}
              className="input"
              inputMode="decimal"
              placeholder="e.g. 25"
              value={value.budget}
              maxLength={12}
              onChange={e => set('budget', e.target.value)}
            />
            <select
              aria-label="Budget currency"
              className="input w-28"
              value={value.budgetCurrency}
              onChange={e =>
                set('budgetCurrency', e.target.value as 'divine' | 'chaos')
              }
            >
              <option value="divine">divine</option>
              <option value="chaos">chaos</option>
            </select>
          </div>
        </div>
        <Field label="Income now" hint="Divines per hour, roughly">
          <input
            className="input"
            inputMode="decimal"
            placeholder="e.g. 2"
            value={value.income}
            maxLength={12}
            onChange={e => set('income', e.target.value)}
          />
        </Field>
        <Field label="Play time per week" hint="Hours">
          <input
            className="input"
            inputMode="numeric"
            placeholder="e.g. 10"
            value={value.hoursPerWeek}
            maxLength={6}
            onChange={e => set('hoursPerWeek', e.target.value)}
          />
        </Field>
        <Field label="Deadline" hint="Optional, e.g. end of league">
          <input
            className="input"
            placeholder="e.g. in 3 weeks"
            value={value.deadline}
            maxLength={60}
            onChange={e => set('deadline', e.target.value)}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-5">
        <Choice
          label="Trading"
          labels={{ trade: 'Trade league', ssf: 'Solo Self-Found' }}
          value={value.mode}
          onChange={v => set('mode', v)}
        />
        <Choice
          label="Mode"
          labels={{ sc: 'Softcore', hc: 'Hardcore' }}
          value={value.hardcore ? 'hc' : 'sc'}
          onChange={v => set('hardcore', v === 'hc')}
        />
        <Choice
          label="Priority"
          labels={PRIORITY_LABELS}
          value={value.priority}
          onChange={v => set('priority', v)}
        />
      </div>

      <Checks
        legend="What do you want the build to do?"
        all={GOALS}
        value={value.goals}
        onChange={v => set('goals', v)}
      />
      <Checks
        legend="What is going wrong right now?"
        all={PAIN_POINTS}
        value={value.painPoints}
        onChange={v => set('painPoints', v)}
      />

      <div className="flex flex-wrap gap-x-8 gap-y-5">
        <Choice
          label="Crafting"
          labels={CRAFTING_LABELS}
          value={value.crafting}
          onChange={v => set('crafting', v)}
        />
        <Choice
          label="Risk"
          labels={RISK_LABELS}
          value={value.risk}
          onChange={v => set('risk', v)}
        />
        <Choice
          label="Your experience"
          labels={EXPERIENCE_LABELS}
          value={value.experience}
          onChange={v => set('experience', v)}
        />
        <Choice
          label="Answer length"
          labels={DETAIL_LABELS}
          value={value.detail}
          onChange={v => set('detail', v)}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_1fr_12rem]">
        <Field label="Items you will keep" hint="Won’t sell or replace these">
          <input
            className="input"
            placeholder="e.g. my Mageblood, 6-link chest"
            value={value.keep}
            maxLength={200}
            onChange={e => set('keep', e.target.value)}
          />
        </Field>
        <Field label="Anything else the AI should know">
          <input
            className="input"
            placeholder="e.g. I hate Delirium, I play on controller"
            value={value.notes}
            maxLength={400}
            onChange={e => set('notes', e.target.value)}
          />
        </Field>
        <Field label="Answer language">
          <input
            className="input"
            value={value.language}
            maxLength={30}
            onChange={e => set('language', e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}
