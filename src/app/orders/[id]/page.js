'use client';
import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api, { errMsg } from '@/lib/api';
import { useAuth } from '@/lib/hooks';
import OrderView from '@/components/OrderView';
import ClientOnly from '@/components/ClientOnly';

function Detail() {
  const { id } = useParams();
  const sp = useSearchParams();
  const router = useRouter();
  const { user, ready } = useAuth();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace(`/login?next=/orders/${id}`); return; }
    api.get(`/orders/${id}`).then((r) => setOrder(r.data)).catch((e) => setErr(errMsg(e)));
  }, [ready, user, id, router]);

  const flash = sp.get('payment') || (sp.get('placed') ? 'placed' : null);
  return (
    <div className="container-x max-w-5xl py-4">
      {err ? <p className="py-20 text-center text-slate-500">{err}</p>
        : !order ? <div className="card h-48 animate-pulse" />
          : <OrderView order={order} flash={flash} backHref="/orders" />}
    </div>
  );
}
export default function OrderDetailPage() { return <Suspense><ClientOnly fallback={<div className="container-x py-6"><div className="card h-40 animate-pulse" /></div>}><Detail /></ClientOnly></Suspense>; }
