'use client';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Zap, ShoppingCart } from 'lucide-react';
import { useLang } from '@/lib/hooks';
import { priceRange, priceOf, stockOf } from '@/lib/pricing';
import { addItem } from '@/store';

export default function ProductCard({ p }) {
  const { t, l, m, n } = useLang();
  const dispatch = useDispatch();
  const r = priceRange(p);
  const out = stockOf(p) <= 0;
  const hasVariants = p.variants?.length > 0;
  const href = `/products/${p.slug}`;

  const quickAdd = () => {
    const pr = priceOf(p);
    dispatch(addItem({ key: `${p._id}:`, productId: p._id, slug: p.slug, name: p.name, image: p.images?.[0], variantLabel: '', price: pr.price, old: pr.old, qty: 1, stock: p.stock }));
    toast.success(t('added'));
  };
  const btn = 'mt-3 flex w-full items-center justify-center gap-2 rounded-sm border border-brand-500 bg-white px-3 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-transparent';

  return (
    <div className="group flex h-full flex-col rounded-sm border border-slate-200 bg-white transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-white p-3 dark:bg-slate-800/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.images?.[0]} alt={l(p.name)} loading="lazy" className={`h-full w-full object-contain transition duration-500 group-hover:scale-105 ${out ? 'grayscale' : ''}`} />
        {r.off > 0 && <span className="absolute left-0 top-3 bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">-{n(r.off)}%</span>}
        {r.flash && <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-white"><Zap className="h-3.5 w-3.5 fill-current" /></span>}
        {out && <div className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-bold text-white">{t('outOfStock')}</div>}
      </Link>
      <div className="flex flex-1 flex-col p-3 pt-1">
        <Link href={href} className="line-clamp-2 min-h-[2.75rem] text-[15px] leading-snug hover:text-brand-600">{l(p.name)}</Link>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-bold text-brand-600">{hasVariants && r.min !== r.max && <span className="mr-1 text-[10px] font-medium text-slate-500">{t('from')}</span>}{m(r.min)}</span>
          {r.old && <span className="text-sm text-slate-400 line-through">{m(r.old)}</span>}
        </div>
        <div className="mt-auto">
          {hasVariants
            ? <Link href={href} className={btn}><ShoppingCart className="h-4 w-4" />{t('selectOptions')}</Link>
            : <button onClick={quickAdd} disabled={out} className={btn}><ShoppingCart className="h-4 w-4" />{t('addToCart')}</button>}
        </div>
      </div>
    </div>
  );
}
