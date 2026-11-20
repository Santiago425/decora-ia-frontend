import { describe, expect, it } from 'vitest';
import { projectLabel, projectPath } from './projectRoute';

describe('projectPath', () => {
  it('opens photo projects in their redesign view', () => {
    const project = { id: 'p1', name: 'Sala japandi', redesign_count: 2 };
    expect(projectPath(project)).toBe('/redesign?project=p1');
    expect(projectLabel(project)).toBe('Ver el rediseño de Sala japandi');
  });

  it('opens empty projects in the 3D editor', () => {
    const project = { id: 'p2', name: 'Dormitorio', redesign_count: 0 };
    expect(projectPath(project)).toBe('/editor/p2');
    expect(projectLabel(project)).toBe('Abrir Dormitorio en el editor 3D');
  });
});
