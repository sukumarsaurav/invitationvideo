import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'outline' | 'ghost' | 'gold';

const styles: Record<Variant, string> = {
  primary: 'bg-primary text-white active:bg-primary-dark disabled:bg-border disabled:text-muted',
  gold: 'bg-accent text-ink active:brightness-95 disabled:bg-border disabled:text-muted',
  outline: 'border border-border bg-surface text-ink active:bg-background disabled:opacity-50',
  ghost: 'text-ink active:bg-surface disabled:opacity-50',
};

export const Button = ({
  variant = 'primary',
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) => (
  <button
    className={cn(
      'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-button px-5 text-[15px] font-semibold transition-[color,background-color,transform] duration-100 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100',
      styles[variant],
      className,
    )}
    {...rest}
  />
);
