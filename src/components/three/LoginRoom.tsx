import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Group } from 'three';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useRenderActive } from '../../hooks/useRenderActive';
import { roomPalette, type RoomPalette } from './roomAssets';
import { LivingRoom, RoomLights, Timeline } from './roomKit';

interface Pointer {
  x: number;
  y: number;
  drag: number;
}

function FitZoom() {
  useFrame(({ camera, size }) => {
    const zoom = Math.min(size.width, size.height * 1.2) / 6.4;
    if (camera.zoom === zoom) return;
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  });
  return null;
}

interface TurntableProps {
  palette: RoomPalette;
  pointer: React.RefObject<Pointer>;
  still: boolean;
}

function Turntable({ palette, pointer, still }: TurntableProps) {
  const group = useRef<Group>(null);
  useFrame(({ clock }, delta) => {
    const room = group.current;
    if (!room || !pointer.current) return;
    const { x, y, drag } = pointer.current;
    const idle = still ? 0 : Math.sin(clock.elapsedTime * 0.18) * 0.45;
    const blend = 1 - Math.exp(-delta * 4);
    room.rotation.y += (idle + drag + x * 0.25 - room.rotation.y) * blend;
    room.rotation.x += (y * 0.08 - room.rotation.x) * blend;
  });
  return (
    <group ref={group}>
      <LivingRoom palette={palette} />
    </group>
  );
}

/** Slowly turning isometric room behind the login card; follows the mouse, a drag or the phone tilt. */
export default function LoginRoom() {
  const container = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0, drag: 0 });
  const active = useRenderActive(container);
  const still = useReducedMotion();
  const palette = useMemo(() => roomPalette(), []);

  useEffect(() => {
    if (still) return;
    let dragging: number | null = null;
    const onMove = (event: PointerEvent) => {
      if (dragging !== null) {
        pointer.current.drag += (event.clientX - dragging) * 0.006;
        dragging = event.clientX;
        return;
      }
      if (event.pointerType !== 'mouse') return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onDown = (event: PointerEvent) => {
      if (event.target instanceof Node && container.current?.contains(event.target)) dragging = event.clientX;
    };
    const onUp = () => {
      dragging = null;
    };
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      pointer.current.x = Math.max(-1, Math.min(1, event.gamma / 30));
      pointer.current.y = Math.max(-1, Math.min(1, (event.beta - 45) / 30));
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('deviceorientation', onTilt);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, [still]);

  return (
    <div ref={container} className="login-room">
      <Canvas
        dpr={[1, 2]}
        frameloop={active && !still ? 'always' : 'demand'}
        gl={{ antialias: true, alpha: true }}
        orthographic
        camera={{ position: [10, 8.4, 10], zoom: 62, near: 0.1, far: 60 }}
        onCreated={({ camera }) => camera.lookAt(0, 0.9, 0)}
      >
        <FitZoom />
        <RoomLights palette={palette} />
        <Timeline origin={0} still>
          <Turntable palette={palette} pointer={pointer} still={still} />
        </Timeline>
      </Canvas>
    </div>
  );
}
