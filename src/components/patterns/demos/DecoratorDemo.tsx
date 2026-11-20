import { useState } from 'react';
import { BaseFurniture, ServiceDecorator, type PricedFurniture } from '../../../editor/furnitureDecorators';
import type { FurnitureAddon } from '../../../types/catalog';
import type { SceneItemData } from '../../../types/project';
import { formatCurrency } from '../../../utils/format';
import { Chip, ChipGroup } from '../../ui';

const sofa = { kind: 'item', id: 'demo-sofa', name: 'Sofá', price: 650, color: '#8a9a7b' } as SceneItemData;

const addon = (slug: string, name: string, price: string): FurnitureAddon => ({
  id: 0,
  slug,
  name,
  description: '',
  price,
  visual: 'none',
  color_hex: null,
  categories: [],
});

const EXTRAS = [addon('cushions', 'Cojines', '45'), addon('throw', 'Manta', '30'), addon('assembly', 'Armado', '25')];

export function DecoratorDemo() {
  const [chosen, setChosen] = useState<string[]>([]);
  const furniture = EXTRAS.filter((extra) => chosen.includes(extra.slug)).reduce<PricedFurniture>(
    (inner, extra) => new ServiceDecorator(inner, extra, sofa),
    new BaseFurniture(sofa),
  );
  const toggle = (slug: string) =>
    setChosen((current) => (current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]));

  return (
    <div className="demo">
      <ChipGroup label="Complementos" className="chips-scroll">
        {EXTRAS.map((extra) => (
          <Chip
            key={extra.slug}
            className="chip-sm"
            selected={chosen.includes(extra.slug)}
            onClick={() => toggle(extra.slug)}
          >
            + {extra.name}
          </Chip>
        ))}
      </ChipGroup>
      <p className="demo-result">
        {furniture.labels().join(' + ')} = <strong>{formatCurrency(furniture.price())}</strong>
      </p>
      <p className="demo-note">Cada complemento envuelve al anterior y suma su precio sin tocar la clase del sofá.</p>
    </div>
  );
}
