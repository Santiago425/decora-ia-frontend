import { useEffect, useState } from 'react';

const DURATION_MS = 2200;

export function Splash() {
  const [phase, setPhase] = useState('show');

  useEffect(() => {
    const leave = setTimeout(() => setPhase('leave'), DURATION_MS);
    const done = setTimeout(() => setPhase('done'), DURATION_MS + 900);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, []);

  if (phase === 'done') return null;
  return (
    <div className={`splash ${phase === 'leave' ? 'splash-leave' : ''}`} aria-hidden="true">
      <div className="splash-mark">
        <span className="splash-word">Decora<em>IA</em></span>
        <span className="splash-line" />
        <span className="splash-tag">Interiores reimaginados</span>
      </div>
    </div>
  );
}
