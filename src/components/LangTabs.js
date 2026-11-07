'use client';
import { useState } from 'react';

// English | বাংলা tabs; `children` is a function receiving the active language
export default function LangTabs({ children, label }) {
  const [lang, setLang] = useState('en');
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        {label && <span className="label !mb-0">{label}</span>}
        <div className="flex overflow-hidden rounded-md border border-slate-300 text-xs font-bold dark:border-slate-600">
          {[['en', 'English'], ['bn', 'বাংলা']].map(([k, n]) => (
            <button key={k} type="button" onClick={() => setLang(k)} className={`px-3 py-1 ${lang === k ? 'bg-brand-500 text-white' : 'text-slate-600 dark:text-slate-300'}`}>{n}</button>
          ))}
        </div>
      </div>
      {children(lang)}
    </div>
  );
}
