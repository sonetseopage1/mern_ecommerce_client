'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Tag } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang } from '@/lib/hooks';
import { setCoupon, cartTotals } from '@/store';

export default function Summary({ showCoupon = true, shipping = null, freeOver = 0 }) {
  const { t, m } = useLang();
  const dispatch = useDispatch();
  const { items, coupon } = useSelector((s) => s.cart);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const tot = cartTotals(items, coupon, shipping);

  const apply = async () => {
    setBusy(true);
    try {
      const { data } = await api.post('/coupons/validate', { code, items: items.map((i) => ({ product: i.productId, variantId: i.variantId, qty: i.qty })) });
      dispatch(setCoupon(data)); toast.success(`${data.code} ✓`);
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="card space-y-3 p-4 text-sm">
      {showCoupon && (coupon ? (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          <span className="flex items-center gap-2"><Tag className="h-4 w-4" />{coupon.code}</span>
          <button className="text-xs underline" onClick={() => dispatch(setCoupon(null))}>{t('remove')}</button>
        </div>
      ) : (
        <div className="flex gap-2"><input className="input uppercase" placeholder={t('coupon')} value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="btn-ghost" disabled={!code || busy} onClick={apply}>{t('apply')}</button></div>
      ))}
      <Row k={t('subtotal')} v={m(tot.subtotal)} />
      {tot.discount > 0 && <Row k={t('discount')} v={`− ${m(tot.discount)}`} className="text-emerald-600" />}
      <Row k={t('shipping')} v={tot.shippingKnown ? (tot.shipping ? m(tot.shipping) : t('free')) : <span className="text-xs font-normal text-slate-500">{t('atCheckout')}</span>} />
      {tot.shippingKnown && tot.shipping > 0 && freeOver > 0 && tot.payable < freeOver && <p className="text-[11px] text-emerald-600">{t('addMoreFree').replace('{n}', m(freeOver - tot.payable))}</p>}
      <div className="border-t border-slate-200 pt-3 dark:border-slate-800"><Row k={t('total')} v={m(tot.total)} className="text-lg font-extrabold" /></div>
    </div>
  );
}
const Row = ({ k, v, className = '' }) => <div className={`flex justify-between ${className}`}><span>{k}</span><span>{v}</span></div>;

