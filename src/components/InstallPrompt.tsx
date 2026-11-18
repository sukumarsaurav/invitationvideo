import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { useI18n } from '@/lib/i18n';

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISSED_KEY = 'iv.installDismissed';
/** RenderPage fires this after a successful download — the moment the app has proven useful. */
export const INSTALL_MOMENT = 'iv:install-moment';

/**
 * "Add to home screen" offer. Chrome/Android only (Safari has no prompt API).
 * Shown once, after the first successful download, never on first visit.
 */
export const InstallPrompt = () => {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onMoment = () => {
      try {
        if (localStorage.getItem(DISMISSED_KEY)) return;
      } catch {
        return;
      }
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener(INSTALL_MOMENT, onMoment);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener(INSTALL_MOMENT, onMoment);
    };
  }, []);

  if (!show || !deferred) return null;

  const close = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Not remembered; it only shows after downloads anyway.
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[55] px-3 pt-3 pb-safe-3">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-xl">
        <div className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-primary text-accent">
          <Download className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t('Add to your home screen')}</p>
          <p className="text-xs text-muted">{t('Open your videos in one tap, like an app.')}</p>
        </div>
        <Button
          className="min-h-10 px-3 text-sm"
          onClick={async () => {
            await deferred.prompt();
            await deferred.userChoice;
            setDeferred(null);
            close();
          }}
        >
          {t('Add')}
        </Button>
        <button onClick={close} className="grid size-10 place-items-center text-muted" aria-label={t('Close')}>
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
};
