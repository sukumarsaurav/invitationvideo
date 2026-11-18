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

  return (
    <div className="flex min-h-dvh flex-col">
      <div className={cn(detail && 'max-md:hidden')}>
        <AnnouncementBar />
      </div>
      <header className={cn('sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur', detail && 'max-md:hidden')}>
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 pl-4 pr-2 md:gap-6 md:px-6">
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
          <div className="ml-auto flex items-center md:ml-0">
            <Link to="/templates?search=1" className={iconBtn} aria-label={t('Search templates')}>
              <Search className="size-6" />
            </Link>
            <button onClick={() => setDrawerOpen(true)} className={iconBtn} aria-label={t('Open menu')}>
              <Menu className="size-7" />
            </button>
          </div>
        </div>
      </header>

      <main key={pathname} className="page-in mx-auto w-full max-w-6xl flex-1">
        <Outlet />
      </main>

      {detail ? null : <Footer />}
      {detail ? null : <BottomTabBar />}
      <AppDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
};
