'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Home, LayoutGrid, ShoppingBag, User, Store } from 'lucide-react';
import { useLang } from '@/lib/hooks';
import { cartTotals } from '@/store';

// App-like bottom tab bar, visible on mobile only
export default function BottomNav() {
  const path = usePathname();
  const { t } = useLang();
  const { items, coupon } = useSelector((s) => s.cart);
  const count = cartTotals(items, coupon).count;
  if (path.startsWith('/admin')) return null;

  const tabs = [
    { href: '/', icon: Home, label: t('home') },
    { href: '/products', icon: Store, label: t('shop') },
    { href: '/categories', icon: LayoutGrid, label: t('categories') },
    { href: '/cart', icon: ShoppingBag, label: t('cart'), badge: count },
    { href: '/account', icon: User, label: t('account') },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/70 bg-white/90 backdrop-blur-xl pb-safe dark:border-slate-800 dark:bg-slate-950/90 md:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {tabs.map(({ href, icon: Icon, label, badge }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition ${active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500'}`}>
                <span className={`relative grid h-7 w-12 place-items-center rounded-full transition ${active ? 'bg-brand-100 dark:bg-brand-900/50' : ''}`}>
                  <Icon className="h-5 w-5" />
                  {badge > 0 && <span className="absolute -right-0.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">{badge}</span>}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
