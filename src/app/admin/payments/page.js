'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Banknote, CreditCard, Copy, Loader2, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang, useAuth } from '@/lib/hooks';

const Toggle = ({ on, onChange, label }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
    className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
    <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[1.4rem]' : 'left-0.5'}`} />
  </button>
);

export default function AdminPayments() {
  const { t } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const [cfg, setCfg] = useState(null);
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [test, setTest] = useState(null);

  useEffect(() => { if (user && user.role !== 'admin') router.replace('/admin'); }, [user, router]);
  const load = () => api.get('/payments/config').then((r) => setCfg(r.data));
  useEffect(() => { load(); }, []);
  if (!cfg) return <div className="card h-40 animate-pulse" />;

  const s = cfg.sslcommerz;
  // functional updates so quick successive changes never overwrite each other
  const setS = (patch) => setCfg((c) => ({ ...c, sslcommerz: { ...c.sslcommerz, ...patch } }));
  const setCod = (enabled) => setCfg((c) => ({ ...c, cod: { enabled } }));

  const save = async (e) => {
    e?.preventDefault(); setBusy(true); setTest(null);
    try {
      await api.put('/payments/config', { cod: cfg.cod, sslcommerz: { enabled: s.enabled, sandbox: s.sandbox, storeId: s.storeId, storePassword: pw } });
      setPw(''); await load(); toast.success(t('saved'));
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  const runTest = async () => {
    setTest({ loading: true });
    try { const { data } = await api.post('/payments/test'); setTest({ ok: true, ...data }); } catch (err) { setTest({ ok: false, msg: errMsg(err) }); }
  };
  const copy = (v) => { navigator.clipboard?.writeText(v); toast.success('Copied'); };

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl space-y-5 pb-24">
      <div><h1 className="h-section">Payment methods</h1><p className="text-xs text-slate-500">Choose how customers can pay. At least one method must stay on.</p></div>

      <section className="card flex items-center gap-4 p-4 sm:p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-slate-800"><Banknote className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1"><h2 className="font-bold">Cash on delivery</h2><p className="text-xs text-slate-500">Customers pay in cash when the order arrives. You can still block it for specific areas in <b>Shipping</b>.</p></div>
        <Toggle on={cfg.cod.enabled} onChange={setCod} label="Cash on delivery" />
      </section>

      <section className="card space-y-4 p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-slate-800"><CreditCard className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1"><h2 className="font-bold">SSLCommerz <span className="font-normal text-slate-500">· cards, bKash, Nagad, Rocket, internet banking</span></h2></div>
          <Toggle on={s.enabled} onChange={(v) => setS({ enabled: v })} label="SSLCommerz" />
        </div>

        <div className={`flex items-start gap-2 rounded-md p-3 text-sm ${s.sandbox ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200' : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'}`}>
          {s.sandbox ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{s.sandbox ? <><b>Sandbox (test) mode.</b> No real money moves. Customers see a “Test mode” label at checkout.</> : <><b>Live mode.</b> Real payments will be taken.</>}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Mode</label>
            <select className="input" value={s.sandbox ? 'sandbox' : 'live'} onChange={(e) => setS({ sandbox: e.target.value === 'sandbox' })}><option value="sandbox">Sandbox (testing)</option><option value="live">Live (real payments)</option></select></div>
          <div><label className="label">Store ID</label><input className="input font-mono" autoComplete="off" value={s.storeId} onChange={(e) => setS({ storeId: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Store password</label>
            <input type="password" autoComplete="new-password" className="input font-mono" placeholder={s.hasPassword ? '•••••••• saved – type only to replace it' : 'Store password'} value={pw} onChange={(e) => setPw(e.target.value)} />
            <p className="mt-1 text-[11px] text-slate-500">Stored encrypted on the server and never shown again.</p></div>
        </div>

        {s.storeId === 'testbox' && <p className="rounded-md bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">You are using SSLCommerz&apos;s shared public test store (<code>testbox</code>), good for trying the checkout. For your own sandbox, register free at <a className="font-semibold text-brand-700 underline" href="https://developer.sslcommerz.com/registration/" target="_blank" rel="noopener noreferrer">developer.sslcommerz.com</a>, then paste the Store ID and password they email you. For live payments, use the keys from your merchant panel and switch to Live.</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-ghost" onClick={runTest} disabled={test?.loading}>{test?.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}Test connection</button>
          {test && !test.loading && (test.ok
            ? <span className="text-sm font-semibold text-emerald-600">✓ Connected to {test.gateway} ({test.mode})</span>
            : <span className="text-sm font-semibold text-red-600">✗ {test.msg}</span>)}
          <span className="text-xs text-slate-400">Test uses the saved settings – save first.</span>
        </div>

        <div>
          <h3 className="mb-1 text-sm font-bold">URLs for your SSLCommerz panel</h3>
          <p className="mb-2 text-xs text-slate-500">Sent automatically with every payment. For live mode, also set the <b>IPN URL</b> in the merchant panel (it must be reachable from the internet – <code>localhost</code> works for the redirects but not for IPN).</p>
          <ul className="space-y-1.5">
            {[['Success URL', cfg.urls.success], ['Fail URL', cfg.urls.fail], ['Cancel URL', cfg.urls.cancel], ['IPN URL', cfg.urls.ipn]].map(([k, v]) => (
              <li key={k} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700"><b className="w-20 shrink-0">{k}</b><code className="min-w-0 flex-1 truncate">{v}</code><button type="button" onClick={() => copy(v)} aria-label="copy"><Copy className="h-3.5 w-3.5 text-slate-500" /></button></li>
            ))}
          </ul>
          <a className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 dark:text-brand-300" href="https://developer.sslcommerz.com/doc/v4/" target="_blank" rel="noopener noreferrer">SSLCommerz documentation<ExternalLink className="h-3 w-3" /></a>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-end gap-2 border-t border-slate-200 bg-white/90 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:left-64">
        <button className="btn-primary" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{t('save')}</button>
      </div>
    </form>
  );
}
