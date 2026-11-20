import type { ComponentType } from 'react';
import { CommandDemo } from './CommandDemo';
import { DecoratorDemo } from './DecoratorDemo';
import { ObserverDemo } from './ObserverDemo';
import { StrategyDemo } from './StrategyDemo';

export const PATTERN_DEMOS: Partial<Record<string, ComponentType>> = {
  'strategy-sort': StrategyDemo,
  command: CommandDemo,
  'decorator-addons': DecoratorDemo,
  observer: ObserverDemo,
};
