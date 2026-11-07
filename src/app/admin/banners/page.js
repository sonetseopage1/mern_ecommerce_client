'use client';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang } from '@/lib/hooks';
import { ImageField } from '@/components/ImageField';

const blank = { image: '', title: { en: '', bn: '' }, subtitle: { en: '', bn: '' }, buttonText: { en: '', bn: '' }, link: '/products', active: true };

export default function AdminBanners() {
  const { t, l } = useLang();
  const [list, setList] = useState(null);
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api.get('/banners/admin/all').then((r) => setList(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    if (!f.image) return toast.error('Please add an image');
    setBusy(true);
    try { if (f._id) await api.put(`/banners/${f._id}`, f); else await api.post('/banners', f); toast.success(t('saved')); setF(null); load(); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  const del = async (b) => {
    if (!window.confirm(`${t('delete')}?`)) return;
    try { await api.delete(`/banners/${b._id}`); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  const move = async (i, d) => {
    const next = [...list];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
    try { await api.put('/banners/reorder', { items: next.map((b, order) => ({ id: b._id, order })) }); } catch (e) { toast.error(errMsg(e)); load(); }
  };
  const bi = (k, lang, v) => setF((o) => ({ ...o, [k]: { ...(o[k] || {}), [lang]: v } }));

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="h-section">{t('banners')}</h1><p className="text-xs text-slate-500">Slides of the home-page hero. Best image size: 1600 × 600 px. The site shows a plain slider if there are none.</p></div>
        <button className="btn-primary" onClick={() => setF(blank)}><Plus className="h-4 w-4" />{t('add')}</button>
      </div>

      <div className="space-y-3">
        {(list || []).map((b, i) => (
          <div key={b._id} className={`card flex flex-col gap-3 p-3 sm:flex-row sm:items-center ${b.active ? '' : 'opacity-60'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.image} alt="" className="aspect-[8/3] w-full rounded object-cover sm:w-56" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{l(b.title) || '—'}</div>
              <div className="truncate text-xs text-slate-500">{l(b.subtitle)}</div>
              <div className="mt-1 text-xs text-brand-700 dark:text-brand-300">{l(b.buttonText) || t('shopNow')} → {b.link} {!b.active && <span className="chip ml-1 bg-slate-200 text-slate-600">hidden</span>}</div>
            </div>
            <div className="flex items-center gap-1 self-end sm:self-center">
              <button className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800" disabled={i === 0} onClick={() => move(i, -1)} aria-label="move up"><ArrowUp className="h-4 w-4" /></button>
              <button className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="move down"><ArrowDown className="h-4 w-4" /></button>
              <button className="grid h-9 w-9 place-items-center rounded-md text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800" onClick={() => setF({ ...blank, ...b, title: { en: '', bn: '', ...b.title }, subtitle: { en: '', bn: '', ...b.subtitle }, buttonText: { en: '', bn: '', ...b.buttonText } })} aria-label={t('edit')}><Pencil className="h-4 w-4" /></button>
              <button className="grid h-9 w-9 place-items-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-slate-800" onClick={() => del(b)} aria-label={t('delete')}><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {list && !list.length && <p className="py-10 text-center text-slate-500">No banners yet</p>}
      </div>

      {f && (
        <div className="fixed inset-0 z-[60] grid place-items-end overflow-y-auto bg-black/50 sm:place-items-center" onClick={() => setF(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="card my-4 w-full max-w-2xl animate-pop space-y-4 rounded-b-none p-5 sm:rounded-b-md">
            <h2 className="font-bold">{f._id ? t('edit') : t('add')} · {t('banners')}</h2>
            <ImageField label="Banner image *" value={f.image} onChange={(v) => setF({ ...f, image: v })} size="h-20 w-52" hint="Wide photo, 1600 × 600 px recommended. Text is placed on the left, over a dark overlay." />
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="label">Title (English)</label><input className="input" value={f.title.en || ''} onChange={(e) => bi('title', 'en', e.target.value)} /></div>
              <div><label className="label">শিরোনাম (বাংলা)</label><input className="input" value={f.title.bn || ''} onChange={(e) => bi('title', 'bn', e.target.value)} /></div>
              <div><label className="label">Subtitle (English)</label><input className="input" value={f.subtitle.en || ''} onChange={(e) => bi('subtitle', 'en', e.target.value)} /></div>
              <div><label className="label">উপশিরোনাম (বাংলা)</label><input className="input" value={f.subtitle.bn || ''} onChange={(e) => bi('subtitle', 'bn', e.target.value)} /></div>
              <div><label className="label">Button text (English)</label><input className="input" placeholder="Shop now" value={f.buttonText.en || ''} onChange={(e) => bi('buttonText', 'en', e.target.value)} /></div>
              <div><label className="label">বাটনের লেখা (বাংলা)</label><input className="input" placeholder="এখনই কিনুন" value={f.buttonText.bn || ''} onChange={(e) => bi('buttonText', 'bn', e.target.value)} /></div>
            </div>
            <div><label className="label">Button link</label><input className="input" placeholder="/products?category=fashion" value={f.link || ''} onChange={(e) => setF({ ...f, link: e.target.value })} /><p className="mt-1 text-[11px] text-slate-500">A page of your site (starts with /) or a full https:// link.</p></div>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />Visible on the home page</label>
            <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setF(null)}>{t('cancel')}</button><button className="btn-primary" disabled={busy}>{t('save')}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
