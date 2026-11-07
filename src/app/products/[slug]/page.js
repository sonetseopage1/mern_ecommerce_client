import { notFound } from 'next/navigation';
import { serverGet, SITE_URL } from '@/lib/api';
import { priceOf } from '@/lib/pricing';
import ProductDetail from '@/components/ProductDetail';
import RelatedProducts from '@/components/RelatedProducts';
import { stripHtml } from '@/components/RichContent';
import { parseVideo } from '@/lib/video';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const p = await serverGet(`/products/${params.slug}`);
  if (!p) return { title: 'Product not found' };
  const desc = stripHtml(p.description?.en).slice(0, 160);
  return {
    title: p.name.en,
    description: desc,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: p.name.en, description: desc, images: p.images?.[0] ? [p.images[0]] : [], type: 'website' },
    twitter: { card: 'summary_large_image', title: p.name.en, description: desc, images: p.images?.[0] ? [p.images[0]] : [] },
  };
}

export default async function ProductPage({ params }) {
  const p = await serverGet(`/products/${params.slug}`);
  if (!p) notFound();
  // same category (incl. sub-categories) first, then top up with newest products
  const [sameCat, newest] = await Promise.all([
    serverGet(`/products?category=${p.category?.slug}&limit=10`),
    serverGet('/products?sort=newest&limit=10'),
  ]);
  const seen = new Set([p._id]);
  const related = [...(sameCat?.items || []), ...(newest?.items || [])].filter((r) => !seen.has(r._id) && seen.add(r._id)).slice(0, 8);
  const { price } = priceOf(p, p.variants?.[0]);
  const inStock = (p.variants?.length ? p.variants.reduce((s, v) => s + v.stock, 0) : p.stock) > 0;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name.en, image: p.images, description: stripHtml(p.description?.en),
    brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined, sku: p.variants?.[0]?.sku || p._id,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: Math.max(p.sold, 1) },
    video: (p.videos || []).map(parseVideo).filter((v) => v?.type === 'youtube').map((v) => ({ '@type': 'VideoObject', name: p.name.en, description: stripHtml(p.description?.en) || p.name.en, thumbnailUrl: v.thumb, uploadDate: p.createdAt, embedUrl: v.embed, contentUrl: v.url })),
    offers: { '@type': 'Offer', priceCurrency: 'BDT', price, url: `${SITE_URL}/products/${p.slug}`, availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', priceValidUntil: p.flashDeal?.endsAt },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ProductDetail p={p} />
      <RelatedProducts items={related} />
    </>
  );
}
