import { Clapperboard, Menu, Search, UserRound } from 'lucide-react';
import { useCatalogue } from '@/lib/catalogue';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useMatches } from 'react-router-dom';
import type { RouteHandle } from '@/App';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useSiteSettings } from '@/lib/siteSettings';
import { AnnouncementBar } from './AnnouncementBar';
import { AppDrawer } from './AppDrawer';
import { BottomTabBar } from './BottomTabBar';
import { DesktopNav } from './DesktopNav';
import { Footer } from './Footer';
import { HeaderSearch } from './HeaderSearch';
import { LanguageSwitch } from './LanguageSwitch';
import { Logo } from './Logo';
import { NAV_ITEMS } from './nav';

const iconBtn = 'grid size-11 place-items-center rounded-full text-primary transition-transform active:scale-95';

/**
 * Offer strip + header + page + footer + phone tab bar.
 * Header: big screens (lg+) get category dropdowns, a search box, My Videos and Sign in;
 * tablets keep the four main links; phones and tablets open the categories in the side drawer.
 */
export const AppShell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { t } = useI18n();
  useCatalogue(); // re-render when the admin-published catalogue arrives
  const { maintenance } = useSiteSettings();
  // Detail screens draw their own back bar on phones and hide the tabs.
  const detail = useMatches().some((m) => (m.handle as RouteHandle | undefined)?.detailScreen);

  // iPhone notch / status bar (installed app, viewport-fit=cover): the page starts below it, a maroon
  // strip stays behind it, and the sticky header sticks just under it. Phone detail screens draw their own bar.
  return (
    <div className={cn('flex min-h-dvh flex-col pt-[env(safe-area-inset-top)]', detail && 'max-md:pt-0')}>
      <div aria-hidden className={cn('fixed inset-x-0 top-0 z-30 h-[env(safe-area-inset-top)] bg-primary', detail && 'max-md:hidden')} />
      {maintenance.enabled && maintenance.text.trim() ? (
        <div role="status" className="bg-accent px-4 py-2 text-center text-sm font-semibold text-ink">
          {maintenance.text}
        </div>
      ) : null}
      <div className={cn(detail && 'max-md:hidden')}>
        <AnnouncementBar />
      </div>
      <header
        className={cn(
          'sticky top-[env(safe-area-inset-top)] z-20 border-b border-border bg-background/90 backdrop-blur',
          detail && 'max-md:hidden',
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-2 pl-4 pr-2 md:gap-6 md:px-6 lg:h-[72px] lg:gap-4 lg:px-10 2xl:px-12">
          <Logo />
          {/* Big screens: categories as dropdowns. */}
          <DesktopNav className="hidden flex-1 justify-center lg:flex" />
          {/* Tablets: the four main destinations (phones use the bottom tabs). */}
          <nav aria-label={t('Main')} className="ml-auto hidden items-center gap-1 md:flex lg:hidden">
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
          <div className="ml-auto flex items-center md:ml-0 md:gap-2 lg:gap-1">
            <HeaderSearch className="hidden w-56 lg:block xl:w-72" />
            <Link to="/templates?search=1" className={cn(iconBtn, 'lg:hidden')} aria-label={t('Search templates')}>
              <Search className="size-6" />
            </Link>
            <NavLink
              to="/my-videos"
              className={({ isActive }) =>
                cn('hidden min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-3 text-sm font-medium lg:flex', isActive ? 'text-primary' : 'text-ink hover:text-primary')
              }
            >
              <Clapperboard className="size-5" strokeWidth={1.8} /> <span className="max-xl:sr-only">{t('My Videos')}</span>
            </NavLink>
            {user ? (
              <Link
                to="/account"
                aria-label={t('Account')}
                title={user.email ?? undefined}
                className="hidden size-10 place-items-center rounded-full bg-primary/10 font-semibold uppercase text-primary lg:grid"
              >
                {(user.email ?? '?').charAt(0)}
              </Link>
            ) : (
              <Link to="/account" className="hidden min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-3 text-sm font-semibold text-ink hover:text-primary lg:flex">
                <UserRound className="size-5" strokeWidth={1.8} /> {t('Sign in')}
              </Link>
            )}
            {/* Very wide screens: language switch in the header (smaller screens: footer and menu). */}
            <LanguageSwitch className="max-xl:hidden" />
            {/* Phones and tablets: the side drawer holds the categories. */}
            <button onClick={() => setDrawerOpen(true)} className={cn(iconBtn, 'lg:hidden')} aria-label={t('Open menu')}>
              <Menu className="size-7" />
            </button>
          </div>
        </div>
      </header>

      {/* Centred, up to 1440px like the header. Pages add px-4 / md:px-6; these gutters line content up with the header. */}
      <main key={pathname} className="page-in mx-auto w-full max-w-[1440px] flex-1 lg:px-4 2xl:px-6">
        <Outlet />
      </main>

      {detail ? null : <Footer />}
      {detail ? null : <BottomTabBar />}
      <AppDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
};
