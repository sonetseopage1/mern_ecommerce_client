'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '@/lib/api';
import { useLang } from '@/lib/hooks';
import { buildTree, flattenTree } from '@/lib/pricing';
import ProductCard from '@/components/ProductCard';

export default function ProductsView() {
  const { t, l, n } = useLang();
  const router = useRouter();
  const sp = useSearchParams();
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const key = sp.toString();

  const get = (k) => sp.get(k) || '';
  const set = (patch) => {
    const p = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    router.replace(`/products?${p.toString()}`);
  };

  useEffect(() => {
    api.get('/categories').then((r) => setCats(flattenTree(buildTree(r.data))));
    api.get('/products/brands').then((r) => setBrands(r.data));
  }, []);

  const load = useCallback(async (pg, append) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(key); params.set('page', pg); params.set('limit', 12);
      const { data: d } = await api.get(`/products?${params}`);
      setData((o) => (append ? { ...d, items: [...o.items, ...d.items] } : d));
    } finally { setLoading(false); }
  }, [key]);

  useEffect(() => { setPage(1); load(1, false); }, [load]);

  const filters = (
    <div className="space-y-4">
      <div>
        <label className="label">{t('categories')}</label>
        <select className="input" value={get('category')} onChange={(e) => set({ category: e.target.value })}>
          <option value="">{t('all')}</option>
          {cats.map((c) => <option key={c._id} value={c.slug}>{'— '.repeat(c.depth)}{l(c.name)}</option>)}
        </select>
      </div>
      <div>
        <label className="label">{t('brand')}</label>
        <select className="input" value={get('brand')} onChange={(e) => set({ brand: e.target.value })}>
          <option value="">{t('all')}</option>
          {brands.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="label">{t('minPrice')}</label><input type="number" className="input" defaultValue={get('minPrice')} onBlur={(e) => set({ minPrice: e.target.value })} /></div>
        <div><label className="label">{t('maxPrice')}</label><input type="number" className="input" defaultValue={get('maxPrice')} onBlur={(e) => set({ maxPrice: e.target.value })} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={get('flash') === '1'} onChange={(e) => set({ flash: e.target.checked ? '1' : '' })} className="h-4 w-4 accent-brand-600" />{t('flashDeals')}</label>
    </div>
  );

  return (
    <div className="container-x py-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="h-section">{get('q') ? `“${get('q')}”` : t('shop')} <span className="text-sm font-normal text-slate-500">({n(data.total)})</span></h1>
        <div className="flex items-center gap-2">
          <select className="input !w-auto !py-2" value={get('sort')} onChange={(e) => set({ sort: e.target.value })} aria-label={t('sortBy')}>
            <option value="">{t('sortBy')}</option>
            <option value="newest">{t('newest')}</option><option value="popular">{t('popular')}</option>
            <option value="price-asc">{t('priceAsc')}</option><option value="price-desc">{t('priceDesc')}</option>
          </select>
          <button className="btn-ghost !px-3 lg:hidden" onClick={() => setOpen(true)} aria-label={t('filters')}><SlidersHorizontal className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="card hidden h-fit max-h-[calc(100vh-5.5rem)] overflow-y-auto p-4 lg:sticky lg:top-[4.5rem] lg:block">{filters}</aside>
        <div>
          {loading && !data.items.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="card aspect-[3/4] animate-pulse" />)}</div>
          ) : data.items.length === 0 ? (
            <p className="py-20 text-center text-slate-500">{t('noProducts')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 2xl:grid-cols-5">{data.items.map((p) => <ProductCard key={p._id} p={p} />)}</div>
          )}
          {page < data.pages && (
            <div className="mt-6 text-center"><button className="btn-ghost" disabled={loading} onClick={() => { setPage(page + 1); load(page + 1, true); }}>{t('loadMore')}</button></div>
          )}
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] animate-pop overflow-y-auto rounded-t-3xl bg-white px-5 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))] dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><b>{t('filters')}</b><button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>
            {filters}
            <button className="btn-primary mt-6 w-full !py-3" onClick={() => setOpen(false)}>{t('apply')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
