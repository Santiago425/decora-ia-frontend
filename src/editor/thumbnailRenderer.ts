import {
  AmbientLight,
  Box3,
  BoxGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Sphere,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
} from 'three';
import { cssVar } from '../styles/theme';
import type { Part } from './furnitureFactory';

const FOV = 28;
// Seen from the front right and a little above, like a product photo.
const VIEW = new Vector3(0.9, 0.75, 1.35).normalize();

let renderer: WebGLRenderer | null | undefined;
const cache = new Map<string, string>();
const queue: { key: string; size: number; build: () => Part[]; resolve: (url: string | null) => void }[] = [];
let scheduled = false;

function sharedRenderer(): WebGLRenderer | null {
  if (renderer !== undefined) return renderer;
  try {
    if (typeof document === 'undefined' || typeof WebGLRenderingContext === 'undefined') throw new Error('no WebGL');
    renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setPixelRatio(1);
  } catch {
    renderer = null;
  }
  return renderer;
}

/** True when this browser can draw real 3D previews; otherwise the flat isometric drawing is used. */
export const canRenderThumbnails = () => sharedRenderer() !== null;

function geometryOf(part: Part): BufferGeometry {
  const [a, b, c] = part.size;
  if (part.geometry === 'box') return new BoxGeometry(a, b, c);
  if (part.geometry === 'cylinder') return new CylinderGeometry(a, c, b, 32);
  return new SphereGeometry(a, 32, 20);
}

function buildScene(parts: Part[]): { scene: Scene; bounds: Sphere; floor: number } {
  const scene = new Scene();
  for (const part of parts) {
    const opacity = part.opacity ?? 1;
    const material = new MeshStandardMaterial({
      color: part.color,
      roughness: part.roughness ?? 0.7,
      metalness: part.metalness ?? 0,
      transparent: opacity < 1,
      opacity,
      emissive: part.emissive ? new Color(part.color) : new Color(0x000000),
      emissiveIntensity: part.emissive ?? 0,
    });
    const mesh = new Mesh(geometryOf(part), material);
    mesh.position.set(...part.position);
    scene.add(mesh);
  }
  const box = new Box3().setFromObject(scene);
  const bounds = box.getBoundingSphere(new Sphere());

  const shadow = new Mesh(
    new CircleGeometry(Math.max(box.max.x - box.min.x, box.max.z - box.min.z) * 0.46, 48),
    new MeshBasicMaterial({ color: cssVar('--scene-handle') || '#2b2b2b', transparent: true, opacity: 0.12 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(bounds.center.x, box.min.y + 0.001, bounds.center.z);
  scene.add(shadow);

  scene.add(new HemisphereLight(0xffffff, new Color(cssVar('--scene-ground') || '#d9c7ab'), 1.4));
  scene.add(new AmbientLight(0xffffff, 0.35));
  const sun = new DirectionalLight(new Color(cssVar('--scene-light') || '#fff1dc'), 2.2);
  sun.position.set(2, 4, 3);
  scene.add(sun);
  return { scene, bounds, floor: box.min.y };
}

function dispose(scene: Scene) {
  scene.traverse((object) => {
    if (object instanceof Mesh) {
      object.geometry.dispose();
      (object.material as MeshStandardMaterial).dispose();
    }
  });
}

/** Renders one model to a PNG data URL, or null when WebGL is not available. */
export function renderThumbnail(parts: Part[], size: number): string | null {
  const gl = sharedRenderer();
  if (!gl || !parts.length) return null;
  const { scene, bounds } = buildScene(parts);
  const camera = new PerspectiveCamera(FOV, 1, 0.01, 100);
  const distance = (bounds.radius / Math.sin(((FOV / 2) * Math.PI) / 180)) * 1;
  camera.position.copy(bounds.center).addScaledVector(VIEW, distance);
  camera.lookAt(bounds.center);
  gl.setSize(size, size, false);
  gl.setClearColor(0x000000, 0);
  gl.render(scene, camera);
  const url = gl.domElement.toDataURL('image/png');
  dispose(scene);
  return url;
}

function drain() {
  scheduled = false;
  const started = performance.now();
  // A few per frame keeps scrolling smooth while the list fills in.
  while (queue.length && performance.now() - started < 12) {
    const job = queue.shift();
    if (!job) break;
    const cached = cache.get(job.key);
    if (cached) {
      job.resolve(cached);
      continue;
    }
    const url = renderThumbnail(job.build(), job.size);
    if (url) cache.set(job.key, url);
    job.resolve(url);
  }
  if (queue.length) schedule();
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(drain);
}

export const cachedThumbnail = (key: string) => cache.get(key) ?? null;

/** Queues a render so long catalogs fill in frame by frame; repeated keys come from the cache. */
export function requestThumbnail(key: string, size: number, build: () => Part[]): Promise<string | null> {
  const cached = cache.get(key);
  if (cached) return Promise.resolve(cached);
  if (!canRenderThumbnails()) return Promise.resolve(null);
  return new Promise((resolve) => {
    queue.push({ key, size, build, resolve });
    schedule();
  });
}
