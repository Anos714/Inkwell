import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createBlog, updateBlog } from '../api/blog-api'
import type { Blog, BlogInput } from '../types'
import { RichTextEditor } from './rich-text-editor'

const emptyForm: BlogInput = { title: '', slug: '', description: '', content: '', coverImage: '', tags: [], isPublished: true }

type Props = { token: string; blog?: Blog; onSaved?: () => void }

export function AdminBlogForm({ token, blog, onSaved }: Props) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<BlogInput>(blog ? {
    title: blog.title,
    slug: blog.slug,
    description: blog.description ?? '',
    content: typeof blog.content === 'string' ? blog.content : JSON.stringify(blog.content),
    coverImage: blog.coverImage ?? '',
    tags: blog.tags,
    isPublished: blog.isPublished,
  } : emptyForm)
  const [tagsInput, setTagsInput] = useState(blog?.tags.join(', ') ?? '')
  const [error, setError] = useState('')
  const mutation = useMutation({
    mutationFn: () => {
      const data = { ...form, tags: tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean) }
      return blog ? updateBlog(token, blog.id, data) : createBlog(token, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      setError('')
      onSaved?.()
      if (!blog) {
        setForm(emptyForm)
        setTagsInput('')
      }
    },
    onError: (err: Error) => setError(err.message),
  })
  const update = (key: keyof BlogInput, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <form onSubmit={(event) => { event.preventDefault(); mutation.mutate() }} className="grid gap-3 md:grid-cols-2">
      {(['title', 'slug', 'description', 'coverImage'] as const).map((key) => (
        <input key={key} value={String(form[key] ?? '')} onChange={(event) => update(key, event.target.value)} placeholder={key[0].toUpperCase() + key.slice(1)} required={key === 'title' || key === 'slug'} className="rounded-xl border border-inkwell-cream/15 bg-inkwell-950 px-4 py-3 text-sm text-inkwell-cream outline-none focus:border-inkwell-gold" />
      ))}
      <RichTextEditor value={String(form.content)} onChange={(value) => update('content', value)} />
      <input value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} placeholder="Tags, comma separated" className="rounded-xl border border-inkwell-cream/15 bg-inkwell-950 px-4 py-3 text-sm text-inkwell-cream outline-none focus:border-inkwell-gold" />
      <label className="flex items-center gap-3 px-2 text-sm text-inkwell-muted"><input type="checkbox" checked={Boolean(form.isPublished)} onChange={(event) => update('isPublished', event.target.checked)} /> Published</label>
      <button disabled={mutation.isPending} className="rounded-xl bg-inkwell-gold px-5 py-3 text-sm font-bold text-inkwell-950 disabled:opacity-60 md:col-span-2">{mutation.isPending ? 'Saving…' : blog ? 'Update entry' : 'Publish entry'}</button>
      {error && <p className="text-sm text-red-300 md:col-span-2">{error}</p>}
    </form>
  )
}
