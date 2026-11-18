import { X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useSiteSettings } from '@/lib/siteSettings';

const KEY = 'iv.announcementClosed';

/** Thin maroon strip above the header. Text comes from Settings in the admin panel (src/config.ts until it loads); closable for the session. */
export const AnnouncementBar = () => {
  const { t } = useI18n();
  const { announcement: setting } = useSiteSettings();
  // The text that was closed; a new announcement shows again.
  const [closedText, setClosedText] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(KEY);
    } catch {
      return null;
    }
  });
  const announcement = setting.enabled && setting.text.trim() ? setting : null;
  if (!announcement || closedText === announcement.text) return null;

  const body = (
    <span className="flex items-center justify-center gap-2">
      <span aria-hidden className="text-accent">✦</span>
      <span className="truncate">{t(announcement.text)}</span>
      <span aria-hidden className="text-accent">✦</span>
    </span>
  );

  return (
    <div className="relative bg-primary text-[13px] text-white/95">
      <div className="flex h-9 w-full items-center justify-center px-10 font-display tracking-wide">
        {announcement.link ? (
          <Link to={announcement.link} className="min-w-0 hover:underline">
            {body}
          </Link>
        ) : (
          body
        )}
      </div>
      <button
        onClick={() => {
          setClosedText(announcement.text);
          try {
            sessionStorage.setItem(KEY, announcement.text);
          } catch {
            // Closed for this page view only.
          }
        }}
        className="absolute right-0 top-0 grid h-9 w-11 place-items-center text-white/70"
        aria-label={t('Close')}
      >
        <X className="size-4" />
      </button>
    </div>
  );
};
