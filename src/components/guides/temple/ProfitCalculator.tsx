'use client';

import { useId, useState } from 'react';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import {
  computeProfit,
  formatMoney,
  type Money,
  type Unit,
} from '@/lib/poe1/guides/temple/profit';

type MoneyKey =
  | 'mapCost'
  | 'threadCost'
  | 'royalVisage'
  | 'otherCosts'
  | 'templeSale'
  | 'otherLoot';

interface MoneyState {
  amount: string;
  unit: Unit;
}

export interface CalculatorDefaults {
  maps: number;
  threads: number;
  saleDiv: number;
  saleDate: string;
  mapCost: number | null;
  threadCost: number | null;
  royalVisage: number | null;
  otherCosts: number | null;
  minutes: number | null;
  /** Observed range, shown as a hint (e.g. "10–15"). */
  minutesObserved?: string;
  rate: number | null;
}

interface State {
  maps: string;
  threads: string;
  minutes: string;
  rate: string;
  money: Record<MoneyKey, MoneyState>;
}

const str = (n: number | null) => (n === null ? '' : String(n));

function initial(d: CalculatorDefaults): State {
  const c = (n: number | null): MoneyState => ({ amount: str(n), unit: 'c' });
  return {
    maps: String(d.maps),
    threads: String(d.threads),
    minutes: str(d.minutes),
    rate: str(d.rate),
    money: {
      templeSale: { amount: String(d.saleDiv), unit: 'div' },
      otherLoot: { amount: '', unit: 'c' },
      mapCost: c(d.mapCost),
      threadCost: c(d.threadCost),
      royalVisage: c(d.royalVisage),
      otherCosts: c(d.otherCosts),
    },
  };
}

const num = (s: string) => (s.trim() === '' ? Number.NaN : Number(s));
const toMoney = (m: MoneyState): Money => ({
  amount: num(m.amount),
  unit: m.unit,
});

function NumberField({
  label,
  hint,
  value,
  onChange,
  suffix,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={value}
          onChange={e => onChange(e.target.value)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="input num tap"
        />
        {suffix ? (
          <span className="shrink-0 text-xs text-forge-muted">{suffix}</span>
        ) : null}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-2xs text-forge-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function MoneyField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: MoneyState;
  onChange: (v: MoneyState) => void;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={value.amount}
          onChange={e => onChange({ ...value, amount: e.target.value })}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="input num tap min-w-0"
        />
        <select
          aria-label={`${label}: currency`}
          value={value.unit}
          onChange={e => onChange({ ...value, unit: e.target.value as Unit })}
          className="input tap w-auto shrink-0"
        >
          <option value="c">chaos</option>
          <option value="div">div</option>
        </select>
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-2xs text-forge-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Net profit per Temple, per map and per hour. Every input is editable; the
 * featured sale is prefilled and labelled as a dated gross example.
 */
export function ProfitCalculator({
  defaults,
}: {
  defaults: CalculatorDefaults;
}) {
  const [state, setState] = useState<State>(() => initial(defaults));
  const [display, setDisplay] = useState<Unit>('div');

  const r = computeProfit({
    maps: num(state.maps),
    threads: num(state.threads),
    minutes: num(state.minutes),
    chaosPerDivine: num(state.rate),
    mapCost: toMoney(state.money.mapCost),
    threadCost: toMoney(state.money.threadCost),
    royalVisage: toMoney(state.money.royalVisage),
    otherCosts: toMoney(state.money.otherCosts),
    templeSale: toMoney(state.money.templeSale),
    otherLoot: toMoney(state.money.otherLoot),
  });
  const unit: Unit = r.rate === null ? r.base : display;
  const fmt = (v: number) => formatMoney(v, r.base, unit, r.rate) ?? '–';

  const setMoney = (key: MoneyKey) => (v: MoneyState) =>
    setState(s => ({ ...s, money: { ...s.money, [key]: v } }));
  const set = (key: 'maps' | 'threads' | 'minutes' | 'rate') => (v: string) =>
    setState(s => ({ ...s, [key]: v }));

  const results = [
    {
      label: 'Net per Temple',
      value: r.needsRate ? null : fmt(r.net),
      missing: 'Enter the exchange rate',
    },
    {
      label: 'Net per map',
      value: r.needsRate || r.perMap === null ? null : fmt(r.perMap),
      missing: r.needsRate
        ? 'Enter the exchange rate'
        : 'Enter the number of maps',
    },
    {
      label: 'Net per hour',
      value: r.needsRate || r.perHour === null ? null : fmt(r.perHour),
      missing: r.needsRate
        ? 'Enter the exchange rate'
        : 'Enter elapsed time to see net per hour',
    },
  ];

  return (
    <div className="panel space-y-6 p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <fieldset className="space-y-4">
          <legend className="section-title mb-2">Income</legend>
          <MoneyField
            label="Temple sale (gross)"
            hint={`Example: ${defaults.saleDiv} div gross, featured price on ${defaults.saleDate}. Replace with your actual sale.`}
            value={state.money.templeSale}
            onChange={setMoney('templeSale')}
          />
          <MoneyField
            label="Other realised loot"
            hint="Loot you sold or valued from the same maps."
            value={state.money.otherLoot}
            onChange={setMoney('otherLoot')}
          />
          <NumberField
            label="Exchange rate"
            suffix="chaos per divine"
            hint="Today’s rate. Needed when you mix chaos and divines."
            value={state.rate}
            onChange={set('rate')}
          />
          <NumberField
            label="Elapsed time"
            suffix="minutes"
            hint={`Three maps plus itemising and listing.${
              defaults.minutesObserved
                ? ` My loops took ${defaults.minutesObserved} minutes.`
                : ''
            }`}
            value={state.minutes}
            onChange={set('minutes')}
          />
        </fieldset>
        <fieldset className="space-y-4">
          <legend className="section-title mb-2">Costs</legend>
          <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
            <NumberField
              label="Maps"
              value={state.maps}
              onChange={set('maps')}
            />
            <MoneyField
              label="Cost per map"
              value={state.money.mapCost}
              onChange={setMoney('mapCost')}
            />
            <NumberField
              label="Threads (total)"
              hint="8 per map × 3 maps = 24."
              value={state.threads}
              onChange={set('threads')}
            />
            <MoneyField
              label="Cost per Thread"
              value={state.money.threadCost}
              onChange={setMoney('threadCost')}
            />
          </div>
          <MoneyField
            label="Royal Visage"
            hint="Its market price, even if it was your own drop."
            value={state.money.royalVisage}
            onChange={setMoney('royalVisage')}
          />
          <MoneyField
            label="Other consumables"
            value={state.money.otherCosts}
            onChange={setMoney('otherCosts')}
          />
        </fieldset>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-forge-border pt-5">
        <div className="w-full max-w-56">
          {r.rate !== null ? (
            <SegmentedControl
              label="Show results in"
              value={display}
              onChange={setDisplay}
              options={[
                { value: 'div', label: 'Divines' },
                { value: 'c', label: 'Chaos' },
              ]}
            />
          ) : (
            <p className="text-xs text-forge-muted">
              Results in {r.base === 'div' ? 'divines' : 'chaos'}. Enter an
              exchange rate to switch.
            </p>
          )}
        </div>
        <button
          type="button"
          className="btn btn-ghost tap"
          onClick={() => setState(initial(defaults))}
        >
          Reset to example
        </button>
      </div>

      <div aria-live="polite" className="space-y-5">
        {r.needsRate ? (
          <p className="rounded-md border border-warn-border bg-warn-bg px-3 py-2 text-sm text-warn-fg">
            You mixed chaos and divines. Enter the exchange rate to add them up.
          </p>
        ) : null}
        <dl className="grid gap-3 sm:grid-cols-3">
          {results.map(x => (
            <div
              key={x.label}
              className="rounded-xl border border-forge-gold/40 bg-forge-bg/70 p-4"
            >
              <dt className="label">{x.label}</dt>
              <dd
                className={`num mt-1 ${
                  x.value === null
                    ? 'text-sm text-forge-muted'
                    : `font-display text-2xl font-bold ${
                        r.net < 0 ? 'text-danger-fg' : 'text-forge-goldbright'
                      }`
                }`}
              >
                {x.value ?? x.missing}
              </dd>
            </div>
          ))}
        </dl>

        <div className="space-y-2">
          <h3 className="section-title">How it was calculated</h3>
          <table className="w-full text-sm">
            <tbody>
              {r.lines.map(l => (
                <tr key={l.label} className="border-b border-forge-border/50">
                  <th
                    scope="row"
                    className="py-1.5 pr-3 text-left font-normal text-forge-muted"
                  >
                    {l.label}
                  </th>
                  <td
                    className={`num py-1.5 text-right ${l.value < 0 ? 'text-danger-fg' : 'text-forge-goldbright'}`}
                  >
                    {l.value < 0 ? '− ' : l.value > 0 ? '+ ' : ''}
                    {fmt(Math.abs(l.value))}
                  </td>
                </tr>
              ))}
              <tr>
                <th
                  scope="row"
                  className="pt-2 pr-3 text-left font-semibold text-forge-goldbright"
                >
                  Net per Temple
                </th>
                <td className="num pt-2 text-right font-semibold text-forge-goldbright">
                  {r.needsRate ? '–' : fmt(r.net)}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs leading-relaxed text-forge-muted">
            Net = sale + other loot − maps × map cost − Threads × Thread cost −
            Royal Visage − other consumables. Per map = net ÷ maps. Per hour =
            net ÷ minutes × 60.
            {r.rate !== null ? ` 1 div = ${r.rate} chaos.` : ''} Empty fields
            count as 0.
          </p>
        </div>
      </div>
    </div>
  );
}
