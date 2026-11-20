export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'glass';
export type ButtonSize = 'md' | 'lg';

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

export function buttonClass({ variant = 'primary', size = 'md', block }: ButtonStyleProps, extra?: string): string {
  return ['button', `button-${variant}`, size === 'lg' && 'button-large', block && 'button-block', extra]
    .filter(Boolean)
    .join(' ');
}
