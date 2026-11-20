import { describe, expect, it } from 'vitest';
import { photoSources, photoSrcSet, sizedPhoto } from './photo';

const UNSPLASH = 'https://images.unsplash.com/photo-1?auto=format&fit=crop&w=1600&q=75';

describe('photo sizing', () => {
  it('rewrites the width and quality of resizable photos', () => {
    const url = new URL(sizedPhoto(UNSPLASH, 1920, 80));
    expect(url.searchParams.get('w')).toBe('1920');
    expect(url.searchParams.get('q')).toBe('80');
    expect(url.searchParams.get('fit')).toBe('crop');
  });

  it('leaves other photos untouched', () => {
    expect(sizedPhoto('/files/abc.jpg', 1920)).toBe('/files/abc.jpg');
    expect(photoSrcSet('https://example.com/a.jpg', [640])).toBeUndefined();
    expect(photoSrcSet(null)).toBeUndefined();
  });

  it('builds one candidate per width', () => {
    const srcSet = photoSrcSet(UNSPLASH, [960, 1920]) ?? '';
    expect(srcSet.split(', ')).toHaveLength(2);
    expect(srcSet).toContain('w=1920');
    expect(srcSet.endsWith('1920w')).toBe(true);
  });

  it('returns sizes only when there is a srcset', () => {
    expect(photoSources('/files/abc.jpg')).toEqual({ src: '/files/abc.jpg', srcSet: undefined, sizes: undefined });
    expect(photoSources(UNSPLASH, '50vw').sizes).toBe('50vw');
  });
});
