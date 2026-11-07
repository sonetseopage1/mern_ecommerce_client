'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/hooks';

// Bold title, short orange underline on a thin rule, "VIEW ALL ITEMS →" on the right
export default function SectionHead({ title, href, children }) {
  const { t } = useLang();
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
          {children}
        </div>
        {href && <Link href={href} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-accent-500 hover:underline">{t('viewAllItems')}<ArrowRight className="h-4 w-4" /></Link>}
      </div>
      <div className="relative mt-2 border-b border-slate-300 dark:border-slate-700"><span className="absolute -bottom-px left-0 h-1 w-12 bg-brand-500" /></div>
    </div>
  );
}
