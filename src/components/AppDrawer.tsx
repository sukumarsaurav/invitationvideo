import { CircleHelp, Languages, LogIn, LogOut, MessageCircle, X } from 'lucide-react';
import { useSupportWhatsapp } from '@/lib/siteSettings';
import { useNavigate } from 'react-router-dom';
import { Drawer } from 'vaul';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { categoriesWithTemplates } from '@/templates/registry';

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

const linkCls = 'flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left text-[15px] text-ink active:bg-background';

/** Digits only, e.g. 919876543210. Leave unset to hide the WhatsApp link. */

/** Left side drawer: account, categories, language, help. Swipe left to close. */
export const AppDrawer = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();
  const SUPPORT_WHATSAPP = useSupportWhatsapp();
  const go = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction="left">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Drawer.Content
          className="safe-top fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-[320px] flex-col bg-surface shadow-2xl outline-none"
          aria-describedby={undefined}
        >
          <Drawer.Title className="sr-only">{t('Menu')}</Drawer.Title>
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="grid size-11 place-items-center rounded-full bg-primary/10 font-semibold uppercase text-primary">
              {user ? (user.email ?? '?').charAt(0) : 'G'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{user ? user.email : t('Guest')}</p>
              <button onClick={() => go(user ? '/my-videos' : '/account?reason=save')} className="min-h-6 text-left text-sm text-primary">
                {user ? t('My Videos') : t('Sign in to save your videos')}
              </button>
            </div>
            <button onClick={() => onOpenChange(false)} className="grid size-11 place-items-center rounded-full text-muted" aria-label={t('Close menu')}>
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted">{t('Categories')}</p>
            {categoriesWithTemplates().map((c) => (
              <button key={c.slug} onClick={() => go(`/invitations/${c.slug}`)} className={cn(linkCls, 'justify-between')}>
                {t(c.name)} <span className="text-sm text-muted">{c.count}</span>
              </button>
            ))}

            <div className="my-2 border-t border-border" />

            <div className="px-3 py-2">
              <p className="mb-2 flex items-center gap-2 text-[15px]">
                <Languages className="size-5 text-muted" /> {t('Language')}
              </p>
              <div className="grid grid-cols-2 gap-1 rounded-button bg-background p-1" role="radiogroup" aria-label={t('Language')}>
                {(
                  [
                    ['en', 'English'],
                    ['hi', 'हिन्दी'],
                  ] as const
                ).map(([code, label]) => (
                  <button
                    key={code}
                    role="radio"
                    aria-checked={lang === code}
                    onClick={() => setLang(code)}
                    className={cn('min-h-10 rounded-[10px] text-sm font-semibold', lang === code ? 'bg-surface text-primary shadow-sm' : 'text-muted')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => go('/help')} className={linkCls}>
              <CircleHelp className="size-5 text-muted" /> {t('How it works & FAQ')}
            </button>
            {SUPPORT_WHATSAPP ? (
              <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noreferrer" className={linkCls}>
                <MessageCircle className="size-5 text-muted" /> {t('Help on WhatsApp')}
              </a>
            ) : null}
          </div>

          <div className="border-t border-border px-2 pt-2 pb-safe-2">
            {user ? (
              <button
                className={linkCls}
                onClick={async () => {
                  onOpenChange(false);
                  await signOut();
                }}
              >
                <LogOut className="size-5 text-muted" /> {t('Log out')}
              </button>
            ) : (
              <button className={linkCls} onClick={() => go('/account')}>
                <LogIn className="size-5 text-muted" /> {t('Sign in')}
              </button>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
