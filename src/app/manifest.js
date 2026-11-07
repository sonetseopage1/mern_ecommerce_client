import { serverGet } from '@/lib/api';

export default async function manifest() {
  const s = (await serverGet('/settings', 300)) || {};
  const name = s.siteName?.en || 'ShopNest';
  const icon = s.appIcon || s.favicon;
  return {
    name, short_name: name.slice(0, 12), description: s.metaDescription?.en || 'Modern online shopping',
    start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#0f2d31',
    icons: icon ? [{ src: icon, sizes: '512x512' }] : [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
