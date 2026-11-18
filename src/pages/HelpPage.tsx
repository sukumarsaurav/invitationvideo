import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FAQ } from '@/content/faq';
import { useI18n } from '@/lib/i18n';
import { helpMeta } from '@/lib/pageMeta';
import { useSeo } from '@/lib/seo';

export const HelpPage = () => {
  const { t } = useI18n();
  useSeo(helpMeta(FAQ));
  return (
    // Long-form text: keep lines readable on wide screens.
    <div className="max-w-3xl px-4 pt-6 md:px-6 md:pt-10">
      <h1 className="font-display text-2xl font-semibold">{t('How it works')}</h1>
      <ol className="mt-4 space-y-3">
        {[
          ['Pick a design', 'Browse templates and tap one you like.'],
          ['Add your details', 'Names, date, venue and a photo. You see the video change as you type.'],
          ['Preview and share', 'Watch it free and send the preview link to family.'],
          ['Download in HD', 'Pay once and send the video on WhatsApp.'],
        ].map(([title, body], i) => (
          <li key={title} className="flex gap-3 rounded-card border border-border bg-surface p-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">{i + 1}</span>
            <div>
              <p className="font-semibold">{t(title)}</p>
              <p className="text-sm text-muted">{t(body)}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-8 font-display text-xl font-semibold">{t('Questions')}</h2>
      <div className="mt-3 divide-y divide-border rounded-card border border-border bg-surface">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group px-4">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 font-semibold">
              {t(q)}
              <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-4 text-sm text-muted">{t(a)}</p>
          </details>
        ))}
      </div>

      <Link to="/templates" className="mt-6 inline-flex min-h-12 items-center rounded-button bg-primary px-6 font-semibold text-white">
        {t('Browse templates')}
      </Link>
    </div>
  );
};
