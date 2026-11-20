// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Tabs, type TabItem } from './Tabs';

type View = 'grid' | 'list' | 'map';

const ITEMS: TabItem<View>[] = [
  { value: 'grid', label: 'Cuadrícula' },
  { value: 'list', label: 'Lista' },
  { value: 'map', label: 'Plano' },
];

function Harness() {
  const [value, setValue] = useState<View>('grid');
  return <Tabs items={ITEMS} value={value} onChange={setValue} label="Vista" />;
}

const selected = () => screen.getByRole('tab', { selected: true }).textContent;

describe('Tabs', () => {
  it('exposes a labelled tablist with only the selected tab focusable', () => {
    render(<Harness />);
    expect(screen.getByRole('tablist', { name: 'Vista' })).toBeTruthy();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
  });

  it('selects a tab on click', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('tab', { name: 'Lista' }));
    expect(selected()).toBe('Lista');
  });

  it('moves with the arrow keys, wraps around and jumps with Home and End', async () => {
    render(<Harness />);
    screen.getByRole('tab', { name: 'Cuadrícula' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(selected()).toBe('Plano');
    expect(document.activeElement?.textContent).toBe('Plano');
    await userEvent.keyboard('{ArrowRight}');
    expect(selected()).toBe('Cuadrícula');
    await userEvent.keyboard('{End}');
    expect(selected()).toBe('Plano');
    await userEvent.keyboard('{Home}');
    expect(selected()).toBe('Cuadrícula');
  });
});
