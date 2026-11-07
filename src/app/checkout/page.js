'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Banknote, CreditCard, Loader2 } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang, useAuth } from '@/lib/hooks';
import { clearCart, cartTotals } from '@/store';
import Summary from '@/components/Summary';
import AreaSelect from '@/components/AreaSelect';

const Radio = ({ checked, disabled, onClick, icon: I, title, sub, badge }) => (
  <button type="button" disabled={disabled} onClick={onClick}
    className={`flex w-full items-start gap-3 rounded-md border-2 p-3 text-left transition ${checked ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700'} ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-brand-300'}`}>
    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${checked ? 'border-brand-500' : 'border-slate-300'}`}>{checked && <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />}</span>
    <I className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
    <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 font-semibold">{title}{badge}</span><span className="block text-xs text-slate-500">{sub}</span></span>
  </button>
);

export default function CheckoutPage() {
  const { t, m } = useLang();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, ready } = useAuth();
  const { items, coupon, hydrated } = useSelector((s) => s.cart);
  const [f, setF] = useState({ name: '', phone: '', address: '', note: '' });
  const [area, setArea] = useState({ division: null, district: null, upazila: null });
  const [quote, setQuote] = useState(null); // { charge, free, freeOver, codAllowed }
  const [methods, setMethods] = useState(null); // { cod:{enabled,availableHere}, sslcommerz:{enabled,sandbox} }
  const [pay, setPay] = useState('');
  const [busy, setBusy] = useState(false);
  const payable = cartTotals(items, coupon).payable;

  useEffect(() => { if (ready && !user) { toast(t('loginRequired')); router.replace('/login?next=/checkout'); } }, [ready, user, router, t]);
  useEffect(() => { if (user) setF((o) => ({ ...o, name: o.name || user.name, phone: o.phone || user.phone || '', address: o.address || user.address || '' })); }, [user]);
  useEffect(() => { if (hydrated && !items.length && !busy) router.replace('/cart'); }, [hydrated, items.length, router, busy]);

  // shipping charge + available payment methods for the chosen thana
  useEffect(() => {
    const id = area.upazila?.id;
    if (!id) { setQuote(null); api.get('/payments/methods').then((r) => setMethods(r.data)).catch(() => {}); return; }
    api.post('/shipping/quote', { upazilaId: id, subtotal: payable }).then((r) => setQuote(r.data)).catch(() => setQuote(null));
    api.get(`/payments/methods?upazila=${id}`).then((r) => setMethods(r.data)).catch(() => {});
  }, [area.upazila?.id, payable]);

  const codOk = methods?.cod.enabled && methods.cod.availableHere;
  const sslOk = methods?.sslcommerz.enabled;
  // keep the selection valid when availability changes
  useEffect(() => {
    if (!methods) return;
    if (pay === 'COD' && !codOk) setPay(sslOk ? 'SSLCOMMERZ' : '');
    else if (pay === 'SSLCOMMERZ' && !sslOk) setPay(codOk ? 'COD' : '');
    else if (!pay) setPay(codOk ? 'COD' : sslOk ? 'SSLCOMMERZ' : '');
  }, [methods, codOk, sslOk, pay]);

  const submit = async (e) => {
    e.preventDefault();
    if (!area.upazila) return toast.error(t('pickAreaFirst'));
    if (!pay) return toast.error(t('paymentMethod'));
    setBusy(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ product: i.productId, variantId: i.variantId, qty: i.qty })),
        shipping: { name: f.name, phone: f.phone, address: f.address, note: f.note, upazilaId: area.upazila.id },
        couponCode: coupon?.code, paymentMethod: pay,
      });
      dispatch(clearCart());
      if (data.paymentUrl) { toast.loading(t('redirectingPay')); window.location.href = data.paymentUrl; return; } // SSLCommerz payment page
      toast.success(t('orderPlaced'));
      router.replace(`/orders/${data.order._id}?placed=1`);
    } catch (err) { toast.error(errMsg(err)); setBusy(false); }
  };
  const bind = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });

  return (
    <form onSubmit={submit} className="container-x grid gap-6 py-4 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <section className="card space-y-4 p-5">
          <h1 className="h-section">{t('checkout')}</h1>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">{t('fullName')} *</label><input required className="input" {...bind('name')} /></div>
            <div><label className="label">{t('phone')} *</label><input required type="tel" inputMode="tel" pattern="[0-9+\-\s]{10,15}" className="input" {...bind('phone')} /></div>
          </div>
          <h2 className="pt-2 text-sm font-bold text-slate-500">{t('deliveryArea')}</h2>
          <AreaSelect value={area} onChange={setArea} />
          <div><label className="label">{t('address')} *</label><textarea required rows={2} className="input" placeholder={t('streetAddress')} {...bind('address')} /></div>
          <div><label className="label">{t('orderNote')}</label><input className="input" {...bind('note')} /></div>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="font-bold">{t('paymentMethod')}</h2>
          {!methods && <div className="h-16 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />}
          {methods?.cod.enabled && (
            <Radio checked={pay === 'COD'} disabled={!methods.cod.availableHere} onClick={() => setPay('COD')} icon={Banknote} title={t('cod')}
              sub={methods.cod.availableHere ? t('codSub2') : t('codUnavailableHere')} />
          )}
          {methods?.sslcommerz.enabled && (
            <Radio checked={pay === 'SSLCOMMERZ'} onClick={() => setPay('SSLCOMMERZ')} icon={CreditCard} title={t('payOnline')} sub={t('payOnlineSub')}
              badge={methods.sslcommerz.sandbox && <span className="chip bg-amber-100 text-amber-700">{t('sandboxMode')}</span>} />
          )}
          {methods && !methods.cod.enabled && !methods.sslcommerz.enabled && <p className="text-sm text-red-500">No payment method is available right now. Please try again later.</p>}
        </section>
      </div>

      <div className="space-y-3 lg:sticky lg:top-24 lg:h-fit">
        <Summary showCoupon={false} shipping={quote ? quote.charge : null} freeOver={quote?.freeOver || 0} />
        {!quote && <p className="text-center text-xs text-slate-500">{t('pickAreaFirst')}</p>}
        <button className="btn-primary w-full !py-3" disabled={busy || !user || !area.upazila || !pay}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{pay === 'SSLCOMMERZ' ? t('payNow') : t('placeOrder')}
        </button>
      </div>
    </form>
  );
}
