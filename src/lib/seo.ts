import { useEffect } from 'react';
import { SITE_URL } from '@/templates/taxonomy';
import { SITE_NAME, type PageMeta } from './pageMeta';

export { breadcrumbLd, faqLd, itemListLd } from './pageMeta';

const DEFAULT_IMAGE = `${SITE_URL}/icons/icon-512.png`;

const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
};

const setCanonical = (href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
};

/**
 * Keeps <head> in step with the page while the customer navigates inside the app.
 * The first load of public pages already has the same tags baked into the HTML by
 * scripts/prerender.ts, from the same PageMeta.
 */
export const useSeo = ({ title, description, path, jsonLd, noindex }: Omit<PageMeta, 'jsonLd'> & { jsonLd?: object[]; image?: string }) => {
  const json = JSON.stringify(jsonLd ?? []);
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const url = `${SITE_URL}${path}`;
    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setCanonical(url);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', DEFAULT_IMAGE);
    setMeta('name', 'twitter:card', 'summary_large_image');

    const items = JSON.parse(json) as object[];
    let script = document.getElementById('seo-jsonld') as HTMLScriptElement | null;
    if (items.length) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'seo-jsonld';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(items.length === 1 ? items[0] : items);
    } else script?.remove();
  }, [title, description, path, json, noindex]);
};
