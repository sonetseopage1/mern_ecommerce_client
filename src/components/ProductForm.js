'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Wand2, Play, ExternalLink } from 'lucide-react';
import { parseVideo } from '@/lib/video';
import api, { errMsg } from '@/lib/api';
import { useLang } from '@/lib/hooks';
import { buildTree, flattenTree, attrsOf, getOptionGroups } from '@/lib/pricing';
import RichTextEditor from '@/components/RichTextEditor';
import LangTabs from '@/components/LangTabs';
import { ImagesField } from '@/components/ImageField';

const toDT = (d) => (d ? new Date(d).toISOString().slice(0, 16) : '');
const toD = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const blank = {
  name: { en: '', bn: '' }, description: { en: '', bn: '' }, images: [], videos: [], category: '', brand: '', manufacturer: '', mfgDate: '', expDate: '',
  price: '', oldPrice: '', stock: 0, optionGroups: [], variants: [], featured: false, active: true, flashDeal: { active: false, discountPercent: 10, startsAt: '', endsAt: '' },
};
const SUGGEST = ['Color', 'Size', 'RAM', 'Storage', 'ROM', 'Material', 'Style', 'Capacity', 'Weight', 'Flavor', 'Pack'];
const keyOf = (attrs) => attrs.map((a) => `${a.name}=${a.value}`).join('|');
const combos = (groups) => groups.reduce((acc, g) => acc.flatMap((c) => g.values.map((v) => [...c, { name: g.name, value: v.label }])), [[]]);

// YouTube / Google Drive / direct video links shown next to the photos on the product page
function VideosField({ value = [], onChange }) {
  const [url, setUrl] = useState('');
  const add = () => {
    const link = url.trim();
    if (!link) return;
    if (!parseVideo(link)) return toast.error('Paste a YouTube, Google Drive or direct video (.mp4 / .webm) link');
    if (value.includes(link)) return toast.error('This video is already added');
    onChange([...value, link]);
    setUrl('');
  };
  return (
    <div>
      <label className="label">Videos <span className="font-normal">(YouTube, Google Drive or .mp4 link)</span></label>
      <div className="flex gap-2">
        <input className="input" placeholder="https://www.youtube.com/watch?v=…  or  https://drive.google.com/file/d/…/view" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <button type="button" className="btn-ghost shrink-0" onClick={add}><Plus className="h-4 w-4" />Add</button>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">Google Drive videos must be shared as “Anyone with the link can view”.</p>
      {value.length > 0 && (
        <ul className="mt-2 space-y-2">
          {value.map((v) => {
            const info = parseVideo(v);
            return (
              <li key={v} className="flex items-center gap-3 rounded-md border border-slate-200 p-2 dark:border-slate-700">
                <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {info?.thumb && <img src={info.thumb} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                  <span className="absolute inset-0 grid place-items-center bg-black/30 text-white"><Play className="h-4 w-4 fill-current" /></span>
                </span>
                <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-brand-700 dark:text-brand-300">{info?.label || 'Video'}</span><span className="block truncate text-xs text-slate-500">{v}</span></span>
                <a href={v} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500" aria-label="open"><ExternalLink className="h-4 w-4" /></a>
                <button type="button" className="p-2 text-red-500" aria-label="remove video" onClick={() => onChange(value.filter((x) => x !== v))}><Trash2 className="h-4 w-4" /></button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const Field = ({ label, children, className = '' }) => <div className={className}><label className="label">{label}</label>{children}</div>;

// one option group: name, type (text / color swatch) and its values
function GroupEditor({ g, onChange, onRemove }) {
  const [val, setVal] = useState('');
  const [hex, setHex] = useState('#1f2937');
  const addValue = () => {
    const label = val.trim();
    if (!label || g.values.some((x) => x.label.toLowerCase() === label.toLowerCase())) return setVal('');
    onChange({ ...g, values: [...g.values, g.type === 'color' ? { label, hex } : { label }] });
    setVal('');
  };
  return (
    <div className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Option name" className="min-w-40 flex-1">
          <input list="opt-names" className="input" placeholder="e.g. Color, RAM, Storage" value={g.name} onChange={(e) => onChange({ ...g, name: e.target.value })} />
        </Field>
        <Field label="Shown as">
          <select className="input" value={g.type} onChange={(e) => onChange({ ...g, type: e.target.value })}>
            <option value="text">Buttons (text)</option><option value="color">Color swatches</option>
          </select>
        </Field>
        <button type="button" className="btn-ghost !px-3 !text-red-500" onClick={onRemove} aria-label="remove option"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {g.values.map((v) => (
          <span key={v.label} className="flex items-center gap-1.5 rounded-full border border-slate-300 py-1 pl-2.5 pr-1.5 text-sm dark:border-slate-600">
            {g.type === 'color' && <span className="h-4 w-4 rounded-full border border-slate-300" style={{ background: v.hex || '#ccc' }} />}{v.label}
            <button type="button" aria-label="remove" className="text-slate-400 hover:text-red-500" onClick={() => onChange({ ...g, values: g.values.filter((x) => x.label !== v.label) })}><X className="h-3.5 w-3.5" /></button>
          </span>
        ))}
        <div className="flex items-center gap-1">
          {g.type === 'color' && <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-9 w-9 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5" aria-label="color" />}
          <input className="input !w-36 !py-1.5" placeholder={g.type === 'color' ? 'Color name' : 'Add value'} value={val} onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addValue(); } }} />
          <button type="button" className="btn-ghost !px-2.5 !py-1.5" onClick={addValue}><Plus className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

export default function ProductForm({ id }) {
  const { t, l } = useLang();
  const router = useRouter();
  const [f, setF] = useState(blank);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState(false);
  const [bulk, setBulk] = useState({ price: '', oldPrice: '', stock: '' });

  useEffect(() => {
    api.get('/categories?all=1').then((r) => setCats(flattenTree(buildTree(r.data))));
    if (id) api.get(`/products/${id}`).then(({ data: p }) => {
      setF({
        ...blank, ...p, category: p.category?._id || '', mfgDate: toD(p.mfgDate), expDate: toD(p.expDate), name: { en: '', bn: '', ...p.name }, description: { en: '', bn: '', ...p.description },
        optionGroups: getOptionGroups(p).map((g) => ({ ...g, values: g.values.map((v) => ({ ...v })) })),
        variants: (p.variants || []).map((v) => ({ ...v, attributes: attrsOf(v) })),
        flashDeal: { ...blank.flashDeal, ...p.flashDeal, startsAt: toDT(p.flashDeal?.startsAt), endsAt: toDT(p.flashDeal?.endsAt) },
      });
      setLoading(false);
    });
  }, [id]);

  const up = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const upN = (k, lang, v) => setF((o) => ({ ...o, [k]: { ...o[k], [lang]: v } }));
  const upFlash = (k, v) => setF((o) => ({ ...o, flashDeal: { ...o.flashDeal, [k]: v } }));
  const setGroup = (i, g) => setF((o) => ({ ...o, optionGroups: o.optionGroups.map((x, j) => (j === i ? g : x)) }));
  const addGroup = (name = '') => setF((o) => ({ ...o, optionGroups: [...o.optionGroups, { name, type: name === 'Color' ? 'color' : 'text', values: [] }] }));
  const upVar = (i, k, v) => setF((o) => ({ ...o, variants: o.variants.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));

  // builds every combination of the option values; rows that already exist keep their price / stock
  const generate = () => {
    const groups = f.optionGroups.filter((g) => g.name.trim() && g.values.length);
    if (!groups.length) return toast.error('Add at least one option with values first');
    const existing = new Map(f.variants.map((v) => [keyOf(attrsOf(v)), v]));
    const rows = combos(groups.map((g) => ({ ...g, name: g.name.trim() }))).map((attrs) => existing.get(keyOf(attrs)) || { attributes: attrs, price: f.price || 0, oldPrice: f.oldPrice ?? '', stock: 0, sku: '', image: '' });
    setF((o) => ({ ...o, optionGroups: groups, variants: rows.map((r) => ({ ...r, attributes: r.attributes })) }));
    toast.success(`${rows.length} variants ready – set the price & stock of each`);
  };
  const applyBulk = () => setF((o) => ({
    ...o, variants: o.variants.map((v) => ({ ...v, ...(bulk.price !== '' ? { price: bulk.price } : {}), ...(bulk.oldPrice !== '' ? { oldPrice: bulk.oldPrice } : {}), ...(bulk.stock !== '' ? { stock: bulk.stock } : {}) })),
  }));

  const submit = async (e) => {
    e.preventDefault();
    const groups = f.optionGroups.filter((g) => g.name.trim() && g.values.length);
    if (groups.length && !f.variants.length) return toast.error('Press “Generate variants” to create the combinations');
    setBusy(true);
    const num = (v) => (v === '' || v == null ? undefined : Number(v));
    const body = {
      ...f, price: num(f.price), oldPrice: num(f.oldPrice), stock: num(f.stock) || 0,
      optionGroups: groups,
      variants: groups.length ? f.variants.map(({ _id, ...v }) => ({ ...(_id ? { _id } : {}), ...v, price: num(v.price), oldPrice: num(v.oldPrice), stock: num(v.stock) || 0 })) : [],
      flashDeal: { ...f.flashDeal, discountPercent: num(f.flashDeal.discountPercent) || 0, startsAt: f.flashDeal.startsAt || null, endsAt: f.flashDeal.endsAt || null },
    };
    try {
      if (id) await api.put(`/products/${id}`, body); else await api.post('/products', body);
      toast.success(t('saved')); router.push('/admin/products');
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  if (loading) return <div className="card h-40 animate-pulse" />;
  const hasVariants = f.variants.length > 0 && f.optionGroups.length > 0;

  return (
    <form onSubmit={submit} className="mx-auto max-w-5xl space-y-5 pb-28">
      <h1 className="h-section">{id ? t('edit') : t('add')} · {t('products')}</h1>
      <datalist id="opt-names">{SUGGEST.map((s) => <option key={s} value={s} />)}</datalist>

      <section className="card grid gap-4 p-4 sm:grid-cols-2">
        <Field label="Name (English) *"><input required className="input" value={f.name.en} onChange={(e) => upN('name', 'en', e.target.value)} /></Field>
        <Field label="নাম (বাংলা)"><input className="input" value={f.name.bn} onChange={(e) => upN('name', 'bn', e.target.value)} /></Field>
        <Field label={`${t('categories')} *`}>
          <select required className="input" value={f.category} onChange={(e) => up('category', e.target.value)}>
            <option value="">—</option>{cats.map((c) => <option key={c._id} value={c._id}>{'— '.repeat(c.depth)}{l(c.name)}</option>)}
          </select>
        </Field>
        <div className="flex flex-col justify-end gap-2 text-sm font-semibold sm:flex-row sm:items-end sm:gap-6">
          <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={f.featured} onChange={(e) => up('featured', e.target.checked)} />{t('featured')}</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={f.active} onChange={(e) => up('active', e.target.checked)} />Active</label>
        </div>
        <div className="sm:col-span-2"><ImagesField label="Product images (the first is the main image)" value={f.images} onChange={(v) => up('images', v)} /></div>
        <div className="sm:col-span-2"><VideosField value={f.videos} onChange={(v) => up('videos', v)} /></div>
        <div className="sm:col-span-2">
          <LangTabs label="Description">
            {(lang) => <RichTextEditor key={lang} minHeight={200} value={f.description?.[lang] || ''} onChange={(html) => upN('description', lang, html)} placeholder={lang === 'bn' ? 'পণ্যের বিবরণ লিখুন…' : 'Describe the product: features, specifications, what is in the box…'} />}
          </LangTabs>
        </div>
      </section>

      <section className="card grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={t('brand')}><input className="input" value={f.brand || ''} onChange={(e) => up('brand', e.target.value)} /></Field>
        <Field label={t('manufacturer')}><input className="input" value={f.manufacturer || ''} onChange={(e) => up('manufacturer', e.target.value)} /></Field>
        <Field label={t('mfgDate')}><input type="date" className="input" value={f.mfgDate} onChange={(e) => up('mfgDate', e.target.value)} /></Field>
        <Field label={t('expDate')}><input type="date" className="input" value={f.expDate} onChange={(e) => up('expDate', e.target.value)} /></Field>
        <Field label="New price (৳) *"><input required type="number" min="0" className="input" value={f.price} onChange={(e) => up('price', e.target.value)} /></Field>
        <Field label="Old price (৳)"><input type="number" min="0" className="input" value={f.oldPrice ?? ''} onChange={(e) => up('oldPrice', e.target.value)} /></Field>
        <Field label="Stock (used when there are no variants)"><input type="number" min="0" className="input" value={f.stock} onChange={(e) => up('stock', e.target.value)} /></Field>
      </section>

      <section className="card space-y-3 p-4">
        <label className="flex items-center gap-2 font-bold"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={f.flashDeal.active} onChange={(e) => upFlash('active', e.target.checked)} />⚡ {t('flashDeals')}</label>
        {f.flashDeal.active && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Discount %"><input type="number" min="1" max="95" className="input" value={f.flashDeal.discountPercent} onChange={(e) => upFlash('discountPercent', e.target.value)} /></Field>
            <Field label="Starts"><input type="datetime-local" className="input" value={f.flashDeal.startsAt} onChange={(e) => upFlash('startsAt', e.target.value)} /></Field>
            <Field label="Ends"><input type="datetime-local" required className="input" value={f.flashDeal.endsAt} onChange={(e) => upFlash('endsAt', e.target.value)} /></Field>
          </div>
        )}
      </section>

      {/* ---------- options + variants ---------- */}
      <section className="card space-y-4 p-4">
        <div>
          <h2 className="font-bold">Options &amp; variants</h2>
          <p className="text-xs text-slate-500">Add any options the product comes in – e.g. a phone: <b>Color</b>, <b>RAM</b>, <b>Storage</b>. Every combination gets its own price and stock.</p>
        </div>
        <div className="space-y-3">
          {f.optionGroups.map((g, i) => <GroupEditor key={i} g={g} onChange={(ng) => setGroup(i, ng)} onRemove={() => setF((o) => ({ ...o, optionGroups: o.optionGroups.filter((_, j) => j !== i), variants: [] }))} />)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['Color', 'Size', 'RAM', 'Storage'].filter((n) => !f.optionGroups.some((g) => g.name === n)).map((n) => <button key={n} type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => addGroup(n)}><Plus className="h-3.5 w-3.5" />{n}</button>)}
          <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => addGroup('')}><Plus className="h-3.5 w-3.5" />Other option</button>
          {f.optionGroups.length > 0 && <button type="button" className="btn-primary !py-1.5 text-sm" onClick={generate}><Wand2 className="h-4 w-4" />Generate variants</button>}
        </div>

        {hasVariants && (
          <>
            <div className="flex flex-wrap items-end gap-2 rounded-md bg-slate-50 p-3 dark:bg-slate-800/60">
              <span className="text-xs font-semibold text-slate-500">Set for all {f.variants.length} variants:</span>
              <input type="number" min="0" className="input !w-28 !py-1.5" placeholder="Price" value={bulk.price} onChange={(e) => setBulk({ ...bulk, price: e.target.value })} />
              <input type="number" min="0" className="input !w-28 !py-1.5" placeholder="Old price" value={bulk.oldPrice} onChange={(e) => setBulk({ ...bulk, oldPrice: e.target.value })} />
              <input type="number" min="0" className="input !w-24 !py-1.5" placeholder="Stock" value={bulk.stock} onChange={(e) => setBulk({ ...bulk, stock: e.target.value })} />
              <button type="button" className="btn-ghost !py-1.5 text-sm" onClick={applyBulk}>Apply</button>
            </div>
            <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr>
                  <th className="p-2">Variant</th><th className="p-2">Price (৳)</th><th className="p-2">Old price</th><th className="p-2">Stock</th><th className="p-2">SKU</th><th className="p-2">Image URL</th><th /></tr></thead>
                <tbody>
                  {f.variants.map((v, i) => (
                    <tr key={v._id || keyOf(v.attributes)} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-semibold">{attrsOf(v).map((a) => a.value).join(' / ')}</td>
                      <td className="p-1"><input required type="number" min="0" className="input !w-28 !py-1.5" value={v.price} onChange={(e) => upVar(i, 'price', e.target.value)} /></td>
                      <td className="p-1"><input type="number" min="0" className="input !w-28 !py-1.5" value={v.oldPrice ?? ''} onChange={(e) => upVar(i, 'oldPrice', e.target.value)} /></td>
                      <td className="p-1"><input type="number" min="0" className="input !w-24 !py-1.5" value={v.stock} onChange={(e) => upVar(i, 'stock', e.target.value)} /></td>
                      <td className="p-1"><input className="input !w-36 !py-1.5" value={v.sku || ''} onChange={(e) => upVar(i, 'sku', e.target.value)} /></td>
                      <td className="p-1"><input className="input !w-44 !py-1.5" placeholder="optional" value={v.image || ''} onChange={(e) => upVar(i, 'image', e.target.value)} /></td>
                      <td className="p-1 text-right"><button type="button" aria-label="remove variant" className="p-2 text-red-500" onClick={() => setF((o) => ({ ...o, variants: o.variants.filter((_, j) => j !== i) }))}><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-end gap-2 border-t border-slate-200 bg-white/90 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:left-64">
        <button type="button" className="btn-ghost" onClick={() => router.push('/admin/products')}>{t('cancel')}</button>
        <button className="btn-primary" disabled={busy}>{t('save')}</button>
      </div>
    </form>
  );
}
