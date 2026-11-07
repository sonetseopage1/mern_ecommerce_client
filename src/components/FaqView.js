'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLang } from '@/lib/hooks';
import RichContent from '@/components/RichContent';

export default function FaqView({ faqs }) {
  const { t, l } = useLang();
  const [open, setOpen] = useState(0);
  return (
    <div className="container-x max-w-3xl py-6">
      <h1 className="mb-1 text-2xl font-extrabold sm:text-3xl">{t('faqTitle')}</h1>
      <div className="mb-5 h-1 w-14 bg-brand-500" />
      {faqs.length === 0 && <p className="py-10 text-center text-slate-500">{t('noFaq')}</p>}
      <ul className="space-y-2">
        {faqs.map((f, i) => (
          <li key={f._id} className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left font-semibold">
              {l(f.question)}<ChevronDown className={`h-5 w-5 shrink-0 text-brand-500 transition ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <div className="border-t border-slate-100 px-4 py-3 text-slate-600 dark:border-slate-800 dark:text-slate-300"><RichContent html={l(f.answer)} /></div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
