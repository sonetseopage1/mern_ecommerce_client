'use client';
import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { makeStore, setUser, setLang, hydrateCart, logout } from '@/store';
import api from '@/lib/api';
import { SiteContext } from '@/lib/settings';

export default function Providers({ children, settings = {}, pages = [] }) {
  const ref = useRef();
  if (!ref.current) ref.current = makeStore();
  const store = ref.current;

  useEffect(() => {
    try {
      const lang = localStorage.getItem('lang');
      if (lang === 'bn' || lang === 'en') store.dispatch(setLang(lang));
    } catch {}
    store.dispatch(hydrateCart());
    const token = (() => { try { return localStorage.getItem('token'); } catch { return null; } })();
    if (!token) { store.dispatch(logout()); return; }
    api.get('/auth/me').then((r) => store.dispatch(setUser(r.data.user))).catch(() => store.dispatch(logout()));
  }, [store]);

  useEffect(() => {
    const unsub = store.subscribe(() => { document.documentElement.lang = store.getState().ui.lang; });
    return unsub;
  }, [store]);

  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="shopnest-theme">
        <SiteContext.Provider value={{ settings: settings || {}, pages: pages || [] }}>{children}</SiteContext.Provider>
        <Toaster position="top-center" toastOptions={{ className: '!bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100', duration: 2200 }} />
      </ThemeProvider>
    </Provider>
  );
}
