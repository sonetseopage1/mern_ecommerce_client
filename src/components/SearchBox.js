'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { useLang } from '@/lib/hooks';
import { priceRange } from '@/lib/pricing';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// bold the part of the name that matches what was typed
function Highlight({ text, term }) {
  if (!term) return text;
  const parts = text.split(new RegExp(`(${esc(term)})`, 'ig'));
  return parts.map((p, i) => (p.toLowerCase() === term.toLowerCase() ? <b key={i} className="text-brand-600">{p}</b> : p));
}

// Header search with live product suggestions (photo, name, price)
export default function SearchBox() {
  const { t, l, m } = useLang();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false); // a search for the current text has finished
  const [active, setActive] = useState(-1);
  const box = useRef(null);
  const seq = useRef(0);
  const term = q.trim();

  useEffect(() => {
    if (term.length < 2) { setItems([]); setLoading(false); setDone(false); return undefined; }
    setLoading(true);
    const id = ++seq.current;
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products?q=${encodeURIComponent(term)}&limit=6`);
        if (id === seq.current) { setItems(data.items); setActive(-1); }
      } catch { if (id === seq.current) setItems([]); }
      finally { if (id === seq.current) { setLoading(false); setDone(true); } }
    }, 250);
    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => {
    const away = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('touchstart', away);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('touchstart', away); };
  }, []);

  const go = (href) => { setOpen(false); setActive(-1); router.push(href); };
  const submit = (e) => { e.preventDefault(); if (!term) return; go(`/products?q=${encodeURIComponent(term)}`); };
  const onKey = (e) => {
    const total = items.length + (term ? 1 : 0); // suggestions + the "see all" row
    if (e.key === 'Escape') { setOpen(false); return; }
    if (!open || !total) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % total); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? total - 1 : a - 1)); }
    else if (e.key === 'Enter' && active >= 0 && active < items.length) { e.preventDefault(); go(`/products/${items[active].slug}`); }
  };
  const showPanel = open && term.length >= 2;

  return (
    <div ref={box} className="relative min-w-0 flex-1 md:max-w-xl lg:max-w-2xl">
      <form onSubmit={submit} role="search" className="flex overflow-hidden rounded-md border-2 border-brand-500 bg-white dark:bg-slate-900">
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKey}
          placeholder={t('search')} aria-label={t('search')} aria-autocomplete="list" autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none md:px-4 md:py-2.5" />
        {q && <button type="button" aria-label="clear" onClick={() => { setQ(''); setItems([]); setOpen(false); }} className="grid w-8 place-items-center text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>}
        <button className="grid w-11 place-items-center bg-brand-500 text-white md:w-14" aria-label="search">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}</button>
      </form>

      {showPanel && (
        <div className="fixed inset-x-3 top-[calc(3.7rem+env(safe-area-inset-top))] z-50 max-h-[70vh] overflow-y-auto rounded-md border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 md:absolute md:inset-x-0 md:top-full md:mt-1.5">
          {items.length === 0 && done && !loading && <div className="px-4 py-6 text-center text-sm text-slate-500">{t('noProducts')}</div>}
          {items.length === 0 && loading && <div className="px-4 py-6 text-center text-sm text-slate-400">…</div>}
          {items.length > 0 && (
            <ul role="listbox">
              {items.map((p, i) => {
                const r = priceRange(p);
                return (
                  <li key={p._id} role="option" aria-selected={active === i}>
                    <Link href={`/products/${p.slug}`} onClick={() => setOpen(false)} onMouseEnter={() => setActive(i)}
                      className={`flex items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-0 dark:border-slate-800 ${active === i ? 'bg-brand-50 dark:bg-slate-800' : ''}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images?.[0]} alt="" className="h-12 w-12 shrink-0 rounded-md border border-slate-200 bg-white object-cover dark:border-slate-700" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium"><Highlight text={l(p.name)} term={term} /></span>
                        <span className="block truncate text-xs text-slate-500">{[p.brand, l(p.category?.name)].filter(Boolean).join(' · ')}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm font-bold text-brand-600">{m(r.min)}</span>
                        {r.old && <span className="block text-[11px] text-slate-400 line-through">{m(r.old)}</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {term && (items.length > 0 || (done && !loading)) && (
            <Link href={`/products?q=${encodeURIComponent(term)}`} onClick={() => setOpen(false)} onMouseEnter={() => setActive(items.length)}
              className={`flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-accent-500 ${active === items.length ? 'bg-brand-50 dark:bg-slate-800' : ''}`}>
              <span className="truncate">{t('seeAllFor')} “{term}”</span><ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
