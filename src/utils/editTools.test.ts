import { describe, expect, it } from 'vitest';
import type { EditTool, Redesign } from '../types/redesign';
import { initialValues, isEditReady, versionDetail } from './editTools';

const paint: EditTool = {
  key: 'wall_paint',
  label: 'Pintar paredes',
  description: '',
  fields: [{ key: 'color', label: 'Color', kind: 'color', placeholder: '', options: [] }],
};

const floor: EditTool = {
  key: 'floor_swap',
  label: 'Cambiar piso',
  description: '',
  fields: [
    {
      key: 'material',
      label: 'Material',
      kind: 'material',
      placeholder: '',
      options: [{ slug: 'floor_walnut', name: 'Nogal', color_hex: '#6b4a32', texture_url: null }],
    },
  ],
};

const replace: EditTool = {
  key: 'replace_furniture',
  label: 'Cambiar un mueble',
  description: '',
  fields: [
    { key: 'target', label: 'Actual', kind: 'text', placeholder: '', options: [] },
    { key: 'replacement', label: 'Nuevo', kind: 'text', placeholder: '', options: [] },
  ],
};

describe('targeted edit helpers', () => {
  it('only allows sending complete and valid values', () => {
    expect(isEditReady(paint, { color: '#2f5d50' })).toBe(true);
    expect(isEditReady(paint, { color: 'verde' })).toBe(false);
    expect(isEditReady(floor, { material: 'floor_walnut' })).toBe(true);
    expect(isEditReady(floor, { material: 'marble' })).toBe(false);
    expect(isEditReady(replace, { target: 'el sofá', replacement: '  ' })).toBe(false);
    expect(isEditReady(undefined, {})).toBe(false);
  });

  it('starts colors and materials with a sensible choice', () => {
    expect(initialValues(paint, '#a9b49a')).toEqual({ color: '#a9b49a' });
    expect(initialValues(floor)).toEqual({ material: 'floor_walnut' });
    expect(initialValues(replace)).toEqual({});
  });

  it('names edited versions by their tool', () => {
    const base = { status: 'ready', style: { slug: 'nordic', name: 'Nórdico' }, edit_tool: null } as Redesign;
    expect(versionDetail(base)).toBe('Nórdico');
    expect(versionDetail({ ...base, edit_tool: { slug: 'wall_paint', name: 'Pintar paredes' } })).toBe(
      'Pintar paredes',
    );
    expect(versionDetail({ ...base, status: 'error' })).toBe('Falló');
    expect(versionDetail({ ...base, inspiration_image_url: '/files/1', inspiration_name: 'Japandi' })).toBe('Japandi');
    expect(versionDetail({ ...base, inspiration_image_url: '/files/1', inspiration_name: null })).toBe('Inspiración');
  });
});
