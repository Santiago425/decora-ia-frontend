export type FloorSize = [number, number];

/** Parses "3x3,4x3.5" into [[3, 3], [4, 3.5]], skipping anything that is not two positive numbers. */
export function parseFloorSizes(values: string[]): FloorSize[] {
  return values
    .map((value) => value.toLowerCase().split('x').map(Number))
    .filter((parts): parts is FloorSize => parts.length === 2 && parts.every((n) => Number.isFinite(n) && n > 0));
}

export interface Range {
  min: number;
  max: number;
}

/** Same limits the API enforces on a scene's room. */
export const ROOM_LIMITS = {
  width: { min: 1.5, max: 20 },
  length: { min: 1.5, max: 20 },
  height: { min: 2, max: 5 },
} as const satisfies Record<string, Range>;

/** Same limits the API enforces on a furniture side. */
export const FURNITURE_LIMITS: Range = { min: 0.01, max: 10 };

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Range a furniture side can take: a share of its catalog size, never beyond the absolute limits. */
export function resizeRange(base: number, [minFactor, maxFactor]: [number, number], absolute: Range): Range {
  const min = round2(Math.max(absolute.min, base * minFactor));
  return { min, max: Math.max(min, round2(Math.min(absolute.max, base * maxFactor))) };
}

export const clamp = (value: number, { min, max }: Range) => Math.min(max, Math.max(min, value));

/** Reads a typed measure, accepting a comma as decimal separator. Returns null when it is not a number. */
export function parseMeasure(text: string): number | null {
  const value = Number(text.trim().replace(',', '.'));
  return text.trim() === '' || Number.isNaN(value) ? null : round2(value);
}
