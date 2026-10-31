const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export function isAcceptedImage(file: File): boolean {
  return ACCEPTED.includes(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
}

export async function shrinkImage(file: Blob, maxSide: number, quality = 0.9): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No pudimos leer la foto'))), 'image/jpeg', quality),
  );
}
