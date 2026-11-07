'use client';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, X, Loader2 } from 'lucide-react';
import { useLang } from '@/lib/hooks';
import { useSite } from '@/lib/settings';
import { statusLabels } from '@/lib/i18n';
import { L } from '@/lib/pricing';

const S = {
  en: { invoice: 'INVOICE', no: 'Invoice no', date: 'Date', billed: 'Billed to', sold: 'Sold by', item: 'Item', price: 'Price', qty: 'Qty', total: 'Total', subtotal: 'Subtotal', discount: 'Discount', shipping: 'Shipping', free: 'Free', grand: 'Grand total', payment: 'Payment method', cod: 'Cash on delivery', status: 'Status', thanks: 'Thank you for shopping with us!', phone: 'Phone', email: 'Email', coupon: 'Coupon', online: 'Online payment (SSLCommerz)', payStatus: 'Payment status', paid: 'Paid', unpaid: 'Unpaid', due: 'Due on delivery', failed: 'Failed', refunded: 'Refunded', tran: 'Transaction' },
  bn: { invoice: 'ইনভয়েস', no: 'ইনভয়েস নং', date: 'তারিখ', billed: 'গ্রাহকের তথ্য', sold: 'বিক্রেতা', item: 'পণ্য', price: 'দাম', qty: 'পরিমাণ', total: 'মোট', subtotal: 'সাবটোটাল', discount: 'ছাড়', shipping: 'ডেলিভারি', free: 'ফ্রি', grand: 'সর্বমোট', payment: 'পেমেন্ট পদ্ধতি', cod: 'ক্যাশ অন ডেলিভারি', status: 'স্ট্যাটাস', thanks: 'আমাদের সাথে কেনাকাটার জন্য ধন্যবাদ!', phone: 'ফোন', email: 'ইমেইল', coupon: 'কুপন', online: 'অনলাইন পেমেন্ট (SSLCommerz)', payStatus: 'পেমেন্ট স্ট্যাটাস', paid: 'পরিশোধিত', unpaid: 'অপরিশোধিত', due: 'ডেলিভারির সময় পরিশোধযোগ্য', failed: 'ব্যর্থ', refunded: 'ফেরত', tran: 'ট্রানজেকশন' },
};

export default function InvoiceModal({ order, onClose }) {
  const ui = useLang();
  const site = useSite();
  const [lang, setLang] = useState(ui.lang === 'bn' ? 'bn' : 'en');
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  const s = S[lang];
  const num = (v) => Number(v || 0).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US');
  const money = (v) => `৳${num(v)}`;
  const date = new Date(order.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const no = order._id.slice(-8).toUpperCase();
  const siteName = L(site.s.siteName, lang) || 'ShopNest';
  const font = lang === 'bn' ? 'var(--font-bn), "Hind Siliguri", sans-serif' : 'var(--font-inter), Inter, "Segoe UI", sans-serif';
  const sh = order.shipping || {};
  const an = (a) => (a ? (lang === 'bn' ? a.bn || a.name : a.name) : '');
  const payLabel = order.paymentStatus === 'unpaid' && order.paymentMethod === 'COD' ? s.due : s[order.paymentStatus] || order.paymentStatus;
  const customer = order.user && typeof order.user === 'object' ? order.user : null;
  const note = L(site.s.invoiceNote, lang) || s.thanks;

  const download = async () => {
    setBusy(true);
    try {
      await document.fonts?.ready;
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
      const img = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const pw = 210, ph = 297, ih = (canvas.height * pw) / canvas.width;
      let left = ih, pos = 0;
      pdf.addImage(img, 'JPEG', 0, pos, pw, ih);
      left -= ph;
      while (left > 0) { pos -= ph; pdf.addPage(); pdf.addImage(img, 'JPEG', 0, pos, pw, ih); left -= ph; }
      pdf.save(`invoice-${no}-${lang}.pdf`);
    } catch (e) {
      console.error(e);
      toast.error('Could not create the PDF');
    } finally { setBusy(false); }
  };

  const th = { padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em', background: '#0f2d31', color: '#fff' };
  const td = { padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontSize: 14, verticalAlign: 'top' };

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-black/70" role="dialog" aria-modal="true">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{ui.t('invoiceLang')}:</span>
          <div className="flex overflow-hidden rounded-md border border-slate-300 text-sm font-bold dark:border-slate-600">
            {[['en', 'English'], ['bn', 'বাংলা']].map(([k, label]) => (
              <button key={k} onClick={() => setLang(k)} className={`px-3 py-1.5 ${lang === k ? 'bg-brand-500 text-white' : ''}`}>{label}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary !py-2" onClick={download} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{ui.t('downloadPdf')}</button>
          <button className="btn-ghost !px-3 !py-2" onClick={onClose} aria-label={ui.t('close')}><X className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 sm:p-6">
        {/* the invoice itself – A4 width, always white so the PDF looks the same in light and dark mode */}
        <div ref={ref} style={{ width: 794, minHeight: 1000, margin: '0 auto', background: '#fff', color: '#0f172a', padding: 44, fontFamily: font, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
            <div>
              {site.logo
                /* eslint-disable-next-line @next/next/no-img-element */
                ? <img src={site.logo} alt={siteName} crossOrigin="anonymous" style={{ height: 48, maxWidth: 200, objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                : <div style={{ fontSize: 26, fontWeight: 800, color: '#0f2d31' }}>{siteName}</div>}
              <div style={{ fontSize: 12.5, color: '#475569', marginTop: 8, lineHeight: 1.6 }}>
                {L(site.s.contact?.address, lang) && <div>{L(site.s.contact.address, lang)}</div>}
                {site.phone && <div>{s.phone}: {site.phone}</div>}
                {site.email && <div>{s.email}: {site.email}</div>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#f58a1f', letterSpacing: '.04em' }}>{s.invoice}</div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 6, lineHeight: 1.7 }}>
                <div>{s.no}: <b style={{ color: '#0f172a' }}>#{no}</b></div>
                <div>{s.date}: <b style={{ color: '#0f172a' }}>{date}</b></div>
                <div>{s.status}: <b style={{ color: '#0f172a' }}>{statusLabels[lang][order.status] || order.status}</b></div>
              </div>
            </div>
          </div>

          <div style={{ height: 3, background: 'linear-gradient(90deg,#f58a1f,#0f2d31)', margin: '22px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 22 }}>
            <div style={{ fontSize: 13.5, lineHeight: 1.65 }}>
              <div style={{ fontSize: 11.5, textTransform: 'uppercase', color: '#64748b', letterSpacing: '.05em', marginBottom: 4 }}>{s.billed}</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{sh.name || customer?.name}</div>
              {sh.phone && <div>{s.phone}: {sh.phone}</div>}
              {customer?.email && <div>{s.email}: {customer.email}</div>}
              <div>{sh.address}</div>
              {sh.upazila ? <div>{[an(sh.upazila), an(sh.district), an(sh.division)].filter(Boolean).join(', ')}</div> : sh.city && <div>{sh.city}</div>}
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.65, textAlign: 'right' }}>
              <div style={{ fontSize: 11.5, textTransform: 'uppercase', color: '#64748b', letterSpacing: '.05em', marginBottom: 4 }}>{s.payment}</div>
              <div style={{ fontWeight: 700 }}>{order.paymentMethod === 'COD' ? s.cod : s.online}</div>
              <div style={{ color: order.paymentStatus === 'paid' ? '#059669' : '#475569' }}>{s.payStatus}: <b>{payLabel}</b></div>
              {order.payment?.tranId && <div style={{ color: '#64748b', fontSize: 12 }}>{s.tran}: {order.payment.tranId}</div>}
              {order.couponCode && <div style={{ color: '#475569' }}>{s.coupon}: {order.couponCode}</div>}
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: 'left', width: 36 }}>#</th>
                <th style={{ ...th, textAlign: 'left' }}>{s.item}</th>
                <th style={{ ...th, textAlign: 'right' }}>{s.price}</th>
                <th style={{ ...th, textAlign: 'center' }}>{s.qty}</th>
                <th style={{ ...th, textAlign: 'right' }}>{s.total}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((i, k) => (
                <tr key={k}>
                  <td style={td}>{num(k + 1)}</td>
                  <td style={td}><div style={{ fontWeight: 600 }}>{L(i.name, lang)}</div>{i.variantLabel && <div style={{ fontSize: 12, color: '#64748b' }}>{i.variantLabel}</div>}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{money(i.price)}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{num(i.qty)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{money(i.price * i.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <div style={{ width: 300, fontSize: 14, lineHeight: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{s.subtotal}</span><span>{money(order.subtotal)}</span></div>
              {order.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}><span>{s.discount}</span><span>− {money(order.discount)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{s.shipping}</span><span>{order.shippingFee ? money(order.shippingFee) : s.free}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, borderTop: '2px solid #0f2d31', marginTop: 6, paddingTop: 6 }}><span>{s.grand}</span><span style={{ color: '#f58a1f' }}>{money(order.total)}</span></div>
            </div>
          </div>

          <div style={{ marginTop: 56, paddingTop: 14, borderTop: '1px dashed #cbd5e1', textAlign: 'center', fontSize: 13.5, color: '#475569' }}>{note}</div>
        </div>
      </div>
    </div>
  );
}
