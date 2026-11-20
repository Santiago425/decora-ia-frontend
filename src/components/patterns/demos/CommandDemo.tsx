import { ArrowLeft, ArrowRight, Redo2, Undo2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { CommandHistory, MoveNodeCommand } from '../../../editor/commands';
import type { SceneData, SceneItemData } from '../../../types/project';
import { Button } from '../../ui';

const MAX_STEPS = 2;

const chair: SceneItemData = {
  kind: 'item',
  id: 'demo-chair',
  furniture_id: null,
  name: 'Silla',
  category: 'seating',
  shape: 'chair',
  position: [0, 0],
  rotation: 0,
  size: [0.5, 0.5, 0.9],
  color: '#c4704f',
  price: 0,
  finish: null,
  addons: [],
};

const initialScene: SceneData = {
  format: 1,
  style: null,
  room: { width: MAX_STEPS * 2 + 1, length: 1, height: 2.6, wall_material: null, floor_material: null },
  lighting: { color: '#ffffff', intensity: 1 },
  nodes: [chair],
};

export function CommandDemo() {
  const history = useRef(new CommandHistory(10));
  const [scene, setScene] = useState(initialScene);
  const x = (scene.nodes[0] as SceneItemData).position[0];

  const move = (dx: number) =>
    setScene((current) => history.current.execute(new MoveNodeCommand(chair.id, dx, 0), current));

  return (
    <div className="demo">
      <div className="demo-track" aria-label={`La silla está en ${x} m`}>
        <span className="demo-chip" style={{ left: `${((x + MAX_STEPS + 0.5) / (MAX_STEPS * 2 + 1)) * 100}%` }}>
          🪑
        </span>
      </div>
      <div className="demo-actions">
        <Button variant="ghost" onClick={() => move(-1)} disabled={x <= -MAX_STEPS} aria-label="Mover a la izquierda">
          <ArrowLeft size={16} />
        </Button>
        <Button variant="ghost" onClick={() => move(1)} disabled={x >= MAX_STEPS} aria-label="Mover a la derecha">
          <ArrowRight size={16} />
        </Button>
        <Button
          variant="ghost"
          onClick={() => setScene((current) => history.current.undo(current))}
          disabled={!history.current.canUndo}
        >
          <Undo2 size={16} /> Deshacer
        </Button>
        <Button
          variant="ghost"
          onClick={() => setScene((current) => history.current.redo(current))}
          disabled={!history.current.canRedo}
        >
          <Redo2 size={16} /> Rehacer
        </Button>
      </div>
      <p className="demo-note">Cada movimiento es un MoveNodeCommand guardado en el mismo CommandHistory del editor.</p>
    </div>
  );
}
