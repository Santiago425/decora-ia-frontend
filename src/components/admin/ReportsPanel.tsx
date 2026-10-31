import { Download, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { adminService } from '../../services/adminService';
import { notificationCenter } from '../../services/notificationCenter';
import type { ReportKind } from '../../types/admin';

const REPORTS: { kind: ReportKind; title: string; description: string }[] = [
  { kind: 'usuarios', title: 'Usuarios', description: 'Nombre, correo, rol, estado, proyectos y último ingreso de cada cuenta.' },
  { kind: 'proyectos', title: 'Proyectos', description: 'Todos los proyectos con su dueño, estado, estilo, presupuesto y rediseños.' },
];

export function ReportsPanel() {
  const [busy, setBusy] = useState<ReportKind | null>(null);

  async function download(kind: ReportKind) {
    setBusy(kind);
    try {
      const { blob, fileName } = await adminService.report(kind);
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
    <section className="panel admin-panel">
      <header className="admin-panel-head">
        <div>
          <h2>Reportes</h2>
          <p>Descárgalos en CSV y ábrelos con Excel o Google Sheets.</p>
        </div>
      </header>
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
            <button className="button button-ghost" onClick={() => download(report.kind)} disabled={busy === report.kind}>
              <Download size={17} /> {busy === report.kind ? 'Preparando…' : 'Descargar'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
