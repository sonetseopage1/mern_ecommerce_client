'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ExternalLink, ArrowLeft } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang, useAuth } from '@/lib/hooks';
import RichTextEditor from '@/components/RichTextEditor';
import LangTabs from '@/components/LangTabs';

const blank = { title: { en: '', bn: '' }, content: { en: '', bn: '' }, slug: '', active: true, showInFooter: true };

export default function AdminPages() {
  const { t, l } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const [list, setList] = useState(null);
  const [f, setF] = useState(null); // page being edited / created
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user && user.role !== 'admin') router.replace('/admin'); }, [user, router]);
  const load = useCallback(() => api.get('/pages/admin/all').then((r) => setList(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      if (f._id) await api.put(`/pages/${f._id}`, f); else await api.post('/pages', f);
      toast.success(t('saved')); setF(null); load();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  const del = async (p) => {
    if (!window.confirm(`${t('delete')} “${l(p.title)}”?`)) return;
    try { await api.delete(`/pages/${p._id}`); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  if (f) {
    return (
      <form onSubmit={save} className="mx-auto max-w-4xl space-y-4 pb-24">
        <button type="button" className="flex items-center gap-1 text-sm font-semibold text-brand-700" onClick={() => setF(null)}><ArrowLeft className="h-4 w-4" />{t('pagesLbl')}</button>
        <h1 className="h-section">{f._id ? t('edit') : t('add')} · {t('pagesLbl')}</h1>
        <div className="card grid gap-4 p-4 sm:grid-cols-2">
          <div><label className="label">Title (English) *</label><input required className="input" value={f.title.en} onChange={(e) => setF({ ...f, title: { ...f.title, en: e.target.value } })} /></div>
          <div><label className="label">শিরোনাম (বাংলা)</label><input className="input" value={f.title.bn || ''} onChange={(e) => setF({ ...f, title: { ...f.title, bn: e.target.value } })} /></div>
          <div><label className="label">URL slug {f._id ? '(fixed)' : '(optional)'}</label>
            <div className="flex items-center gap-1"><span className="text-sm text-slate-400">/pages/</span><input disabled={!!f._id} className="input" placeholder="terms-and-conditions" value={f.slug || ''} onChange={(e) => setF({ ...f, slug: e.target.value })} /></div></div>
          <div className="flex flex-wrap items-end gap-5 text-sm font-semibold">
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />Published</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={f.showInFooter} onChange={(e) => setF({ ...f, showInFooter: e.target.checked })} />Show in footer</label>
          </div>
        </div>
        <div className="card p-4">
          <LangTabs label="Content">
            {(lang) => <RichTextEditor key={lang} minHeight={320} value={f.content?.[lang] || ''} onChange={(html) => setF((o) => ({ ...o, content: { ...o.content, [lang]: html } }))} placeholder={lang === 'bn' ? 'এখানে লিখুন…' : 'Write the page content here…'} />}
          </LangTabs>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-30 flex justify-end gap-2 border-t border-slate-200 bg-white/90 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:left-64">
          <button type="button" className="btn-ghost" onClick={() => setF(null)}>{t('cancel')}</button>
          <button className="btn-primary" disabled={busy}>{t('save')}</button>
        </div>
      </form>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="h-section">{t('pagesLbl')}</h1><p className="text-xs text-slate-500">Terms &amp; conditions, policies, about us … edited with the rich-text editor</p></div>
        <button className="btn-primary" onClick={() => setF(blank)}><Plus className="h-4 w-4" />{t('add')}</button></div>
      <div className="space-y-2">
        {(list || []).map((p) => (
          <div key={p._id} className="card flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{p.title.en} {p.title.bn && <span className="font-normal text-slate-500">· {p.title.bn}</span>}</div>
              <div className="text-xs text-slate-500">/pages/{p.slug} {!p.active && <span className="chip ml-1 bg-slate-200 text-slate-600">draft</span>} {p.showInFooter && <span className="chip ml-1 bg-brand-100 text-brand-700">footer</span>}</div>
            </div>
            <Link href={`/pages/${p.slug}`} target="_blank" className="p-2 text-slate-500" aria-label="view"><ExternalLink className="h-4 w-4" /></Link>
            <button className="p-2 text-brand-600" onClick={() => setF({ ...blank, ...p, title: { en: '', bn: '', ...p.title }, content: { en: '', bn: '', ...p.content } })}><Pencil className="h-4 w-4" /></button>
            <button className="p-2 text-red-500" onClick={() => del(p)}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {list && !list.length && <p className="py-10 text-center text-slate-500">—</p>}
      </div>
    </div>
  );
}
