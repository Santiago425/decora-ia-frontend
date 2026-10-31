import { EmptyState } from '../components/EmptyState';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="page">
      <header className="page-header">
        <h1>{title}</h1>
      </header>
      <EmptyState title="Estamos preparando este espacio" description="Muy pronto podrás usarlo." />
    </div>
  );
}
