'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api, { errMsg } from '@/lib/api';
import OrderView from '@/components/OrderView';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.get(`/orders/${id}`).then((r) => setOrder(r.data)).catch((e) => setErr(errMsg(e))); }, [id]);
  return (
    <div className="mx-auto max-w-6xl">
      {err ? <p className="py-20 text-center text-slate-500">{err}</p> : !order ? <div className="card h-48 animate-pulse" /> : <OrderView order={order} admin backHref="/admin/orders" />}
    </div>
  );
}
