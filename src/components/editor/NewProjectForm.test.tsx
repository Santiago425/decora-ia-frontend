// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { DesignStyle, RoomType } from '../../types/catalog';
import { NewProjectForm } from './NewProjectForm';

const ROOMS: RoomType[] = [{ id: 1, slug: 'living-room', name: 'Sala', icon: 'sofa' }];
const STYLES = [{ id: 1, slug: 'nordic', name: 'Nórdico', palettes: [], materials: [] } as unknown as DesignStyle];

describe('NewProjectForm', () => {
  it('brings the name field back into view when it is missing', async () => {
    const onCreate = vi.fn();
    render(<NewProjectForm roomTypes={ROOMS} styles={STYLES} busy={false} onCreate={onCreate} />);
    await userEvent.click(screen.getByRole('button', { name: /Crear y abrir el editor/ }));

    const name = screen.getByLabelText('Nombre del proyecto');
    expect(document.activeElement).toBe(name);
    expect(screen.getByRole('alert').textContent).toBe('Ponle un nombre a tu proyecto (mínimo 2 letras)');
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('creates the project with the chosen room and style', async () => {
    const onCreate = vi.fn();
    render(<NewProjectForm roomTypes={ROOMS} styles={STYLES} busy={false} onCreate={onCreate} />);
    await userEvent.type(screen.getByLabelText('Nombre del proyecto'), 'Sala de Ana{Enter}');
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Sala de Ana', room_type: 'living-room', style: 'nordic', furnished: true }),
    );
  });
});
