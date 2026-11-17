'use client';

import type { VisceraFamily, VisceraView } from '@/lib/poe1/viscera/browse';
import { tagLabel } from '@/lib/poe1/viscera/tags';
import { slugify } from '@/lib/poe1/viscera/wikiParse';
import {
  SlotIcon,
  SourceLine,
  StatLine,
  TierBadge,
  VisceraIcon,
} from './parts';
import { BuyLink } from './BuyLink';
import type { Equipped } from './WickermanPanel';

/** Equip button: shows what it would replace in the slot. */
export function EquipButton({
  v,
  equipped,
  onEquip,
  compact = false,
}: {
  v: VisceraView;
  equipped: Equipped;
  onEquip: (v: VisceraView) => void;
  compact?: boolean;
}) {
  const current = equipped[v.slot];
  const on = current?.id === v.id;
  const label = on ? 'Equipped' : current ? 'Swap in' : 'Equip';
  return (
    <button
      type="button"
      onClick={() => onEquip(v)}
      aria-pressed={on}
      title={
        on
          ? `Remove from ${v.slot}`
          : current
            ? `Replaces ${current.name}`
            : `Put on ${v.slot}`
      }
      className={`btn btn-sm tap shrink-0 rounded-full ${
        on ? 'border-forge-gold/70 bg-forge-gold/15 text-forge-rust-strong' : ''
      }`}
    >
      {on ? '✓ ' : ''}
      {compact && !on ? (current ? 'Swap' : 'Equip') : label}
    </button>
  );
}

function MemberRow({
  v,
  equipped,
  onEquip,
}: {
  v: VisceraView;
  equipped: Equipped;
  onEquip: (v: VisceraView) => void;
}) {
  const on = equipped[v.slot]?.id === v.id;
  return (
    <li
      className={`space-y-1.5 rounded-xl border p-3 transition-colors ${
        on
          ? 'border-forge-gold/50 bg-forge-gold/5'
          : 'border-forge-border/50 bg-forge-bg/30'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <TierBadge tier={v.tier} />
        <h4 className="text-sm font-semibold text-forge-goldbright">
          {v.name}
        </h4>
        {v.levelReq > 1 ? (
          <span className="text-2xs text-forge-muted">Lv {v.levelReq}</span>
        ) : null}
        <span className="ml-auto flex items-center gap-1.5">
          <BuyLink v={v} />
          <EquipButton v={v} equipped={equipped} onEquip={onEquip} />
        </span>
      </div>
      <ul className="space-y-0.5 text-sm leading-relaxed">
        {v.effects.map(e => (
          <li key={e}>
            <StatLine text={e} />
          </li>
        ))}
      </ul>
      {v.flavour ? (
        <p className="font-display text-xs italic leading-relaxed text-rarity-unique/90">
          {v.flavour}
        </p>
      ) : null}
      <ul className="space-y-0.5 border-t border-forge-border/40 pt-1.5">
        {v.sources.map(s => (
          <SourceLine key={`${s.boss}|${s.where}`} source={s} />
        ))}
      </ul>
    </li>
  );
}

export function FamilyCard({
  family,
  equipped,
  onEquip,
}: {
  family: VisceraFamily;
  equipped: Equipped;
  onEquip: (v: VisceraView) => void;
}) {
  const tags = [...new Set(family.members.flatMap(m => m.tags))].slice(0, 5);
  return (
    <article
      id={slugify(family.family)}
      className="panel group/card scroll-mt-24 flex flex-col gap-3 p-4 transition-colors hover:border-forge-gold/40"
    >
      <header className="flex items-start gap-3.5">
        <VisceraIcon icon={family.icon} slot={family.slot} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-[0.16em] text-forge-muted">
            <SlotIcon slot={family.slot} className="h-3 w-3" />
            {family.slot}
            {family.firstAct ? (
              <span className="text-forge-rust-strong">
                · Act {family.firstAct}
              </span>
            ) : null}
          </p>
          <h3 className="display mt-0.5 text-lg leading-tight">
            {family.family}
          </h3>
          {tags.length ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {tags.map(t => (
                <span key={t} className="tag-chip text-2xs">
                  {tagLabel(t)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </header>
      <ul className="space-y-2">
        {family.members.map(v => (
          <MemberRow key={v.id} v={v} equipped={equipped} onEquip={onEquip} />
        ))}
      </ul>
    </article>
  );
}
