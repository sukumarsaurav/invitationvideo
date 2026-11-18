import { Link } from 'react-router-dom';
import { TAGLINE } from '@/config';
import { useI18n } from '@/lib/i18n';
import { categoriesWithTemplates, tagsWithTemplates } from '@/templates/registry';
import { Logo } from './Logo';

/** Links to every occasion and tag page: helps people browse and search engines find each page. */
export const Footer = () => {
  const { t } = useI18n();
  const linkCls = 'inline-flex min-h-9 items-center text-sm text-muted hover:text-primary';
  return (
    <footer className="mt-12 border-t border-border bg-surface pb-safe-24 md:pb-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-6">
        <div>
          <Logo tagline={false} />
          <p className="mt-3 max-w-xs text-sm text-muted">{t('Personalised wedding, birthday and festival invitation videos. Preview free, download HD for WhatsApp.')}</p>
        </div>
        <nav aria-label={t('Occasions')}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent-ink">{t('Occasions')}</p>
          <ul>
            {categoriesWithTemplates().map((c) => (
              <li key={c.slug}>
                <Link to={`/invitations/${c.slug}`} className={linkCls}>
                  {t('{category} invitations', { category: t(c.name) })}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t('Popular searches')}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent-ink">{t('Popular searches')}</p>
          <ul>
            {tagsWithTemplates()
              .slice(0, 8)
              .map((tag) => (
                <li key={tag.slug}>
                  <Link to={`/tags/${tag.slug}`} className={linkCls}>
                    {t(tag.title)}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
        <nav aria-label={t('Help')}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent-ink">{t('Help')}</p>
          <ul>
            <li>
              <Link to="/help" className={linkCls}>
                {t('How it works & FAQ')}
              </Link>
            </li>
            <li>
              <Link to="/templates" className={linkCls}>
                {t('All templates')}
              </Link>
            </li>
            <li>
              <Link to="/my-videos" className={linkCls}>
                {t('My Videos')}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-4 text-xs text-muted md:px-6">
        © {new Date().getFullYear()} invitationvideos.com · {t(TAGLINE)}
      </p>
    </footer>
  );
};
