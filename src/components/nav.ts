import { Clapperboard, Home, LayoutGrid, UserRound, type LucideIcon } from 'lucide-react';

export type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

/** The four destinations shared by the phone bottom tabs and the desktop top nav. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/templates', label: 'Templates', icon: LayoutGrid },
  { to: '/my-videos', label: 'My Videos', icon: Clapperboard },
  { to: '/account', label: 'Account', icon: UserRound },
];
