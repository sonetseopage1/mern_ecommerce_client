'use client';
import { useLang } from '@/lib/hooks';
import ProductCard from '@/components/ProductCard';
import Carousel from '@/components/Carousel';
import SectionHead from '@/components/SectionHead';

export default function RelatedProducts({ items }) {
  const { t } = useLang();
  if (!items?.length) return null;
  return (
    <section className="container-x mt-10 pb-4">
      <SectionHead title={t('relatedProducts')} />
      <Carousel>{items.map((r) => <ProductCard key={r._id} p={r} />)}</Carousel>
    </section>
  );
}
