import { Link } from 'react-router-dom';
import { useSeo } from '@/lib/seo';
import { useI18n } from '@/lib/i18n';

export const NotFoundPage = () => {
  const { t } = useI18n();
  useSeo({ title: 'Page not found', description: '', path: '/404', noindex: true });
  return (
    <div className="px-4 py-16 text-center">
      <p className="font-display text-2xl font-semibold">{t('Page not found')}</p>
      <p className="mt-2 text-muted">{t("That template or video doesn't exist.")}</p>
      <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-button bg-primary px-5 font-semibold text-white">
        {t('Go home')}
      </Link>
    </div>
  );
};
