'use client';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Pencil, Trash2, FolderPlus } from 'lucide-react';
import api, { errMsg } from '@/lib/api';
import { useLang } from '@/lib/hooks';
import { buildTree, flattenTree } from '@/lib/pricing';

function Item({ node, actions, children }) {
  const { l } = useLang();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node._id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
      <div className="card mb-2 flex items-center gap-2 p-2">
        <button {...attributes} {...listeners} className="cursor-grab touch-none p-2 text-slate-400 active:cursor-grabbing" aria-label="drag"><GripVertical className="h-4 w-4" /></button>
        <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{l(node.name)}</div>{node.name.bn && node.name.en && <div className="truncate text-xs text-slate-500">{node.name.bn}</div>}</div>
        {!node.active && <span className="chip bg-slate-200 text-slate-600">off</span>}
        {actions(node)}
      </div>
      {children}
    </li>
  );
}

// One sortable level; recursion renders deeper levels, each with its own DnD context
function Level({ nodes, parent, onReorder, actions }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const end = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = nodes.findIndex((n) => n._id === active.id), to = nodes.findIndex((n) => n._id === over.id);
    onReorder(arrayMove(nodes, from, to).map((n, order) => ({ id: n._id, parent, order })));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={end}>
      <SortableContext items={nodes.map((n) => n._id)} strategy={verticalListSortingStrategy}>
        <ul>
          {nodes.map((n) => (
            <Item key={n._id} node={n} actions={actions}>
              {n.children.length > 0 && <div className="ml-6 border-l-2 border-slate-200 pl-3 dark:border-slate-800"><Level nodes={n.children} parent={n._id} onReorder={onReorder} actions={actions} /></div>}
            </Item>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

export default function AdminCategories() {
  const { t, l } = useLang();
  const [flat, setFlat] = useState([]);
  const [form, setForm] = useState(null); // { _id?, name:{en,bn}, parent, active }
  const load = useCallback(() => api.get('/categories?all=1').then((r) => setFlat(r.data)), []);
  useEffect(() => { load(); }, [load]);
  const tree = buildTree(flat);

  const reorder = async (items) => {
    // optimistic
    setFlat((f) => f.map((c) => { const i = items.find((x) => x.id === c._id); return i ? { ...c, order: i.order } : c; }));
    try { await api.put('/categories/reorder', { items }); } catch (e) { toast.error(errMsg(e)); load(); }
  };
  const save = async (e) => {
    e.preventDefault();
    try {
      if (form._id) await api.put(`/categories/${form._id}`, form); else await api.post('/categories', form);
      setForm(null); load(); toast.success('✓');
    } catch (err) { toast.error(errMsg(err)); }
  };
  const del = async (c) => {
    if (!window.confirm(`${t('delete')} “${l(c.name)}”?`)) return;
    try { await api.delete(`/categories/${c._id}`); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  const actions = (c) => (
    <div className="flex shrink-0">
      <button title="Add sub-category" className="p-2 text-emerald-600" onClick={() => setForm({ name: { en: '', bn: '' }, parent: c._id, active: true })}><FolderPlus className="h-4 w-4" /></button>
      <button className="p-2 text-brand-600" onClick={() => setForm({ _id: c._id, name: { en: '', bn: '', ...c.name }, parent: c.parent || '', image: c.image || '', active: c.active })}><Pencil className="h-4 w-4" /></button>
      <button className="p-2 text-red-500" onClick={() => del(c)}><Trash2 className="h-4 w-4" /></button>
    </div>
  );

  // parent choices exclude self & descendants
  const excluded = new Set();
  if (form?._id) { const walk = (n) => { excluded.add(n._id); n.children.forEach(walk); }; const find = (arr) => arr.forEach((n) => (n._id === form._id ? walk(n) : find(n.children))); find(tree); }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="h-section">{t('categories')}</h1><p className="text-xs text-slate-500">⠿ Drag to reorder within a level · multi-level supported</p></div>
        <button className="btn-primary" onClick={() => setForm({ name: { en: '', bn: '' }, parent: '', active: true })}><Plus className="h-4 w-4" />{t('add')}</button></div>
      <Level nodes={tree} parent={null} onReorder={reorder} actions={actions} />
      {!tree.length && <p className="py-10 text-center text-slate-500">—</p>}

      {form && (
        <div className="fixed inset-0 z-[60] grid place-items-end bg-black/50 sm:place-items-center" onClick={() => setForm(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="card w-full max-w-md animate-pop space-y-3 rounded-b-none p-5 sm:rounded-b-2xl">
            <h2 className="font-bold">{form._id ? t('edit') : t('add')}</h2>
            <div><label className="label">Name (English) *</label><input required className="input" value={form.name.en} onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })} /></div>
            <div><label className="label">নাম (বাংলা)</label><input className="input" value={form.name.bn || ''} onChange={(e) => setForm({ ...form, name: { ...form.name, bn: e.target.value } })} /></div>
            <div><label className="label">Parent</label>
              <select className="input" value={form.parent || ''} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
                <option value="">— (top level)</option>
                {flattenTree(tree).filter((c) => !excluded.has(c._id)).map((c) => <option key={c._id} value={c._id}>{'— '.repeat(c.depth)}{l(c.name)}</option>)}
              </select></div>
            <div><label className="label">Image URL</label><input className="input" value={form.image || ''} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" /></div>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Active</label>
            <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>{t('cancel')}</button><button className="btn-primary">{t('save')}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
