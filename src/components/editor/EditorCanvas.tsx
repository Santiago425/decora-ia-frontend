import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Plane, Vector2, Vector3, type PerspectiveCamera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { config } from '../../config';
import type { Pricing } from '../../editor/furnitureDecorators';
import { flattenItems, nodeBounds, type Bounds } from '../../editor/sceneTree';
import type { SceneData, SceneNodeData } from '../../types/project';
import { FurnitureMesh } from './FurnitureMesh';
import { RoomMesh } from './RoomMesh';

export type CameraView = 'perspective' | 'top';

export interface EditorCanvasHandle {
  capture(): string | null;
}

interface EditorCanvasProps {
  scene: SceneData;
  pricing: Pricing;
  selection: string[];
  readOnly: boolean;
  view: CameraView;
  onSelect: (id: string | null, additive: boolean) => void;
  onMove: (id: string, dx: number, dz: number) => void;
}

interface Drag {
  id: string;
  start: Vector3;
  bounds: Bounds;
  delta: [number, number];
}

const FLOOR = new Plane(new Vector3(0, 1, 0), 0);
const FOV = 45;
const snap = (value: number) => Math.round(value / config.editor.snap) * config.editor.snap;
const cssColor = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#f6f1e9';

const HALF_FOV = Math.tan(((FOV / 2) * Math.PI) / 180);

function cameraPosition(view: CameraView, room: SceneData['room'], aspect = 1.4): [number, number, number] {
  if (view === 'top') {
    const distance = Math.max(room.length / 2 / HALF_FOV, room.width / 2 / (HALF_FOV * aspect)) * 1.12;
    return [0, distance + room.height, 0.01];
  }
  const radius = Math.hypot(room.width, room.length) / 2;
  const distance = (radius * 1.2) / (HALF_FOV * Math.min(1, aspect));
  const direction = new Vector3(0.42, 0.8, 1).normalize().multiplyScalar(distance);
  return [direction.x, direction.y, direction.z];
}

function CameraRig({ view, room, controls }: { view: CameraView; room: SceneData['room']; controls: React.RefObject<OrbitControlsImpl> }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height));
  const { width, length, height } = room;
  useEffect(() => {
    camera.position.set(...cameraPosition(view, { width, length, height } as SceneData['room'], aspect));
    controls.current?.target.set(0, 0.3, 0);
    controls.current?.update();
  }, [view, width, length, height, aspect, camera, controls]);
  return null;
}

function DragController({
  active,
  dragRef,
  room,
  onDrag,
  onDrop,
}: {
  active: boolean;
  dragRef: React.MutableRefObject<Drag | null>;
  room: SceneData['room'];
  onDrag: (delta: [number, number]) => void;
  onDrop: () => void;
}) {
  const { camera, gl, raycaster } = useThree();

  useEffect(() => {
    if (!active) return;
    const element = gl.domElement;
    const pointer = new Vector2();
    const hit = new Vector3();
    const halfW = room.width / 2;
    const halfL = room.length / 2;

    function move(event: PointerEvent) {
      const rect = element.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const drag = dragRef.current;
      if (!drag || !raycaster.ray.intersectPlane(FLOOR, hit)) return;
      const { bounds, start } = drag;
      const dx = Math.min(halfW - bounds.maxX, Math.max(-halfW - bounds.minX, snap(hit.x - start.x)));
      const dz = Math.min(halfL - bounds.maxZ, Math.max(-halfL - bounds.minZ, snap(hit.z - start.z)));
      onDrag([dx, dz]);
    }

    element.addEventListener('pointermove', move);
    window.addEventListener('pointerup', onDrop);
    window.addEventListener('pointercancel', onDrop);
    return () => {
      element.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', onDrop);
      window.removeEventListener('pointercancel', onDrop);
    };
  }, [active, dragRef, room, camera, gl, raycaster, onDrag, onDrop]);

  return null;
}

function SelectionMarker({ node, offset }: { node: SceneNodeData; offset: [number, number] }) {
  const bounds = nodeBounds(node);
  const width = bounds.maxX - bounds.minX + 0.12;
  const depth = bounds.maxZ - bounds.minZ + 0.12;
  const color = cssColor('--terracotta');
  return (
    <group position={[(bounds.minX + bounds.maxX) / 2 + offset[0], 0.012, (bounds.minZ + bounds.maxZ) / 2 + offset[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      {[
        [0, depth / 2, width, 0.03],
        [0, -depth / 2, width, 0.03],
        [width / 2, 0, 0.03, depth],
        [-width / 2, 0, 0.03, depth],
      ].map(([x, z, w, d], index) => (
        <mesh key={index} position={[x, 0.002, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w, d]} />
          <meshBasicMaterial color={color} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

export const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(function EditorCanvas(
  { scene, pricing, selection, readOnly, view, onSelect, onMove },
  ref,
) {
  const controls = useRef<OrbitControlsImpl>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const { room, lighting } = scene;
  const size = Math.max(room.width, room.length);
  const background = useMemo(() => cssColor('--sand-100'), []);

  useImperativeHandle(ref, () => ({ capture: () => canvas.current?.toDataURL('image/png') ?? null }), []);

  const startDrag = useCallback(
    (node: SceneNodeData, event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();
      const additive = event.shiftKey || event.ctrlKey || event.metaKey;
      onSelect(node.id, additive);
      if (readOnly || additive) return;
      if (controls.current) controls.current.enabled = false;
      const start = new Vector3();
      event.ray.intersectPlane(FLOOR, start);
      const next = { id: node.id, start, bounds: nodeBounds(node), delta: [0, 0] as [number, number] };
      dragRef.current = next;
      setDrag(next);
    },
    [onSelect, readOnly],
  );

  const updateDrag = useCallback((delta: [number, number]) => {
    if (!dragRef.current) return;
    dragRef.current = { ...dragRef.current, delta };
    setDrag(dragRef.current);
  }, []);

  const drop = useCallback(() => {
    const current = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (controls.current) controls.current.enabled = true;
    if (current && (current.delta[0] !== 0 || current.delta[1] !== 0)) onMove(current.id, ...current.delta);
  }, [onMove]);

  const selectedNodes = scene.nodes.filter((node) => selection.includes(node.id));

  return (
    <Canvas
      ref={canvas}
      shadows
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ position: cameraPosition(view, room), fov: FOV, near: 0.1, far: 200 }}
      onPointerMissed={(event) => onSelect(null, event.shiftKey)}
    >
      <color attach="background" args={[background]} />
      <hemisphereLight args={['#ffffff', '#d8c8ae', 0.8 * lighting.intensity]} />
      <ambientLight intensity={0.25 * lighting.intensity} color={lighting.color} />
      <directionalLight
        position={[room.width * 0.25, room.height * 3.2, room.length * 0.35]}
        intensity={1.5 * lighting.intensity}
        color={lighting.color}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-size}
        shadow-camera-right={size}
        shadow-camera-top={size}
        shadow-camera-bottom={-size}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <pointLight position={[0, room.height - 0.3, 0]} intensity={0.6 * lighting.intensity} color={lighting.color} distance={size * 2} />

      <RoomMesh room={room} materials={pricing.materials} />
      <ContactShadows position={[0, 0.005, 0]} scale={size * 1.4} opacity={0.35} blur={2.4} far={2} resolution={512} />

      {scene.nodes.map((node) => {
        const offset: [number, number] = drag?.id === node.id ? drag.delta : [0, 0];
        return (node.kind === 'group' ? flattenItems(node.children) : [node]).map((item) => (
          <FurnitureMesh
            key={item.id}
            item={item}
            pricing={pricing}
            offset={offset}
            onPointerDown={(event) => startDrag(node, event)}
          />
        ));
      })}

      {selectedNodes.map((node) => (
        <SelectionMarker key={node.id} node={node} offset={drag?.id === node.id ? drag.delta : [0, 0]} />
      ))}

      <DragController active={drag !== null} dragRef={dragRef} room={room} onDrag={updateDrag} onDrop={drop} />
      <OrbitControls
        ref={controls}
        makeDefault
        target={[0, 0.4, 0]}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={1.5}
        maxDistance={size * 4}
        enableDamping
      />
      <CameraRig view={view} room={room} controls={controls} />
    </Canvas>
  );
});
