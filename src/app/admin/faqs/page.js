'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Pencil, Trash2 } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang, useAuth } from '@/lib/hooks';
import RichTextEditor from '@/components/RichTextEditor';
import LangTabs from '@/components/LangTabs';

const blank = { question: { en: '', bn: '' }, answer: { en: '', bn: '' }, active: true };

function Row({ faq, onEdit, onDelete }) {
  const { l } = useLang();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: faq._id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }} className="card mb-2 flex items-center gap-2 p-2">
      <button {...attributes} {...listeners} className="cursor-grab touch-none p-2 text-slate-400 active:cursor-grabbing" aria-label="drag"><GripVertical className="h-4 w-4" /></button>
      <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{l(faq.question)}</div>{faq.question.bn && faq.question.en && <div className="truncate text-xs text-slate-500">{faq.question.bn}</div>}</div>
      {!faq.active && <span className="chip bg-slate-200 text-slate-600">hidden</span>}
      <button className="p-2 text-brand-600" onClick={() => onEdit(faq)}><Pencil className="h-4 w-4" /></button>
      <button className="p-2 text-red-500" onClick={() => onDelete(faq)}><Trash2 className="h-4 w-4" /></button>
    </li>
  );
}

export default function AdminFaqs() {
  const { t, l } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const [list, setList] = useState(null);
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => { if (user && user.role !== 'admin') router.replace('/admin'); }, [user, router]);
  const load = useCallback(() => api.get('/faqs/admin/all').then((r) => setList(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const end = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const next = arrayMove(list, list.findIndex((x) => x._id === active.id), list.findIndex((x) => x._id === over.id));
    setList(next);
    try { await api.put('/faqs/reorder', { items: next.map((x, order) => ({ id: x._id, order })) }); } catch (e) { toast.error(errMsg(e)); load(); }
  };
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { if (f._id) await api.put(`/faqs/${f._id}`, f); else await api.post('/faqs', f); toast.success(t('saved')); setF(null); load(); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  const del = async (q) => {
    if (!window.confirm(`${t('delete')} “${l(q.question)}”?`)) return;
    try { await api.delete(`/faqs/${q._id}`); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="h-section">{t('faq')}</h1><p className="text-xs text-slate-500">⠿ Drag to change the order shown on the FAQ page</p></div>
        <button className="btn-primary" onClick={() => setF(blank)}><Plus className="h-4 w-4" />{t('add')}</button></div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={end}>
        <SortableContext items={(list || []).map((x) => x._id)} strategy={verticalListSortingStrategy}>
          <ul>{(list || []).map((q) => <Row key={q._id} faq={q} onEdit={(x) => setF({ ...blank, ...x, question: { en: '', bn: '', ...x.question }, answer: { en: '', bn: '', ...x.answer } })} onDelete={del} />)}</ul>
        </SortableContext>
      </DndContext>
      {list && !list.length && <p className="py-10 text-center text-slate-500">{t('noFaq')}</p>}

      {f && (
        <div className="fixed inset-0 z-[60] grid place-items-end overflow-y-auto bg-black/50 sm:place-items-center" onClick={() => setF(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="card my-4 w-full max-w-2xl animate-pop space-y-4 rounded-b-none p-5 sm:rounded-b-md">
            <h2 className="font-bold">{f._id ? t('edit') : t('add')} · {t('faq')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="label">Question (English) *</label><input required className="input" value={f.question.en} onChange={(e) => setF({ ...f, question: { ...f.question, en: e.target.value } })} /></div>
              <div><label className="label">প্রশ্ন (বাংলা)</label><input className="input" value={f.question.bn || ''} onChange={(e) => setF({ ...f, question: { ...f.question, bn: e.target.value } })} /></div>
            </div>
            <LangTabs label="Answer">
              {(lang) => <RichTextEditor key={lang} minHeight={140} value={f.answer?.[lang] || ''} onChange={(html) => setF((o) => ({ ...o, answer: { ...o.answer, [lang]: html } }))} placeholder={lang === 'bn' ? 'উত্তর লিখুন…' : 'Write the answer…'} />}
            </LangTabs>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />Visible on the FAQ page</label>
            <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setF(null)}>{t('cancel')}</button><button className="btn-primary" disabled={busy}>{t('save')}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
