import { config } from '../config';

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith('/') ? `${config.apiOrigin}${url}` : url;
}

export async function downloadImage(url: string, filename: string): Promise<void> {
  const response = await fetch(url, { credentials: 'omit' });
  if (!response.ok) throw new Error('No pudimos descargar la imagen');
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
