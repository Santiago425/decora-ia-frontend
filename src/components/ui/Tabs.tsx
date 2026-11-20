import { useRef, type KeyboardEvent, type ReactNode } from 'react';

export interface TabItem<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  variant?: 'segmented' | 'chips';
  className?: string;
}

const NEXT_KEYS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
  variant = 'segmented',
  className,
}: TabsProps<T>) {
  const list = useRef<HTMLDivElement>(null);

  function focusTab(index: number) {
    const target = items[(index + items.length) % items.length];
    onChange(target.value);
    list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[items.indexOf(target)]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const current = items.findIndex((item) => item.value === value);
    if (event.key in NEXT_KEYS) focusTab(current + NEXT_KEYS[event.key]);
    else if (event.key === 'Home') focusTab(0);
    else if (event.key === 'End') focusTab(items.length - 1);
    else return;
    event.preventDefault();
  }

  return (
    <div
      ref={list}
      role="tablist"
      aria-label={label}
      className={['tabs', `tabs-${variant}`, className].filter(Boolean).join(' ')}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={variant === 'chips' ? 'chip' : 'tab'}
            onClick={() => onChange(item.value)}
            onKeyDown={onKeyDown}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
