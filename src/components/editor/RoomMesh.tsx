import { useMemo } from 'react';
import { DoubleSide, FrontSide } from 'three';
import type { Material } from '../../types/catalog';
import type { RoomData } from '../../types/project';
import { NEUTRAL_COLORS, surfaceFinish } from '../../editor/styleTheme';
import { darken } from '../../utils/color';

const WALL_THICKNESS = 0.08;

export function RoomMesh({ room, materials }: { room: RoomData; materials: Map<string, Material> }) {
  const wall = surfaceFinish(room.wall_material, materials, NEUTRAL_COLORS.wall);
  const floor = surfaceFinish(room.floor_material, materials, NEUTRAL_COLORS.floor);
  const { width, length, height } = room;

  const walls = useMemo(
    () => [
      { position: [0, height / 2, -length / 2] as const, rotation: 0, span: width },
      { position: [0, height / 2, length / 2] as const, rotation: Math.PI, span: width },
      { position: [-width / 2, height / 2, 0] as const, rotation: Math.PI / 2, span: length },
      { position: [width / 2, height / 2, 0] as const, rotation: -Math.PI / 2, span: length },
    ],
    [width, length, height],
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={floor.color} roughness={floor.roughness} metalness={floor.metalness} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[width + WALL_THICKNESS * 2, length + WALL_THICKNESS * 2]} />
        <meshStandardMaterial color={darken(wall.color, 0.25)} side={DoubleSide} />
      </mesh>
      {walls.map(({ position, rotation, span }, index) => (
        <mesh key={index} position={[...position]} rotation={[0, rotation, 0]} receiveShadow>
          <planeGeometry args={[span, height]} />
          <meshStandardMaterial color={wall.color} roughness={wall.roughness} metalness={wall.metalness} side={FrontSide} />
        </mesh>
      ))}
    </group>
  );
}
