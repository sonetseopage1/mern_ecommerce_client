'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Package, ClipboardList, Banknote } from 'lucide-react';
import api from '@/lib/api';
import { useLang } from '@/lib/hooks';
import { statusColor } from '@/lib/pricing';

export default function Dashboard() {
  const { t, l, m, n, st, date } = useLang();
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/stats').then((r) => setS(r.data)); }, []);
  if (!s) return <div className="card h-40 animate-pulse" />;
  const cards = [[t('revenue'), m(s.revenue), Banknote, 'from-emerald-500 to-teal-500'], [t('orders'), n(s.orders), ClipboardList, 'from-brand-500 to-brand-700'], [t('products'), n(s.products), Package, 'from-ink-700 to-ink-900'], [t('users'), n(s.users), Users, 'from-accent-400 to-accent-600']];
  const max = Math.max(1, ...s.byStatus.map((x) => x.count));
  return (
    <div className="space-y-6">
      <h1 className="h-section">{t('dashboard')}</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([k, v, I, g]) => (
          <div key={k} className={`rounded-2xl bg-gradient-to-br ${g} p-4 text-white shadow-soft`}><I className="mb-2 h-5 w-5 opacity-80" /><div className="text-xl font-extrabold sm:text-2xl">{v}</div><div className="text-xs opacity-90">{k}</div></div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 font-bold">{t('orders')} · {t('status')}</h2>
          <div className="space-y-2">
            {s.byStatus.map((x) => (
              <div key={x._id} className="flex items-center gap-3 text-sm"><span className="w-24 shrink-0">{st(x._id)}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: `${(x.count / max) * 100}%` }} /></div><b>{n(x.count)}</b></div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <h2 className="mb-3 font-bold">Low stock</h2>
          {s.lowStock.length === 0 ? <p className="text-sm text-slate-500">—</p> : <ul className="space-y-2 text-sm">{s.lowStock.map((p) => <li key={p._id} className="flex justify-between"><Link href={`/admin/products/${p._id}`} className="hover:text-brand-600">{l(p.name)}</Link><b className="text-red-500">{n(p.stock)}</b></li>)}</ul>}
        </div>
      </div>
      <div className="card overflow-x-auto p-4">
        <h2 className="mb-3 font-bold">{t('orders')}</h2>
        <table className="w-full min-w-[480px] text-left text-sm"><tbody>
          {s.recent.map((o) => <tr key={o._id} className="border-t border-slate-100 dark:border-slate-800"><td className="py-2 font-mono text-xs">#{o._id.slice(-6).toUpperCase()}</td><td>{o.user?.name}</td><td>{date(o.createdAt)}</td><td><span className={`chip ${statusColor[o.status]}`}>{st(o.status)}</span></td><td className="text-right font-bold">{m(o.total)}</td></tr>)}
        </tbody></table>
      </div>
    </div>
  );
}
