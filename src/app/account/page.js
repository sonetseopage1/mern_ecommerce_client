'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Shield, ShoppingBag, LogOut, ChevronRight } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang, useAuth } from '@/lib/hooks';
import { setUser, logout } from '@/store';
import { ThemeToggle, LangToggle } from '@/components/Header';

export default function AccountPage() {
  const { t } = useLang();
  const { user, ready } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const [f, setF] = useState({ name: '', phone: '', address: '' });

  useEffect(() => { if (ready && !user) router.replace('/login?next=/account'); }, [ready, user, router]);
  useEffect(() => { if (user) setF({ name: user.name, phone: user.phone || '', address: user.address || '' }); }, [user]);
  if (!user) return <div className="container-x py-10"><div className="card h-40 animate-pulse" /></div>;

  const save = async (e) => {
    e.preventDefault();
    try { const { data } = await api.put('/auth/me', f); dispatch(setUser(data.user)); toast.success('✓'); } catch (err) { toast.error(errMsg(err)); }
  };
  const link = 'card flex items-center justify-between p-4 font-semibold';
  return (
    <div className="container-x max-w-2xl space-y-4 py-4">
      <div className="card flex items-center gap-4 bg-gradient-to-br from-ink-800 to-ink-600 !border-0 p-5 text-white">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-white/20 text-2xl font-bold">{user.name[0]}</div>
        <div className="min-w-0 flex-1"><div className="truncate text-lg font-bold">{user.name}</div><div className="truncate text-sm opacity-90">{user.email}</div></div>
        <span className="chip bg-white/25 uppercase">{user.role}</span>
      </div>
      <div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">Theme / Language</span><div className="flex gap-2"><LangToggle /><ThemeToggle /></div></div>
      {['admin', 'manager'].includes(user.role) && <Link href="/admin" className={link}><span className="flex items-center gap-2"><Shield className="h-5 w-5 text-brand-600" />{t('admin')}</span><ChevronRight className="h-4 w-4" /></Link>}
      <Link href="/orders" className={link}><span className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-brand-600" />{t('myOrders')}</span><ChevronRight className="h-4 w-4" /></Link>
      <form onSubmit={save} className="card space-y-3 p-5">
        <h2 className="font-bold">{t('profile')}</h2>
        <div><label className="label">{t('name')}</label><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="label">{t('phone')}</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        <div><label className="label">{t('address')}</label><textarea className="input" rows={2} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
        <button className="btn-primary">{t('update')}</button>
      </form>
      <button onClick={() => { dispatch(logout()); router.push('/'); }} className={`${link} w-full text-red-500`}><span className="flex items-center gap-2"><LogOut className="h-5 w-5" />{t('logout')}</span></button>
    </div>
  );
}
