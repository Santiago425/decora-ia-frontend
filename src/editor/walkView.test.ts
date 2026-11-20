import { describe, expect, it } from 'vitest';
import { LOOK_AHEAD, WALK_CORNERS, walkPose } from './walkView';

const room = { width: 5, length: 4, height: 2.7 };

describe('walkPose', () => {
  it('stands inside a corner at eye height', () => {
    const { eye } = walkPose(room, 0);
    expect(eye.x).toBeGreaterThan(0);
    expect(eye.x).toBeLessThan(room.width / 2);
    expect(eye.z).toBeGreaterThan(0);
    expect(eye.z).toBeLessThan(room.length / 2);
    expect(eye.y).toBeCloseTo(1.6);
  });

  it('looks a short step towards the middle of the room', () => {
    const { eye, focus } = walkPose(room, 2);
    expect(eye.distanceTo(focus)).toBeCloseTo(LOOK_AHEAD);
    expect(Math.abs(focus.x)).toBeLessThan(Math.abs(eye.x));
    expect(Math.abs(focus.z)).toBeLessThan(Math.abs(eye.z));
  });

  it('visits every corner and then starts over', () => {
    const corners = Array.from({ length: WALK_CORNERS }, (_, i) => walkPose(room, i).eye.toArray().join());
    expect(new Set(corners).size).toBe(WALK_CORNERS);
    expect(walkPose(room, WALK_CORNERS).eye.equals(walkPose(room, 0).eye)).toBe(true);
  });

  it('keeps the eye under a low ceiling', () => {
    expect(walkPose({ ...room, height: 2 }, 0).eye.y).toBeLessThan(2);
  });
});
