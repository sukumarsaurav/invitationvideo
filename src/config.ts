import { showPrices } from './lib/pricing';

/**
 * Site-wide content you may change without touching components.
 * Set ANNOUNCEMENT to null to hide the strip at the top of the site.
 * When real offers exist (e.g. a coupon code), put the code here.
 */
export const ANNOUNCEMENT: { text: string; link?: string } | null = {
  text: showPrices() ? 'Free preview · Pay only for HD' : 'Free preview · Free HD download',
  link: '/templates',
};

export const TAGLINE = 'Video invites in minutes';
