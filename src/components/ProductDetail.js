'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Star, Zap, Minus, Plus, ShoppingBag, Check, Tag, Copy, Play } from 'lucide-react';
import { parseVideo } from '@/lib/video';
import VideoPlayer from '@/components/VideoPlayer';
import api from '@/lib/api';
import { useLang } from '@/lib/hooks';
import { priceOf, attrOf, attrsOf, variantText, getOptionGroups } from '@/lib/pricing';
import { addItem } from '@/store';
import Countdown from '@/components/Countdown';
import ImageZoom from '@/components/ImageZoom';
import RichContent from '@/components/RichContent';

export default function ProductDetail({ p }) {
  const { t, l, m, n, date } = useLang();
  const dispatch = useDispatch();
  const router = useRouter();
  const vs = p.variants || [];
  const groups = useMemo(() => getOptionGroups(p), [p]);
  const first = vs.find((v) => v.stock > 0) || vs[0];
  // selected value per option group, e.g. { Color: 'Black', RAM: '8GB', Storage: '128GB' }
  const [sel, setSel] = useState(() => Object.fromEntries(attrsOf(first).map((a) => [a.name, a.value])));
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => { api.get(`/coupons/for-product/${p._id}`).then((r) => setCoupons(r.data)).catch(() => {}); }, [p._id]);

  const variant = vs.length ? vs.find((v) => groups.every((g) => attrOf(v, g.name) === sel[g.name])) : null;
  const pr = priceOf(p, variant);
  const stock = vs.length ? (variant?.stock ?? 0) : p.stock;
  const images = [variant?.image, ...p.images].filter(Boolean);
  // videos follow the photos in the gallery
  const videos = useMemo(() => (p.videos || []).map(parseVideo).filter(Boolean), [p.videos]);
  const total = images.length + videos.length;
  const cur = Math.min(img, Math.max(total - 1, 0));
  const vid = cur >= images.length ? videos[cur - images.length] : null;

  // choosing a value keeps the other choices when that combination exists, otherwise jumps to the closest in-stock variant
  const choose = (group, value) => {
    const next = { ...sel, [group]: value };
    if (vs.some((v) => groups.every((g) => attrOf(v, g.name) === next[g.name]))) return setSel(next);
    const cands = vs.filter((v) => attrOf(v, group) === value);
    const score = (v) => groups.filter((g) => g.name !== group && attrOf(v, g.name) === sel[g.name]).length * 10 + (v.stock > 0 ? 1 : 0);
    const best = cands.sort((a, b) => score(b) - score(a))[0];
    if (best) setSel(Object.fromEntries(attrsOf(best).map((a) => [a.name, a.value])));
  };
  // a value is greyed out when no in-stock variant has it together with the other selected values
  const available = (group, value) => vs.some((v) => v.stock > 0 && attrOf(v, group) === value && groups.every((g) => g.name === group || attrOf(v, g.name) === sel[g.name]));

  const add = (go) => {
    if (vs.length && !variant) return toast.error(t('selectOptions'));
    if (stock <= 0) return toast.error(t('outOfStock'));
    dispatch(addItem({
      key: `${p._id}:${variant?._id || ''}`, productId: p._id, variantId: variant?._id, slug: p.slug, name: p.name,
      image: images[0], variantLabel: variantText(variant), price: pr.price, old: pr.old, qty, stock,
    }));
    toast.success(t('added'));
    if (go) router.push('/cart');
  };

  const expired = p.expDate && new Date(p.expDate) < new Date();
  const copy = (code) => { navigator.clipboard?.writeText(code); toast.success(`${t('copied')}: ${code}`); };

  return (
    <div className="container-x py-4">
      <nav className="mb-3 text-xs text-slate-500">
        <Link href="/">{t('home')}</Link> / <Link href={`/products?category=${p.category?.slug}`}>{l(p.category?.name)}</Link> / <span>{l(p.name)}</span>
      </nav>
      <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
        <div>
          {vid
            ? <VideoPlayer key={vid.url} video={vid} title={l(p.name)} />
            : <ImageZoom images={images} index={cur} setIndex={setImg} alt={l(p.name)} badge={pr.off > 0 ? `-${n(pr.off)}%` : null} />}
          {total > 1 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" onClick={() => setImg(i)} className={`h-16 w-16 shrink-0 cursor-pointer rounded-md border-2 object-cover ${i === cur ? 'border-brand-500' : 'border-transparent opacity-70'}`} />
              ))}
              {videos.map((v, i) => (
                <button key={v.url} type="button" aria-label={`Video ${i + 1}`} onClick={() => setImg(images.length + i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-slate-800 ${images.length + i === cur ? 'border-brand-500' : 'border-transparent opacity-80'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {v.thumb && <img src={v.thumb} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                  <span className="absolute inset-0 grid place-items-center bg-black/30"><span className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-slate-900"><Play className="h-3.5 w-3.5 fill-current" /></span></span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {p.brand && <span className="text-xs font-bold uppercase tracking-wider text-brand-600">{p.brand}</span>}
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{l(p.name)}</h1>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current" />{n(p.rating)}</span>
            <span>{n(p.sold)} {t('sold')}</span>
          </div>

          {pr.flash && p.flashDeal?.endsAt && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-gradient-to-r from-ink-800 to-ink-600 p-3 text-white">
              <span className="flex items-center gap-1 text-sm font-bold"><Zap className="h-4 w-4 fill-amber-300 text-amber-300" />{t('flashDeals')}</span>
              <Countdown to={p.flashDeal.endsAt} />
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">{m(pr.price)}</span>
            {pr.old && <span className="text-lg text-slate-400 line-through">{m(pr.old)}</span>}
            {pr.off > 0 && <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{n(pr.off)}% {t('off')}</span>}
          </div>

          {coupons.length > 0 && (
            <div className="space-y-2">
              {coupons.map((c) => (
                <div key={c._id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed border-brand-400 bg-brand-50 px-3 py-2 text-sm dark:bg-brand-900/20">
                  <span className="flex items-center gap-2"><Tag className="h-4 w-4 text-brand-600" />
                    <span>{t('useCode')} <b className="font-mono tracking-wider">{c.code}</b> – <b>{c.type === 'percent' ? `${n(c.value)}%` : m(c.value)}</b> {t('off')}{c.minOrder > 0 && <span className="text-slate-500"> · {t('minOrderLbl')} {m(c.minOrder)}</span>}</span></span>
                  <button className="flex items-center gap-1 text-xs font-bold text-brand-700 dark:text-brand-300" onClick={() => copy(c.code)}><Copy className="h-3.5 w-3.5" />Copy</button>
                </div>
              ))}
            </div>
          )}

          {/* any number of option groups: Color swatches, RAM, Storage, Size ... */}
          {groups.map((g) => (
            <div key={g.name}>
              <div className="label">{g.name}: <b className="text-slate-800 dark:text-slate-100">{sel[g.name]}</b></div>
              <div className="flex flex-wrap gap-2">
                {g.values.map((val) => {
                  const on = sel[g.name] === val.label, ok = available(g.name, val.label);
                  return g.type === 'color' ? (
                    <button key={val.label} title={val.label} onClick={() => choose(g.name, val.label)}
                      className={`grid h-9 w-9 place-items-center rounded-full border-2 transition ${on ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-slate-300 dark:border-slate-600'} ${ok ? '' : 'opacity-40'}`} style={{ background: val.hex || '#ccc' }}>
                      {on && <Check className="h-4 w-4 text-white mix-blend-difference" />}
                    </button>
                  ) : (
                    <button key={val.label} onClick={() => choose(g.name, val.label)}
                      className={`min-w-12 rounded-md border px-3 py-2 text-sm font-semibold transition ${on ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200' : 'border-slate-200 dark:border-slate-700'} ${ok ? '' : 'opacity-40 line-through'}`}>{val.label}</button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 text-sm">
            <span className={`chip ${stock > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-600'}`}>{stock > 0 ? `${t('inStock')}${stock <= 10 ? ` · ${n(stock)} ${t('left')}` : ''}` : t('outOfStock')}</span>
            {variant?.sku && <span className="text-xs text-slate-400">SKU: {variant.sku}</span>}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Qty qty={qty} setQty={setQty} max={stock} />
            <button className="btn-ghost flex-1" onClick={() => add(false)} disabled={stock <= 0 || expired}><ShoppingBag className="h-4 w-4" />{t('addToCart')}</button>
            <button className="btn-primary flex-1" onClick={() => add(true)} disabled={stock <= 0 || expired}>{t('buyNow')}</button>
          </div>

          <dl className="card grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-sm">
            {[[t('brand'), p.brand], [t('manufacturer'), p.manufacturer], [t('mfgDate'), date(p.mfgDate)], [t('expDate'), date(p.expDate)]].filter(([, v]) => v).map(([k, v]) => (
              <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className={`font-semibold ${k === t('expDate') && expired ? 'text-red-500' : ''}`}>{v}</dd></div>
            ))}
          </dl>
          {l(p.description) && <div><h2 className="mb-2 font-bold">{t('description')}</h2><RichContent html={l(p.description)} className="text-sm text-slate-600 dark:text-slate-300" /></div>}
        </div>
      </div>

      {/* Sticky mobile action bar (app-like) */}
      <div className="fixed inset-x-0 bottom-[calc(3.9rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-2 border-t border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
        <Qty qty={qty} setQty={setQty} max={stock} />
        <button className="btn-ghost flex-1 !px-2" onClick={() => add(false)} disabled={stock <= 0 || expired}><ShoppingBag className="h-4 w-4" />{t('addToCart')}</button>
        <button className="btn-primary flex-1 !px-2" onClick={() => add(true)} disabled={stock <= 0 || expired}>{t('buyNow')}</button>
      </div>
      <div className="h-16 md:hidden" />
    </div>
  );
}

export function Qty({ qty, setQty, max = 99 }) {
  const { n } = useLang();
  return (
    <div className="flex items-center rounded-md border border-slate-200 dark:border-slate-700">
      <button className="grid h-10 w-9 place-items-center" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="-"><Minus className="h-4 w-4" /></button>
      <span className="w-7 text-center text-sm font-bold">{n(qty)}</span>
      <button className="grid h-10 w-9 place-items-center" onClick={() => setQty(Math.min(max || 1, qty + 1))} aria-label="+"><Plus className="h-4 w-4" /></button>
    </div>
  );
}
