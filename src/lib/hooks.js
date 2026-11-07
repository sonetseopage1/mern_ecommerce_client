'use client';
import { useSelector } from 'react-redux';
import { dict, statusLabels } from '@/lib/i18n';
import { L, money } from '@/lib/pricing';

export function useLang() {
  const lang = useSelector((s) => s.ui.lang);
  return {
    lang,
    t: (k) => dict[lang]?.[k] ?? dict.en[k] ?? k,
    l: (obj) => L(obj, lang),
    m: (n) => money(n, lang),
    n: (x) => Number(x).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US'),
    st: (s) => statusLabels[lang][s] || s,
    date: (d) => (d ? new Date(d).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''),
  };
}

export const useAuth = () => useSelector((s) => s.auth);
