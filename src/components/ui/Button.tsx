import type { ButtonHTMLAttributes, PointerEvent, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { ripple } from '../motion/ripple';
import { buttonClass, type ButtonStyleProps } from './buttonClass';

type ButtonProps = ButtonStyleProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    loadingLabel?: ReactNode;
  };

export function Button({
  variant,
  size,
  block,
  loading,
  loadingLabel,
  className,
  disabled,
  children,
  type = 'button',
  onPointerDown,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, block }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        ripple(event);
        onPointerDown?.(event);
      }}
      {...rest}
    >
      {loading ? (
        <>
          <span className="spinner" aria-hidden="true" /> {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function ButtonLink({ variant, size, block, className, onPointerDown, ...rest }: ButtonStyleProps & LinkProps) {
  return (
    <Link
      className={buttonClass({ variant, size, block }, className)}
      onPointerDown={(event) => {
        ripple(event);
        onPointerDown?.(event);
      }}
      {...rest}
    />
  );
}
