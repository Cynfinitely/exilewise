import { ToolCard } from '@/components/home/tools';
import { POE1_GUIDES } from '@/lib/poe1/guides';
import { noindexMetadata } from '@/lib/seo/metadata';

// A thin hub while there are few guides: reachable and followed, not listed.
export const metadata = noindexMetadata('Path of Exile 1 guides');

export default function Poe1GuidesPage() {
  return (
    <div className="space-y-12">
      <header className="pt-2 text-center">
        <p className="eyebrow">Path of Exile 1</p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">PoE 1 guides</h1>
        <p className="mx-auto mt-4 max-w-xl text-forge-muted">
          League companions and written guides to the videos: setups, decisions,
          selling and the numbers to check whether a farm is worth your time.
        </p>
        <div className="ornament mx-auto mt-6 max-w-md">
          <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-forge-gold" />
        </div>
      </header>
      <section aria-labelledby="covens-heading" className="space-y-6">
        <h2 id="covens-heading" className="section-title text-center">
          Covens league
        </h2>
        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
          <ToolCard
            tool={{
              href: '/poe1/viscera',
              title: 'Viscera & Wickerman planner',
              desc: 'Every Covens viscera, which boss drops it and where, a four-socket Wickerman builder with combined stats and picks for your build.',
              icon: 'viscera',
              accent: 'peach',
            }}
          />
        </div>
      </section>
      <h2 className="section-title text-center">All PoE 1 guides</h2>
      <ul className="mx-auto -mt-6 grid max-w-4xl gap-5 sm:grid-cols-2">
        {POE1_GUIDES.map(g => (
          <li key={g.href} className="flex [&>*]:w-full">
            <ToolCard
              tool={{
                href: g.href,
                title: g.title,
                desc: `${g.desc} Updated ${g.updatedAt}.`,
                icon: 'guides',
                accent: 'sky',
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
