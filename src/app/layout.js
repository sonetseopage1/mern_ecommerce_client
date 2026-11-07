import './globals.css';
import { Inter, Hind_Siliguri } from 'next/font/google';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import FloatingWidgets from '@/components/FloatingWidgets';
import { SITE_URL, serverGet } from '@/lib/api';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const bn = Hind_Siliguri({ subsets: ['bengali', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-bn', display: 'swap' });

// Site name, meta tags, OG image and icons all come from Admin → Settings
export async function generateMetadata() {
  const s = (await serverGet('/settings', 60)) || {};
  const name = s.siteName?.en || 'ShopNest';
  const title = s.metaTitle?.en || `${name} – Modern Online Shopping`;
  const description = [s.metaDescription?.en, s.metaDescription?.bn].filter(Boolean).join(' | ') || 'Shop online with flash deals, coupons and fast delivery.';
  const keywords = [s.metaKeywords?.en, s.metaKeywords?.bn].filter(Boolean).join(',').split(',').map((k) => k.trim()).filter(Boolean);
  const images = s.ogImage ? [s.ogImage] : undefined;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${name}` },
    description,
    applicationName: name,
    keywords: keywords.length ? keywords : undefined,
    openGraph: { type: 'website', siteName: name, title, description, images },
    twitter: { card: images ? 'summary_large_image' : 'summary', title, description, images },
    alternates: { canonical: '/' },
    icons: { icon: s.favicon || '/icon.svg', apple: s.appIcon || s.favicon || undefined },
    appleWebApp: { capable: true, title: name, statusBarStyle: 'default' },
  };
}

export const viewport = {
  width: 'device-width', initialScale: 1, viewportFit: 'cover',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#0f2d31' }, { media: '(prefers-color-scheme: dark)', color: '#020617' }],
};

export default async function RootLayout({ children }) {
  const [settings, pages] = await Promise.all([serverGet('/settings', 60), serverGet('/pages', 60)]);
  return (
    <html lang="bn" suppressHydrationWarning className={`${inter.variable} ${bn.variable}`}>
      <body>
        <Providers settings={settings || {}} pages={pages || []}>
          <Header />
          <main className="min-h-[70vh] pb-6 md:pb-10">{children}</main>
          <Footer />
          <BottomNav />
          <FloatingWidgets />
        </Providers>
      </body>
    </html>
  );
}
