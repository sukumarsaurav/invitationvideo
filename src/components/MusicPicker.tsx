import { Check, Music, VolumeX } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { tracksFor, type MusicTrack } from '@/templates/music';

/** Background music choice: tracks suggested for the occasion first, then the rest, then "No music". */
export const MusicPicker = ({ category, value, onChange }: { category: string; value: string; onChange: (id: string) => void }) => {
  const { t } = useI18n();
  const { suggested, others } = tracksFor(category);

  const row = (id: string, name: string, mood: string, icon: React.ReactNode) => {
    const selected = value === id;
    return (
      <button
        key={id || 'none'}
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={() => onChange(id)}
        className={cn(
          'flex min-h-14 w-full items-center gap-3 rounded-button border px-3 text-left transition-colors',
          selected ? 'border-primary bg-primary/5' : 'border-border bg-surface active:bg-background',
        )}
      >
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-full', selected ? 'bg-primary text-white' : 'bg-background text-muted')}>
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{name}</span>
          {mood ? <span className="block truncate text-xs text-muted">{mood}</span> : null}
        </span>
        {selected ? <Check className="size-5 shrink-0 text-primary" strokeWidth={3} /> : null}
      </button>
    );
  };
  const trackRow = (m: MusicTrack) => row(m.id, t(m.name), t(m.mood), <Music className="size-4" />);

  return (
    <div role="radiogroup" aria-label={t('Music')} className="grid gap-2">
      {suggested.map(trackRow)}
      {others.length ? <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">{t('More music')}</p> : null}
      {others.map(trackRow)}
      {row('', t('No music'), '', <VolumeX className="size-4" />)}
    </div>
  );
};
