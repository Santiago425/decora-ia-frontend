/** Rotates a list so it starts at a given position. */
export function startAt<T>(items: T[], start: number): T[] {
  if (items.length === 0) return items;
  const offset = ((start % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}
