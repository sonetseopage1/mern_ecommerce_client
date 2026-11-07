'use client';
import { createContext, useContext } from 'react';
import { useLang } from '@/lib/hooks';

// Site settings (name, logo, contact, social links ...) are loaded once on the server and shared through this context.
export const SiteContext = createContext({ settings: {}, pages: [] });

export function useSite() {
  const { settings: s = {}, pages = [] } = useContext(SiteContext);
  const { l } = useLang();
  return {
    s, pages,
    name: l(s.siteName) || 'ShopNest',
    tagline: l(s.tagline),
    logo: s.logo || '',
    phone: s.contact?.phone || '',
    email: s.contact?.email || '',
    address: l(s.contact?.address),
    social: s.social || {},
    footerText: l(s.footerText),
    invoiceNote: l(s.invoiceNote),
  };
}

export const telHref = (p) => `tel:${String(p || '').replace(/[^\d+]/g, '')}`;

// WhatsApp may be stored as a number or a full link
export function socialHref(key, v) {
  if (!v) return '';
  if (key === 'whatsapp' && !/^https?:/i.test(v)) return `https://wa.me/${String(v).replace(/\D/g, '')}`;
  return /^https?:/i.test(v) ? v : `https://${v}`;
}
