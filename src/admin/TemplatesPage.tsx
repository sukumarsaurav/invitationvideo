import { ArrowLeft, Eye, EyeOff, Save } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { VideoPlayer } from '@/components/VideoPlayer';
import { loadCatalogue } from '@/lib/catalogue';
import { cn, formatInr } from '@/lib/cn';
import { supabase } from '@/lib/supabase';
import { makeExampleData } from '@/templates/data';
import { ALL_TEMPLATES, TAGS } from '@/templates/registry';
import type { TemplateMeta } from '@/templates/types';
import { atLeast, useAdmin } from './access';
import { Badge, Card, ErrorNote, Field, formatDateTime, inputCls, Loading, PageHeader } from './ui';

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_inr: number;
  is_active: boolean;
  is_trending: boolean;
  popularity: number;
  sort_order: number;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  preview_url: string | null;
  thumbnail_url: string | null;
  code_hash: string | null;
  category_id: string;
  published_at: string | null;
  updated_at: string;
  categories: { slug: string; name: string } | null;
};

const COLUMNS =
  'id, slug, name, description, price_inr, is_active, is_trending, popularity, sort_order, tags, seo_title, seo_description, preview_url, thumbnail_url, code_hash, category_id, published_at, updated_at, categories(slug, name)';

/** Same hash as scripts/generate-seed.ts, so the panel can tell when the code changed after the last seed. */
const codeHash = async (t: TemplateMeta) => {
  const duration = t.schema.clips.reduce((sum, c) => sum + c.durationInFrames, 0);
  const json = JSON.stringify({ fps: t.fps, width: t.width, height: t.height, duration, schema: t.schema });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
};

const useCodeHashes = () => {
  const [hashes, setHashes] = useState<Record<string, string>>({});
  useEffect(() => {
    Promise.all(ALL_TEMPLATES.map(async (t) => [t.slug, await codeHash(t)] as const)).then((pairs) => setHashes(Object.fromEntries(pairs)));
  }, []);
  return hashes;
};

const status = (r: Row) => (r.is_active ? { label: 'Published', tone: 'good' as const } : r.published_at ? { label: 'Hidden', tone: 'neutral' as const } : { label: 'Draft', tone: 'warn' as const });

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export const TemplatesPage = () => {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const hashes = useCodeHashes();

  useEffect(() => {
    (async () => {
      const { data, error: e } = await supabase!.from('templates').select(COLUMNS).order('sort_order').order('name');
      if (e) return setError(e.message);
      setRows(data as unknown as Row[]);
      const to = new Date();
      const from = new Date(to.getTime() - 30 * 864e5);
      const { data: dash } = await supabase!.rpc('admin_dashboard', { p_from: from.toISOString(), p_to: to.toISOString() });
      const byTemplate = ((dash as { by_template?: Array<{ slug: string; drafts: number }> } | null)?.by_template ?? []).map((x) => [x.slug, x.drafts]);
      setDrafts(Object.fromEntries(byTemplate));
    })();
  }, []);

  const inCode = new Set(ALL_TEMPLATES.map((t) => t.slug));
  const notSeeded = rows ? ALL_TEMPLATES.filter((t) => !rows.some((r) => r.slug === t.slug)) : [];

  return (
    <>
      <PageHeader title="Templates" description="Price, copy, tags, order and visibility. The animation itself lives in the code; new templates arrive here as drafts after a deploy and seed." />
      {error ? <ErrorNote message={error} /> : null}
      {!rows && !error ? <Loading /> : null}
      {notSeeded.length ? (
        <div className="mb-4">
          <ErrorNote message={`In the code but not in the database: ${notSeeded.map((t) => t.slug).join(', ')}. Run npm run seed:generate and apply supabase/seed.sql.`} />
        </div>
      ) : null}
      {rows ? (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Template</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 text-right font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Order</th>
                <th className="px-4 py-3 text-right font-semibold">Drafts, 30 days</th>
                <th className="px-4 py-3 font-semibold">Checks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const s = status(r);
                const missing = !inCode.has(r.slug);
                const stale = !missing && hashes[r.slug] && r.code_hash && hashes[r.slug] !== r.code_hash;
                return (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-background">
                    <td className="px-4 py-3">
                      <Link to={`/admin/templates/${r.slug}`} className="font-semibold text-primary hover:underline">
                        {r.name}
                      </Link>
                      <span className="block text-xs text-muted">{r.slug}</span>
                    </td>
                    <td className="px-4 py-3">{r.categories?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatInr(r.price_inr)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={s.tone}>{s.label}</Badge> {r.is_trending ? <Badge>Trending</Badge> : null}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.sort_order}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{drafts[r.slug] ?? 0}</td>
                    <td className="px-4 py-3">
                      {missing ? <Badge tone="bad">Missing from code</Badge> : stale ? <Badge tone="warn">Code changed, re-seed</Badge> : <Badge tone="good">OK</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

type Form = Pick<Row, 'name' | 'description' | 'price_inr' | 'is_trending' | 'popularity' | 'sort_order' | 'tags' | 'category_id'> & {
  seo_title: string;
  seo_description: string;
  preview_url: string;
  thumbnail_url: string;
};

const toForm = (r: Row): Form => ({
  name: r.name,
  description: r.description,
  price_inr: r.price_inr,
  is_trending: r.is_trending,
  popularity: r.popularity,
  sort_order: r.sort_order,
  tags: r.tags ?? [],
  category_id: r.category_id,
  seo_title: r.seo_title ?? '',
  seo_description: r.seo_description ?? '',
  preview_url: r.preview_url ?? '',
  thumbnail_url: r.thumbnail_url ?? '',
});

type AuditEntry = { id: number; actor_id: string | null; action: string; before: Record<string, unknown> | null; after: Record<string, unknown> | null; created_at: string };
const IGNORED = new Set(['updated_at', 'updated_by', 'published_at']);
const changedFields = (e: AuditEntry) =>
  e.before && e.after ? Object.keys(e.after).filter((k) => !IGNORED.has(k) && JSON.stringify(e.before![k]) !== JSON.stringify(e.after![k])) : [];

export const TemplateEditorPage = () => {
  const { slug } = useParams();
  const { role } = useAdmin();
  const toast = useToast();
  const canEdit = atLeast(role, 'manager');
  const def = ALL_TEMPLATES.find((t) => t.slug === slug);
  const exampleData = useMemo(() => (def ? makeExampleData(def) : null), [def]);

  const [row, setRow] = useState<Row | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [{ data, error: e }, { data: cats }] = await Promise.all([
      supabase!.from('templates').select(COLUMNS).eq('slug', slug!).maybeSingle(),
      supabase!.from('categories').select('id, name').order('sort_order'),
    ]);
    if (e) return setError(e.message);
    if (!data) return setError('No template with this slug in the database.');
    setRow(data as unknown as Row);
    setForm(toForm(data as unknown as Row));
    setCategories((cats ?? []) as Array<{ id: string; name: string }>);
    if (atLeast(role, 'manager')) {
      const { data: log } = await supabase!
        .from('audit_log')
        .select('id, actor_id, action, before, after, created_at')
        .eq('entity_type', 'templates')
        .eq('entity_id', slug!)
        .order('created_at', { ascending: false })
        .limit(10);
      setHistory((log ?? []) as AuditEntry[]);
    }
  }, [slug, role]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorNote message={error} />;
  if (!row || !form) return <Loading />;

  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(row));
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm({ ...form, [key]: value });

  const write = async (patch: Partial<Row>, message: string) => {
    setSaving(true);
    const { data, error: e } = await supabase!.from('templates').update(patch).eq('id', row.id).select(COLUMNS).maybeSingle();
    setSaving(false);
    // RLS turns a forbidden update into "no row", not an error.
    if (e || !data) {
      toast({ message: e?.message ?? 'Not saved: your role cannot edit templates.', tone: 'error' });
      return;
    }
    setRow(data as unknown as Row);
    setForm(toForm(data as unknown as Row));
    toast({ message });
    void loadCatalogue(true);
    void load();
  };

  const save = () => {
    if (!form.name.trim()) return toast({ message: 'Name is required.', tone: 'error' });
    if (!Number.isInteger(form.price_inr) || form.price_inr < 1) return toast({ message: 'Price must be a whole number of rupees, at least ₹1.', tone: 'error' });
    void write(
      {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        seo_title: form.seo_title.trim() || null,
        seo_description: form.seo_description.trim() || null,
        preview_url: form.preview_url.trim() || null,
        thumbnail_url: form.thumbnail_url.trim() || null,
      },
      'Saved. The store shows it on the next page load.',
    );
  };

  const togglePublished = () => {
    if (!row.is_active && !def) return toast({ message: 'This template is not in the deployed code, so it cannot be published.', tone: 'error' });
    if (dirty) return toast({ message: 'Save your changes first.', tone: 'error' });
    const question = row.is_active
      ? `Hide "${row.name}" from the store? Customers who already have videos on it can still edit and download them.`
      : `Publish "${row.name}" at ${formatInr(row.price_inr)}? It appears in the store straight away.`;
    if (!window.confirm(question)) return;
    void write({ is_active: !row.is_active }, row.is_active ? 'Hidden from the store.' : 'Published.');
  };

  const s = status(row);

  return (
    <>
      <Link to="/admin/templates" className="mb-3 inline-flex min-h-10 items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Templates
      </Link>
      <PageHeader
        title={row.name}
        description={`${row.slug} · last saved ${formatDateTime(row.updated_at)}`}
        actions={
          <>
            <Badge tone={s.tone}>{s.label}</Badge>
            {canEdit ? (
              <>
                <Button variant="outline" onClick={togglePublished} disabled={saving}>
                  {row.is_active ? <EyeOff className="size-4" /> : <Eye className="size-4" />} {row.is_active ? 'Hide' : 'Publish'}
                </Button>
                <Button onClick={save} disabled={saving || !dirty}>
                  <Save className="size-4" /> Save
                </Button>
              </>
            ) : null}
          </>
        }
      />
      {!def ? (
        <div className="mb-4">
          <ErrorNote message="This template is in the database but not in the deployed code. Keep it hidden until the code is deployed." />
        </div>
      ) : null}
      {!canEdit ? <p className="mb-4 rounded-button bg-background p-3 text-sm text-muted">Your role can view templates but not change them.</p> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card title="Store listing">
            <fieldset disabled={!canEdit} className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={80} />
              </Field>
              <Field label="Category">
                <select className={inputCls} value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Description" hint="Shown on the template page and cards.">
                  <textarea className={cn(inputCls, 'h-24 py-2')} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={400} />
                </Field>
              </div>
              <Field label="Price (₹)" hint="New orders only; paid orders keep the price they paid.">
                <input className={inputCls} type="number" min={1} step={1} inputMode="numeric" value={form.price_inr} onChange={(e) => set('price_inr', Math.round(Number(e.target.value)))} />
              </Field>
              <Field label="Store order" hint="Lower comes first.">
                <input className={inputCls} type="number" step={1} value={form.sort_order} onChange={(e) => set('sort_order', Math.round(Number(e.target.value)))} />
              </Field>
              <Field label="Popularity" hint="Higher ranks earlier in Popular templates.">
                <input className={inputCls} type="number" step={1} value={form.popularity} onChange={(e) => set('popularity', Math.round(Number(e.target.value)))} />
              </Field>
              <label className="flex min-h-11 items-center gap-3 self-end">
                <input type="checkbox" className="size-5 accent-[var(--color-primary)]" checked={form.is_trending} onChange={(e) => set('is_trending', e.target.checked)} />
                <span className="text-sm font-semibold">Show in Trending now</span>
              </label>
            </fieldset>
          </Card>

          <Card title="Tags">
            <fieldset disabled={!canEdit} className="flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const on = form.tags.includes(tag.slug);
                return (
                  <button
                    key={tag.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set('tags', on ? form.tags.filter((x) => x !== tag.slug) : [...form.tags, tag.slug])}
                    className={cn('min-h-9 rounded-full border px-3 text-sm', on ? 'border-primary bg-primary/10 font-semibold text-primary' : 'border-border text-ink')}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </fieldset>
          </Card>

          <Card title="Search engines">
            <fieldset disabled={!canEdit} className="grid gap-4">
              <Field label="SEO title" hint={`Empty uses "${row.name} – … invitation video". Aim for under 60 characters (${form.seo_title.length}).`}>
                <input className={inputCls} value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} maxLength={90} />
              </Field>
              <Field label="SEO description" hint={`Empty uses the description plus the price. Aim for under 160 characters (${form.seo_description.length}).`}>
                <textarea className={cn(inputCls, 'h-20 py-2')} value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} maxLength={300} />
              </Field>
              <p className="text-xs text-muted">Pre-rendered search pages and the sitemap pick up changes on the next deploy.</p>
            </fieldset>
          </Card>

          <Card title="Preview media">
            <fieldset disabled={!canEdit} className="grid gap-4 md:grid-cols-2">
              <Field label="Preview video URL" hint="Optional. Uploads arrive with file storage (Phase 3).">
                <input className={inputCls} type="url" value={form.preview_url} onChange={(e) => set('preview_url', e.target.value)} placeholder="https://" />
              </Field>
              <Field label="Thumbnail URL" hint="Optional. Cards fall back to a live frame.">
                <input className={inputCls} type="url" value={form.thumbnail_url} onChange={(e) => set('thumbnail_url', e.target.value)} placeholder="https://" />
              </Field>
            </fieldset>
          </Card>
        </div>

        <div className="space-y-6">
          {def && exampleData ? (
            <Card title="Preview">
              <VideoPlayer def={def} data={exampleData} watermark={false} autoPlay loop className="mx-auto w-full max-w-[300px] overflow-hidden rounded-card" style={{ aspectRatio: '9 / 16' }} />
            </Card>
          ) : null}
          {def ? (
            <Card title="What customers can change">
              <p className="text-sm">{def.schema.details.map((d) => d.label).join(' · ')}</p>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {def.schema.clips.map((c) => (
                  <li key={c.id}>
                    {c.name}
                    {c.optional ? ' (optional)' : ''}: {c.fields.length} fields
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">Set in the template's code.</p>
            </Card>
          ) : null}
          {atLeast(role, 'manager') ? (
            <Card title="History">
              {history.length === 0 ? <p className="text-sm text-muted">No changes recorded yet.</p> : null}
              <ul className="space-y-2 text-sm">
                {history.map((h) => {
                  const fields = changedFields(h);
                  return (
                    <li key={h.id} className="border-b border-border pb-2 last:border-0">
                      <span className="block text-xs text-muted">{formatDateTime(h.created_at)}</span>
                      {h.action === 'update' ? (fields.length ? `Changed ${fields.join(', ')}` : 'Saved with no visible change') : h.action === 'insert' ? 'Added by the seed' : h.action}
                    </li>
                  );
                })}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
};
