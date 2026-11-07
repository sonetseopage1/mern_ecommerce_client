'use client';
import { Children, useCallback, useEffect, useRef, useState } from 'react';

// Scroll-snap product slider with pagination dots (5 / 4 / 3 / 2 cards per view)
const WIDTHS = {
  product: 'w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)] xl:w-[calc(20%-9.6px)]',
  cat: 'w-[calc(33.333%-8px)] sm:w-[calc(25%-9px)] md:w-[calc(16.666%-10px)] lg:w-[calc(12.5%-10.5px)]',
};

export default function Carousel({ children, size = 'product', auto = 0 }) {
  const ref = useRef(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el || !el.clientWidth) return; // hidden / not laid out yet – keep the previous values
    setPages(Math.min(60, Math.max(1, Math.round(el.scrollWidth / el.clientWidth))));
    setPage(Math.max(0, Math.round(el.scrollLeft / el.clientWidth)));
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [update, children]);

  const go = (i) => ref.current?.scrollTo({ left: i * ref.current.clientWidth, behavior: 'smooth' });

  // optional auto-slide (paused while hovering / touching)
  const paused = useRef(false);
  useEffect(() => {
    if (!auto) return undefined;
    const id = setInterval(() => {
      const el = ref.current;
      if (!el || paused.current || el.scrollWidth <= el.clientWidth + 4) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + el.clientWidth, behavior: 'smooth' });
    }, auto);
    return () => clearInterval(id);
  }, [auto]);

  return (
    <div onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }} onTouchStart={() => { paused.current = true; }} onTouchEnd={() => { setTimeout(() => { paused.current = false; }, 4000); }}>
      <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth">
        {Children.map(children, (c) => (
          <div className={`shrink-0 snap-start ${WIDTHS[size]}`}>{c}</div>
        ))}
      </div>
      {pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: Math.min(60, Math.max(1, pages || 1)) }).map((_, i) => (
            <button key={i} aria-label={`page ${i + 1}`} onClick={() => go(i)}
              className={`h-2.5 rounded-full border border-brand-500 transition-all ${i === page ? 'w-6 bg-brand-500' : 'w-2.5 bg-transparent'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
