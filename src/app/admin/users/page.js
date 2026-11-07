'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang, useAuth } from '@/lib/hooks';

export default function AdminUsers() {
  const { t, date } = useLang();
  const { user: me } = useAuth();
  const [list, setList] = useState(null);
  useEffect(() => { api.get('/users').then((r) => setList(r.data)).catch((e) => toast.error(errMsg(e))); }, []);

  const role = async (u, r) => {
    try { await api.put(`/users/${u._id}/role`, { role: r }); setList((a) => a.map((x) => (x._id === u._id ? { ...x, role: r } : x))); toast.success('✓'); } catch (e) { toast.error(errMsg(e)); }
  };
  const del = async (u) => {
    if (!window.confirm(`${t('delete')} ${u.email}?`)) return;
    try { await api.delete(`/users/${u._id}`); setList((a) => a.filter((x) => x._id !== u._id)); } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <div className="space-y-4">
      <h1 className="h-section">{t('users')}</h1>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr><th className="p-3">{t('name')}</th><th>{t('email')}</th><th>Role</th><th /></tr></thead>
          <tbody>{(list || []).map((u) => (
            <tr key={u._id} className="border-t border-slate-100 dark:border-slate-800">
              <td className="p-3 font-semibold">{u.name}<div className="text-xs font-normal text-slate-500">{date(u.createdAt)}</div></td><td>{u.email}</td>
              <td><select disabled={u._id === me?._id} className="input !w-auto !py-1.5" value={u.role} onChange={(e) => role(u, e.target.value)}><option value="user">user</option><option value="manager">manager</option><option value="admin">admin</option></select></td>
              <td className="p-3 text-right">{u._id !== me?._id && <button onClick={() => del(u)} className="p-2 text-red-500"><Trash2 className="h-4 w-4" /></button>}</td>
            </tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
