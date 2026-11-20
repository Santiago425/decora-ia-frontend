import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
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
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, block }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
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

export function ButtonLink({ variant, size, block, className, ...rest }: ButtonStyleProps & LinkProps) {
  return <Link className={buttonClass({ variant, size, block }, className)} {...rest} />;
}
