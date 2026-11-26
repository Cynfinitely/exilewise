import { BuildPlannerPage } from '@/components/buildplan/BuildPlannerPage';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata('/poe1/build-planner');

export default function Poe1BuildPlannerPage() {
  return <BuildPlannerPage game="poe1" />;
}
