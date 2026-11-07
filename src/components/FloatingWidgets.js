'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ShoppingBag, ChevronUp, Phone } from 'lucide-react';
import { useLang } from '@/lib/hooks';
import { cartTotals } from '@/store';
import { useSite, telHref } from '@/lib/settings';

export default function FloatingWidgets() {
  const path = usePathname();
  const { t, m, n } = useLang();
  const site = useSite();
  const { items, coupon } = useSelector((s) => s.cart);
  const tot = cartTotals(items, coupon);
  const [top, setTop] = useState(false);
  // product pages have a sticky Add-to-cart / Buy-now bar on mobile, so lift the buttons above it
  const onDetail = /^\/products\/[^/]+/.test(path);

  useEffect(() => {
    const f = () => setTop(window.scrollY > 400);
    f(); window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  if (path.startsWith('/admin')) return null;

  return (
    <>
      {/* orange mini-cart on the right edge (tablet / desktop) */}
      <Link href="/cart" aria-label={t('cart')} className="fixed right-0 top-1/2 z-40 hidden w-24 -translate-y-1/2 overflow-hidden rounded-l-md text-center shadow-xl md:block">
        <span className="flex flex-col items-center gap-1 bg-brand-500 px-2 py-3 text-xs font-semibold text-white"><ShoppingBag className="h-6 w-6" />{n(tot.count)} {t('itemsLbl')}</span>
        <span className="block bg-white px-1 py-1.5 text-xs font-bold text-brand-600 dark:bg-slate-900">{m(tot.subtotal)}</span>
      </Link>

      <div className={`fixed right-4 z-40 flex flex-col items-center gap-3 md:bottom-6 ${onDetail ? 'bottom-[calc(8.9rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(4.8rem+env(safe-area-inset-bottom))]'}`}>
        {top && <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label={t('scrollTop')} className="grid h-11 w-11 place-items-center rounded-full border-2 border-brand-500 bg-white text-brand-600 shadow-lg dark:bg-slate-900"><ChevronUp className="h-5 w-5" /></button>}
        {site.phone && <a href={telHref(site.phone)} aria-label={t('callUs')} className="grid h-12 w-12 place-items-center rounded-full bg-brand-500 text-white shadow-xl"><Phone className="h-5 w-5" /></a>}
      </div>
    </>
  );
}
