import { BarChart3, FileSpreadsheet, Sofa, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AdminOverview } from '../components/admin/AdminOverview';
import { CatalogAdmin } from '../components/admin/CatalogAdmin';
import { ReportsPanel } from '../components/admin/ReportsPanel';
import { UsersPanel } from '../components/admin/UsersPanel';
import { PageHeader, Tabs } from '../components/ui';

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
      <PageHeader
        className="admin-header"
        title="Administración"
        subtitle="Lo que pasa en toda la plataforma, las cuentas y el catálogo."
        patterns={['proxy-admin', 'template-method', 'bridge-reports']}
      />

      <Tabs
        className="admin-tabs"
        label="Secciones de administración"
        value={tab}
        onChange={(key) => setParams(key === 'overview' ? {} : { tab: key })}
        items={(Object.keys(TABS) as Tab[]).map((key) => {
          const { label, icon: Icon } = TABS[key];
          return { value: key, label, icon: <Icon size={17} aria-hidden="true" /> };
        })}
      />

      {tab === 'overview' && <AdminOverview />}
      {tab === 'users' && <UsersPanel />}
      {tab === 'catalog' && <CatalogAdmin />}
      {tab === 'reports' && <ReportsPanel />}
    </div>
  );
}
