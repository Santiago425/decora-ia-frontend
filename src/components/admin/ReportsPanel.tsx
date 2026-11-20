import { Download, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { adminService } from '../../services/adminService';
import { notificationCenter } from '../../services/notificationCenter';
import type { ReportFormat, ReportKind } from '../../types/admin';
import { Button, Panel } from '../ui';

const REPORTS: { kind: ReportKind; title: string; description: string }[] = [
  {
    kind: 'usuarios',
    title: 'Usuarios',
    description: 'Nombre, correo, rol, estado, proyectos y último ingreso de cada cuenta.',
  },
  {
    kind: 'proyectos',
    title: 'Proyectos',
    description: 'Todos los proyectos con su dueño, estado, estilo, presupuesto y rediseños.',
  },
];

const FORMATS: { format: ReportFormat; label: string }[] = [
  { format: 'csv', label: 'CSV' },
  { format: 'json', label: 'JSON' },
];

export function ReportsPanel() {
  const [busy, setBusy] = useState<string | null>(null);

  async function download(kind: ReportKind, format: ReportFormat) {
    setBusy(`${kind}-${format}`);
    try {
      const { blob, fileName } = await adminService.report(kind, format);
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      notificationCenter.notify((e as Error).message, 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel
      className="admin-panel"
      title="Reportes"
      description="CSV para abrir en Excel o Google Sheets, JSON para usar los datos en otro programa."
    >
      <div className="report-grid">
        {REPORTS.map((report) => (
          <article key={report.kind} className="report-card">
            <span className="report-icon">
              <FileSpreadsheet size={22} />
            </span>
            <div>
              <h3>{report.title}</h3>
              <p>{report.description}</p>
            </div>
            <div className="report-actions">
              {FORMATS.map(({ format, label }) => {
                const key = `${report.kind}-${format}`;
                return (
                  <Button
                    key={format}
                    variant="ghost"
                    onClick={() => download(report.kind, format)}
                    disabled={busy === key}
                    aria-label={`Descargar ${report.title.toLowerCase()} en ${label}`}
                  >
                    <Download size={17} /> {busy === key ? 'Preparando…' : label}
                  </Button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
