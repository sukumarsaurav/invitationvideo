import { Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useMatches } from 'react-router-dom';
import type { RouteHandle } from '@/App';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { AnnouncementBar } from './AnnouncementBar';
import { AppDrawer } from './AppDrawer';
import { BottomTabBar } from './BottomTabBar';
import { Footer } from './Footer';
import { LanguageSwitch } from './LanguageSwitch';
import { Logo } from './Logo';
import { NAV_ITEMS } from './nav';

const iconBtn = 'grid size-11 place-items-center rounded-full text-primary transition-transform active:scale-95';

/** Offer strip + header (logo left, search and menu right) + page + footer + phone tab bar. */
export const AppShell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const { t } = useI18n();
  // Detail screens draw their own back bar on phones and hide the tabs.
  const detail = useMatches().some((m) => (m.handle as RouteHandle | undefined)?.detailScreen);

  // iPhone notch / status bar (installed app, viewport-fit=cover): the page starts below it, a maroon
  // strip stays behind it, and the sticky header sticks just under it. Phone detail screens draw their own bar.
  return (
    <div className={cn('flex min-h-dvh flex-col pt-[env(safe-area-inset-top)]', detail && 'max-md:pt-0')}>
      <div aria-hidden className={cn('fixed inset-x-0 top-0 z-30 h-[env(safe-area-inset-top)] bg-primary', detail && 'max-md:hidden')} />
      <div className={cn(detail && 'max-md:hidden')}>
        <AnnouncementBar />
      </div>
      <header
        className={cn(
          'sticky top-[env(safe-area-inset-top)] z-20 border-b border-border bg-background/90 backdrop-blur',
          detail && 'max-md:hidden',
        )}
      >
        <div className="flex h-16 w-full items-center gap-2 pl-4 pr-2 md:gap-6 md:px-6 lg:px-10 2xl:px-16">
          <Logo />
          <nav aria-label={t('Main')} className="ml-auto hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn('rounded-full px-4 py-2 text-sm font-medium transition-colors', isActive ? 'bg-primary text-white' : 'text-ink hover:bg-surface')
                }
              >
                {t(label)}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center md:ml-0 md:gap-2">
            <Link to="/templates?search=1" className={iconBtn} aria-label={t('Search templates')}>
              <Search className="size-6" />
            </Link>
            {/* Desktop: language switch in the header (tablets: footer; phones: menu). */}
            <LanguageSwitch className="max-lg:hidden" />
            {/* The menu is for phones and tablets; desktop has the full nav above. */}
            <button onClick={() => setDrawerOpen(true)} className={cn(iconBtn, 'md:hidden')} aria-label={t('Open menu')}>
              <Menu className="size-7" />
            </button>
          </div>
        </div>
      </header>

      {/* Full width. Pages add px-4 / md:px-6; these extra gutters line content up with the header on big screens. */}
      <main key={pathname} className="page-in w-full flex-1 lg:px-4 2xl:px-10">
        <Outlet />
      </main>

      {detail ? null : <Footer />}
      {detail ? null : <BottomTabBar />}
      <AppDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
};
