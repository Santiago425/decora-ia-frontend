// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SceneRender } from '../../types/project';
import { PhotoRenderDialog } from './PhotoRenderDialog';

const service = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn() }));
vi.mock('../../services/sceneRenderService', () => ({ sceneRenderService: service }));

const made = (changes: Partial<SceneRender> = {}): SceneRender => ({
  id: 'r1',
  project_id: 'p1',
  status: 'ready',
  capture_image_url: 'https://cdn.test/capture.jpg',
  result_image_url: 'https://cdn.test/photo.jpg',
  time_of_day: 'night',
  error_message: null,
  created_at: new Date().toISOString(),
  ...changes,
});

function setup() {
  const prepareCapture = vi.fn().mockResolvedValue(new Blob(['jpeg'], { type: 'image/jpeg' }));
  render(
    <PhotoRenderDialog open projectId="p1" projectName="Sala" prepareCapture={prepareCapture} onClose={vi.fn()} />,
  );
  return prepareCapture;
}

describe('PhotoRenderDialog', () => {
  beforeEach(() => {
    service.list.mockReset().mockResolvedValue([]);
    service.create.mockReset();
    URL.createObjectURL = vi.fn(() => 'blob:capture');
    URL.revokeObjectURL = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
  });

  it('sends a fresh capture and shows the photo next to the 3D view', async () => {
    service.create.mockResolvedValue(made());
    const prepareCapture = setup();
    await userEvent.click(await screen.findByRole('button', { name: /Crear foto real/ }));
    expect(prepareCapture).toHaveBeenCalledOnce();
    expect(service.create).toHaveBeenCalledWith('p1', expect.any(Blob));
    expect(await screen.findByRole('button', { name: /Descargar/ })).toBeTruthy();
    expect(screen.getByLabelText('Comparar antes y después')).toBeTruthy();
  });

  it('tells the user when the photo could not be made', async () => {
    service.create.mockResolvedValue(
      made({ status: 'error', result_image_url: null, error_message: 'La IA alcanzó su límite por ahora' }),
    );
    setup();
    await userEvent.click(await screen.findByRole('button', { name: /Crear foto real/ }));
    expect((await screen.findByRole('alert')).textContent).toContain('límite');
    expect(screen.getByRole('button', { name: /Intentar de nuevo/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Descargar/ })).toBeNull();
  });
});
