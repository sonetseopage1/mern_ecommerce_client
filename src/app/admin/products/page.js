'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Zap } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang } from '@/lib/hooks';
import { priceRange, stockOf } from '@/lib/pricing';

export default function AdminProducts() {
  const { t, l, m, n } = useLang();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const load = useCallback(() => api.get(`/products?all=1&limit=100&q=${encodeURIComponent(q)}`).then((r) => setItems(r.data.items)), [q]);
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [load]);

  const del = async (p) => {
    if (!window.confirm(`${t('delete')} “${l(p.name)}”?`)) return;
    try { await api.delete(`/products/${p._id}`); toast.success('✓'); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="h-section">{t('products')}</h1>
        <div className="flex gap-2"><input className="input !w-48" placeholder={t('search')} value={q} onChange={(e) => setQ(e.target.value)} />
          <Link href="/admin/products/new" className="btn-primary"><Plus className="h-4 w-4" />{t('add')}</Link></div>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm [&_td]:align-middle">
          <thead className="text-xs uppercase text-slate-500"><tr><th className="p-3">{t('products')}</th><th>{t('brand')}</th><th>{t('total')}</th><th>Stock</th><th /></tr></thead>
          <tbody>
            {(items || []).map((p) => { const r = priceRange(p); return (
              <tr key={p._id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images?.[0]} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    <div><div className="font-semibold">{l(p.name)}</div><div className="text-xs text-slate-500">{l(p.category?.name)} {p.variants?.length ? `· ${n(p.variants.length)} var.` : ''}</div></div>
                  </div>
                </td>
                <td>{p.brand}</td>
                <td><b>{m(r.min)}</b> {r.old && <s className="text-xs text-slate-400">{m(r.old)}</s>} {r.flash && <Zap className="inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />}</td>
                <td className={stockOf(p) <= 5 ? 'font-bold text-red-500' : ''}>{n(stockOf(p))}</td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/products/${p._id}`} aria-label={t('edit')} title={t('edit')} className="grid h-9 w-9 place-items-center rounded-md text-brand-600 transition hover:bg-brand-50 dark:hover:bg-slate-800"><Pencil className="h-4 w-4" /></Link>
                    <button type="button" onClick={() => del(p)} aria-label={t('delete')} title={t('delete')} className="grid h-9 w-9 place-items-center rounded-md text-red-500 transition hover:bg-red-50 dark:hover:bg-slate-800"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>); })}
          </tbody>
        </table>
        {items && !items.length && <p className="p-6 text-center text-slate-500">{t('noProducts')}</p>}
      </div>
    </div>
  );
}
