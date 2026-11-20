import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group, Mesh, MeshBasicMaterial } from 'three';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useRenderActive } from '../../hooks/useRenderActive';
import { cssVars } from '../../styles/theme';

interface OrbProps {
  active: boolean;
  listening: boolean;
}

function Orb({ active, listening, still }: OrbProps & { still: boolean }) {
  const colors = useMemo(
    () => cssVars({ core: '--primary', glass: '--primary-on-dark', light: '--scene-light', sky: '--scene-sky' }),
    [],
  );
  const shell = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const rings = useRef<Mesh[]>([]);

  useFrame(({ clock }) => {
    const t = still ? 0 : clock.elapsedTime;
    if (shell.current) {
      shell.current.rotation.y = t * 0.4;
      shell.current.position.y = Math.sin(t * 1.4) * 0.04;
    }
    if (core.current) {
      const beat = active ? 1 + Math.max(0, Math.sin(t * 7)) ** 6 * 0.28 : 1 + Math.sin(t * 1.6) * 0.04;
      core.current.scale.setScalar(beat);
    }
    rings.current.forEach((ring, index) => {
      const phase = ((t * 0.8 + index / rings.current.length) % 1) * (listening ? 1 : 0);
      ring.visible = listening && !still;
      ring.scale.setScalar(1 + phase * 0.9);
      (ring.material as MeshBasicMaterial).opacity = (1 - phase) * 0.5;
    });
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 4]} intensity={2} color={colors.light} />
      <pointLight position={[0, 0, 0]} intensity={4} color={colors.glass} distance={3} />
      <group ref={shell}>
        <mesh>
          <sphereGeometry args={[1, 48, 48]} />
          <meshPhysicalMaterial
            color={colors.sky}
            transmission={0.92}
            thickness={0.9}
            roughness={0.06}
            ior={1.45}
            clearcoat={1}
            attenuationColor={colors.glass}
            attenuationDistance={1.2}
          />
        </mesh>
        <mesh ref={core}>
          <icosahedronGeometry args={[0.42, 3]} />
          <meshStandardMaterial color={colors.core} emissive={colors.core} emissiveIntensity={0.9} roughness={0.3} />
        </mesh>
      </group>
      {[0, 1].map((index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            if (mesh) rings.current[index] = mesh;
          }}
          visible={false}
        >
          <torusGeometry args={[1.05, 0.02, 8, 64]} />
          <meshBasicMaterial color={colors.core} transparent opacity={0} />
        </mesh>
      ))}
    </>
  );
}

/** Glass sphere version of the Lumi orb: the core beats while Lumi answers and rings ripple while it listens. */
export default function LumiOrb3D({ active, listening }: OrbProps) {
  const container = useRef<HTMLSpanElement>(null);
  const visible = useRenderActive(container);
  const still = useReducedMotion();
  return (
    <span ref={container} className="lumi-orb-3d">
      <Canvas
        dpr={[1, 2]}
        frameloop={visible && !still ? 'always' : 'demand'}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 3.2], fov: 40 }}
      >
        <Orb active={active} listening={listening} still={still} />
      </Canvas>
    </span>
  );
}
