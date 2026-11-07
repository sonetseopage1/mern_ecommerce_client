'use client';
import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline as UIcon, Strikethrough, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, ImagePlus, AlignLeft, AlignCenter, AlignRight, Undo2, Redo2, Eraser, Minus } from 'lucide-react';
import { uploadFiles } from '@/lib/upload';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// legacy plain-text values (with line breaks) become paragraphs
const normalize = (v) => (!v ? '' : /<[a-z][\s\S]*>/i.test(v) ? v : v.split(/\n+/).map((l) => `<p>${esc(l)}</p>`).join(''));

function Btn({ on, active, label, children, disabled }) {
  return (
    <button type="button" title={label} aria-label={label} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={on}
      className={`grid h-8 w-8 place-items-center rounded transition disabled:opacity-30 ${active ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'}`}>{children}</button>
  );
}
const Sep = () => <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600" />;

// value / onChange work with an HTML string
export default function RichTextEditor({ value, onChange, placeholder = '', minHeight = 180 }) {
  const fileRef = useRef(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer nofollow' } }),
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: normalize(value),
    immediatelyRender: false,
    editorProps: { attributes: { class: 'rich px-4 py-3 outline-none', style: `min-height:${minHeight}px` } },
    onUpdate: ({ editor: e }) => onChange?.(e.isEmpty ? '' : e.getHTML()),
  });

  // keep in sync when the parent loads / swaps the value (but never while the user is typing)
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const cur = editor.isEmpty ? '' : editor.getHTML();
    if (normalize(value) !== cur) editor.commands.setContent(normalize(value), false);
  }, [value, editor]);

  if (!editor) return <div className="h-40 animate-pulse rounded-md border border-slate-200 dark:border-slate-700" />;
  const c = () => editor.chain().focus();

  const setLink = () => {
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Link URL (leave empty to remove)', prev);
    if (url === null) return;
    if (!url) c().extendMarkRange('link').unsetLink().run();
    else c().extendMarkRange('link').setLink({ href: /^(https?:|mailto:|tel:)/i.test(url) ? url : `https://${url}` }).run();
  };
  const onFile = async (e) => {
    const urls = await uploadFiles(e.target.files);
    urls.forEach((src) => c().setImage({ src }).run());
    e.target.value = '';
  };

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-800">
        <Btn label="Bold" active={editor.isActive('bold')} on={() => c().toggleBold().run()}><Bold className="h-4 w-4" /></Btn>
        <Btn label="Italic" active={editor.isActive('italic')} on={() => c().toggleItalic().run()}><Italic className="h-4 w-4" /></Btn>
        <Btn label="Underline" active={editor.isActive('underline')} on={() => c().toggleUnderline().run()}><UIcon className="h-4 w-4" /></Btn>
        <Btn label="Strikethrough" active={editor.isActive('strike')} on={() => c().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Btn>
        <Sep />
        <Btn label="Heading 2" active={editor.isActive('heading', { level: 2 })} on={() => c().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Btn>
        <Btn label="Heading 3" active={editor.isActive('heading', { level: 3 })} on={() => c().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Btn>
        <Sep />
        <Btn label="Bullet list" active={editor.isActive('bulletList')} on={() => c().toggleBulletList().run()}><List className="h-4 w-4" /></Btn>
        <Btn label="Numbered list" active={editor.isActive('orderedList')} on={() => c().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Btn>
        <Btn label="Quote" active={editor.isActive('blockquote')} on={() => c().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Btn>
        <Btn label="Divider" on={() => c().setHorizontalRule().run()}><Minus className="h-4 w-4" /></Btn>
        <Sep />
        <Btn label="Align left" active={editor.isActive({ textAlign: 'left' })} on={() => c().setTextAlign('left').run()}><AlignLeft className="h-4 w-4" /></Btn>
        <Btn label="Align center" active={editor.isActive({ textAlign: 'center' })} on={() => c().setTextAlign('center').run()}><AlignCenter className="h-4 w-4" /></Btn>
        <Btn label="Align right" active={editor.isActive({ textAlign: 'right' })} on={() => c().setTextAlign('right').run()}><AlignRight className="h-4 w-4" /></Btn>
        <Sep />
        <Btn label="Link" active={editor.isActive('link')} on={setLink}><LinkIcon className="h-4 w-4" /></Btn>
        <Btn label="Upload image" on={() => fileRef.current?.click()}><ImagePlus className="h-4 w-4" /></Btn>
        <Btn label="Clear formatting" on={() => c().unsetAllMarks().clearNodes().run()}><Eraser className="h-4 w-4" /></Btn>
        <Sep />
        <Btn label="Undo" disabled={!editor.can().undo()} on={() => c().undo().run()}><Undo2 className="h-4 w-4" /></Btn>
        <Btn label="Redo" disabled={!editor.can().redo()} on={() => c().redo().run()}><Redo2 className="h-4 w-4" /></Btn>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFile} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
