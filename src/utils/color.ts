function channels(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('')}`;
}

export function mixColors(from: string, to: string, amount: number): string {
  const a = channels(from);
  const b = channels(to);
  return toHex([a[0] + (b[0] - a[0]) * amount, a[1] + (b[1] - a[1]) * amount, a[2] + (b[2] - a[2]) * amount]);
}

export const lighten = (hex: string, amount: number) => mixColors(hex, '#ffffff', amount);
export const darken = (hex: string, amount: number) => mixColors(hex, '#000000', amount);
