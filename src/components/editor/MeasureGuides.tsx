import { Html, Line } from '@react-three/drei';
import { useMemo } from 'react';
import { wallGaps } from '../../editor/layoutGuides';
import { flattenItems, nodeBounds } from '../../editor/sceneTree';
import { cssVar } from '../../styles/theme';
import type { RoomData, SceneNodeData } from '../../types/project';
import { formatMeters } from '../../utils/format';

type Point = [number, number, number];

const OUTSIDE = 0.35;
const FLOOR_Y = 0.025;
const MIN_GAP = 0.02;

function Label({ position, children, strong = false }: { position: Point; children: string; strong?: boolean }) {
  return (
    <Html position={position} center zIndexRange={[20, 0]} className="measure-anchor">
      <span className={`measure-label${strong ? ' strong' : ''}`}>{children}</span>
    </Html>
  );
}

function Dimension({ from, to, color, dashed = false }: { from: Point; to: Point; color: string; dashed?: boolean }) {
  return (
    <Line
      points={[from, to]}
      color={color}
      lineWidth={dashed ? 1.5 : 2}
      dashed={dashed}
      dashSize={0.08}
      gapSize={0.05}
      depthTest={false}
      renderOrder={10}
    />
  );
}

function RoomDimensions({ room, color }: { room: RoomData; color: string }) {
  const halfW = room.width / 2;
  const halfL = room.length / 2;
  const front = halfL + OUTSIDE;
  const side = halfW + OUTSIDE;
  return (
    <group>
      <Dimension from={[-halfW, FLOOR_Y, front]} to={[halfW, FLOOR_Y, front]} color={color} />
      <Label position={[0, FLOOR_Y, front]} strong>{`Ancho ${formatMeters(room.width)}`}</Label>
      <Dimension from={[side, FLOOR_Y, -halfL]} to={[side, FLOOR_Y, halfL]} color={color} />
      <Label position={[side, FLOOR_Y, 0]} strong>{`Largo ${formatMeters(room.length)}`}</Label>
      <Dimension from={[-halfW, 0, -halfL]} to={[-halfW, room.height, -halfL]} color={color} />
      <Label position={[-halfW, room.height / 2, -halfL]} strong>{`Alto ${formatMeters(room.height)}`}</Label>
    </group>
  );
}

function NodeDimensions({
  node,
  offset,
  room,
  color,
}: {
  node: SceneNodeData;
  offset: [number, number];
  room: RoomData;
  color: string;
}) {
  const { bounds, height } = useMemo(() => {
    const raw = nodeBounds(node);
    const items = node.kind === 'group' ? flattenItems(node.children) : [node];
    return {
      bounds: {
        minX: raw.minX + offset[0],
        maxX: raw.maxX + offset[0],
        minZ: raw.minZ + offset[1],
        maxZ: raw.maxZ + offset[1],
      },
      height: Math.max(...items.map((item) => item.size[2]), 0),
    };
  }, [node, offset]);
  const gaps = wallGaps(bounds, room);
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;
  const halfW = room.width / 2;
  const halfL = room.length / 2;
  const runs: { gap: number; from: Point; to: Point }[] = [
    { gap: gaps.left, from: [-halfW, FLOOR_Y, cz], to: [bounds.minX, FLOOR_Y, cz] },
    { gap: gaps.right, from: [bounds.maxX, FLOOR_Y, cz], to: [halfW, FLOOR_Y, cz] },
    { gap: gaps.back, from: [cx, FLOOR_Y, -halfL], to: [cx, FLOOR_Y, bounds.minZ] },
    { gap: gaps.front, from: [cx, FLOOR_Y, bounds.maxZ], to: [cx, FLOOR_Y, halfL] },
  ];
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;

  return (
    <group>
      {runs
        .filter(({ gap }) => gap >= MIN_GAP)
        .map(({ gap, from, to }, index) => (
          <group key={index}>
            <Dimension from={from} to={to} color={color} dashed />
            <Label position={[(from[0] + to[0]) / 2, FLOOR_Y, (from[2] + to[2]) / 2]}>{formatMeters(gap)}</Label>
          </group>
        ))}
      <Label position={[cx, height + 0.18, cz]} strong>
        {`${formatMeters(width, { unit: false })} × ${formatMeters(depth)}`}
      </Label>
    </group>
  );
}

interface MeasureGuidesProps {
  room: RoomData;
  node?: SceneNodeData;
  offset: [number, number];
  showRoom: boolean;
}

// Dimension lines: the room's real size and, for the selected piece, its footprint and the free space to each wall.
export function MeasureGuides({ room, node, offset, showRoom }: MeasureGuidesProps) {
  const color = useMemo(() => cssVar('--text-2'), []);
  const accent = useMemo(() => cssVar('--primary'), []);
  return (
    <group>
      {showRoom && <RoomDimensions room={room} color={color} />}
      {node && <NodeDimensions node={node} offset={offset} room={room} color={accent} />}
    </group>
  );
}
