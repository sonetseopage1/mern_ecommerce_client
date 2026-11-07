/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST || '.next',
  poweredByHeader: false,
  // Set NEXT_EXPORT=1 later to produce a static bundle for Capacitor (mobile app)
  ...(process.env.NEXT_EXPORT === '1' ? { output: 'export', images: { unoptimized: true } } : {}),
};
export default nextConfig;
