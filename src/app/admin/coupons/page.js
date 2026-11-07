'use client';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang } from '@/lib/hooks';

const blank = { code: '', type: 'percent', value: 10, minOrder: 0, maxDiscount: '', usageLimit: '', expiresAt: '', active: true, products: [], showOnProduct: false };
const D = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

// pick the products a coupon is limited to (none selected = every product)
function ProductPicker({ value, onChange }) {
  const { l } = useLang();
  const [q, setQ] = useState('');
  const [res, setRes] = useState([]);
  useEffect(() => {
    if (!q.trim()) { setRes([]); return undefined; }
    const id = setTimeout(() => api.get(`/products?all=1&limit=8&q=${encodeURIComponent(q)}`).then((r) => setRes(r.data.items)), 250);
    return () => clearTimeout(id);
  }, [q]);
  const picked = new Set(value.map((p) => p._id));
  return (
    <div className="col-span-2">
      <label className="label">Valid only for these products <span className="font-normal">(leave empty = all products)</span></label>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {value.map((p) => (
          <span key={p._id} className="flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-2.5 pr-1.5 text-xs font-semibold text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
            {l(p.name)}<button type="button" aria-label="remove" onClick={() => onChange(value.filter((x) => x._id !== p._id))}><X className="h-3.5 w-3.5" /></button>
          </span>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search a product to add…" value={q} onChange={(e) => setQ(e.target.value)} />
        {res.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {res.map((p) => (
              <li key={p._id}>
                <button type="button" disabled={picked.has(p._id)} onClick={() => { onChange([...value, { _id: p._id, name: p.name, slug: p.slug }]); setQ(''); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images?.[0]} alt="" className="h-8 w-8 rounded object-cover" />{l(p.name)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminCoupons() {
  const { t, l, m, n, date } = useLang();
  const [list, setList] = useState([]);
  const [f, setF] = useState(null);
  const load = useCallback(() => api.get('/coupons').then((r) => setList(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    const num = (v) => (v === '' || v == null ? undefined : Number(v));
    const body = { ...f, value: num(f.value), minOrder: num(f.minOrder) || 0, maxDiscount: num(f.maxDiscount), usageLimit: num(f.usageLimit), expiresAt: f.expiresAt || null, products: f.products.map((p) => p._id) };
    try { if (f._id) await api.put(`/coupons/${f._id}`, body); else await api.post('/coupons', body); setF(null); load(); toast.success(t('saved')); } catch (err) { toast.error(errMsg(err)); }
  };
  const del = async (c) => { if (window.confirm(`${t('delete')} ${c.code}?`)) { await api.delete(`/coupons/${c._id}`); load(); } };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="h-section">{t('coupons')}</h1><button className="btn-primary" onClick={() => setF(blank)}><Plus className="h-4 w-4" />{t('add')}</button></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <div key={c._id} className={`card relative overflow-hidden p-4 ${c.active ? '' : 'opacity-60'}`}>
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-500/10" />
            <div className="font-mono text-lg font-extrabold tracking-wider text-brand-600">{c.code}</div>
            <div className="text-2xl font-extrabold">{c.type === 'percent' ? `${n(c.value)}%` : m(c.value)} <span className="text-sm font-medium text-slate-500">{t('off')}</span></div>
            <div className="mt-1 space-y-0.5 text-xs text-slate-500">
              {c.minOrder > 0 && <div>Min order {m(c.minOrder)}</div>}{c.maxDiscount && <div>Max {m(c.maxDiscount)}</div>}
              {c.expiresAt && <div>{t('expDate')}: {date(c.expiresAt)}</div>}<div>Used {n(c.used)}{c.usageLimit ? ` / ${n(c.usageLimit)}` : ''}</div>
              <div className="font-semibold text-slate-700 dark:text-slate-300">{c.products?.length ? `Only: ${c.products.map((p) => l(p.name)).join(', ')}` : 'All products'}</div>
              {c.showOnProduct && <div className="text-brand-600">Shown on product page</div>}
            </div>
            <div className="mt-2 flex justify-end"><button className="p-2 text-brand-600" onClick={() => setF({ ...blank, ...c, expiresAt: D(c.expiresAt), maxDiscount: c.maxDiscount ?? '', usageLimit: c.usageLimit ?? '', products: c.products || [] })}><Pencil className="h-4 w-4" /></button><button className="p-2 text-red-500" onClick={() => del(c)}><Trash2 className="h-4 w-4" /></button></div>
          </div>
        ))}
      </div>
      {f && (
        <div className="fixed inset-0 z-[60] grid place-items-end bg-black/50 sm:place-items-center" onClick={() => setF(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="card grid max-h-[92vh] w-full max-w-xl animate-pop grid-cols-2 gap-3 overflow-y-auto rounded-b-none p-5 sm:rounded-b-md">
            <h2 className="col-span-2 font-bold">{f._id ? t('edit') : t('add')}</h2>
            <div><label className="label">Code</label><input required className="input uppercase" value={f.code} onChange={set('code')} /></div>
            <div><label className="label">Type</label><select className="input" value={f.type} onChange={set('type')}><option value="percent">Percent %</option><option value="fixed">Fixed ৳</option></select></div>
            <div><label className="label">Value</label><input required type="number" min="0" className="input" value={f.value} onChange={set('value')} /></div>
            <div><label className="label">Min order (whole cart)</label><input type="number" min="0" className="input" value={f.minOrder} onChange={set('minOrder')} /></div>
            <div><label className="label">Max discount</label><input type="number" min="0" className="input" value={f.maxDiscount} onChange={set('maxDiscount')} /></div>
            <div><label className="label">Usage limit</label><input type="number" min="0" className="input" value={f.usageLimit} onChange={set('usageLimit')} /></div>
            <div><label className="label">{t('expDate')}</label><input type="date" className="input" value={f.expiresAt} onChange={set('expiresAt')} /></div>
            <label className="flex items-end gap-2 pb-2 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={f.active} onChange={set('active')} />Active</label>
            <ProductPicker value={f.products} onChange={(products) => setF({ ...f, products })} />
            <label className="col-span-2 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={f.showOnProduct} onChange={set('showOnProduct')} />Show this code on the product page{f.products.length ? 's of the selected products' : 's'}</label>
            <div className="col-span-2 flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setF(null)}>{t('cancel')}</button><button className="btn-primary">{t('save')}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
