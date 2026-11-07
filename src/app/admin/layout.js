'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { LayoutDashboard, Package, FolderTree, TicketPercent, ClipboardList, Users, ExternalLink, Menu, X, LogOut, Settings, FileText, HelpCircle, UserCircle, Images, Truck, CreditCard } from 'lucide-react';
import { useLang, useAuth } from '@/lib/hooks';
import { useSite } from '@/lib/settings';
import { logout } from '@/store';
import { ThemeToggle, LangToggle } from '@/components/Header';

function Avatar({ user, size = 'h-9 w-9' }) {
  return user?.avatar
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={user.avatar} alt={user.name} className={`${size} shrink-0 rounded-full object-cover`} />
    : <span className={`${size} grid shrink-0 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white`}>{user?.name?.[0]?.toUpperCase()}</span>;
}

export default function AdminLayout({ children }) {
  const { t } = useLang();
  const site = useSite();
  const { user, ready } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace('/login?next=/admin');
    else if (!['admin', 'manager'].includes(user.role)) router.replace('/');
  }, [ready, user, router]);
  useEffect(() => { setOpen(false); }, [path]);

  if (!user || !['admin', 'manager'].includes(user.role)) return <div className="grid min-h-screen place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  const isAdmin = user.role === 'admin';
  const nav = [
    { href: '/admin', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/admin/products', icon: Package, label: t('products') },
    { href: '/admin/categories', icon: FolderTree, label: t('categories') },
    { href: '/admin/coupons', icon: TicketPercent, label: t('coupons') },
    { href: '/admin/orders', icon: ClipboardList, label: t('orders') },
    { href: '/admin/banners', icon: Images, label: t('banners') },
    { href: '/admin/shipping', icon: Truck, label: t('shippingLbl') },
    ...(isAdmin ? [
      { href: '/admin/payments', icon: CreditCard, label: t('paymentsLbl') },
      { href: '/admin/users', icon: Users, label: t('users') },
      { href: '/admin/pages', icon: FileText, label: t('pagesLbl') },
      { href: '/admin/faqs', icon: HelpCircle, label: t('faq') },
      { href: '/admin/settings', icon: Settings, label: t('settingsLbl') },
    ] : []),
    { href: '/admin/profile', icon: UserCircle, label: t('profile') },
  ];
  const active = (h) => (h === '/admin' ? path === h : path.startsWith(h));
  const current = nav.find((n) => active(n.href));
  const doLogout = () => { dispatch(logout()); router.push('/login'); };

  return (
    <div className="min-h-screen">
      {open && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)} />}

      {/* left sidebar – logout sits at the bottom */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4 pt-safe dark:border-slate-800">
          <Link href="/admin" className="flex min-w-0 items-center gap-2 text-lg font-extrabold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {site.logo ? <img src={site.logo} alt={site.name} className="h-8 max-w-[150px] object-contain" /> : <span className="truncate text-ink-800 dark:text-white">{site.name}</span>}
          </Link>
          <button className="p-1 md:hidden" onClick={() => setOpen(false)} aria-label="close"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map(({ href, icon: I, label }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${active(href) ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><I className="h-4 w-4" />{label}</Link>
          ))}
        </nav>
        <div className="shrink-0 space-y-2 border-t border-slate-200 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] dark:border-slate-800">
          <Link href="/admin/profile" className="flex items-center gap-3 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Avatar user={user} />
            <span className="min-w-0 leading-tight"><span className="block truncate text-sm font-semibold">{user.name}</span><span className="text-[11px] uppercase text-slate-500">{user.role}</span></span>
          </Link>
          <button onClick={doLogout} className="flex w-full items-center justify-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/40"><LogOut className="h-4 w-4" />{t('logout')}</button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col md:pl-64">
        {/* top navbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 pt-safe backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <button className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 dark:border-slate-700 md:hidden" onClick={() => setOpen(true)} aria-label="menu"><Menu className="h-5 w-5" /></button>
          <h2 className="min-w-0 flex-1 truncate text-base font-bold">{current?.label || t('admin')}</h2>
          <Link href="/" target="_blank" className="hidden items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-slate-800 sm:flex"><ExternalLink className="h-4 w-4" />{t('viewSite')}</Link>
          <LangToggle /><ThemeToggle />
          <Link href="/admin/profile" aria-label={t('profile')}><Avatar user={user} /></Link>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
