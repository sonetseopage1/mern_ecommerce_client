import { serverGet } from '@/lib/api';
import HomeView from '@/components/HomeView';

export const revalidate = 60;

export default async function Home() {
  const [cats, flash, featured, newest, banners] = await Promise.all([
    serverGet('/categories'),
    serverGet('/products?flash=1&limit=10'),
    serverGet('/products?featured=1&limit=10'),
    serverGet('/products?sort=newest&limit=10'),
    serverGet('/banners'),
  ]);
  // one slider section per top-level category (first 5)
  const roots = (cats || []).filter((c) => !c.parent).slice(0, 5);
  const sections = (await Promise.all(roots.map(async (c) => ({ cat: c, items: (await serverGet(`/products?category=${c.slug}&limit=10`))?.items || [] })))).filter((s) => s.items.length);

  const ld = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'ShopNest', potentialAction: { '@type': 'SearchAction', target: '/products?q={q}', 'query-input': 'required name=q' } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <HomeView cats={cats || []} flash={flash?.items || []} featured={featured?.items || []} newest={newest?.items || []} sections={sections} banners={banners || []} />
    </>
  );
}
