import {
  Archive,
  Armchair,
  BedDouble,
  Box,
  Lamp,
  Library,
  Monitor,
  RectangleHorizontal,
  Sofa,
  Sprout,
  Table,
  type LucideIcon,
} from 'lucide-react';

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
};

export const categoryIcon = (name: string | undefined): LucideIcon => (name && ICONS[name]) || Box;
