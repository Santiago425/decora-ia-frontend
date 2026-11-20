import type { PointerEvent } from 'react';

/** Material-like ripple from the touch point; the span removes itself when its animation ends. */
export function ripple(event: PointerEvent<HTMLElement>): void {
  const host = event.currentTarget;
  if (host.matches(':disabled')) return;
  const box = host.getBoundingClientRect();
  const size = Math.max(box.width, box.height) * 2;
  const wave = document.createElement('span');
  wave.className = 'ripple';
  wave.style.width = wave.style.height = `${size}px`;
  wave.style.left = `${event.clientX - box.left - size / 2}px`;
  wave.style.top = `${event.clientY - box.top - size / 2}px`;
  wave.addEventListener('animationend', () => wave.remove());
  host.appendChild(wave);
}
