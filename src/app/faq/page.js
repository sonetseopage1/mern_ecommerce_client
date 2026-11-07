import { serverGet } from '@/lib/api';
import { stripHtml } from '@/components/RichContent';
import FaqView from '@/components/FaqView';

export const revalidate = 60;
export const metadata = { title: 'FAQ – Frequently asked questions', description: 'Answers to common questions about orders, delivery, payment, coupons and returns.', alternates: { canonical: '/faq' } };

export default async function FaqPage() {
  const faqs = (await serverGet('/faqs', 60)) || [];
  const ld = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question.en, acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.answer?.en) } })),
  };
  return (
    <>
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
      <FaqView faqs={faqs} />
    </>
  );
}
