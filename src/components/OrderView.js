'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Clock, Package, Truck, PackageCheck, FileText, Phone, Mail, MapPin, CreditCard, Banknote, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang } from '@/lib/hooks';
import { statusColor } from '@/lib/pricing';
import InvoiceModal from '@/components/InvoiceModal';

const STEPS = [['pending', Clock], ['processing', Package], ['shipped', Truck], ['delivered', PackageCheck]];
const payColor = { paid: 'bg-emerald-100 text-emerald-700', unpaid: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-600', refunded: 'bg-slate-200 text-slate-700' };
const Box = ({ title, children, className = '' }) => <section className={`card p-4 sm:p-5 ${className}`}><h2 className="mb-3 font-bold">{title}</h2>{children}</section>;
const Row = ({ k, v, strong }) => <div className="flex justify-between gap-3 py-0.5"><span className="text-slate-500">{k}</span><span className={`text-right ${strong ? 'font-extrabold' : 'font-medium'}`}>{v}</span></div>;

export default function OrderView({ order: initial, admin = false, flash = null, backHref }) {
  const { t, l, m, st, lang } = useLang();
  const [order, setOrder] = useState(initial);
  const [inv, setInv] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(initial.adminNote || '');
  const o = order;
  const dt = (d) => (d ? new Date(d).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');
  const an = (a) => (a ? (lang === 'bn' ? a.bn || a.name : a.name) : '');
  const sh = o.shipping || {};
  const customer = o.user && typeof o.user === 'object' ? o.user : null;
  const history = Object.fromEntries((o.statusHistory || []).map((h) => [h.status, h]));
  const cancelled = o.status === 'cancelled';
  const stepIdx = STEPS.findIndex(([s]) => s === o.status);
  const online = o.paymentMethod === 'SSLCOMMERZ';

  const act = async (fn, ok) => {
    setBusy(true);
    try { const r = await fn(); if (r?.data?._id) setOrder((x) => ({ ...x, ...r.data, user: x.user })); if (ok) toast.success(ok); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const setStatus = (s) => {
    if (s === 'cancelled' && !window.confirm('Cancel this order? The items go back to stock and a cancelled order cannot be re-opened.')) return;
    act(() => api.put(`/orders/${o._id}/status`, { status: s }), t('saved'));
  };
  const setPayStatus = (paymentStatus) => act(() => api.put(`/orders/${o._id}/payment`, { paymentStatus }), t('saved'));
  const saveNote = () => act(() => api.put(`/orders/${o._id}/note`, { adminNote: note }), t('saved'));
  const payNow = async () => {
    setBusy(true);
    try { const { data } = await api.post(`/orders/${o._id}/pay`); toast.loading(t('redirectingPay')); window.location.href = data.paymentUrl; } catch (e) { toast.error(errMsg(e)); setBusy(false); }
  };

  const banner = {
    success: ['bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', CheckCircle2, t('paySuccessMsg')],
    failed: ['bg-red-50 text-red-600 dark:bg-red-900/30', XCircle, t('payFailedMsg')],
    cancelled: ['bg-amber-50 text-amber-700 dark:bg-amber-900/30', AlertTriangle, t('payCancelMsg')],
    placed: ['bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', CheckCircle2, t('placedMsg')],
  }[flash];

  return (
    <div className="space-y-4">
      {backHref && <Link href={backHref} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 dark:text-brand-300"><ArrowLeft className="h-4 w-4" />{t('backToOrders')}</Link>}
      {banner && <div className={`flex items-center gap-2 rounded-md p-4 font-semibold ${banner[0]}`}>{(() => { const I = banner[1]; return <I className="h-5 w-5 shrink-0" />; })()}{banner[2]}</div>}

      <div className="card flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <div>
          <h1 className="text-xl font-extrabold">{t('orderNoLbl')} <span className="font-mono">#{o._id.slice(-8).toUpperCase()}</span></h1>
          <p className="text-sm text-slate-500">{dt(o.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`chip ${statusColor[o.status]}`}>{st(o.status)}</span>
          <span className={`chip ${payColor[o.paymentStatus]}`}>{t('paymentStatusLbl')}: {t(o.paymentStatus)}</span>
          <button className="btn-ghost !py-1.5 text-sm" onClick={() => setInv(true)}><FileText className="h-4 w-4" />{t('downloadInvoice')}</button>
        </div>
      </div>

      {/* progress */}
      <Box title={t('timeline')}>
        {cancelled ? (
          <div className="flex items-center gap-2 text-red-600"><XCircle className="h-5 w-5" /><b>{st('cancelled')}</b><span className="text-sm text-slate-500">{dt(history.cancelled?.at)}</span></div>
        ) : (
          <ol className="grid grid-cols-4 gap-1">
            {STEPS.map(([s, Icon], i) => {
              const done = i <= stepIdx;
              return (
                <li key={s} className="relative flex flex-col items-center text-center">
                  {i > 0 && <span className={`absolute right-1/2 top-5 h-0.5 w-full -translate-y-1/2 ${i <= stepIdx ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                  <span className={`relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 ${done ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900'}`}><Icon className="h-5 w-5" /></span>
                  <span className={`mt-1.5 text-xs font-semibold ${done ? '' : 'text-slate-400'}`}>{st(s)}</span>
                  <span className="text-[10px] text-slate-400">{history[s] ? dt(history[s].at) : ''}</span>
                </li>
              );
            })}
          </ol>
        )}
      </Box>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Box title={`${t('products')} (${o.items.length})`}>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {o.items.map((i, k) => (
                <li key={k} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.image} alt="" className="h-16 w-16 shrink-0 rounded-md border border-slate-200 object-cover dark:border-slate-700" />
                  <div className="min-w-0 flex-1"><div className="font-semibold">{l(i.name)}</div>{i.variantLabel && <div className="text-xs text-slate-500">{i.variantLabel}</div>}<div className="text-xs text-slate-500">{m(i.price)} × {i.qty}</div></div>
                  <div className="font-bold">{m(i.price * i.qty)}</div>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-0.5 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
              <Row k={t('subtotal')} v={m(o.subtotal)} />
              {o.discount > 0 && <Row k={`${t('discount')}${o.couponCode ? ` (${o.couponCode})` : ''}`} v={`− ${m(o.discount)}`} />}
              <Row k={`${t('shipping')}${sh.district ? ` (${an(sh.district)})` : ''}`} v={o.shippingFee ? m(o.shippingFee) : t('free')} />
              <div className="mt-1 border-t border-slate-100 pt-2 text-lg dark:border-slate-800"><Row k={t('total')} v={m(o.total)} strong /></div>
            </div>
          </Box>
        </div>

        <div className="space-y-4">
          <Box title={t('deliveryInfo')}>
            <div className="space-y-2 text-sm">
              <div className="font-bold">{sh.name}</div>
              {sh.phone && <a href={`tel:${sh.phone}`} className="flex items-center gap-2 text-brand-700 dark:text-brand-300"><Phone className="h-4 w-4" />{sh.phone}</a>}
              {(sh.email || customer?.email) && <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Mail className="h-4 w-4" />{sh.email || customer.email}</div>}
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{sh.address}{sh.upazila && <><br />{[an(sh.upazila), an(sh.district), an(sh.division)].filter(Boolean).join(', ')}</>}{!sh.upazila && sh.city && <>, {sh.city}</>}</span></div>
              {sh.note && <div className="rounded-md bg-slate-50 p-2 text-xs dark:bg-slate-800"><b>{t('noteLbl')}:</b> {sh.note}</div>}
            </div>
          </Box>

          <Box title={t('paymentMethod')}>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 font-semibold">{online ? <CreditCard className="h-4 w-4 text-brand-600" /> : <Banknote className="h-4 w-4 text-brand-600" />}{online ? t('onlinePayment') : t('cod')}</div>
              <Row k={t('paymentStatusLbl')} v={<span className={`chip ${payColor[o.paymentStatus]}`}>{t(o.paymentStatus)}</span>} />
              {o.payment?.tranId && <Row k={t('transactionId')} v={<span className="font-mono text-xs">{o.payment.tranId}</span>} />}
              {o.payment?.cardType && <Row k={t('cardType')} v={o.payment.cardType} />}
              {o.payment?.paidAt && <Row k={t('paidAt')} v={dt(o.payment.paidAt)} />}
            </div>
            {!admin && online && o.paymentStatus !== 'paid' && !cancelled && (
              <button className="btn-primary mt-3 w-full" onClick={payNow} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}{t('payNow')}</button>
            )}
          </Box>

          {admin && (
            <Box title="Manage order">
              <div className="space-y-3 text-sm">
                <div><label className="label">Order status</label>
                  <select className="input" value={o.status} disabled={busy || cancelled} onChange={(e) => setStatus(e.target.value)}>
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{st(s)}</option>)}
                  </select>
                  {cancelled && <p className="mt-1 text-xs text-slate-500">Cancelled orders cannot be re-opened.</p>}
                  {!cancelled && o.paymentMethod === 'COD' && <p className="mt-1 text-xs text-slate-500">Marking a COD order “Delivered” also marks the cash as paid.</p>}</div>
                <div><label className="label">Payment status</label>
                  <select className="input" value={o.paymentStatus} disabled={busy} onChange={(e) => setPayStatus(e.target.value)}>
                    {['unpaid', 'paid', 'failed', 'refunded'].map((s) => <option key={s} value={s}>{t(s)}</option>)}
                  </select></div>
                <div><label className="label">Internal note (customer cannot see it)</label>
                  <textarea rows={3} className="input" value={note} onChange={(e) => setNote(e.target.value)} />
                  <button className="btn-ghost mt-2 !py-1.5" onClick={saveNote} disabled={busy || note === (o.adminNote || '')}>{t('save')}</button></div>
              </div>
            </Box>
          )}
        </div>
      </div>
      {inv && <InvoiceModal order={o} onClose={() => setInv(false)} />}
    </div>
  );
}
