'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLang } from '@/lib/hooks';
import { buildTree } from '@/lib/pricing';

function Node({ c, depth }) {
  const { l } = useLang();
  const [open, setOpen] = useState(depth === 0);
  return (
    <li>
      <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-3 hover:bg-slate-100 dark:hover:bg-slate-800" style={{ marginLeft: depth * 14 }}>
        <Link href={`/products?category=${c.slug}`} className={`flex-1 ${depth === 0 ? 'font-bold' : 'text-sm font-medium'}`}>{l(c.name)}</Link>
        {c.children.length > 0 && <button onClick={() => setOpen(!open)} aria-label="toggle"><ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} /></button>}
      </div>
      {open && c.children.length > 0 && <ul>{c.children.map((k) => <Node key={k._id} c={k} depth={depth + 1} />)}</ul>}
    </li>
  );
}

export default function CategoriesView({ cats }) {
  const { t } = useLang();
  return (
    <div className="container-x py-4">
      <h1 className="h-section mb-3">{t('categories')}</h1>
      <ul className="card divide-y divide-slate-100 p-2 dark:divide-slate-800">{buildTree(cats).map((c) => <Node key={c._id} c={c} depth={0} />)}</ul>
    </div>
  );
}
