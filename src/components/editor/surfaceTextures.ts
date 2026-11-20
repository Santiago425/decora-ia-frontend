import { useEffect, useMemo, useState } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, TextureLoader, type Texture } from 'three';

/** Loads a material photo (texture_url from the catalog) as a tiled map; null until it loads or if it fails. */
export function useSurfaceTexture(url: string | null | undefined, repeatX: number, repeatY: number): Texture | null {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    if (!url) return;
    let alive = true;
    const loader = new TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      url,
      (loaded) => {
        if (!alive) return loaded.dispose();
        loaded.colorSpace = SRGBColorSpace;
        loaded.wrapS = loaded.wrapT = RepeatWrapping;
        loaded.anisotropy = 4;
        setTexture(loaded);
      },
      undefined,
      () => alive && setTexture(null),
    );
    return () => {
      alive = false;
      setTexture((current) => {
        current?.dispose();
        return null;
      });
    };
  }, [url]);

  useEffect(() => {
    texture?.repeat.set(repeatX, repeatY);
  }, [texture, repeatX, repeatY]);

  return url ? texture : null;
}

/** Vertical shade for the bottom of the walls, a cheap stand-in for ambient occlusion. */
export function useWallShade(): Texture {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createLinearGradient(0, 0, 0, 128);
      gradient.addColorStop(0, 'rgb(0 0 0 / 0)');
      gradient.addColorStop(1, 'rgb(0 0 0 / 0.22)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 4, 128);
    }
    return new CanvasTexture(canvas);
  }, []);
}
