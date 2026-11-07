'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Truck, BadgeCheck, Wallet, Headphones, Zap } from 'lucide-react';
import { useLang } from '@/lib/hooks';
import { buildTree } from '@/lib/pricing';
import ProductCard from '@/components/ProductCard';
import Countdown from '@/components/Countdown';
import Carousel from '@/components/Carousel';
import SectionHead from '@/components/SectionHead';

function Hero({ banners = [] }) {
  const { t, l } = useLang();
  // slides come from Admin → Banners; without any, a built-in gradient slider is shown
  const fallback = [
    { bg: 'from-ink-900 via-ink-700 to-ink-500', title: t('heroTitle'), sub: t('heroSub'), cta: t('shopNow'), href: '/products' },
    { bg: 'from-brand-700 via-brand-600 to-brand-400', title: t('offerZone') + ' ⚡', sub: t('couponBanner'), cta: t('offerZone'), href: '/products?flash=1' },
    { bg: 'from-ink-800 via-ink-600 to-brand-600', title: t('genuine'), sub: t('genuineSub') + ' · ' + t('freeShipNote'), cta: t('shopNow'), href: '/products?featured=1' },
  ];
  const slides = banners.length
    ? banners.map((b) => ({ image: b.image, title: l(b.title), sub: l(b.subtitle), cta: l(b.buttonText) || t('shopNow'), href: b.link || '/products' }))
    : fallback;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  useEffect(() => {
    if (paused || n < 2) return undefined;
    const id = setInterval(() => setI((x) => (x + 1) % n), 5500);
    return () => clearInterval(id);
  }, [n, paused]);
  const cur = Math.min(i, n - 1);
  return (
    <div className="relative overflow-hidden rounded-md" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${cur * 100}%)` }}>
        {slides.map((s, k) => (
          <div key={k} className={`relative flex h-52 w-full shrink-0 items-center overflow-hidden px-6 text-white sm:h-72 sm:px-14 lg:h-[26rem] ${s.image ? 'bg-ink-900' : `bg-gradient-to-r ${s.bg}`}`}>
            {s.image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading={k === 0 ? 'eager' : 'lazy'} fetchPriority={k === 0 ? 'high' : 'auto'} draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/5" />
              </>
            ) : (
              <><div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10" /><div className="absolute -bottom-16 right-28 h-48 w-48 rounded-full bg-white/10" /></>
            )}
            <div className="relative max-w-xl">
              <h1 className="text-2xl font-extrabold leading-tight drop-shadow sm:text-4xl lg:text-5xl">{s.title}</h1>
              {s.sub && <p className="mt-2 text-sm text-white/90 drop-shadow sm:text-base lg:text-lg">{s.sub}</p>}
              <Link href={s.href} className="btn mt-4 bg-brand-500 text-white shadow-lg hover:bg-brand-600 sm:mt-5 sm:!px-6 sm:!py-3">{s.cta}</Link>
            </div>
          </div>
        ))}
      </div>
      {n > 1 && (
        <>
          <button aria-label="prev" onClick={() => setI((cur + n - 1) % n)} className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-slate-700 shadow sm:grid"><ChevronLeft className="h-5 w-5" /></button>
          <button aria-label="next" onClick={() => setI((cur + 1) % n)} className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-slate-700 shadow sm:grid"><ChevronRight className="h-5 w-5" /></button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">{slides.map((_, k) => <button key={k} aria-label={`slide ${k + 1}`} onClick={() => setI(k)} className={`h-2 rounded-full transition-all ${k === cur ? 'w-6 bg-brand-500' : 'w-2 bg-white/60'}`} />)}</div>
        </>
      )}
    </div>
  );
}

const Slider = ({ items }) => <Carousel>{items.map((p) => <ProductCard key={p._id} p={p} />)}</Carousel>;

export default function HomeView({ cats, flash, featured, newest, sections, banners = [] }) {
  const { t, l } = useLang();
  // top-level categories followed by their direct children, all in one carousel
  const shownCats = buildTree(cats).flatMap((r) => [r, ...r.children]);
  const end = flash.map((p) => p.flashDeal?.endsAt).filter(Boolean).sort()[0];
  const tints = ['bg-brand-100 text-brand-700', 'bg-ink-100 text-ink-700', 'bg-rose-100 text-rose-700', 'bg-sky-100 text-sky-700', 'bg-violet-100 text-violet-700'];

  return (
    <div className="pb-6">
      <section className="container-x pt-3 md:pt-5"><Hero banners={banners} /></section>

      <section className="container-x mt-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[[Truck, t('fastDelivery'), t('fastDeliverySub')], [BadgeCheck, t('genuine'), t('genuineSub')], [Wallet, t('cod'), t('codSub')], [Headphones, t('support'), t('supportSub')]].map(([I, a, b], i) => (
            <div key={i} className="flex items-center gap-3 rounded-sm border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"><I className="h-8 w-8 shrink-0 text-brand-500" /><div className="min-w-0"><div className="truncate text-sm font-bold">{a}</div><div className="truncate text-xs text-slate-500">{b}</div></div></div>
          ))}
        </div>
      </section>

      {shownCats.length > 0 && (
        <section className="container-x mt-10">
          <SectionHead title={t('popularCats')} href="/categories" />
          <Carousel size="cat" auto={3500}>
            {shownCats.map((c, i) => (
              <Link key={c._id} href={`/products?category=${c.slug}`} className="group flex flex-col items-center gap-2 text-center">
                <span className={`grid aspect-square w-full max-w-28 place-items-center overflow-hidden rounded-full text-3xl font-extrabold shadow-sm ring-2 ring-white transition duration-300 group-hover:ring-4 group-hover:ring-brand-500 dark:ring-slate-800 ${tints[i % tints.length]}`}>
                  {c.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.image} alt={l(c.name)} loading="lazy" draggable={false} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" /> : l(c.name)[0]}
                </span>
                <span className="line-clamp-2 text-xs font-semibold leading-tight sm:text-sm">{l(c.name)}</span>
              </Link>
            ))}
          </Carousel>
        </section>
      )}

      {flash.length > 0 && (
        <section className="container-x mt-10">
          <SectionHead title={<span className="flex items-center gap-2"><Zap className="h-6 w-6 fill-brand-500 text-brand-500" />{t('offerZone')}</span>} href="/products?flash=1">
            {end && <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">{t('endsIn')} <Countdown to={end} dark /></span>}
          </SectionHead>
          <Slider items={flash} />
        </section>
      )}

      {featured.length > 0 && <section className="container-x mt-10"><SectionHead title={t('featured')} href="/products?featured=1" /><Slider items={featured} /></section>}

      {sections.map(({ cat, items }) => (
        <section key={cat._id} className="container-x mt-10">
          <SectionHead title={l(cat.name)} href={`/products?category=${cat.slug}`} />
          <Slider items={items} />
        </section>
      ))}

      {newest.length > 0 && <section className="container-x mt-10"><SectionHead title={t('newArrivals')} href="/products?sort=newest" /><Slider items={newest} /></section>}

      {!cats.length && !newest.length && (
        <p className="container-x mt-10 text-center text-slate-500">API is not reachable or database is empty. Run <code>npm run seed</code> in /server.</p>
      )}
    </div>
  );
}
