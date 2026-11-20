import {
  Archive,
  Armchair,
  Bath,
  BedDouble,
  Box,
  ChefHat,
  DoorClosed,
  DoorOpen,
  Droplets,
  Flame,
  Grid2x2,
  Lamp,
  LampDesk,
  Library,
  Monitor,
  RectangleHorizontal,
  Refrigerator,
  ScanFace,
  ShowerHead,
  Sofa,
  Sprout,
  Table,
  Toilet,
  Tv,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import { createElement } from 'react';

const ICONS: Record<string, LucideIcon> = {
  sofa: Sofa,
  'bed-double': BedDouble,
  table: Table,
  armchair: Armchair,
  lamp: Lamp,
  library: Library,
  'rectangle-horizontal': RectangleHorizontal,
  sprout: Sprout,
  monitor: Monitor,
  archive: Archive,
  toilet: Toilet,
  droplets: Droplets,
  bath: Bath,
  'shower-head': ShowerHead,
  'scan-face': ScanFace,
  refrigerator: Refrigerator,
  flame: Flame,
  'chef-hat': ChefHat,
  'lamp-desk': LampDesk,
  'door-closed': DoorClosed,
  tv: Tv,
  door: DoorOpen,
  window: Grid2x2,
};

export const categoryIcon = (name: string | undefined): LucideIcon => (name && ICONS[name]) || Box;

export function CategoryIcon({ name, ...props }: { name: string | undefined } & LucideProps) {
  return createElement(categoryIcon(name), props);
}
