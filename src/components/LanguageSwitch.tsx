import { cn } from '@/lib/cn';
import { useI18n, type Lang } from '@/lib/i18n';

const OPTIONS: ReadonlyArray<readonly [Lang, string, string]> = [
  ['en', 'EN', 'English'],
  ['hi', 'हिं', 'हिन्दी'],
];

/** Compact English / Hindi switch for the desktop header and the footer (phones also have it in the menu). */
export const LanguageSwitch = ({ className }: { className?: string }) => {
  const { t, lang, setLang } = useI18n();
  return (
    <div className={cn('flex items-center rounded-full border border-border bg-surface p-0.5', className)} role="radiogroup" aria-label={t('Language')}>
      {OPTIONS.map(([code, short, full]) => (
        <button
          key={code}
          role="radio"
          aria-checked={lang === code}
          aria-label={full}
          onClick={() => setLang(code)}
          className={cn(
            'min-h-9 min-w-10 rounded-full px-2.5 text-sm font-semibold transition-colors',
            lang === code ? 'bg-primary text-white' : 'text-muted hover:text-ink',
          )}
        >
          {short}
        </button>
      ))}
    </div>
  );
};
