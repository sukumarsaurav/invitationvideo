import { X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ANNOUNCEMENT } from '@/config';
import { useI18n } from '@/lib/i18n';

const KEY = 'iv.announcementClosed';

/** Thin maroon strip above the header. Text comes from src/config.ts; closable for the session. */
export const AnnouncementBar = () => {
  const { t } = useI18n();
  const [closed, setClosed] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) === ANNOUNCEMENT?.text;
    } catch {
      return false;
    }
  });
  const announcement = ANNOUNCEMENT;
  if (!announcement || closed) return null;

  const body = (
    <span className="flex items-center justify-center gap-2">
      <span aria-hidden className="text-accent">✦</span>
      <span className="truncate">{t(announcement.text)}</span>
      <span aria-hidden className="text-accent">✦</span>
    </span>
  );

  return (
    <div className="safe-top relative bg-primary text-[13px] text-white/95">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-center px-10 font-display tracking-wide">
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
          setClosed(true);
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
