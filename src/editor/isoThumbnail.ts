import { darken, lighten } from '../utils/color';
import type { Part } from './furnitureFactory';

export interface IsoShape {
  kind: 'polygon' | 'ellipse';
  points?: string;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  fill: string;
}

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

const project = (x: number, y: number, z: number): [number, number] => [(x - z) * COS, (x + z) * SIN - y];

/** Footprint of any part as an axis-aligned box: [width, height, depth]. */
function boxSize(part: Part): [number, number, number] {
  if (part.geometry === 'box') return part.size;
  if (part.geometry === 'cylinder') {
    const radius = Math.max(part.size[0], part.size[2]);
    return [radius * 2, part.size[1], radius * 2];
  }
  const diameter = part.size[0] * 2;
  return [diameter, diameter, diameter];
}

function boxFaces(part: Part): IsoShape[] {
  const [w, h, d] = boxSize(part);
  const [cx, cy, cz] = part.position;
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y0 = cy - h / 2;
  const y1 = cy + h / 2;
  const z0 = cz - d / 2;
  const z1 = cz + d / 2;
  const poly = (corners: [number, number, number][], fill: string): IsoShape => ({
    kind: 'polygon',
    points: corners
      .map((c) =>
        project(...c)
          .map((v) => v.toFixed(3))
          .join(','),
      )
      .join(' '),
    fill,
  });
  return [
    poly(
      [
        [x0, y1, z0],
        [x1, y1, z0],
        [x1, y1, z1],
        [x0, y1, z1],
      ],
      lighten(part.color, 0.12),
    ),
    poly(
      [
        [x0, y1, z1],
        [x1, y1, z1],
        [x1, y0, z1],
        [x0, y0, z1],
      ],
      part.color,
    ),
    poly(
      [
        [x1, y1, z0],
        [x1, y1, z1],
        [x1, y0, z1],
        [x1, y0, z0],
      ],
      darken(part.color, 0.18),
    ),
  ];
}

function sphereShape(part: Part): IsoShape {
  const [cx, cy] = project(...part.position);
  const radius = part.size[0];
  return { kind: 'ellipse', cx, cy, rx: radius, ry: radius, fill: part.color };
}

/** Flat isometric drawing of a furniture model, painted back to front so nearer parts cover farther ones. */
export function isoThumbnail(parts: Part[]): { shapes: IsoShape[]; viewBox: string } {
  const ordered = [...parts]
    .filter((part) => (part.opacity ?? 1) > 0.2)
    .sort((a, b) => a.position[0] + a.position[2] - (b.position[0] + b.position[2]) || a.position[1] - b.position[1]);
  const shapes = ordered.flatMap((part) => (part.geometry === 'sphere' ? [sphereShape(part)] : boxFaces(part)));

  const xs: number[] = [];
  const ys: number[] = [];
  for (const part of ordered) {
    const [w, h, d] = boxSize(part);
    const [cx, cy, cz] = part.position;
    for (const x of [cx - w / 2, cx + w / 2])
      for (const y of [cy - h / 2, cy + h / 2])
        for (const z of [cz - d / 2, cz + d / 2]) {
          const [px, py] = project(x, y, z);
          xs.push(px);
          ys.push(py);
        }
  }
  if (!xs.length) return { shapes, viewBox: '-1 -1 2 2' };
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const width = Math.max(...xs) - minX;
  const height = Math.max(...ys) - minY;
  const side = Math.max(width, height) * 1.15;
  const viewBox = [minX + width / 2 - side / 2, minY + height / 2 - side / 2, side, side]
    .map((v) => v.toFixed(3))
    .join(' ');
  return { shapes, viewBox };
}
