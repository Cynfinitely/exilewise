import { BrandMark } from '@/components/brand/BrandMark';
import { isGameEnabled } from '@/lib/games/config';
import { CHANNEL } from '@/lib/youtube/channel';

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      className="text-forge-goldbright/90 underline-offset-4 hover:text-forge-rust-strong hover:underline"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-forge-border/60 bg-forge-bg/60 backdrop-blur-sm">
      <div className="container-shell flex flex-col gap-6 py-10 text-xs leading-relaxed text-forge-muted sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <BrandMark className="h-8 w-8 opacity-80" />
            <span className="display text-sm tracking-[0.16em]">
              EXILE<span className="text-forge-gold">WISE</span>
            </span>
          </div>
          <p>
            Made by {CHANNEL.name}.{' '}
            <Ext href={CHANNEL.url}>Watch on YouTube {CHANNEL.handle}</Ext>
          </p>
        </div>
        <div className="max-w-xl space-y-1.5 sm:text-right">
          <p>
            Viscera data from the{' '}
            <Ext href="https://www.poewiki.net/wiki/Viscera">
              Path of Exile Wiki
            </Ext>{' '}
            (CC BY-NC-SA 3.0). League lists from{' '}
            <Ext href="https://poe.ninja/">poe.ninja</Ext>.
          </p>
          {isGameEnabled('poe2') ? (
            <p>
              PoE 2 data from{' '}
              <Ext href="https://github.com/repoe-fork/repoe">repoe-fork</Ext>{' '}
              and prices from <Ext href="https://poe2scout.com/">poe2scout</Ext>
              . Crafting odds are approximate.
            </p>
          ) : null}
          <p>
            Not affiliated with or endorsed by Grinding Gear Games. Path of
            Exile is a trademark of Grinding Gear Games.
          </p>
        </div>
      </div>
    </footer>
  );
}
