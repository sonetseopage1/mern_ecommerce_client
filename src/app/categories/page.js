import { serverGet } from '@/lib/api';
import CategoriesView from '@/components/CategoriesView';

export const revalidate = 120;
export const metadata = { title: 'All categories', description: 'Browse all product categories.', alternates: { canonical: '/categories' } };

export default async function CategoriesPage() {
  const cats = await serverGet('/categories', 120);
  return <CategoriesView cats={cats || []} />;
}
