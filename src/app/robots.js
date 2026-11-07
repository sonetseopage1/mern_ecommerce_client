import { SITE_URL } from '@/lib/api';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/cart', '/checkout', '/account', '/orders'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
