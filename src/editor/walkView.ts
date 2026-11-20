import { Vector3 } from 'three';
import { config } from '../config';
import type { RoomData } from '../types/project';

const WALL_CLEARANCE = 0.45;
export const LOOK_AHEAD = 0.6;
// Corners visited in turn by the walk view: front right, front left, back left, back right.
const CORNERS: [number, number][] = [
  [1, 1],
  [-1, 1],
  [-1, -1],
  [1, -1],
];
export const WALK_CORNERS = CORNERS.length;

// Walk view: standing in a corner of the room at eye height, looking towards the middle.
export function walkPose(
  room: Pick<RoomData, 'width' | 'length' | 'height'>,
  corner: number,
): { eye: Vector3; focus: Vector3 } {
  const [sx, sz] = CORNERS[corner % CORNERS.length];
  const eyeHeight = Math.min(config.editor.eyeHeight, room.height - 0.2);
  const eye = new Vector3(
    sx * Math.max(0, room.width / 2 - WALL_CLEARANCE),
    eyeHeight,
    sz * Math.max(0, room.length / 2 - WALL_CLEARANCE),
  );
  const ahead = new Vector3(0, eyeHeight * 0.7, 0).sub(eye).normalize().multiplyScalar(LOOK_AHEAD);
  return { eye, focus: eye.clone().add(ahead) };
}
