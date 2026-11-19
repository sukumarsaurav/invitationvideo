/**
 * Categories and tags: plain data, importable from Node scripts (sitemap, seed) as well as the app.
 * Each tag becomes a landing page at /tags/<slug> once at least one template uses it, so the
 * descriptions are written for people searching (and for search engines).
 */

export const SITE_URL = 'https://invitationvideos.com';

/**
 * Occasions. A main category (no parent) has its own page that also lists its sub-categories'
 * designs: /invitations/wedding shows wedding, engagement and save-the-date designs, and
 * the sidebar lets people narrow to one. Each template belongs to exactly one category.
 */
export type Category = {
  slug: string;
  name: string;
  blurb: string;
  /** The main category this one sits under (a sub-category). */
  parent?: string;
  /** How the main category is named among its own sub-categories, e.g. "Wedding ceremony". */
  subLabel?: string;
};

export const CATEGORIES: Category[] = [
  { slug: 'wedding', name: 'Wedding', subLabel: 'Wedding ceremony', blurb: 'Personalised wedding invitation videos with your names, date, venue and photo, ready to share on WhatsApp.' },
  { slug: 'engagement', name: 'Engagement', parent: 'wedding', blurb: 'Engagement and ring ceremony invitation videos you can personalise in minutes.' },
  { slug: 'save-the-date', name: 'Save the Date', parent: 'wedding', blurb: 'Save the date videos to tell family and friends early.' },
  { slug: 'haldi', name: 'Haldi', parent: 'wedding', blurb: 'Haldi ceremony invitation videos in sunny yellows, with marigolds, your names and the muhurat.' },
  { slug: 'mehndi', name: 'Mehndi', parent: 'wedding', blurb: 'Mehndi night invitation videos with henna patterns, your names, date and venue.' },
  { slug: 'sangeet', name: 'Sangeet', parent: 'wedding', blurb: 'Sangeet and cocktail night invitation videos with music, lights and dance-floor energy.' },
  { slug: 'reception', name: 'Reception', parent: 'wedding', blurb: 'Wedding reception invitation videos, elegant and ready to share on WhatsApp.' },
  { slug: 'birthday', name: 'Birthday', blurb: 'Birthday invitation videos for kids and adults, with photo, party details and a free preview.' },
  { slug: 'anniversary', name: 'Anniversary', blurb: 'Anniversary celebration invitation videos for every milestone year.' },
  { slug: 'baby-shower', name: 'Baby Shower', blurb: 'Baby shower and godh bharai invitation videos, personalised and ready to send.' },
  { slug: 'griha-pravesh', name: 'Griha Pravesh', blurb: 'Griha pravesh and housewarming invitation videos with your new address and muhurat.' },
];

/**
 * Tags filter within an occasion. Groups become sidebar sections: community (Hindu, and later
 * South Indian, Marathi, Muslim…), style (look and feel), feature (handled by their own filters,
 * e.g. the photo filter, so not listed as checkboxes).
 */
export type TagGroup = 'community' | 'style' | 'feature';
export type Tag = { slug: string; name: string; title: string; blurb: string; group: TagGroup };

export const TAGS: Tag[] = [
  { slug: 'hindu-wedding', group: 'community', name: 'Hindu wedding', title: 'Hindu wedding invitation videos', blurb: 'Traditional Hindu wedding invitation videos with shubh vivah blessings, your names, muhurat and venue.' },
  { slug: 'traditional', group: 'style', name: 'Traditional', title: 'Traditional invitation videos', blurb: 'Classic Indian designs with ornate frames, gold details and rich colours.' },
  { slug: 'royal', group: 'style', name: 'Royal', title: 'Royal invitation videos', blurb: 'Palace-inspired invitation videos with regal frames and gold lettering.' },
  { slug: 'maroon-and-gold', group: 'style', name: 'Maroon & gold', title: 'Maroon and gold invitation videos', blurb: 'Deep maroon backgrounds with gold calligraphy, the classic Indian wedding palette.' },
  { slug: 'with-photo', group: 'feature', name: 'With photo', title: 'Invitation videos with photo', blurb: 'Designs with a photo slot for the couple, the birthday star or the family.' },
  { slug: 'kids-birthday', group: 'style', name: 'Kids birthday', title: 'Kids birthday invitation videos', blurb: 'Fun, colourful birthday invitation videos for children, with balloons and a photo.' },
  { slug: 'pastel', group: 'style', name: 'Pastel', title: 'Pastel invitation videos', blurb: 'Soft pastel colours for light, cheerful invitations.' },
  { slug: 'south-indian-wedding', group: 'community', name: 'South Indian wedding', title: 'South Indian wedding invitation videos', blurb: 'Temple-inspired wedding invitation videos with gold, bells and kolam details for Tamil, Telugu, Kannada and Malayali weddings.' },
  { slug: 'floral', group: 'style', name: 'Floral', title: 'Floral invitation videos', blurb: 'Invitation videos framed with flowers, petals and leaves.' },
  { slug: 'modern', group: 'style', name: 'Modern', title: 'Modern invitation videos', blurb: 'Clean, minimal designs with simple type and lots of space.' },
  { slug: 'party', group: 'style', name: 'Party', title: 'Party invitation videos', blurb: 'Bright, high-energy designs with lights, music and confetti for sangeet and cocktail nights.' },
  { slug: 'whatsapp-invite', group: 'feature', name: 'WhatsApp invite', title: 'WhatsApp invitation videos', blurb: 'Vertical 1080 × 1920 videos made to look great when shared on WhatsApp and Instagram stories.' },
];

export const getCategory = (slug: string | undefined) => CATEGORIES.find((c) => c.slug === slug);

/** Categories without a parent, in menu order. */
export const MAIN_CATEGORIES = CATEGORIES.filter((c) => !c.parent);

/** The main category a category belongs to (itself when it is one). */
export const mainCategoryOf = (slug: string): string => CATEGORIES.find((c) => c.slug === slug)?.parent ?? slug;

/** A main category and its sub-categories, main first. */
export const subCategoriesOf = (slug: string): Category[] => CATEGORIES.filter((c) => c.slug === slug || c.parent === slug);

/** Does a template in `templateCategory` appear on the page of `pageCategory`? Main pages include their sub-categories. */
export const inCategory = (templateCategory: string, pageCategory: string) =>
  templateCategory === pageCategory || CATEGORIES.some((c) => c.slug === templateCategory && c.parent === pageCategory);
export const getTag = (slug: string | undefined) => TAGS.find((t) => t.slug === slug);
