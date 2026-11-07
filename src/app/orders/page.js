'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { useLang, useAuth } from '@/lib/hooks';
import { statusColor } from '@/lib/pricing';
import InvoiceModal from '@/components/InvoiceModal';
import ClientOnly from '@/components/ClientOnly';

const payColor = { paid: 'bg-emerald-100 text-emerald-700', unpaid: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-600', refunded: 'bg-slate-200 text-slate-700' };

function Orders() {
  const { t, l, m, st, date } = useLang();
  const { user, ready } = useAuth();
  const router = useRouter();
  const placed = useSearchParams().get('placed');
  const [orders, setOrders] = useState(null);
  const [inv, setInv] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace('/login?next=/orders'); return; }
    api.get('/orders/mine').then((r) => setOrders(r.data));
  }, [ready, user, router]);

  return (
    <div className="container-x py-4">
      {placed && <div className="mb-4 flex items-center gap-2 rounded-md bg-emerald-50 p-4 font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"><CheckCircle2 />{t('orderPlaced')}</div>}
      <h1 className="h-section mb-3">{t('myOrders')}</h1>
      {orders === null ? <div className="card h-32 animate-pulse" /> : orders.length === 0 ? <p className="py-16 text-center text-slate-500">{t('noOrders')}</p> : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o._id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <Link href={`/orders/${o._id}`} className="font-mono text-xs font-bold text-brand-700 hover:underline dark:text-brand-300">#{o._id.slice(-8).toUpperCase()} <span className="font-sans font-normal text-slate-500">· {date(o.createdAt)}</span></Link>
                <span className="flex flex-wrap gap-1.5"><span className={`chip ${payColor[o.paymentStatus]}`}>{t(o.paymentStatus)}</span><span className={`chip ${statusColor[o.status]}`}>{st(o.status)}</span></span>
              </div>
              <Link href={`/orders/${o._id}`} className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                {o.items.map((i, k) => (
                  <div key={k} className="flex shrink-0 items-center gap-2 rounded-md bg-slate-50 p-2 pr-3 text-xs dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.image} alt="" className="h-10 w-10 rounded object-cover" />
                    <div><div className="max-w-32 truncate font-semibold">{l(i.name)}</div><div className="text-slate-500">{i.variantLabel} × {i.qty}</div></div>
                  </div>
                ))}
              </Link>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="flex gap-2">
                  <button className="btn-ghost !py-1.5 text-xs" onClick={() => setInv(o)}><FileText className="h-4 w-4" />{t('downloadInvoice')}</button>
                  <Link href={`/orders/${o._id}`} className="btn-ghost !py-1.5 text-xs">{t('viewDetails')}<ChevronRight className="h-4 w-4" /></Link>
                </span>
                <span className="font-extrabold text-brand-600">{t('total')}: {m(o.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {inv && <InvoiceModal order={inv} onClose={() => setInv(null)} />}
    </div>
  );
}
export default function OrdersPage() { return <Suspense><ClientOnly fallback={<div className="container-x py-6"><div className="card h-40 animate-pulse" /></div>}><Orders /></ClientOnly></Suspense>; }
