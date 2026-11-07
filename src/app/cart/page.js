'use client';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2 } from 'lucide-react';
import { useLang } from '@/lib/hooks';
import { removeItem, setQty } from '@/store';
import Summary from '@/components/Summary';
import { Qty } from '@/components/ProductDetail';

export default function CartPage() {
  const { t, l, m } = useLang();
  const dispatch = useDispatch();
  const { items, hydrated } = useSelector((s) => s.cart);
  if (!hydrated) return <div className="container-x py-10"><div className="card h-40 animate-pulse" /></div>;
  if (!items.length) return (
    <div className="container-x py-20 text-center">
      <p className="mb-4 text-slate-500">{t('emptyCart')}</p><Link href="/products" className="btn-primary">{t('shopNow')}</Link>
    </div>
  );
  return (
    <div className="container-x grid gap-6 py-4 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="h-section mb-3">{t('cart')}</h1>
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.key} className="card flex gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/products/${i.slug}`} className="line-clamp-1 font-semibold">{l(i.name)}</Link>
                {i.variantLabel && <span className="text-xs text-slate-500">{i.variantLabel}</span>}
                <div className="mt-1 flex items-baseline gap-2"><b className="text-brand-600">{m(i.price)}</b>{i.old && <s className="text-xs text-slate-400">{m(i.old)}</s>}</div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <Qty qty={i.qty} max={i.stock} setQty={(q) => dispatch(setQty({ key: i.key, qty: q }))} />
                  <button onClick={() => dispatch(removeItem(i.key))} className="p-2 text-red-500" aria-label={t('remove')}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-3 lg:sticky lg:top-24 lg:h-fit">
        <Summary />
        <Link href="/checkout" className="btn-primary w-full">{t('checkout')}</Link>
      </div>
    </div>
  );
}
