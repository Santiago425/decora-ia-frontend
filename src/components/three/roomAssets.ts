import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { cssVars } from '../../styles/theme';

export const roomPalette = () =>
  cssVars({
    wall: '--scene-wall',
    floor: '--scene-floor',
    rug: '--scene-rug',
    sofa: '--scene-sofa',
    wood: '--wood',
    plant: '--scene-plant',
    pot: '--scene-pot',
    metal: '--scene-metal',
    light: '--scene-light',
    sky: '--scene-sky',
    ground: '--scene-ground',
    primary: '--primary',
    accent2: '--chart-2',
    accent3: '--chart-3',
  });

export type RoomPalette = ReturnType<typeof roomPalette>;

function canvasTexture(size: number, paint: (context: CanvasRenderingContext2D, size: number) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) paint(context, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Oak planks drawn on a canvas, tinted from the floor token. */
export function usePlankTexture(color: string, repeat = 2) {
  return useMemo(() => {
    const texture = canvasTexture(512, (context, size) => {
      const rows = 8;
      const rowHeight = size / rows;
      for (let row = 0; row < rows; row += 1) {
        let x = -((row * 97) % 180);
        while (x < size) {
          const length = 160 + ((row * 53 + x) % 120);
          context.fillStyle = color;
          context.fillRect(x, row * rowHeight, length, rowHeight);
          context.fillStyle = `rgb(0 0 0 / ${0.03 + ((row + Math.abs(x)) % 5) * 0.018})`;
          context.fillRect(x, row * rowHeight, length, rowHeight);
          context.fillStyle = 'rgb(0 0 0 / 0.16)';
          context.fillRect(x, row * rowHeight, 2, rowHeight);
          x += length;
        }
        context.fillStyle = 'rgb(0 0 0 / 0.14)';
        context.fillRect(0, row * rowHeight, size, 2);
      }
    });
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(repeat, repeat);
    return texture;
  }, [color, repeat]);
}

export function useBlobTexture() {
  return useMemo(
    () =>
      canvasTexture(128, (context, size) => {
        const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgb(0 0 0 / 0.42)');
        gradient.addColorStop(0.55, 'rgb(0 0 0 / 0.16)');
        gradient.addColorStop(1, 'rgb(0 0 0 / 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
      }),
    [],
  );
}
