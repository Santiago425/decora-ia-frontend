import { useFrame } from '@react-three/fiber';
import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';
import type { Group } from 'three';
import { useBlobTexture, usePlankTexture, type RoomPalette } from './roomAssets';

interface TimelineValue {
  origin: number;
  still: boolean;
}

const TimelineContext = createContext<TimelineValue>({ origin: 0, still: true });

/** Shares the start time of an assembly animation; with `still` every piece is drawn in place. */
export function Timeline({ origin, still, children }: TimelineValue & { children: ReactNode }) {
  const value = useMemo(() => ({ origin, still }), [origin, still]);
  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeOutBack = (x: number) => 1 + 2.4 * (x - 1) ** 3 + 1.4 * (x - 1) ** 2;
const easeOutCubic = (x: number) => 1 - (1 - x) ** 3;

type Motion = 'drop' | 'grow' | 'unroll';

interface AppearProps {
  at: number;
  duration?: number;
  motion?: Motion;
  position?: [number, number, number];
  rotation?: [number, number, number];
  children: ReactNode;
}

/** Brings a piece into the room at `at` seconds: dropping from above, growing up or unrolling sideways. */
export function Appear({ at, duration = 0.55, motion = 'drop', position, rotation, children }: AppearProps) {
  const ref = useRef<Group>(null);
  const { origin, still } = useContext(TimelineContext);

  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    const progress = still ? 1 : clamp01(((performance.now() - origin) / 1000 - at) / duration);
    group.visible = progress > 0;
    if (motion === 'drop') {
      group.position.y = (1 - easeOutBack(progress)) * 1.8;
      group.rotation.y = (1 - easeOutCubic(progress)) * 0.5;
    } else if (motion === 'grow') {
      group.scale.y = Math.max(0.001, easeOutCubic(progress));
    } else {
      group.scale.x = Math.max(0.001, easeOutCubic(progress));
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <group ref={ref} visible={still}>
        {children}
      </group>
    </group>
  );
}

/** A soft contact shadow without a shadow map, cheap enough for intro and login scenes. */
export function BlobShadow({ width, depth, opacity = 0.7 }: { width: number; depth: number; opacity?: number }) {
  const texture = useBlobTexture();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

export function RoomShell({
  palette,
  size = 4,
  height = 2.6,
}: {
  palette: RoomPalette;
  size?: number;
  height?: number;
}) {
  const planks = usePlankTexture(palette.floor);
  const half = size / 2;
  return (
    <>
      <Appear at={0} duration={0.45} motion="unroll">
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[size, 0.1, size]} />
          <meshStandardMaterial map={planks} roughness={0.7} />
        </mesh>
      </Appear>
      <Appear at={0.25} duration={0.5} motion="grow" position={[0, 0, -half - 0.05]}>
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[size + 0.1, height, 0.1]} />
          <meshStandardMaterial color={palette.wall} roughness={0.95} />
        </mesh>
        <mesh position={[0.6, height * 0.56, 0.055]}>
          <planeGeometry args={[1.3, 1.25]} />
          <meshBasicMaterial color={palette.light} />
        </mesh>
        <mesh position={[0.6, height * 0.56, 0.06]}>
          <boxGeometry args={[0.04, 1.25, 0.02]} />
          <meshStandardMaterial color={palette.wall} />
        </mesh>
      </Appear>
      <Appear at={0.35} duration={0.5} motion="grow" position={[-half - 0.05, 0, 0]}>
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[0.1, height, size + 0.1]} />
          <meshStandardMaterial color={palette.wall} roughness={0.95} />
        </mesh>
        <mesh position={[0.06, 0.06, 0]}>
          <boxGeometry args={[0.03, 0.12, size]} />
          <meshStandardMaterial color={palette.wood} />
        </mesh>
      </Appear>
    </>
  );
}

export function Rug({ palette }: { palette: RoomPalette }) {
  return (
    <mesh position={[0, 0.012, 0]}>
      <boxGeometry args={[2.3, 0.024, 1.6]} />
      <meshStandardMaterial color={palette.rug} roughness={1} />
    </mesh>
  );
}

export function Sofa({ palette }: { palette: RoomPalette }) {
  return (
    <group>
      <BlobShadow width={2.6} depth={1.3} />
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2.1, 0.32, 0.9]} />
        <meshStandardMaterial color={palette.sofa} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.66, -0.36]}>
        <boxGeometry args={[2.1, 0.5, 0.2]} />
        <meshStandardMaterial color={palette.sofa} roughness={0.95} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.97, 0.5, 0]}>
          <boxGeometry args={[0.18, 0.42, 0.9]} />
          <meshStandardMaterial color={palette.sofa} roughness={0.95} />
        </mesh>
      ))}
      {[-0.44, 0.44].map((x) => (
        <mesh key={x} position={[x, 0.52, 0.04]}>
          <boxGeometry args={[0.84, 0.12, 0.74]} />
          <meshStandardMaterial color={palette.wall} roughness={1} />
        </mesh>
      ))}
      <mesh position={[-0.55, 0.72, -0.18]} rotation={[0.25, 0.2, 0.1]}>
        <boxGeometry args={[0.42, 0.36, 0.12]} />
        <meshStandardMaterial color={palette.primary} roughness={1} />
      </mesh>
      <mesh position={[0.62, 0.72, -0.18]} rotation={[0.25, -0.15, -0.08]}>
        <boxGeometry args={[0.38, 0.34, 0.12]} />
        <meshStandardMaterial color={palette.wood} roughness={1} />
      </mesh>
      {[-0.95, 0.95].flatMap((x) =>
        [-0.36, 0.36].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.07, z]}>
            <cylinderGeometry args={[0.03, 0.025, 0.14, 8]} />
            <meshStandardMaterial color={palette.metal} />
          </mesh>
        )),
      )}
    </group>
  );
}

export function CoffeeTable({ palette }: { palette: RoomPalette }) {
  return (
    <group>
      <BlobShadow width={1.2} depth={1.2} opacity={0.5} />
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.05, 40]} />
        <meshStandardMaterial color={palette.wood} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.16, 0.4, 20]} />
        <meshStandardMaterial color={palette.wood} roughness={0.6} />
      </mesh>
      <mesh position={[0.12, 0.5, 0.05]}>
        <cylinderGeometry args={[0.07, 0.05, 0.12, 16]} />
        <meshStandardMaterial color={palette.wall} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function FloorLamp({ palette, glow = true }: { palette: RoomPalette; glow?: boolean }) {
  return (
    <group>
      <BlobShadow width={0.7} depth={0.7} opacity={0.5} />
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 24]} />
        <meshStandardMaterial color={palette.metal} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.56, 8]} />
        <meshStandardMaterial color={palette.metal} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.16, 0.26, 0.32, 28, 1, true]} />
        <meshStandardMaterial color={palette.light} emissive={palette.light} emissiveIntensity={0.6} side={2} />
      </mesh>
      {glow && <pointLight position={[0, 1.5, 0]} color={palette.light} intensity={2.2} distance={4} decay={2} />}
    </group>
  );
}

export function Plant({ palette }: { palette: RoomPalette }) {
  return (
    <group>
      <BlobShadow width={0.8} depth={0.8} opacity={0.55} />
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.44, 24]} />
        <meshStandardMaterial color={palette.pot} roughness={0.9} />
      </mesh>
      {[
        [0, 0.78, 0, 0.3],
        [0.16, 0.62, 0.08, 0.22],
        [-0.14, 0.66, -0.06, 0.24],
        [0.02, 1.02, -0.04, 0.2],
      ].map(([x, y, z, r]) => (
        <mesh key={`${x}${y}`} position={[x, y, z]}>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color={palette.plant} roughness={0.85} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export function Shelf({ palette }: { palette: RoomPalette }) {
  const books = [palette.primary, palette.accent2, palette.wall, palette.accent3, palette.wood];
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.26, 0.04, 1.3]} />
        <meshStandardMaterial color={palette.wood} roughness={0.6} />
      </mesh>
      {books.map((color, index) => (
        <mesh key={index} position={[0, 0.15, -0.5 + index * 0.1]} rotation={[index === 4 ? 0.3 : 0, 0, 0]}>
          <boxGeometry args={[0.2, 0.26 - (index % 2) * 0.05, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0.35]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={palette.pot} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function RoomLights({ palette }: { palette: RoomPalette }) {
  return (
    <>
      <hemisphereLight args={[palette.sky, palette.ground, 1.1]} />
      <directionalLight position={[2, 5, 4]} intensity={1.6} color={palette.light} />
      <ambientLight intensity={0.25} />
    </>
  );
}

/** The furnished living room shared by the intro and the login scene. */
export function LivingRoom({ palette }: { palette: RoomPalette }) {
  return (
    <group>
      <RoomShell palette={palette} />
      <Appear at={0.75} motion="unroll" position={[0.2, 0, 0.1]}>
        <Rug palette={palette} />
      </Appear>
      <Appear at={0.95} position={[0.2, 0, -1.2]}>
        <Sofa palette={palette} />
      </Appear>
      <Appear at={1.2} position={[0.25, 0, 0.35]}>
        <CoffeeTable palette={palette} />
      </Appear>
      <Appear at={1.4} position={[1.55, 0, -1.45]}>
        <FloorLamp palette={palette} />
      </Appear>
      <Appear at={1.6} position={[-1.45, 0, -1.4]}>
        <Plant palette={palette} />
      </Appear>
      <Appear at={1.8} position={[-1.82, 1.35, 0.6]}>
        <Shelf palette={palette} />
      </Appear>
    </group>
  );
}
