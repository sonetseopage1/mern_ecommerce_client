import { Suspense } from 'react';
import ProductsView from '@/components/ProductsView';
import ClientOnly from '@/components/ClientOnly';

export const metadata = {
  title: 'Shop all products',
  description: 'Browse all products – filter by category, brand and price. Flash deals and coupons available.',
  alternates: { canonical: '/products' },
};

export default function ProductsPage() {
  return <Suspense><ClientOnly fallback={<div className="container-x py-6"><div className="card h-40 animate-pulse" /></div>}><ProductsView /></ClientOnly></Suspense>;
}
