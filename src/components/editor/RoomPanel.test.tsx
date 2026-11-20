// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RoomComposite } from '../../editor/composite';
import { buildPricing } from '../../editor/furnitureDecorators';
import type { DaylightPreset, DesignStyle } from '../../types/catalog';
import type { SceneData } from '../../types/project';
import { RoomPanel } from './RoomPanel';

const style = (slug: string, name: string, lighting_color: string): DesignStyle => ({
  id: 1,
  slug,
  name,
  description: '',
  image_url: null,
  lighting_color,
  lighting_intensity: 1,
  palettes: [],
  materials: [],
});

const scene: SceneData = {
  format: 1,
  style: 'nordic',
  room: { width: 3, length: 3, height: 2.5, wall_material: null, floor_material: null },
  lighting: { color: '#fff6e8', intensity: 1 },
  nodes: [],
};

const preset = (slug: string, name: string): DaylightPreset => ({
  id: 1,
  slug,
  name,
  description: '',
  sun_color: '#ffe0b5',
  sun_intensity: 1,
  sun_elevation: 30,
  sun_azimuth: 90,
  ambient_color: '#dce8f5',
  ambient_intensity: 1,
  sky_color: '#cfe4f8',
  window_intensity: 5,
  lamp_intensity: 0,
});

function setup() {
  const onLighting = vi.fn();
  render(
    <RoomPanel
      composite={new RoomComposite(scene, buildPricing([], []))}
      styles={[
        style('nordic', 'Nórdico', '#FFF6E8'),
        style('japandi', 'Japandi', '#fff6e8'),
        style('industrial', 'Industrial', '#ffd9a8'),
      ]}
      materials={[]}
      daylight={[preset('morning', 'Mañana'), preset('night', 'Noche')]}
      disabled={false}
      onStyle={vi.fn()}
      onRoom={vi.fn()}
      onLighting={onLighting}
    />,
  );
  return onLighting;
}

describe('RoomPanel light tones', () => {
  it('offers one tone per distinct style lighting color and marks the current one', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Luz Nórdico' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByRole('button', { name: 'Luz Japandi' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Luz Industrial' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('changes only the light color and keeps the intensity', () => {
    const onLighting = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Luz Industrial' }));
    expect(onLighting).toHaveBeenCalledWith({ color: '#ffd9a8', intensity: 1 });
    fireEvent.click(screen.getByRole('button', { name: 'Luz Nórdico' }));
    expect(onLighting).toHaveBeenCalledTimes(1);
  });

  it('accepts any tone from the color picker', () => {
    const onLighting = setup();
    fireEvent.change(screen.getByLabelText('Elegir otro tono de luz'), { target: { value: '#cfe0ff' } });
    expect(onLighting).toHaveBeenCalledWith({ color: '#cfe0ff', intensity: 1 });
  });
});

describe('RoomPanel time of day', () => {
  it('starts with the studio light and switches to a time from the catalog', () => {
    const onLighting = setup();
    expect(screen.getByRole('button', { name: 'Estudio' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Noche' }));
    expect(onLighting).toHaveBeenCalledWith({ color: '#fff6e8', intensity: 1, time_of_day: 'night' });
    fireEvent.click(screen.getByRole('button', { name: 'Estudio' }));
    expect(onLighting).toHaveBeenCalledTimes(1);
  });
});
