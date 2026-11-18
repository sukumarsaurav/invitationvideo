import { TEMPLATES } from '@/templates/registry';
import { inCategory } from '@/templates/taxonomy';

/**
 * The category menu: dropdowns in the desktop header, collapsible groups in the phone drawer.
 * Each link points at an occasion page (/invitations/<slug>) or a style page (/tags/<slug>).
 * Add an entry here when a new occasion or style gets templates (e.g. South Indian or Marathi
 * weddings, once those tags exist in src/templates/taxonomy.ts).
 */
export type MenuLink = { label: string; to: string; category?: string; tag?: string };
export type MenuGroup = { label: string; to: string; links: MenuLink[] };

const occasion = (label: string, slug: string): MenuLink => ({ label, to: `/invitations/${slug}`, category: slug });
const style = (label: string, slug: string): MenuLink => ({ label, to: `/tags/${slug}`, tag: slug });

export const MENU: MenuGroup[] = [
  {
    label: 'Wedding',
    to: '/invitations/wedding',
    links: [
      occasion('All wedding invitations', 'wedding'),
      occasion('Save the Date', 'save-the-date'),
      occasion('Engagement', 'engagement'),
      style('Hindu wedding', 'hindu-wedding'),
      style('Traditional', 'traditional'),
      style('Royal', 'royal'),
      style('Maroon & gold', 'maroon-and-gold'),
    ],
  },
  {
    label: 'Birthday',
    to: '/invitations/birthday',
    links: [occasion('All birthday invitations', 'birthday'), style('Kids birthday', 'kids-birthday'), style('Pastel', 'pastel')],
  },
  {
    label: 'Ceremonies',
    to: '/templates',
    links: [occasion('Anniversary', 'anniversary'), occasion('Baby Shower', 'baby-shower'), occasion('Griha Pravesh', 'griha-pravesh')],
  },
  {
    label: 'More',
    to: '/templates',
    links: [
      { label: 'All templates', to: '/templates' },
      style('With photo', 'with-photo'),
      style('WhatsApp invite', 'whatsapp-invite'),
      { label: 'How it works & FAQ', to: '/help' },
    ],
  },
];

/** Published templates behind a link; null for links that aren't a listing (e.g. Help). */
export const linkCount = (link: MenuLink): number | null => {
  if (link.category) return TEMPLATES.filter((t) => inCategory(t.category, link.category!)).length;
  if (link.tag) return TEMPLATES.filter((t) => t.tags.includes(link.tag!)).length;
  return link.to === '/templates' ? TEMPLATES.length : null;
};

/** Is the current page one of this group's links? Used to highlight the group in the header. */
export const groupIsActive = (group: MenuGroup, pathname: string) =>
  group.links.some((l) => l.to !== '/templates' && (pathname === l.to || pathname.startsWith(`${l.to}/`)));
