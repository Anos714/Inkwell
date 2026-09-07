import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Underline from '@tiptap/extension-underline'
import { useEffect, useState } from 'react'

type Props = { value: string; onChange: (value: string) => void }

type ToolbarButtonProps = {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}

function ToolbarButton({ label, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-1.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-inkwell-gold text-inkwell-950' : 'text-inkwell-muted hover:bg-inkwell-brown/50 hover:text-inkwell-cream'}`}
    >
      {label}
    </button>
  )
}

export function RichTextEditor({ value, onChange }: Props) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ allowBase64: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: value,
    editorProps: { attributes: { class: 'min-h-80 px-8 py-8 text-sm leading-7 outline-none' } },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])

  if (!editor) return <div className="min-h-56 rounded-xl border border-inkwell-cream/15 bg-inkwell-950 md:col-span-2" />

  return (
    <div className={`rich-text-editor ${theme === 'light' ? 'rich-text-editor-light' : 'rich-text-editor-dark'} overflow-hidden rounded-xl border md:col-span-2`}>
      <div className="rich-text-toolbar flex flex-wrap items-center gap-1 border-b p-2">
        <ToolbarButton label="↶" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton label="↷" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
        <span className="toolbar-divider" />
        <select
          value={editor.isActive('heading', { level: 1 }) ? 'h1' : editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
          onChange={(event) => {
            const value = event.target.value
            if (value === 'p') editor.chain().focus().setParagraph().run()
            else editor.chain().focus().toggleHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 }).run()
          }}
          className="editor-select rounded-lg border px-2 py-1.5 text-xs outline-none"
          aria-label="Text style"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
        <span className="toolbar-divider" />
        <ToolbarButton label="B" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton label="I" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton label="U" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarButton label="S" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <ToolbarButton label="Code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
        <ToolbarButton label="Highlight" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} />
        <label className="color-picker" title="Text color">
          A
          <input type="color" onChange={(event) => editor.chain().focus().setColor(event.target.value).run()} aria-label="Text color" />
        </label>
        <span className="toolbar-divider" />
        <ToolbarButton label="• List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton label="1. List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton label="☑ Task" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} />
        <ToolbarButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        <span className="toolbar-divider" />
        <ToolbarButton label="←" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
        <ToolbarButton label="↔" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
        <ToolbarButton label="→" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />
        <ToolbarButton label="—" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <ToolbarButton label="Link" active={editor.isActive('link')} onClick={() => {
          const url = window.prompt('Enter URL')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }} />
        <ToolbarButton label="Image" onClick={() => {
          const url = window.prompt('Enter image URL')
          if (url) editor.chain().focus().setImage({ src: url }).run()
        }} />
        <ToolbarButton label={theme === 'dark' ? '☼ Light' : '☾ Dark'} onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
