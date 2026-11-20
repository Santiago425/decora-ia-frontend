// Reads design tokens from tokens.css for code that needs real color values (Three.js, Mermaid).
export function cssVar(name: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function cssVars<K extends string>(names: Record<K, string>): Record<K, string> {
  return Object.fromEntries(Object.entries<string>(names).map(([key, name]) => [key, cssVar(name)])) as Record<
    K,
    string
  >;
}
