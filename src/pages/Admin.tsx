import { BarChart3, FileSpreadsheet, Sofa, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AdminOverview } from '../components/admin/AdminOverview';
import { CatalogAdmin } from '../components/admin/CatalogAdmin';
import { ReportsPanel } from '../components/admin/ReportsPanel';
import { UsersPanel } from '../components/admin/UsersPanel';

const TABS = {
  overview: { label: 'Resumen', icon: BarChart3 },
  users: { label: 'Usuarios', icon: Users },
  catalog: { label: 'Catálogo', icon: Sofa },
  reports: { label: 'Reportes', icon: FileSpreadsheet },
} as const;

type Tab = keyof typeof TABS;

export default function Admin() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = (params.get('tab') as Tab) in TABS ? (params.get('tab') as Tab) : 'overview';

  return (
    <div className="page admin-page">
      <header className="page-header admin-header">
        <div>
          <h1>Administración</h1>
          <p className="page-subtitle">Lo que pasa en toda la plataforma, las cuentas y el catálogo.</p>
        </div>
      </header>

      <nav className="admin-tabs" role="tablist" aria-label="Secciones de administración">
        {(Object.keys(TABS) as Tab[]).map((key) => {
          const { label, icon: Icon } = TABS[key];
          return (
            <button key={key} role="tab" aria-selected={tab === key} onClick={() => setParams(key === 'overview' ? {} : { tab: key })}>
              <Icon size={17} /> {label}
            </button>
          );
        })}
      </nav>

      {tab === 'overview' && <AdminOverview />}
      {tab === 'users' && <UsersPanel />}
      {tab === 'catalog' && <CatalogAdmin />}
      {tab === 'reports' && <ReportsPanel />}
    </div>
  );
}
