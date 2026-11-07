'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Twitter, Linkedin, Send, MessageCircle, Music2, Pin } from 'lucide-react';
import { useLang } from '@/lib/hooks';
import { useSite, socialHref, telHref } from '@/lib/settings';

const SOCIAL = [['facebook', Facebook], ['instagram', Instagram], ['youtube', Youtube], ['twitter', Twitter], ['tiktok', Music2], ['linkedin', Linkedin], ['telegram', Send], ['whatsapp', MessageCircle], ['pinterest', Pin]];

export default function Footer() {
  const { t, l } = useLang();
  const site = useSite();
  const path = usePathname();
  if (path.startsWith('/admin')) return null;
  const h = 'mb-3 font-bold text-white';
  const a = 'block py-1 text-white/75 hover:text-white';
  const links = site.pages.filter((p) => p.showInFooter !== false);
  return (
    <footer className="mt-10 bg-ink-900 pb-24 text-sm md:mt-12 md:pb-0">
      <div className="container-x grid gap-8 py-8 sm:grid-cols-2 md:grid-cols-4 md:py-10">
        <div>
          <div className="mb-3 text-2xl font-extrabold text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {site.logo ? <img src={site.logo} alt={site.name} className="h-10 max-w-[180px] rounded bg-white/95 p-1 object-contain" /> : site.name}
          </div>
          <p className="text-white/75">{site.footerText || site.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SOCIAL.filter(([k]) => site.social[k]).map(([k, Icon]) => (
              <a key={k} href={socialHref(k, site.social[k])} target="_blank" rel="noopener noreferrer" aria-label={k} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-brand-500"><Icon className="h-4 w-4" /></a>
            ))}
          </div>
        </div>
        <div><div className={h}>{t('quickLinks')}</div>
          <Link className={a} href="/">{t('home')}</Link><Link className={a} href="/products">{t('shop')}</Link>
          <Link className={a} href="/categories">{t('categories')}</Link><Link className={a} href="/products?flash=1">{t('offerZone')}</Link></div>
        <div><div className={h}>{t('information')}</div>
          {links.map((p) => <Link key={p.slug} className={a} href={`/pages/${p.slug}`}>{l(p.title)}</Link>)}
          <Link className={a} href="/faq">{t('faq')}</Link>
          <Link className={a} href="/orders">{t('myOrders')}</Link></div>
        <div className="space-y-2 text-white/80"><div className={h}>{t('contact')}</div>
          {site.phone && <a href={telHref(site.phone)} className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" />{site.phone}</a>}
          {site.email && <a href={`mailto:${site.email}`} className="flex items-center gap-2 break-all"><Mail className="h-4 w-4 shrink-0" />{site.email}</a>}
          {site.address && <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{site.address}</div>}</div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">© {new Date().getFullYear()} {site.name}. All rights reserved.</div>
    </footer>
  );
}
