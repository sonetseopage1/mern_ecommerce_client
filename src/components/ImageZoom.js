'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

const pct = (e, r, cx = e.clientX, cy = e.clientY) => ({
  x: Math.min(100, Math.max(0, ((cx - r.left) / r.width) * 100)),
  y: Math.min(100, Math.max(0, ((cy - r.top) / r.height) * 100)),
});

function Lightbox({ images, index, setIndex, alt, onClose }) {
  const [zoomed, setZoomed] = useState(false);
  const [o, setO] = useState({ x: 50, y: 50 });
  const touch = useRef({ x: 0, swiped: false });
  const n = images.length;
  const go = useCallback((d) => { setZoomed(false); setIndex((index + d + n) % n); }, [index, n, setIndex]);

  useEffect(() => {
    const key = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', key);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = prev; };
  }, [go, onClose]);

  const click = (e) => {
    if (touch.current.swiped) { touch.current.swiped = false; return; }
    setO(pct(e, e.currentTarget.getBoundingClientRect()));
    setZoomed((z) => !z);
  };

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black/95 pt-safe pb-safe" role="dialog" aria-modal="true" aria-label={alt}>
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm opacity-80">{index + 1} / {n}</span>
        <div className="flex gap-2">
          <button onClick={() => setZoomed((z) => !z)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="zoom">{zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}</button>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="close"><X className="h-5 w-5" /></button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 select-none overflow-hidden" onClick={click}
        onMouseMove={zoomed ? (e) => setO(pct(e, e.currentTarget.getBoundingClientRect())) : undefined}
        onTouchStart={(e) => { touch.current.x = e.touches[0].clientX; touch.current.swiped = false; }}
        onTouchMove={zoomed ? (e) => setO(pct(e, e.currentTarget.getBoundingClientRect(), e.touches[0].clientX, e.touches[0].clientY)) : undefined}
        onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touch.current.x; if (!zoomed && Math.abs(dx) > 50) { touch.current.swiped = true; go(dx < 0 ? 1 : -1); } }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[index]} alt={alt} draggable={false} className="h-full w-full object-contain transition-transform duration-200"
          style={{ transform: zoomed ? 'scale(2.6)' : 'scale(1)', transformOrigin: `${o.x}% ${o.y}%`, cursor: zoomed ? 'zoom-out' : 'zoom-in' }} />
        {n > 1 && !zoomed && (<>
          <button onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30 sm:grid" aria-label="previous"><ChevronLeft className="h-6 w-6" /></button>
          <button onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30 sm:grid" aria-label="next"><ChevronRight className="h-6 w-6" /></button>
        </>)}
      </div>

      {n > 1 && (
        <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto px-4 py-3">
          {images.map((src, k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={k} src={src} alt="" onClick={() => { setZoomed(false); setIndex(k); }} className={`h-14 w-14 shrink-0 cursor-pointer rounded-lg border-2 object-cover ${k === index ? 'border-white' : 'border-transparent opacity-50'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ImageZoom({ images, index, setIndex, alt, badge }) {
  const i = Math.min(index, images.length - 1);
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <div className="card relative aspect-square cursor-zoom-in overflow-hidden"
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        onMouseMove={(e) => setPos(pct(e, e.currentTarget.getBoundingClientRect()))} onClick={() => setOpen(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[i]} alt={alt} draggable={false} className="h-full w-full object-cover transition-transform duration-150 ease-out"
          style={{ transform: hover ? 'scale(2)' : 'scale(1)', transformOrigin: `${pos.x}% ${pos.y}%` }} />
        {badge && <span className="absolute left-0 top-3 rounded-r-full bg-red-600 px-3 py-1 text-sm font-bold text-white shadow">{badge}</span>}
        <span className="pointer-events-none absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white"><ZoomIn className="h-4 w-4" /></span>
      </div>
      {open && <Lightbox images={images} index={i} setIndex={setIndex} alt={alt} onClose={close} />}
    </>
  );
}
