export function StatusCard({ title, state, detail }) {
  return (
    <div className={`status-card status-${state}`}>
      <span className="dot" />
      <div>
        <h3>{title}</h3>
        <p>{detail}</p>
      </div>
    </div>
  );
}
