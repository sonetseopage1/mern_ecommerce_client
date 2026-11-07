'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from 'next-themes';
import { ShoppingBag, Sun, Moon, Languages, User, LogOut, Shield, Phone, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import api from '@/lib/api';
import { useLang, useAuth } from '@/lib/hooks';
import { useSite, telHref } from '@/lib/settings';
import SearchBox from '@/components/SearchBox';
import { buildTree } from '@/lib/pricing';
import { setLang, logout, cartTotals } from '@/store';

export function ThemeToggle({ className = '' }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button aria-label="Toggle theme" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={`grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white/70 text-slate-600 transition hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 ${className}`}>
      <Sun className="hidden h-4 w-4 dark:block" /><Moon className="h-4 w-4 dark:hidden" />
    </button>
  );
}

export function LangToggle({ className = '' }) {
  const dispatch = useDispatch();
  const { lang } = useLang();
  return (
    <button aria-label="Switch language" onClick={() => dispatch(setLang(lang === 'en' ? 'bn' : 'en'))}
      className={`flex h-9 items-center gap-1 rounded-full border border-slate-200 bg-white/70 px-3 text-xs font-bold text-slate-600 transition hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 ${className}`}>
      <Languages className="h-4 w-4" />{lang === 'en' ? 'বাংলা' : 'EN'}
    </button>
  );
}

// nested flyout items (desktop)
function SubItem({ c }) {
  const { l } = useLang();
  return (
    <li className="group/item relative">
      <Link href={`/products?category=${c.slug}`} className="flex items-center justify-between gap-6 px-4 py-2.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800">
        {l(c.name)}{c.children.length > 0 && <ChevronRight className="h-3.5 w-3.5" />}
      </Link>
      {c.children.length > 0 && (
        <ul className="invisible absolute left-full top-0 z-50 min-w-52 border border-slate-200 bg-white py-1 opacity-0 shadow-xl transition group-hover/item:visible group-hover/item:opacity-100 dark:border-slate-700 dark:bg-slate-900">
          {c.children.map((k) => <SubItem key={k._id} c={k} />)}
        </ul>
      )}
    </li>
  );
}

export default function Header() {
  const { t, l, m } = useLang();
  const site = useSite();
  const router = useRouter();
  const path = usePathname();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { items, coupon } = useSelector((s) => s.cart);
  const tot = cartTotals(items, coupon);
  const [menu, setMenu] = useState(false);
  const [tree, setTree] = useState([]);

  useEffect(() => { api.get('/categories').then((r) => setTree(buildTree(r.data))).catch(() => {}); }, []);

  if (path.startsWith('/admin')) return null;
  const navLink = 'flex h-full shrink-0 items-center gap-1 whitespace-nowrap px-3 text-sm font-medium text-white/95 hover:text-brand-400 md:px-4';

  // display:contents lets the sticky bars stick to the page (not just inside the header box)
  return (
    <header className="contents">
      {/* top row */}
      <div className="sticky top-0 z-40 bg-white shadow-sm pt-safe dark:bg-slate-950 md:static md:shadow-none">
        <div className="container-x flex h-14 items-center gap-3 md:h-[76px] md:gap-8">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight text-ink-800 dark:text-white">
            {site.logo
              /* eslint-disable-next-line @next/next/no-img-element */
              ? <img src={site.logo} alt={site.name} className="h-9 max-w-[150px] object-contain" />
              : <><span className="grid h-9 w-9 place-items-center rounded bg-brand-500 text-white"><ShoppingBag className="h-5 w-5" /></span>
                <span className="hidden sm:inline">{site.name}</span></>}
          </Link>
          <SearchBox />
          <div className="flex shrink-0 items-center gap-3 md:ml-auto">
            {site.phone && <a href={telHref(site.phone)} className="hidden items-center gap-2 lg:flex">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-brand-500 text-brand-500"><Phone className="h-4 w-4" /></span>
              <span className="text-xs leading-tight"><span className="block text-slate-500">{t('hotline')}</span><b className="text-sm">{site.phone}</b></span>
            </a>}
            <LangToggle /><ThemeToggle />
            <Link href="/cart" className="relative hidden h-10 w-10 place-items-center rounded-full border border-slate-200 dark:border-slate-700 md:grid" aria-label={t('cart')}>
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">{tot.count}</span>
            </Link>
            <div className="relative hidden md:block">
              {user ? (
                <>
                  <button onClick={() => setMenu(!menu)} className="grid h-10 w-10 place-items-center rounded-full bg-ink-700 text-sm font-bold text-white">{user.name[0]?.toUpperCase()}</button>
                  {menu && (
                    <div onClick={() => setMenu(false)} className="card absolute right-0 z-50 mt-2 w-52 animate-pop p-2 text-sm">
                      <div className="px-3 py-2 text-xs text-slate-500">{user.name} · <span className="uppercase">{user.role}</span></div>
                      {['admin', 'manager'].includes(user.role) && <Link href="/admin" className="flex items-center gap-2 rounded px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"><Shield className="h-4 w-4" />{t('admin')}</Link>}
                      <Link href="/account" className="flex items-center gap-2 rounded px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"><User className="h-4 w-4" />{t('account')}</Link>
                      <Link href="/orders" className="flex items-center gap-2 rounded px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"><ShoppingBag className="h-4 w-4" />{t('myOrders')}</Link>
                      <button onClick={() => { dispatch(logout()); router.push('/'); }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"><LogOut className="h-4 w-4" />{t('logout')}</button>
                    </div>
                  )}
                </>
              ) : <Link href="/login" className="btn-primary !py-2.5"><User className="h-4 w-4" />{t('login')}</Link>}
            </div>
          </div>
        </div>
      </div>

      {/* dark category bar – sticky, like ghorerbazar */}
      <nav className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 bg-ink-800 md:top-0">
        <div className="container-x">
          <ul className="no-scrollbar flex h-11 items-stretch overflow-x-auto md:h-12 md:overflow-visible">
            <li className="h-full"><Link href="/products?flash=1" className={`${navLink} !text-brand-400`}><Zap className="h-4 w-4 fill-current" />{t('offerZone')}</Link></li>
            {tree.map((c) => (
              <li key={c._id} className="group relative h-full">
                <Link href={`/products?category=${c.slug}`} className={navLink}>{l(c.name)}{c.children.length > 0 && <ChevronDown className="hidden h-3.5 w-3.5 md:block" />}</Link>
                {c.children.length > 0 && (
                  <ul className="invisible absolute left-0 top-full z-50 hidden min-w-56 border border-slate-200 bg-white py-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900 md:block">
                    {c.children.map((k) => <SubItem key={k._id} c={k} />)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
