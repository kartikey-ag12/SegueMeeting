"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Bold, Italic, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Undo, Redo, Eraser } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function RichTextEditor({ content, onChange, itemId }: { content: string, onChange: (html: string) => void, itemId: string }) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight,
    ],
    content,
    onUpdate: ({ editor }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onChange(editor.getHTML());
      }, 1000);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content || "");
    }
    // Only reset content when switching to a different item
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, editor]);

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white flex flex-col mt-2">
      <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 flex-wrap">
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Undo"><Undo className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Redo"><Redo className="w-4 h-4" /></button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onClick={toggleBold} className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`} title="Bold"><Bold className="w-4 h-4" /></button>
        <button type="button" onClick={toggleItalic} className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`} title="Italic"><Italic className="w-4 h-4" /></button>
        <button type="button" onClick={toggleStrike} className={`p-1.5 rounded ${editor.isActive('strike') ? 'bg-slate-200 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`} title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`} title="Align Left"><AlignLeft className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`} title="Align Center"><AlignCenter className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`} title="Align Right"><AlignRight className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`} title="Align Justify"><AlignJustify className="w-4 h-4" /></button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded ${editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`} title="Bullet List"><List className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded ${editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`} title="Ordered List"><ListOrdered className="w-4 h-4" /></button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onClick={() => editor.chain().focus().unsetAllMarks().run()} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Clear Formatting"><Eraser className="w-4 h-4" /></button>
      </div>
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
}
