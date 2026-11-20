import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { roomPalette } from './roomAssets';
import { LivingRoom, RoomLights, Timeline } from './roomKit';

function CameraDrift({ origin, still }: { origin: number; still: boolean }) {
  useFrame(({ camera }) => {
    const t = still ? 3 : (performance.now() - origin) / 1000;
    const angle = 0.78 - Math.min(t, 3) * 0.06;
    const aspect = 'aspect' in camera ? camera.aspect : 1.5;
    const radius = (9.4 - Math.min(t, 3) * 0.4) * Math.max(1, 1.1 / aspect);
    camera.position.set(Math.sin(angle) * radius, 5.2 - Math.min(t, 3) * 0.25, Math.cos(angle) * radius);
    camera.lookAt(0, 0.9, -0.3);
  });
  return null;
}

export default function IntroRoom({ origin, still }: { origin: number; still: boolean }) {
  const palette = useMemo(() => roomPalette(), []);
  return (
    <Canvas
      className="intro-canvas"
      dpr={[1, 2]}
      frameloop={still ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 32, position: [5, 4.3, 5], near: 0.1, far: 50 }}
    >
      <CameraDrift origin={origin} still={still} />
      <RoomLights palette={palette} />
      <Timeline origin={origin} still={still}>
        <LivingRoom palette={palette} />
      </Timeline>
    </Canvas>
  );
}
