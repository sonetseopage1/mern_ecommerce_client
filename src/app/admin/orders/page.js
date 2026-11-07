'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import api from '@/lib/api';
import { useLang } from '@/lib/hooks';
import { statusColor } from '@/lib/pricing';

const payColor = { paid: 'bg-emerald-100 text-emerald-700', unpaid: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-600', refunded: 'bg-slate-200 text-slate-700' };
const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { t, l, m, n, st, date, lang } = useLang();
  const [orders, setOrders] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [payment, setPayment] = useState('');
  const an = (a) => (a ? (lang === 'bn' ? a.bn || a.name : a.name) : '');

  const load = useCallback(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (status) p.set('status', status);
    if (payment) p.set('payment', payment);
    return api.get(`/orders?${p}`).then((r) => setOrders(r.data));
  }, [q, status, payment]);
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="h-section">{t('orders')} {orders && <span className="text-sm font-normal text-slate-500">({n(orders.length)})</span>}</h1>
        <div className="flex flex-wrap gap-2">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="input !w-56 pl-9" placeholder="Order no / name / phone" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{st(s)}</option>)}</select>
          <select className="input !w-auto" value={payment} onChange={(e) => setPayment(e.target.value)}><option value="">All payments</option>{['paid', 'unpaid', 'failed', 'refunded'].map((s) => <option key={s} value={s}>{t(s)}</option>)}</select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm [&_td]:align-middle">
          <thead className="text-xs uppercase text-slate-500"><tr>
            <th className="p-3">Order</th><th>Customer</th><th>Area</th><th>Items</th><th>Payment</th><th>Status</th><th className="text-right">{t('total')}</th><th /></tr></thead>
          <tbody>
            {(orders || []).map((o) => (
              <tr key={o._id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-3"><Link href={`/admin/orders/${o._id}`} className="font-mono text-xs font-bold text-brand-700 hover:underline dark:text-brand-300">#{o._id.slice(-8).toUpperCase()}</Link><div className="text-xs text-slate-500">{date(o.createdAt)}</div></td>
                <td><div className="font-semibold">{o.shipping?.name || o.user?.name}</div><div className="text-xs text-slate-500">{o.shipping?.phone}</div></td>
                <td className="text-xs">{o.shipping?.upazila ? <>{an(o.shipping.upazila)}<div className="text-slate-500">{an(o.shipping.district)}, {an(o.shipping.division)}</div></> : <span className="text-slate-400">{o.shipping?.city || '—'}</span>}</td>
                <td className="text-xs text-slate-500">{n(o.items.reduce((s, i) => s + i.qty, 0))} · {l(o.items[0]?.name)}{o.items.length > 1 ? ` +${n(o.items.length - 1)}` : ''}</td>
                <td><div className="text-xs font-semibold">{o.paymentMethod === 'SSLCOMMERZ' ? 'Online' : 'COD'}</div><span className={`chip ${payColor[o.paymentStatus]}`}>{t(o.paymentStatus)}</span></td>
                <td><span className={`chip ${statusColor[o.status]}`}>{st(o.status)}</span></td>
                <td className="p-3 text-right font-bold">{m(o.total)}</td>
                <td className="p-3 text-right"><Link href={`/admin/orders/${o._id}`} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Eye className="h-3.5 w-3.5" />{t('viewDetails')}</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders && !orders.length && <p className="p-10 text-center text-slate-500">{t('noOrders')}</p>}
        {!orders && <div className="h-32 animate-pulse" />}
      </div>
    </div>
  );
}
