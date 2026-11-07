'use client';
import { useRef, useState } from 'react';
import { Upload, X, Star } from 'lucide-react';
import { uploadFiles } from '@/lib/upload';

// One image: preview + upload button + URL box
export function ImageField({ label, value, onChange, hint, round = false, size = 'h-20 w-20' }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    setBusy(true);
    const [url] = await uploadFiles(e.target.files);
    setBusy(false);
    if (url) onChange(url);
    e.target.value = '';
  };
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex items-start gap-3">
        <div className={`${size} shrink-0 overflow-hidden border border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 ${round ? 'rounded-full' : 'rounded-md'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-slate-400"><Upload className="h-5 w-5" /></div>}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex gap-2">
            <button type="button" className="btn-ghost !px-3 !py-2" disabled={busy} onClick={() => ref.current?.click()}><Upload className="h-4 w-4" />{busy ? '…' : 'Upload'}</button>
            {value && <button type="button" className="btn-ghost !px-3 !py-2 !text-red-500" onClick={() => onChange('')}><X className="h-4 w-4" /></button>}
          </div>
          <input className="input !py-2 text-xs" placeholder="…or paste image URL" value={value || ''} onChange={(e) => onChange(e.target.value)} />
          {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
        </div>
        <input ref={ref} type="file" accept="image/*" hidden onChange={pick} />
      </div>
    </div>
  );
}

// Many images (product gallery): the first one is the main image
export function ImagesField({ label, value = [], onChange }) {
  const ref = useRef(null);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const add = (list) => onChange([...value, ...list.filter(Boolean)]);
  const pick = async (e) => {
    setBusy(true);
    add(await uploadFiles(e.target.files));
    setBusy(false);
    e.target.value = '';
  };
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {value.map((src, i) => (
          <div key={src + i} className="group relative h-20 w-20 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-0 top-0 bg-brand-500 px-1 text-[9px] font-bold text-white">MAIN</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-0.5 opacity-0 transition group-hover:opacity-100">
              {i !== 0 ? <button type="button" title="Make main" className="text-white" onClick={() => onChange([src, ...value.filter((_, j) => j !== i)])}><Star className="h-4 w-4" /></button> : <span />}
              <button type="button" title="Remove" className="text-white" onClick={() => onChange(value.filter((_, j) => j !== i))}><X className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="grid h-20 w-20 place-items-center rounded-md border border-dashed border-slate-300 text-xs text-slate-500 hover:border-brand-500 hover:text-brand-600 dark:border-slate-600">
          <span className="flex flex-col items-center gap-1"><Upload className="h-4 w-4" />{busy ? '…' : 'Upload'}</span>
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <input className="input !py-2 text-xs" placeholder="…or paste an image URL and press Add" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (url.trim()) { add([url.trim()]); setUrl(''); } } }} />
        <button type="button" className="btn-ghost !px-3 !py-2" onClick={() => { if (url.trim()) { add([url.trim()]); setUrl(''); } }}>Add</button>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={pick} />
    </div>
  );
}
