import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/ui';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="page">
      <PageHeader title={title} />
      <EmptyState title="Estamos preparando este espacio" description="Muy pronto podrás usarlo." />
    </div>
  );
}
