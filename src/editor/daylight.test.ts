import { describe, expect, it } from 'vitest';
import type { SceneItemData } from '../types/project';
import { lampLights, sunPosition, windowLights } from './daylight';

const item = (shape: string, position: [number, number], rotation = 0, height = 1.2): SceneItemData => ({
  kind: 'item',
  id: `${shape}-${position.join('_')}`,
  furniture_id: null,
  name: shape,
  category: shape,
  shape,
  position,
  rotation,
  size: [1.2, 0.12, height],
  color: '#ffffff',
  price: 0,
  finish: null,
  addons: [],
});

describe('daylight', () => {
  it('places the sun from its elevation and azimuth', () => {
    const [x, y, z] = sunPosition({ sun_elevation: 90, sun_azimuth: 0 }, 10);
    expect(y).toBeCloseTo(10);
    expect(Math.abs(x) + Math.abs(z)).toBeCloseTo(0);
    const east = sunPosition({ sun_elevation: 0, sun_azimuth: 90 }, 10);
    expect(east[0]).toBeCloseTo(10);
    const back = sunPosition({ sun_elevation: 0, sun_azimuth: 0 }, 10);
    expect(back[2]).toBeCloseTo(-10);
  });

  it('aims each window light into the room', () => {
    const [back] = windowLights([item('window', [0, -1.94])], 0.9, 8);
    expect(back.position[1]).toBeCloseTo(1.5);
    expect(back.target[2]).toBeGreaterThan(back.position[2]);
    const [left] = windowLights([item('window', [-2.44, 0], 90)], 0.9, 8);
    expect(left.target[0]).toBeGreaterThan(left.position[0]);
  });

  it('lights only lamps and windows, up to the limit', () => {
    const nodes = [item('lamp', [1, 1], 0, 1.6), item('lamp', [-1, 1], 0, 1.6), item('sofa', [0, 0])];
    expect(lampLights(nodes, 1)).toHaveLength(1);
    expect(lampLights(nodes, 8)[0].position[1]).toBeCloseTo(1.48);
    expect(windowLights(nodes, 0.9, 8)).toHaveLength(0);
  });
});
