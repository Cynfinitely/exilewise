import { noindexMetadata } from '@/lib/seo/metadata';
import { GameHub } from '@/components/games/GameHub';

// A thin hub: reachable and followed, but not listed in search.
export const metadata = noindexMetadata('Path of Exile 1 tools');

export default function Poe1Page() {
  return <GameHub game="poe1" />;
}
