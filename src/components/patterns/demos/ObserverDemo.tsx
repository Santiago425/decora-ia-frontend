import { BellRing } from 'lucide-react';
import { useEffect, useState } from 'react';
import { notificationCenter } from '../../../services/notificationCenter';
import { Button } from '../../ui';

export function ObserverDemo() {
  const [heard, setHeard] = useState(0);

  useEffect(() => notificationCenter.subscribe(() => setHeard((count) => count + 1)), []);

  return (
    <div className="demo">
      <Button variant="ghost" onClick={() => notificationCenter.notify('Hola desde el patrón Observer', 'info')}>
        <BellRing size={16} /> Publicar un aviso
      </Button>
      <p className="demo-result">
        Este recuadro está suscrito y escuchó <strong>{heard}</strong> {heard === 1 ? 'aviso' : 'avisos'}.
      </p>
      <p className="demo-note">El aviso de abajo y este contador reciben el mismo mensaje sin conocerse.</p>
    </div>
  );
}
