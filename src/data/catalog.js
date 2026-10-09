export const STYLES = {
  modern: { label: 'Moderno', description: 'Líneas limpias y tonos neutros', swatch: ['#d9d4cc', '#5c5c5c', '#1f1f1f'] },
  nordic: { label: 'Nórdico', description: 'Madera clara, blanco y luz', swatch: ['#f4efe6', '#d8c3a5', '#8aa29e'] },
  industrial: { label: 'Industrial', description: 'Metal, ladrillo y tonos oscuros', swatch: ['#a0522d', '#4a4a48', '#2b2b2b'] },
  bohemian: { label: 'Bohemio', description: 'Texturas, plantas y calidez', swatch: ['#e07a5f', '#f2cc8f', '#3d805b'] },
  minimalist: { label: 'Minimalista', description: 'Solo lo esencial', swatch: ['#ffffff', '#ece8e1', '#bdb5aa'] },
};

export const ROOM_TYPES = {
  bedroom: { label: 'Dormitorio', icon: '🛏️' },
  living_room: { label: 'Sala', icon: '🛋️' },
  kitchen: { label: 'Cocina', icon: '🍳' },
  bathroom: { label: 'Baño', icon: '🛁' },
  dining_room: { label: 'Comedor', icon: '🍽️' },
  office: { label: 'Oficina', icon: '💻' },
};

export const COLOR_PRESETS = [
  '#f4efe6', '#d8c3a5', '#8aa29e', '#3d805b', '#e07a5f',
  '#f2cc8f', '#b4532a', '#5c6b8a', '#4a4a48', '#1f1f1f',
];

export const MAX_COLORS = 5;

export const SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200';

export const PATTERNS = [
  { name: 'Singleton', kind: 'Creacional', where: 'Conexión a PostgreSQL y cliente HTTP del frontend', icon: '①' },
  { name: 'Builder', kind: 'Creacional', where: 'Arma y valida la solicitud de remodelación paso a paso', icon: '🧱' },
  { name: 'Abstract Factory', kind: 'Creacional', where: 'Cada proveedor de IA crea su analizador y su generador', icon: '🏭' },
  { name: 'Adapter', kind: 'Estructural', where: 'Traduce la API del servicio de IA externo al formato interno', icon: '🔌' },
  { name: 'Decorator', kind: 'Estructural', where: 'Agrega reintentos y registro de tiempos al generador de imágenes', icon: '🎀' },
];
