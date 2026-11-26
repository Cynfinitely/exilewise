import { BuildPlannerPage } from '@/components/buildplan/BuildPlannerPage';
import { noindexMetadata } from '@/lib/seo/metadata';

// PoE 2 is hidden for now (src/proxy.ts redirects it); register it in
// src/lib/seo/pages.ts with pageMetadata when PoE 2 comes back.
export const metadata = noindexMetadata('Path of Exile 2 Build Planner');

export default function Poe2BuildPlannerPage() {
  return <BuildPlannerPage game="poe2" />;
}
