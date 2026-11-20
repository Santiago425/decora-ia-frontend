type Rgb = [number, number, number];

function channels(hex: string): Rgb {
  const value = parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b]
    .map((c) =>
      Math.round(Math.min(255, Math.max(0, c)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];

function mixChannels(a: Rgb, b: Rgb, amount: number): string {
  return toHex([a[0] + (b[0] - a[0]) * amount, a[1] + (b[1] - a[1]) * amount, a[2] + (b[2] - a[2]) * amount]);
}

export const mixColors = (from: string, to: string, amount: number) =>
  mixChannels(channels(from), channels(to), amount);
export const lighten = (hex: string, amount: number) => mixChannels(channels(hex), WHITE, amount);
export const darken = (hex: string, amount: number) => mixChannels(channels(hex), BLACK, amount);
