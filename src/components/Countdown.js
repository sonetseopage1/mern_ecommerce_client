'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/hooks';

export default function Countdown({ to, compact = false, dark = false }) {
  const { t, n } = useLang();
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, +new Date(to) - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [to]);
  if (left === null || !to) return null;
  const s = Math.floor(left / 1000);
  const parts = [[Math.floor(s / 86400), t('days')], [Math.floor((s % 86400) / 3600), t('hrs')], [Math.floor((s % 3600) / 60), t('min')], [s % 60, t('sec')]];
  if (compact) return <span className="tabular-nums">{parts.slice(parts[0][0] ? 0 : 1).map(([v, u]) => `${n(String(v).padStart(2, '0'))}${u}`).join(' ')}</span>;
  return (
    <div className="flex items-center gap-1.5">
      {parts.map(([v, u]) => (
        <div key={u} className={`min-w-11 rounded px-2 py-1 text-center ${dark ? 'bg-ink-800 text-white' : 'bg-white/20 backdrop-blur'}`}>
          <div className="text-base font-extrabold tabular-nums leading-none">{n(String(v).padStart(2, '0'))}</div>
          <div className="text-[9px] uppercase opacity-80">{u}</div>
        </div>
      ))}
    </div>
  );
}
