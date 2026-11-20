import type { DaylightPreset } from '../types/catalog';
import type { SceneItemData, SceneNodeData } from '../types/project';
import { flattenItems } from './sceneTree';

type Point = [number, number, number];

export interface WindowLight {
  id: string;
  position: Point;
  target: Point;
}

export interface LampLight {
  id: string;
  position: Point;
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const LIGHT_INSET = 0.25;
const WINDOW_REACH = 2.2;
const LAMP_DROP = 0.12;

/**
 * Where the sun sits for a preset, `distance` meters away from the middle of the room.
 * Azimuth 0 is behind the back wall and grows clockwise seen from above (90 is the right wall).
 */
export function sunPosition(preset: Pick<DaylightPreset, 'sun_elevation' | 'sun_azimuth'>, distance: number): Point {
  const elevation = toRadians(preset.sun_elevation);
  const azimuth = toRadians(preset.sun_azimuth);
  const flat = Math.cos(elevation) * distance;
  return [flat * Math.sin(azimuth), Math.sin(elevation) * distance, -flat * Math.cos(azimuth)];
}

/** A light just inside each window, aimed at the floor in front of it, so daylight seems to come in. */
export function windowLights(nodes: SceneNodeData[], sill: number, limit: number): WindowLight[] {
  return byShape(nodes, 'window', limit).map((item) => {
    const angle = toRadians(item.rotation);
    const [nx, nz] = [Math.sin(angle), Math.cos(angle)];
    const [x, z] = item.position;
    const middle = sill + item.size[2] / 2;
    return {
      id: item.id,
      position: [x + nx * LIGHT_INSET, middle, z + nz * LIGHT_INSET],
      target: [x + nx * WINDOW_REACH, 0, z + nz * WINDOW_REACH],
    };
  });
}

/** A warm point light under the shade of each lamp. */
export function lampLights(nodes: SceneNodeData[], limit: number): LampLight[] {
  return byShape(nodes, 'lamp', limit).map((item) => ({
    id: item.id,
    position: [item.position[0], Math.max(0.2, item.size[2] - LAMP_DROP), item.position[1]],
  }));
}

function byShape(nodes: SceneNodeData[], shape: string, limit: number): SceneItemData[] {
  return flattenItems(nodes)
    .filter((item) => item.shape === shape)
    .slice(0, Math.max(0, limit));
}
