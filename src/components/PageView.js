'use client';
import { useLang } from '@/lib/hooks';
import RichContent from '@/components/RichContent';

export default function PageView({ page }) {
  const { l } = useLang();
  return (
    <div className="container-x max-w-4xl py-6">
      <h1 className="mb-1 text-2xl font-extrabold sm:text-3xl">{l(page.title)}</h1>
      <div className="mb-5 h-1 w-14 bg-brand-500" />
      <div className="rounded-md border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <RichContent html={l(page.content)} />
      </div>
    </div>
  );
}
