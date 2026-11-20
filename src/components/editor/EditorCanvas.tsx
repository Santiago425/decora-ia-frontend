import { ContactShadows, Environment, Lightformer, OrbitControls, SoftShadows } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Object3D, PerspectiveCamera, Plane, Vector2, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { config } from '../../config';
import { lampLights, sunPosition, windowLights, type WindowLight } from '../../editor/daylight';
import type { Pricing } from '../../editor/furnitureDecorators';
import { flattenItems, nodeBounds, type Bounds } from '../../editor/sceneTree';
import { LOOK_AHEAD, walkPose } from '../../editor/walkView';
import type { DaylightPreset } from '../../types/catalog';
import type { SceneData, SceneNodeData } from '../../types/project';
import { FurnitureMesh } from './FurnitureMesh';
import { MeasureGuides } from './MeasureGuides';
import { RoomMesh } from './RoomMesh';
import { cssVar } from '../../styles/theme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type CameraView = 'perspective' | 'top' | 'walk';

export interface EditorCanvasHandle {
  capture(): string | null;
  /** The current view as a JPEG, ready to send to the photo model. */
  captureJpeg(quality: number): Promise<Blob | null>;
}

interface EditorCanvasProps {
  scene: SceneData;
  pricing: Pricing;
  selection: string[];
  readOnly: boolean;
  view: CameraView;
  corner: number;
  guides: boolean;
  clashing: Set<string>;
  /** Time of day picked in the room panel; without one the room keeps the plain studio light. */
  daylight?: DaylightPreset;
  /** Hides selection and clash markers so a capture shows only the room. */
  clean?: boolean;
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
const LOOK_AT = new Vector3(0, 0.3, 0);
const snap = (value: number) => Math.round(value / config.editor.snap) * config.editor.snap;

const HALF_FOV = Math.tan(((FOV / 2) * Math.PI) / 180);

const WALK_FOV = 70;
function cameraPosition(view: CameraView, room: SceneData['room'], aspect = 1.4, corner = 0): [number, number, number] {
  if (view === 'walk') return walkPose(room, corner).eye.toArray();
  if (view === 'top') {
    const distance = Math.max(room.length / 2 / HALF_FOV, room.width / 2 / (HALF_FOV * aspect)) * 1.12;
    return [0, distance + room.height, 0.01];
  }
  const radius = Math.hypot(room.width, room.length) / 2;
  const distance = (radius * 1.2) / (HALF_FOV * Math.min(1, aspect));
  const direction = new Vector3(0.42, 0.8, 1).normalize().multiplyScalar(distance);
  return [direction.x, direction.y, direction.z];
}

function CameraRig({
  view,
  corner,
  room,
  controls,
}: {
  view: CameraView;
  corner: number;
  room: SceneData['room'];
  controls: React.RefObject<OrbitControlsImpl>;
}) {
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height));
  const goal = useRef<Vector3 | null>(null);
  const focus = useRef<Vector3>(LOOK_AT);
  const still = useReducedMotion();
  const { width, length, height } = room;

  useEffect(() => {
    const shape = { width, length, height } as SceneData['room'];
    goal.current = new Vector3(...cameraPosition(view, shape, aspect, corner));
    focus.current = view === 'walk' ? walkPose(shape, corner).focus : LOOK_AT;
  }, [view, corner, width, length, height, aspect]);

  useFrame(({ camera }, delta) => {
    const fov = view === 'walk' ? WALK_FOV : FOV;
    if (camera instanceof PerspectiveCamera && camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    const target = goal.current;
    if (!target) return;
    const blend = still ? 1 : 1 - Math.exp(-delta * 5);
    camera.position.lerp(target, blend);
    controls.current?.target.lerp(focus.current, blend);
    controls.current?.update();
    if (camera.position.distanceTo(target) < 0.005) goal.current = null;
  });
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
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
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

function SelectionMarker({
  node,
  offset,
  tone = '--primary',
}: {
  node: SceneNodeData;
  offset: [number, number];
  tone?: string;
}) {
  const bounds = nodeBounds(node);
  const width = bounds.maxX - bounds.minX + 0.12;
  const depth = bounds.maxZ - bounds.minZ + 0.12;
  const color = cssVar(tone);
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

function WindowGlow({ light, color, intensity }: { light: WindowLight; color: string; intensity: number }) {
  const target = useMemo(() => new Object3D(), []);
  return (
    <>
      <primitive object={target} position={light.target} />
      <spotLight
        position={light.position}
        target={target}
        color={color}
        intensity={intensity}
        angle={0.85}
        penumbra={0.9}
        distance={6}
      />
    </>
  );
}

export const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(function EditorCanvas(
  { scene, pricing, selection, readOnly, view, corner, guides, clashing, daylight, clean = false, onSelect, onMove },
  ref,
) {
  const controls = useRef<OrbitControlsImpl>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const { room, lighting } = scene;
  const size = Math.max(room.width, room.length);
  const background = useMemo(() => cssVar('--bg'), []);
  const glow = lighting.intensity;
  const ambient = daylight ? daylight.ambient_intensity : 1;
  const sunColor = daylight?.sun_color ?? lighting.color;
  const sun: [number, number, number] = daylight
    ? sunPosition(daylight, size * 3)
    : [room.width * 0.25, room.height * 3.2, room.length * 0.35];
  const windows = useMemo(
    () =>
      daylight?.window_intensity
        ? windowLights(scene.nodes, config.editor.windowSill, config.editor.maxSceneLights)
        : [],
    [daylight, scene.nodes],
  );
  const lamps = useMemo(
    () => (daylight?.lamp_intensity ? lampLights(scene.nodes, config.editor.maxSceneLights) : []),
    [daylight, scene.nodes],
  );

  useImperativeHandle(
    ref,
    () => ({
      capture: () => canvas.current?.toDataURL('image/png') ?? null,
      captureJpeg: (quality) =>
        new Promise((resolve) => {
          const element = canvas.current;
          if (!element) resolve(null);
          else element.toBlob(resolve, 'image/jpeg', quality);
        }),
    }),
    [],
  );

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
      <SoftShadows size={22} samples={12} focus={0.5} />
      <hemisphereLight
        args={[daylight?.sky_color ?? cssVar('--scene-sky'), cssVar('--scene-ground'), 0.8 * glow * ambient]}
      />
      <ambientLight intensity={0.25 * glow * ambient} color={daylight?.ambient_color ?? lighting.color} />
      <directionalLight
        position={sun}
        intensity={1.5 * glow * (daylight ? daylight.sun_intensity : 1)}
        color={sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-size}
        shadow-camera-right={size}
        shadow-camera-top={size}
        shadow-camera-bottom={-size}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <pointLight
        position={[0, room.height - 0.3, 0]}
        intensity={0.6 * glow * ambient}
        color={lighting.color}
        distance={size * 2}
      />
      {windows.map((light) => (
        <WindowGlow
          key={light.id}
          light={light}
          color={sunColor}
          intensity={(daylight?.window_intensity ?? 0) * glow}
        />
      ))}
      {lamps.map((lamp) => (
        <pointLight
          key={lamp.id}
          position={lamp.position}
          color={lighting.color}
          intensity={(daylight?.lamp_intensity ?? 0) * glow}
          distance={5}
        />
      ))}

      <Environment resolution={128} environmentIntensity={0.5 * glow * ambient}>
        <Lightformer
          form="rect"
          intensity={2}
          color={lighting.color}
          position={[0, 5, 0]}
          scale={[10, 10, 1]}
          rotation-x={Math.PI / 2}
        />
        <Lightformer form="rect" intensity={0.8} position={[-5, 2, 3]} scale={[6, 3, 1]} rotation-y={Math.PI / 2} />
        <Lightformer
          form="rect"
          intensity={1.6}
          color={cssVar('--scene-light')}
          position={[4, 2.2, -3]}
          scale={[3, 2.2, 1]}
          rotation-y={-Math.PI / 3}
        />
      </Environment>

      <RoomMesh room={room} materials={pricing.materials} />
      <ContactShadows position={[0, 0.005, 0]} scale={size * 1.4} opacity={0.45} blur={2.6} far={2} resolution={512} />

      {scene.nodes.map((node) => {
        const offset: [number, number] = drag?.id === node.id ? drag.delta : [0, 0];
        return (node.kind === 'group' ? flattenItems(node.children) : [node]).map((item) => (
          <FurnitureMesh
            key={item.id}
            item={item}
            pricing={pricing}
            offset={offset}
            sky={daylight?.sky_color}
            onPointerDown={(event) => startDrag(node, event)}
          />
        ));
      })}

      {scene.nodes
        .filter((node) => !clean && clashing.has(node.id) && !selection.includes(node.id))
        .map((node) => (
          <SelectionMarker
            key={node.id}
            node={node}
            offset={drag?.id === node.id ? drag.delta : [0, 0]}
            tone="--danger"
          />
        ))}
      {(clean ? [] : selectedNodes).map((node) => (
        <SelectionMarker
          key={node.id}
          node={node}
          offset={drag?.id === node.id ? drag.delta : [0, 0]}
          tone={clashing.has(node.id) ? '--danger' : '--primary'}
        />
      ))}

      {!clean && (guides || drag) && (
        <MeasureGuides
          room={room}
          node={selectedNodes.length === 1 ? selectedNodes[0] : undefined}
          offset={drag && drag.id === selectedNodes[0]?.id ? drag.delta : [0, 0]}
          showRoom={guides}
        />
      )}

      <DragController active={drag !== null} dragRef={dragRef} room={room} onDrag={updateDrag} onDrop={drop} />
      <OrbitControls
        ref={controls}
        makeDefault
        target={[0, 0.4, 0]}
        maxPolarAngle={view === 'walk' ? Math.PI * 0.8 : Math.PI / 2.15}
        minDistance={view === 'walk' ? LOOK_AHEAD * 0.5 : 1.5}
        maxDistance={view === 'walk' ? LOOK_AHEAD : size * 4}
        enableZoom={view !== 'walk'}
        enablePan={view !== 'walk'}
        rotateSpeed={view === 'walk' ? -0.4 : 1}
        enableDamping
      />
      <CameraRig view={view} corner={corner} room={room} controls={controls} />
    </Canvas>
  );
});
