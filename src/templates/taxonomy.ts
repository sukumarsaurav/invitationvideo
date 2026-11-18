/**
 * Categories and tags: plain data, importable from Node scripts (sitemap, seed) as well as the app.
 * Each tag becomes a landing page at /tags/<slug> once at least one template uses it, so the
 * descriptions are written for people searching (and for search engines).
 */

export const SITE_URL = 'https://invitationvideos.com';

export type Category = { slug: string; name: string; blurb: string };

export const CATEGORIES: Category[] = [
  { slug: 'wedding', name: 'Wedding', blurb: 'Personalised wedding invitation videos with your names, date, venue and photo, ready to share on WhatsApp.' },
  { slug: 'engagement', name: 'Engagement', blurb: 'Engagement and ring ceremony invitation videos you can personalise in minutes.' },
  { slug: 'birthday', name: 'Birthday', blurb: 'Birthday invitation videos for kids and adults, with photo, party details and a free preview.' },
  { slug: 'anniversary', name: 'Anniversary', blurb: 'Anniversary celebration invitation videos for every milestone year.' },
  { slug: 'baby-shower', name: 'Baby Shower', blurb: 'Baby shower and godh bharai invitation videos, personalised and ready to send.' },
  { slug: 'griha-pravesh', name: 'Griha Pravesh', blurb: 'Griha pravesh and housewarming invitation videos with your new address and muhurat.' },
  { slug: 'save-the-date', name: 'Save the Date', blurb: 'Save the date videos to tell family and friends early.' },
];

export type Tag = { slug: string; name: string; title: string; blurb: string };

export const TAGS: Tag[] = [
  { slug: 'hindu-wedding', name: 'Hindu wedding', title: 'Hindu wedding invitation videos', blurb: 'Traditional Hindu wedding invitation videos with shubh vivah blessings, your names, muhurat and venue.' },
  { slug: 'traditional', name: 'Traditional', title: 'Traditional invitation videos', blurb: 'Classic Indian designs with ornate frames, gold details and rich colours.' },
  { slug: 'royal', name: 'Royal', title: 'Royal invitation videos', blurb: 'Palace-inspired invitation videos with regal frames and gold lettering.' },
  { slug: 'maroon-and-gold', name: 'Maroon & gold', title: 'Maroon and gold invitation videos', blurb: 'Deep maroon backgrounds with gold calligraphy, the classic Indian wedding palette.' },
  { slug: 'with-photo', name: 'With photo', title: 'Invitation videos with photo', blurb: 'Designs with a photo slot for the couple, the birthday star or the family.' },
  { slug: 'kids-birthday', name: 'Kids birthday', title: 'Kids birthday invitation videos', blurb: 'Fun, colourful birthday invitation videos for children, with balloons and a photo.' },
  { slug: 'pastel', name: 'Pastel', title: 'Pastel invitation videos', blurb: 'Soft pastel colours for light, cheerful invitations.' },
  { slug: 'whatsapp-invite', name: 'WhatsApp invite', title: 'WhatsApp invitation videos', blurb: 'Vertical 1080 × 1920 videos made to look great when shared on WhatsApp and Instagram stories.' },
];

export const getCategory = (slug: string | undefined) => CATEGORIES.find((c) => c.slug === slug);
export const getTag = (slug: string | undefined) => TAGS.find((t) => t.slug === slug);
