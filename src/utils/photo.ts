import { config } from '../config';

/** Hosts that resize a photo on the fly through the `w` and `q` query parameters. */
const RESIZABLE_HOSTS = ['images.unsplash.com'];

function resizableUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    return RESIZABLE_HOSTS.includes(parsed.hostname) ? parsed : null;
  } catch {
    return null;
  }
}

/** Same photo asked at a given width (and the configured quality), when its host can resize it. */
export function sizedPhoto(url: string, width: number, quality = config.photo.quality): string {
  const parsed = resizableUrl(url);
  if (!parsed) return url;
  parsed.searchParams.set('w', String(width));
  parsed.searchParams.set('q', String(quality));
  return parsed.toString();
}

/** Responsive `srcset` so each screen downloads a sharp enough copy, up to full HD and beyond. */
export function photoSrcSet(url: string | null | undefined, widths = config.photo.widths): string | undefined {
  if (!url || !resizableUrl(url) || widths.length === 0) return undefined;
  return widths.map((width) => `${sizedPhoto(url, width)} ${width}w`).join(', ');
}

/** Props for a photo that fills its box: a crisp default `src` plus the responsive candidates. */
export function photoSources(url: string, sizes = '100vw') {
  const widths = config.photo.widths;
  const largest = widths.length > 0 ? Math.max(...widths) : 0;
  const srcSet = photoSrcSet(url, widths);
  return {
    src: largest ? sizedPhoto(url, Math.min(largest, config.photo.defaultWidth)) : url,
    srcSet,
    sizes: srcSet ? sizes : undefined,
  };
}
