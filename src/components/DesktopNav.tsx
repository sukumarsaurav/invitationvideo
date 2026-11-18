import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { groupIsActive, linkCount, MENU, type MenuGroup } from './menu';

/**
 * One header dropdown. Opens on hover (with a short delay so passing the mouse across the bar
 * doesn't flicker menus open) and on click or Enter/Space; closes on Escape, a click outside,
 * moving away, or picking a link.
 */
const Dropdown = ({ group, open, setOpen }: { group: MenuGroup; open: boolean; setOpen: (open: boolean) => void }) => {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const active = groupIsActive(group, pathname);
  const id = `menu-${group.label.toLowerCase()}`;

  const later = (next: boolean, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), ms);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);

  return (
    <div
      ref={ref}
      className="relative"
      onPointerEnter={(e) => e.pointerType === 'mouse' && later(true, 120)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && later(false, 180)}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          window.clearTimeout(timer.current);
          setOpen(!open);
        }}
        className={cn(
          'flex min-h-11 items-center gap-1 rounded-full px-3.5 font-display text-[17px] transition-colors xl:px-4',
          active || open ? 'text-primary' : 'text-ink hover:text-primary',
        )}
      >
        {t(group.label)}
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} strokeWidth={2.2} />
      </button>
      {open ? (
        <div id={id} className="absolute left-0 top-full z-30 pt-2">
          <ul className="min-w-60 rounded-card border border-border bg-surface p-2 shadow-[0_18px_40px_-16px_rgba(42,26,31,0.35)]">
            {group.links.map((link) => {
              const count = linkCount(link);
              const current = pathname === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setOpen(false)}
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      'flex min-h-10 items-center justify-between gap-4 rounded-[10px] px-3 text-[15px]',
                      current ? 'bg-primary/10 font-semibold text-primary' : 'text-ink hover:bg-background',
                    )}
                  >
                    {t(link.label)}
                    {count === 0 ? (
                      <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{t('Soon')}</span>
                    ) : count !== null ? (
                      <span className="text-xs text-muted tabular-nums">{count}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

/** Big screens: the category dropdowns in the header. Phones and tablets get the same list in the side drawer. */
export const DesktopNav = ({ className }: { className?: string }) => {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  // A new page closes any open menu.
  useEffect(() => setOpenLabel(null), [pathname]);

  return (
    <nav aria-label={t('Categories')} className={cn('items-center gap-0.5', className)}>
      {MENU.map((group) => (
        <Dropdown
          key={group.label}
          group={group}
          open={openLabel === group.label}
          setOpen={(open) => setOpenLabel((cur) => (open ? group.label : cur === group.label ? null : cur))}
        />
      ))}
    </nav>
  );
};
