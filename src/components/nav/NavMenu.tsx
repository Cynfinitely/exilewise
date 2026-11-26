'use client';

import Link from 'next/link';
import { useId } from 'react';
import { Chevron } from '@/components/nav/GameLeagueControls';
import { NavIcon, type NavIconName } from '@/components/ui/NavIcons';
import { usePopover } from '@/components/ui/usePopover';
import type { GameNavItem } from '@/lib/games/config';

/** The link in `links` that best matches the path (longest prefix wins). */
export function activeHref(
  pathname: string,
  links: readonly GameNavItem[]
): string | undefined {
  return links
    .filter(l => pathname === l.href || pathname.startsWith(`${l.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

/** Icon, label and description row used in the drawer and the dropdowns. */
export function MenuLink({
  item,
  active,
  onNavigate,
}: {
  item: GameNavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2 transition-colors ${
        active
          ? 'border-forge-gold/40 bg-forge-panel2'
          : 'border-transparent hover:bg-forge-panel2/70'
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-forge-border bg-forge-bg/60 text-forge-rust-strong">
        <NavIcon name={item.icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-base tracking-wide text-forge-goldbright">
          {item.label}
        </span>
        <span className="block truncate text-xs text-forge-muted">
          {item.description}
        </span>
      </span>
    </Link>
  );
}

/** Top-bar dropdown for a menu group (e.g. PoE 1 "Guides"). */
export function NavMenu({
  label,
  icon = 'guides',
  links,
  pathname,
}: {
  label: string;
  icon?: NavIconName;
  links: readonly GameNavItem[];
  pathname: string;
}) {
  const { open, setOpen, rootRef, triggerRef } = usePopover();
  const menuId = useId();
  const current = activeHref(pathname, links);
  const active = current !== undefined;
  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(o => !o)}
        className={`group relative inline-flex h-10 items-center gap-2 px-3 text-sm tracking-wide transition-colors ${
          active || open
            ? 'text-forge-goldbright'
            : 'text-forge-muted hover:text-forge-goldbright'
        }`}
      >
        <NavIcon
          name={icon}
          className={`h-4 w-4 ${active ? 'text-forge-rust-strong' : ''}`}
        />
        {label}
        <Chevron
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
        <span
          aria-hidden
          className={`absolute inset-x-3 -bottom-3.25 h-px origin-center bg-linear-to-r from-transparent via-forge-gold to-transparent transition-transform duration-300 ${
            active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-75'
          }`}
        />
      </button>
      {open ? (
        <ul
          id={menuId}
          aria-label={label}
          className="panel absolute left-0 top-full z-60 mt-3 w-88 space-y-1 bg-forge-panel p-1.5 shadow-lg"
        >
          {links.map(link => (
            <li key={link.href}>
              <MenuLink
                item={link}
                active={link.href === current}
                onNavigate={close}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
