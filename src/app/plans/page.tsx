import { SavedLibrary } from '@/components/plans/SavedLibrary';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = {
  title: 'Saved Plans',
};

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Plans & Favorites"
        description="Your crafting plans and favorite bases, saved in this browser."
      />
      <SavedLibrary />
    </div>
  );
}
