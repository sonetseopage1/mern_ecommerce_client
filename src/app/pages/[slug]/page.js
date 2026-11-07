import { notFound } from 'next/navigation';
import { serverGet } from '@/lib/api';
import { stripHtml } from '@/components/RichContent';
import PageView from '@/components/PageView';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const p = await serverGet(`/pages/${params.slug}`, 60);
  if (!p) return { title: 'Page not found' };
  return { title: p.title.en, description: stripHtml(p.content?.en).slice(0, 160), alternates: { canonical: `/pages/${p.slug}` } };
}

export default async function InfoPage({ params }) {
  const p = await serverGet(`/pages/${params.slug}`, 60);
  if (!p) notFound();
  return <PageView page={p} />;
}
