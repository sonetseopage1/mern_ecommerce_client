'use client';
import { useEffect, useState } from 'react';

// Renders `children` only after the page has hydrated. The saved language / theme live in the browser, so pages that
// hydrate late (inside <Suspense>) would otherwise draw in a different language than the server HTML and trigger a hydration warning.
export default function ClientOnly({ children, fallback = null }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  return ready ? children : fallback;
}
