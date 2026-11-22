import { Fill } from '@/components/guides/Fill';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import {
  PRICES,
  type PricePoint,
  type PriceKind,
} from '@/lib/poe1/guides/temple/meta';
import {
  ADVERTISE,
  COMPARE,
  INSPECT,
  PRICE_LABELS,
} from '@/lib/poe1/guides/temple/selling';

const KIND: Record<PriceKind, { label: string; tone: BadgeTone }> = {
  asking: { label: 'Asking', tone: 'info' },
  sold: { label: 'Sold', tone: 'success' },
  unsold: { label: 'Unsold', tone: 'warn' },
};

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="panel-inset space-y-2 p-4">
      <h3 className="font-semibold text-forge-goldbright">{title}</h3>
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-forge-muted marker:text-forge-gold">
        {items.map(i => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function PriceRow({ p }: { p: PricePoint }) {
  return (
    <tr className="border-b border-forge-border/60 align-top">
      <td className="num whitespace-nowrap py-3 pr-3 text-forge-muted">
        {p.date}
      </td>
      <td className="py-3 pr-3 text-forge-goldbright">
        {p.layout}
        {p.note ? (
          <span className="mt-1 block text-xs text-forge-muted">{p.note}</span>
        ) : null}
      </td>
      <td className="num py-3 pr-3 font-semibold text-forge-goldbright">
        {p.amountDiv} div{' '}
        <span className="text-xs font-normal text-forge-muted">gross</span>
      </td>
      <td className="py-3">
        <Fill
          field={p.kind}
          render={k => <Badge tone={KIND[k].tone}>{KIND[k].label}</Badge>}
        />
      </td>
    </tr>
  );
}

/** Itemising, pricing and selling, with a dated price log. */
export function Selling() {
  const rows = [PRICES.featured, ...PRICES.log];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <List title="Inspect the finished Temple" items={INSPECT} />
        <List title="What to advertise" items={ADVERTISE} />
        <List title="Compare similar Temples" items={COMPARE} />
      </div>

      <div className="space-y-3">
        <h3 className="display text-xl">Price log</h3>
        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          {(Object.keys(PRICE_LABELS) as PriceKind[]).map(k => (
            <div key={k} className="flex gap-2">
              <dt className="shrink-0">
                <Badge tone={KIND[k].tone}>{KIND[k].label}</Badge>
              </dt>
              <dd className="text-forge-muted">{PRICE_LABELS[k]}</dd>
            </div>
          ))}
        </dl>
        <div className="table-scroll relative">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">
              Dated Temple prices, each marked asking, sold or unsold
            </caption>
            <thead className="text-xs uppercase tracking-wider text-forge-muted">
              <tr className="border-b border-forge-border">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Date
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Layout
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Price
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <PriceRow key={`${p.date}-${p.layout}`} p={p} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-forge-muted">
          Prices are one player’s examples on the dates shown, before input
          costs. The market moves through the league. Check current listings
          before you price yours.
        </p>
      </div>
    </div>
  );
}
