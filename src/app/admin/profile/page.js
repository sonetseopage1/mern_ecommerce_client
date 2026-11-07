'use client';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang, useAuth } from '@/lib/hooks';
import { setUser } from '@/store';
import { ImageField } from '@/components/ImageField';

export default function AdminProfile() {
  const { t } = useLang();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [f, setF] = useState({ name: '', phone: '', avatar: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) setF({ name: user.name || '', phone: user.phone || '', avatar: user.avatar || '' }); }, [user]);
  if (!user) return null;

  const saveProfile = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const { data } = await api.put('/auth/me', f); dispatch(setUser(data.user)); toast.success(t('saved')); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  // picture is saved right away so it shows in the sidebar / top bar
  const changeAvatar = async (url) => {
    setF((o) => ({ ...o, avatar: url }));
    try { const { data } = await api.put('/auth/me', { avatar: url }); dispatch(setUser(data.user)); } catch (err) { toast.error(errMsg(err)); }
  };
  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast.error(t('passwordMismatch'));
    setBusy(true);
    try {
      await api.put('/auth/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success(t('passwordChanged'));
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="h-section">{t('profile')}</h1>

      <form onSubmit={saveProfile} className="card space-y-4 p-5">
        <ImageField label="Profile picture" value={f.avatar} onChange={changeAvatar} round size="h-24 w-24" hint="Square photo, up to 5 MB" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">{t('name')}</label><input required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><label className="label">{t('phone')}</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div><label className="label">{t('email')}</label><input disabled className="input opacity-60" value={user.email} /></div>
          <div><label className="label">Role</label><input disabled className="input uppercase opacity-60" value={user.role} /></div>
        </div>
        <button className="btn-primary" disabled={busy}>{t('save')}</button>
      </form>

      <form onSubmit={savePassword} className="card space-y-4 p-5">
        <h2 className="flex items-center gap-2 font-bold"><KeyRound className="h-4 w-4 text-brand-600" />{t('changePassword')}</h2>
        <div><label className="label">{t('currentPassword')}</label><input required type="password" autoComplete="current-password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">{t('newPassword')}</label><input required minLength={6} type="password" autoComplete="new-password" className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
          <div><label className="label">{t('confirmPassword')}</label><input required minLength={6} type="password" autoComplete="new-password" className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
        </div>
        <button className="btn-primary" disabled={busy}>{t('changePassword')}</button>
      </form>
    </div>
  );
}
