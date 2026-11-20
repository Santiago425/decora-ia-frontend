// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Redesign } from '../../types/redesign';
import { RedesignVersions } from './RedesignVersions';

const version = (id: string) =>
  ({
    id,
    result_image_url: null,
    original_image_url: null,
    style: { slug: 'nordic', name: 'Nórdico' },
    edit_tool: null,
    inspiration_name: null,
  }) as unknown as Redesign;

describe('RedesignVersions', () => {
  it('asks to delete the chosen version with its label', () => {
    const onDelete = vi.fn();
    const onSelect = vi.fn();
    const versions = [version('b'), version('a')];
    render(<RedesignVersions versions={versions} current="b" onSelect={onSelect} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Versión 1' }));
    expect(onDelete).toHaveBeenCalledWith(versions[1], 'Versión 1');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('hides delete buttons when there is only one version', () => {
    render(<RedesignVersions versions={[version('a')]} current="a" onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Eliminar/ })).toBeNull();
  });
});
