'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import api, { errMsg } from '@/lib/api';
import { useLang } from '@/lib/hooks';
import { setUser } from '@/store';
import ClientOnly from '@/components/ClientOnly';

function Form({ mode }) {
  const { t } = useLang();
  const router = useRouter();
  const sp = useSearchParams();
  const dispatch = useDispatch();
  const reg = mode === 'register';
  const [f, setF] = useState({ name: '', email: '', password: '', phone: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const { data } = await api.post(`/auth/${mode}`, f);
      localStorage.setItem('token', data.token);
      dispatch(setUser(data.user));
      const next = sp.get('next');
      router.replace(next && next.startsWith('/') ? next : ['admin', 'manager'].includes(data.user.role) ? '/admin' : '/');
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  const bind = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });

  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-8">
      <form onSubmit={submit} className="card w-full max-w-md space-y-4 p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold">{reg ? t('register') : t('login')}</h1>
        {reg && <div><label className="label">{t('name')}</label><input required className="input" {...bind('name')} /></div>}
        <div><label className="label">{t('email')}</label><input required type="email" className="input" {...bind('email')} /></div>
        {reg && <div><label className="label">{t('phone')}</label><input className="input" {...bind('phone')} /></div>}
        <div><label className="label">{t('password')}</label><input required minLength={6} type="password" className="input" {...bind('password')} /></div>
        <button className="btn-primary w-full" disabled={busy}>{reg ? t('register') : t('login')}</button>
        <p className="text-center text-sm text-slate-500">{reg ? t('haveAccount') : t('noAccount')}{' '}
          <Link className="font-semibold text-brand-600" href={reg ? '/login' : '/register'}>{reg ? t('login') : t('register')}</Link></p>
        {!reg && <p className="rounded-lg bg-slate-100 p-2 text-center text-[11px] text-slate-500 dark:bg-slate-800">Demo: admin@shop.com / admin123 · manager@shop.com / manager123 · user@shop.com / user123</p>}
      </form>
    </div>
  );
}

export default function AuthForm({ mode }) {
  return <Suspense><ClientOnly fallback={<div className="container-x grid min-h-[70vh] place-items-center py-8"><div className="card h-72 w-full max-w-md animate-pulse" /></div>}><Form mode={mode} /></ClientOnly></Suspense>;
}
