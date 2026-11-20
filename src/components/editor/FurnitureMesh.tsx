import type { ThreeEvent } from '@react-three/fiber';
import { memo, useMemo } from 'react';
import { decorateFurniture, type Pricing } from '../../editor/furnitureDecorators';
import type { Part } from '../../editor/furnitureFactory';
import type { SceneItemData } from '../../types/project';

function PartMesh({ part, sky }: { part: Part; sky?: string }) {
  const [a, b, c] = part.size;
  const color = part.role === 'glass' && sky ? sky : part.color;
  const transparent = part.opacity !== undefined && part.opacity < 1;
  return (
    <mesh position={part.position} castShadow={!transparent && part.role !== 'glow'} receiveShadow>
      {part.geometry === 'box' && <boxGeometry args={[a, b, c]} />}
      {part.geometry === 'cylinder' && <cylinderGeometry args={[a, c, b, 24]} />}
      {part.geometry === 'sphere' && <sphereGeometry args={[a, 24, 16]} />}
      <meshStandardMaterial
        color={color}
        roughness={part.roughness ?? 0.75}
        metalness={part.metalness ?? 0}
        transparent={transparent}
        opacity={part.opacity ?? 1}
        emissive={part.emissive ? color : 'black'}
        emissiveIntensity={part.emissive ?? 0}
      />
    </mesh>
  );
}

interface FurnitureMeshProps {
  item: SceneItemData;
  pricing: Pricing;
  offset: [number, number];
  /** Sky color behind the windows for the chosen time of day. */
  sky?: string;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
}

export const FurnitureMesh = memo(function FurnitureMesh({
  item,
  pricing,
  offset,
  sky,
  onPointerDown,
}: FurnitureMeshProps) {
  const parts = useMemo(() => decorateFurniture(item, pricing).parts(), [item, pricing]);
  return (
    <group
      position={[item.position[0] + offset[0], 0, item.position[1] + offset[1]]}
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onPointerDown={onPointerDown}
    >
      {parts.map((part, index) => (
        <PartMesh key={index} part={part} sky={sky} />
      ))}
    </group>
  );
});
