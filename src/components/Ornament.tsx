import { cn } from '@/lib/cn';

/** Gold divider: two hairlines and a small diamond with dots. Decorative only. */
export const Ornament = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 240 20" className={cn('h-5 w-60 text-accent', className)} aria-hidden>
    <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M8 10H96" opacity="0.7" />
      <path d="M144 10H232" opacity="0.7" />
      <path d="M120 2L128 10L120 18L112 10Z" />
      <path d="M120 6L124 10L120 14L116 10Z" fill="currentColor" stroke="none" />
    </g>
    <circle cx="104" cy="10" r="1.8" fill="currentColor" />
    <circle cx="136" cy="10" r="1.8" fill="currentColor" />
  </svg>
);
