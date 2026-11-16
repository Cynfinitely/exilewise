'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { NavIcon, type NavIconName } from '@/components/ui/NavIcons';
import { Sheet } from '@/components/ui/Sheet';

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: NavIconName;
};

const NAV_GROUPS: { label: string; links: NavItem[] }[] = [
  {
    label: 'Browse',
    links: [
      {
        href: '/items',
        label: 'Items & Mods',
        description: 'Bases and every mod that can roll',
        icon: 'items',
      },
      {
        href: '/materials',
        label: 'Materials',
        description: 'Currencies, essences, omens, prices',
        icon: 'materials',
      },
    ],
  },
  {
    label: 'Plan',
    links: [
      {
        href: '/craft',
        label: 'Planner',
        description: 'Find the cheapest way to craft an item',
        icon: 'craft',
      },
      {
        href: '/plans',
        label: 'Saved Plans',
        description: 'Reopen plans with today’s prices',
        icon: 'plans',
      },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href));
}

function DesktopLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={`relative inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm transition-colors ${
        active
          ? 'bg-forge-panel2 font-semibold text-forge-gold ring-1 ring-forge-rust/40'
          : 'text-forge-muted hover:bg-forge-panel2/70 hover:text-forge-goldbright'
      }`}
    >
      <NavIcon name={item.icon} />
      {item.label}
      {active ? (
        <span
          aria-hidden
          className="absolute -bottom-[7px] left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-forge-mint"
        />
      ) : null}
    </Link>
  );
}

function DrawerLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
        active
          ? 'bg-forge-panel2 ring-1 ring-forge-rust/40'
          : 'hover:bg-forge-panel2/70'
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          active
            ? 'bg-forge-gold text-white'
            : 'bg-forge-panel2 text-forge-gold'
        }`}
      >
        <NavIcon name={item.icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span
          className={`block text-base ${
            active
              ? 'font-semibold text-forge-gold'
              : 'font-medium text-forge-goldbright'
          }`}
        >
          {item.label}
        </span>
        <span className="block truncate text-xs text-forge-muted">
          {item.description}
        </span>
      </span>
    </Link>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Close the drawer on navigation (state adjusted during render, not in an effect).
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    setDrawerOpen(false);
  }

  useEffect(() => {
    if (!drawerOpen) return;
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => mq.matches && setDrawerOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [drawerOpen]);

  const homeActive = pathname === '/';

  return (
    <header className="sticky top-0 z-50 border-b border-forge-border/80 bg-white/80 backdrop-blur-md">
      <a
        href="#main"
        className="btn sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60]"
      >
        Skip to content
      </a>
      <nav
        aria-label="Main"
        className="container-shell flex items-center gap-3 py-3"
      >
        <Link
          href="/"
          aria-current={homeActive ? 'page' : undefined}
          className="mr-1 flex h-9 shrink-0 items-center gap-2 rounded-full pr-2 text-forge-goldbright"
          aria-label="Exilewise — home"
        >
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-forge-rust to-forge-mint text-xs font-bold text-forge-goldbright"
          >
            Ew
          </span>
          <span className="text-base font-bold tracking-tight">
            Exile<span className="font-medium text-forge-muted">wise</span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-1 md:flex">
          {NAV_GROUPS.map((group, i) => (
            <div
              key={group.label}
              role="group"
              aria-label={group.label}
              className="flex items-center gap-1"
            >
              {i > 0 ? (
                <span aria-hidden className="mx-2 h-5 w-px bg-forge-border" />
              ) : null}
              {group.links.map(link => (
                <DesktopLink
                  key={link.href}
                  item={link}
                  active={isActive(pathname, link.href)}
                />
              ))}
            </div>
          ))}
        </div>

        <Link
          href="/craft"
          className="btn btn-primary hidden h-9 rounded-full px-4 lg:inline-flex"
        >
          Plan a craft
        </Link>

        <button
          type="button"
          className="btn tap ml-auto rounded-full md:hidden"
          aria-expanded={drawerOpen}
          aria-haspopup="dialog"
          onClick={() => setDrawerOpen(true)}
        >
          <span aria-hidden className="flex flex-col gap-[3px]">
            <span className="block h-0.5 w-4 rounded-sm bg-current" />
            <span className="block h-0.5 w-4 rounded-sm bg-current" />
            <span className="block h-0.5 w-4 rounded-sm bg-current" />
          </span>
          Menu
        </button>
      </nav>

      <Sheet open={drawerOpen} onClose={closeDrawer} title="Menu" side="right">
        <nav aria-label="Main (mobile)" className="space-y-4 p-3">
          <DrawerLink
            item={{
              href: '/',
              label: 'Home',
              description: 'Overview of every tool',
              icon: 'home',
            }}
            active={homeActive}
            onNavigate={closeDrawer}
          />
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="mb-1 px-3 text-2xs font-semibold uppercase tracking-wide text-forge-muted">
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.links.map(link => (
                  <DrawerLink
                    key={link.href}
                    item={link}
                    active={isActive(pathname, link.href)}
                    onNavigate={closeDrawer}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </Sheet>
    </header>
  );
}
