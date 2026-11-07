'use client';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ChevronRight, Loader2, RotateCcw } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang } from '@/lib/hooks';

const NEXT = { division: 'district', district: 'upazila' };

// One area (division / district / thana). Empty fields inherit from the level above.
function Node({ level, area, parentEff, rules, setRule, depth = 0 }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [kids, setKids] = useState(null);
  const rule = rules[`${level}:${area.id}`];
  const eff = { charge: rule?.charge ?? parentEff.charge, cod: rule?.codAllowed ?? parentEff.cod };
  const nm = (a) => (lang === 'bn' ? a.bn || a.name : a.name);
  const childLevel = NEXT[level];

  const toggle = async () => {
    if (!open && kids === null) {
      const url = level === 'division' ? `/geo/districts?division=${area.id}` : `/geo/upazilas?district=${area.id}`;
      setKids((await api.get(url)).data);
    }
    setOpen(!open);
  };
  const codVal = rule?.codAllowed === true ? 'true' : rule?.codAllowed === false ? 'false' : 'inherit';
  const save = (charge, cod) => setRule(level, area.id, { charge, codAllowed: cod });
  const own = rule && (rule.charge != null || rule.codAllowed != null);

  return (
    <>
      <div className={`grid items-center gap-2 border-t border-slate-100 py-2 pr-3 dark:border-slate-800 sm:grid-cols-[1fr_120px_170px_28px] ${level === 'division' ? 'bg-slate-50/70 dark:bg-slate-800/40' : ''}`} style={{ paddingLeft: 12 + depth * 22 }}>
        <div className="flex min-w-0 items-center gap-1.5">
          {childLevel ? (
            <button type="button" onClick={toggle} className="grid h-6 w-6 shrink-0 place-items-center rounded hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="expand"><ChevronRight className={`h-4 w-4 transition ${open ? 'rotate-90' : ''}`} /></button>
          ) : <span className="w-6" />}
          <span className={`truncate ${level === 'division' ? 'font-bold' : level === 'district' ? 'font-semibold' : 'text-sm'}`}>{nm(area)}</span>
          {area.kind === 'thana' && <span className="chip bg-brand-100 text-brand-700">thana</span>}
          {own && <span className="chip bg-brand-500 text-white">custom</span>}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">৳</span>
          <input key={`c${rule?.charge ?? ''}-${parentEff.charge}`} type="number" min="0" className="input !py-1.5" placeholder={String(parentEff.charge)} defaultValue={rule?.charge ?? ''}
            onBlur={(e) => { const v = e.target.value === '' ? null : Number(e.target.value); if (v !== (rule?.charge ?? null)) save(v, rule?.codAllowed ?? null); }} aria-label="charge" />
        </div>
        <select className="input !py-1.5 text-xs" value={codVal} aria-label="cash on delivery"
          onChange={(e) => save(rule?.charge ?? null, e.target.value === 'inherit' ? null : e.target.value === 'true')}>
          <option value="inherit">COD: inherit ({parentEff.cod ? 'allowed' : 'blocked'})</option><option value="true">COD: allowed</option><option value="false">COD: not allowed</option>
        </select>
        <button type="button" title="Clear custom rate" disabled={!own} onClick={() => save(null, null)} className="grid h-7 w-7 place-items-center rounded text-slate-400 hover:text-red-500 disabled:opacity-20"><RotateCcw className="h-3.5 w-3.5" /></button>
      </div>
      {open && kids && kids.map((k) => <Node key={k.id} level={childLevel} area={k} parentEff={eff} rules={rules} setRule={setRule} depth={depth + 1} />)}
    </>
  );
}

export default function AdminShipping() {
  const { t } = useLang();
  const [def, setDef] = useState(null);
  const [rules, setRules] = useState({});
  const [divs, setDivs] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [r, d] = await Promise.all([api.get('/shipping/rules'), api.get('/geo/divisions')]);
    setDef(r.data.default);
    setRules(Object.fromEntries(r.data.rules.map((x) => [`${x.level}:${x.refId}`, x])));
    setDivs(d.data);
  }, []);
  useEffect(() => { load(); }, [load]);

  const saveDefault = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.put('/shipping/default', def); toast.success(t('saved')); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  const setRule = async (level, refId, v) => {
    try {
      await api.put('/shipping/rule', { level, refId, charge: v.charge, codAllowed: v.codAllowed });
      setRules((o) => { const n = { ...o }; if (v.charge == null && v.codAllowed == null) delete n[`${level}:${refId}`]; else n[`${level}:${refId}`] = { level, refId, ...v }; return n; });
      toast.success(t('saved'), { duration: 900 });
    } catch (err) { toast.error(errMsg(err)); }
  };

  if (!def) return <div className="card h-40 animate-pulse" />;
  const rootEff = { charge: def.charge, cod: def.codAllowed };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div><h1 className="h-section">Shipping &amp; delivery areas</h1><p className="text-xs text-slate-500">Set the delivery charge for the whole country, then override it for a division, district or thana. The most specific setting wins.</p></div>

      <form onSubmit={saveDefault} className="card space-y-4 p-4 sm:p-5">
        <h2 className="font-bold">Default (everywhere else)</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="label">Delivery charge (৳)</label><input required type="number" min="0" className="input" value={def.charge} onChange={(e) => setDef({ ...def, charge: e.target.value })} /></div>
          <div><label className="label">Free delivery on orders over (৳)</label><input type="number" min="0" className="input" value={def.freeOver} onChange={(e) => setDef({ ...def, freeOver: e.target.value })} /><p className="mt-1 text-[11px] text-slate-500">0 = never free</p></div>
          <div><label className="label">Cash on delivery</label>
            <select className="input" value={String(def.codAllowed)} onChange={(e) => setDef({ ...def, codAllowed: e.target.value === 'true' })}><option value="true">Allowed</option><option value="false">Not allowed</option></select></div>
        </div>
        <button className="btn-primary" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{t('save')}</button>
      </form>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="font-bold">Charge by area</h2>
          <p className="text-xs text-slate-500">Open a division → district → thana. Leave a box empty to inherit; type a number and click away to save. <span className="chip bg-brand-500 text-white">custom</span> rows have their own setting. Inherited values show in grey.</p>
        </div>
        <div className="hidden bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-800/60 sm:grid sm:grid-cols-[1fr_120px_170px_28px] sm:gap-2"><span className="pl-8">Area</span><span>Charge</span><span>Cash on delivery</span><span /></div>
        {divs.map((d) => <Node key={d.id} level="division" area={d} parentEff={rootEff} rules={rules} setRule={setRule} />)}
      </div>
    </div>
  );
}
