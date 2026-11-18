import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useDrafts } from '@/lib/drafts';
import { useI18n } from '@/lib/i18n';
import { NAV_ITEMS } from './nav';

/** Phone-only tab bar, fixed to the bottom and padded for the home indicator. */
export const BottomTabBar = () => {
  const waiting = useDrafts().drafts.some((d) => d.status === 'paid');
  const { t } = useI18n();
  return (
    <nav
      aria-label={t('Main')}
      className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur md:hidden"
    >
      <ul className="grid h-16 grid-cols-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'relative flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium',
                  isActive ? 'text-primary' : 'text-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon className="size-6" strokeWidth={isActive ? 2.4 : 1.8} fill={isActive ? 'currentColor' : 'none'} fillOpacity={0.12} />
                    {to === '/my-videos' && waiting ? (
                      <span className="absolute -right-1 -top-0.5 size-2.5 rounded-full border-2 border-surface bg-accent" />
                    ) : null}
                  </span>
                  {t(label)}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
