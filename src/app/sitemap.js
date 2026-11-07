import { serverGet, SITE_URL } from '@/lib/api';

export default async function sitemap() {
  const [prods, cats, pages] = await Promise.all([serverGet('/products?limit=100', 300), serverGet('/categories', 300), serverGet('/pages', 300)]);
  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/categories`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, changeFrequency: 'monthly', priority: 0.4 },
    ...(pages || []).map((p) => ({ url: `${SITE_URL}/pages/${p.slug}`, changeFrequency: 'monthly', priority: 0.3 })),
    ...(cats || []).map((c) => ({ url: `${SITE_URL}/products?category=${c.slug}`, changeFrequency: 'weekly', priority: 0.6 })),
    ...(prods?.items || []).map((p) => ({ url: `${SITE_URL}/products/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly', priority: 0.8 })),
  ];
}
