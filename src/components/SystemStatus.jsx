import { StatusCard } from './StatusCard.jsx';

export function SystemStatus({ backend, database }) {
  return (
    <section className="section" id="estado">
      <span className="kicker">En vivo</span>
      <h2 className="section-title">Estado del <em>sistema</em></h2>
      <div className="status">
        <StatusCard title="Frontend" state="up" detail="Hello World desde DecoraIA" />
        <StatusCard title="Backend" {...backend} />
        <StatusCard title="Base de datos" {...database} />
      </div>
    </section>
  );
}
