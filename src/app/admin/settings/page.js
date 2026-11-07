'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api, { errMsg } from '@/lib/api';
import { useLang, useAuth } from '@/lib/hooks';
import { ImageField } from '@/components/ImageField';

const Card = ({ title, hint, children }) => (
  <section className="card space-y-4 p-4 sm:p-5">
    <div><h2 className="font-bold">{title}</h2>{hint && <p className="text-xs text-slate-500">{hint}</p>}</div>
    {children}
  </section>
);
const Field = ({ label, children, className = '' }) => <div className={className}><label className="label">{label}</label>{children}</div>;

// bilingual (English + Bangla) field pair – declared outside the page so inputs keep focus while typing
function BI({ f, bi, k, label, area, rows = 2, ph }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[['en', `${label} (English)`], ['bn', `${label} (বাংলা)`]].map(([lang, lb]) => (
        <Field key={lang} label={lb}>
          {area ? <textarea rows={rows} className="input" placeholder={ph} value={f[k]?.[lang] || ''} onChange={(e) => bi(k, lang, e.target.value)} />
            : <input className="input" placeholder={ph} value={f[k]?.[lang] || ''} onChange={(e) => bi(k, lang, e.target.value)} />}
        </Field>
      ))}
    </div>
  );
}

const SOCIAL = [['facebook', 'Facebook', 'https://facebook.com/yourpage'], ['instagram', 'Instagram', 'https://instagram.com/yourpage'], ['youtube', 'YouTube', 'https://youtube.com/@channel'], ['twitter', 'X / Twitter', 'https://x.com/handle'], ['tiktok', 'TikTok', 'https://tiktok.com/@handle'], ['linkedin', 'LinkedIn', 'https://linkedin.com/company/name'], ['telegram', 'Telegram', 'https://t.me/handle'], ['whatsapp', 'WhatsApp (number or link)', '88017XXXXXXXX'], ['pinterest', 'Pinterest', 'https://pinterest.com/name']];

export default function AdminSettings() {
  const { t } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user && user.role !== 'admin') router.replace('/admin'); }, [user, router]);
  useEffect(() => { api.get('/settings').then((r) => setF(r.data)); }, []);

  if (!f) return <div className="card h-40 animate-pulse" />;
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const bi = (k, lang, v) => setF((o) => ({ ...o, [k]: { ...(o[k] || {}), [lang]: v } }));
  const nested = (k, sub, v) => setF((o) => ({ ...o, [k]: { ...(o[k] || {}), [sub]: v } }));
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.put('/settings', f); toast.success(`${t('saved')} – the public site refreshes within a minute`); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={save} className="mx-auto max-w-4xl space-y-5 pb-24">
      <h1 className="h-section">{t('settingsLbl')}</h1>

      <Card title="General" hint="Shown in the header, footer, invoices and browser tab.">
        <BI f={f} bi={bi} k="siteName" label="Site name" ph="ShopNest" />
        <BI f={f} bi={bi} k="tagline" label="Tagline" />
        <BI f={f} bi={bi} k="footerText" label="Footer text" area ph="Short text under the logo in the footer" />
      </Card>

      <Card title="Branding" hint="Logo is used in the header, footer and invoices. Favicon appears in the browser tab; app icon is used when the site is added to a phone's home screen.">
        <div className="grid gap-5 sm:grid-cols-3">
          <ImageField label="Logo" value={f.logo} onChange={(v) => set('logo', v)} size="h-20 w-32" hint="PNG with transparent background works best" />
          <ImageField label="Favicon" value={f.favicon} onChange={(v) => set('favicon', v)} hint="Square, 64×64 or larger (PNG / ICO)" />
          <ImageField label="App icon" value={f.appIcon} onChange={(v) => set('appIcon', v)} hint="Square PNG, 512×512 recommended" />
        </div>
      </Card>

      <Card title="SEO & meta tags" hint="Used by search engines and when your link is shared on Facebook, WhatsApp, Telegram etc.">
        <BI f={f} bi={bi} k="metaTitle" label="Meta title" ph="Up to ~60 characters" />
        <BI f={f} bi={bi} k="metaDescription" label="Meta description" area rows={3} ph="Up to ~160 characters" />
        <BI f={f} bi={bi} k="metaKeywords" label="Meta keywords" ph="keyword one, keyword two" />
        <ImageField label="Open Graph (OG) image" value={f.ogImage} onChange={(v) => set('ogImage', v)} size="h-20 w-36" hint="Shown in link previews. Recommended 1200×630 px." />
        {(f.metaTitle?.en || f.metaDescription?.en) && (
          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
            <div className="mb-1 text-[11px] uppercase text-slate-400">Search preview</div>
            <div className="text-lg text-blue-700 dark:text-blue-400">{f.metaTitle?.en || f.siteName?.en}</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">{(f.metaDescription?.en || '').slice(0, 160)}</div>
          </div>
        )}
      </Card>

      <Card title="Contact">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Phone / hotline"><input className="input" value={f.contact?.phone || ''} onChange={(e) => nested('contact', 'phone', e.target.value)} /></Field>
          <Field label="Email"><input type="email" className="input" value={f.contact?.email || ''} onChange={(e) => nested('contact', 'email', e.target.value)} /></Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[['en', 'Address (English)'], ['bn', 'Address (বাংলা)']].map(([lang, lb]) => (
            <Field key={lang} label={lb}><textarea rows={2} className="input" value={f.contact?.address?.[lang] || ''} onChange={(e) => nested('contact', 'address', { ...(f.contact?.address || {}), [lang]: e.target.value })} /></Field>
          ))}
        </div>
      </Card>

      <Card title="Social network links" hint="Only filled links are shown as icons in the footer.">
        <div className="grid gap-3 sm:grid-cols-2">
          {SOCIAL.map(([k, label, ph]) => <Field key={k} label={label}><input className="input" placeholder={ph} value={f.social?.[k] || ''} onChange={(e) => nested('social', k, e.target.value)} /></Field>)}
        </div>
      </Card>

      <Card title="Invoice" hint="Optional message printed at the bottom of every invoice.">
        <BI f={f} bi={bi} k="invoiceNote" label="Invoice note" area ph="Thank you for shopping with us!" />
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-end gap-2 border-t border-slate-200 bg-white/90 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:left-64">
        <button className="btn-primary" disabled={busy}>{t('save')}</button>
      </div>
    </form>
  );
}
