'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { BrandMark } from '@/components/brand/BrandMark';
import { GamePicker, LeagueSelect } from '@/components/nav/GameLeagueControls';
import {
  activeHref,
  MenuLink as DrawerLink,
  NavMenu,
} from '@/components/nav/NavMenu';
import { NavIcon } from '@/components/ui/NavIcons';
import { Sheet } from '@/components/ui/Sheet';
import {
  GAMES,
  gameFromPath,
  navGroupsFor,
  type GameId,
  type GameNavItem as NavItem,
  type LeagueOption,
} from '@/lib/games/config';

export interface SiteNavProps {
  rememberedGame: GameId;
  leagues: Partial<
    Record<GameId, { options: LeagueOption[]; selected: string }>
  >;
}

/** Call-to-action button, shown only on the pages under `path`. */
const CTAS = [
  {
    path: '/poe1/viscera',
    href: '/poe1/viscera#wickerman',
    label: 'Build a Wickerman',
  },
] as const;

/** Site-wide link to the YouTube channel page, outside the game menus. */
const VIDEOS: NavItem = {
  href: '/videos',
  label: 'Videos',
  description: 'Latest uploads from the YouTube channel',
  icon: 'videos',
};

function isActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href));
}

function DesktopLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={`group relative inline-flex h-10 items-center gap-2 px-3 text-sm tracking-wide transition-colors ${
        active
          ? 'text-forge-goldbright'
          : 'text-forge-muted hover:text-forge-goldbright'
      }`}
    >
      <NavIcon
        name={item.icon}
        className={`h-4 w-4 ${active ? 'text-forge-rust-strong' : ''}`}
      />
      {item.label}
      <span
        aria-hidden
        className={`absolute inset-x-3 -bottom-[13px] h-px origin-center bg-linear-to-r from-transparent via-forge-gold to-transparent transition-transform duration-300 ${
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-75'
        }`}
      />
    </Link>
  );
}

export function SiteNav({ rememberedGame, leagues }: SiteNavProps) {
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
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mq.matches && setDrawerOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [drawerOpen]);

  const game = gameFromPath(pathname) ?? rememberedGame;
  const { options = [], selected = '' } = leagues[game] ?? {};
  const groups = navGroupsFor(game, selected);
  const cta = CTAS.find(c => isActive(pathname, c.path));
  const homeActive = pathname === '/';

  const overview: NavItem = {
    href: GAMES[game].home,
    label: 'Overview',
    description: `All ${GAMES[game].name} tools`,
    icon: 'home',
  };

  const controls = (wide: boolean) => (
    <>
      <GamePicker game={game} wide={wide} />
      <LeagueSelect
        key={game}
        game={game}
        options={options}
        selected={selected}
        className={wide ? 'w-full' : 'w-40 xl:w-44'}
      />
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-forge-border/60 bg-forge-bg/75 backdrop-blur-xl">
      <a
        href="#main"
        className="btn sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-60"
      >
        Skip to content
      </a>
      <nav
        aria-label="Main"
        className="container-shell flex h-(--nav-height) items-center gap-4"
      >
        <Link
          href="/"
          aria-current={homeActive ? 'page' : undefined}
          aria-label="Exilewise — home"
          className="tap flex shrink-0 items-center gap-2.5"
        >
          <BrandMark className="h-9 w-9 drop-shadow-[0_0_12px_rgb(240_138_60/0.35)]" />
          <span className="display text-lg tracking-[0.14em]">
            EXILE<span className="text-forge-gold">WISE</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          {controls(false)}
        </div>

        <div className="hidden min-w-0 flex-1 items-center lg:flex">
          <span aria-hidden className="mx-2 h-5 w-px bg-forge-border" />
          {groups.length === 0 ? (
            <DesktopLink item={overview} active={pathname === overview.href} />
          ) : null}
          {groups.map(group => (
            <div
              key={group.label}
              role="group"
              aria-label={`${GAMES[game].short} ${group.label}`}
              className="flex items-center"
            >
              {group.menu ? (
                <NavMenu
                  label={group.label}
                  icon={group.icon}
                  links={group.links}
                  pathname={pathname}
                />
              ) : (
                group.links.map(link => (
                  <DesktopLink
                    key={link.href}
                    item={link}
                    active={isActive(pathname, link.href)}
                  />
                ))
              )}
            </div>
          ))}
          <span aria-hidden className="mx-2 h-5 w-px bg-forge-border" />
          <DesktopLink item={VIDEOS} active={isActive(pathname, VIDEOS.href)} />
        </div>

        {cta ? (
          <Link
            href={cta.href}
            className="btn btn-primary ml-auto hidden h-10 shrink-0 rounded-full px-5 font-display text-xs font-bold uppercase tracking-[0.16em] xl:inline-flex"
          >
            {cta.label}
          </Link>
        ) : null}

        <button
          type="button"
          className="btn tap ml-auto rounded-full lg:hidden"
          aria-expanded={drawerOpen}
          aria-haspopup="dialog"
          onClick={() => setDrawerOpen(true)}
        >
          <span aria-hidden className="flex flex-col gap-0.75">
            <span className="block h-px w-4 bg-current" />
            <span className="block h-px w-4 bg-current" />
            <span className="block h-px w-4 bg-current" />
          </span>
          Menu
        </button>
      </nav>
      {/* Gilded hairline under the bar. */}
      <div
        aria-hidden
        className="h-px bg-linear-to-r from-transparent via-forge-gold/40 to-transparent"
      />

      <Sheet open={drawerOpen} onClose={closeDrawer} title="Menu" side="right">
        <nav aria-label="Main (mobile)" className="space-y-5 p-4">
          <div className="space-y-2 sm:hidden">
            <p className="section-title">Game &amp; league</p>
            <div className="flex flex-col gap-2">{controls(true)}</div>
          </div>
          <DrawerLink
            item={overview}
            active={pathname === overview.href}
            onNavigate={closeDrawer}
          />
          {groups.map(group => (
            <div key={group.label}>
              <p className="section-title mb-2 px-1">{group.label}</p>
              <div className="flex flex-col gap-1">
                {group.links.map(link => (
                  <DrawerLink
                    key={link.href}
                    item={link}
                    active={link.href === activeHref(pathname, group.links)}
                    onNavigate={closeDrawer}
                  />
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className="section-title mb-2 px-1">Channel</p>
            <DrawerLink
              item={VIDEOS}
              active={isActive(pathname, VIDEOS.href)}
              onNavigate={closeDrawer}
            />
          </div>
        </nav>
      </Sheet>
    </header>
  );
}
