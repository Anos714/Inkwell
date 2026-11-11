import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { createBlog, updateBlog } from '../api/blog-api'
import { uploadImage } from '../api/upload-api'
import type { Blog, BlogInput } from '../types'
import { RichTextEditor } from './rich-text-editor'

const emptyForm: BlogInput = {
  title: '',
  slug: '',
  description: '',
  content: '',
  coverImage: '',
  tags: [],
  isPublished: true,
}

type Props = {
  token: string
  blog?: Blog
  onSaved?: () => void
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-dim">
      {children}
    </span>
  )
}

const lineInput =
  'field-line w-full border-b border-inkwell-rule bg-transparent py-3 text-sm text-inkwell-cream outline-none transition duration-300 placeholder:text-inkwell-dim/60 focus:border-inkwell-brass'

/** Turn a title into a URL-safe slug as the writer types. */
function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90)
    .replace(/^-|-$/g, '')
}

export function AdminBlogForm({ token, blog, onSaved }: Props) {
  const queryClient = useQueryClient()

  const [form, setForm] = useState<BlogInput>(
    blog
      ? {
          title: blog.title,
          slug: blog.slug,
          description: blog.description ?? '',
          content:
            typeof blog.content === 'string'
              ? blog.content
              : JSON.stringify(blog.content),
          coverImage: blog.coverImage ?? '',
          tags: blog.tags,
          isPublished: blog.isPublished,
        }
      : emptyForm,
  )

  const [tagsInput, setTagsInput] = useState(blog?.tags.join(', ') ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(blog))
  const [error, setError] = useState('')
  const [coverPreview, setCoverPreview] = useState(blog?.coverImage ?? '')
  const [isUploadingCover, setIsUploadingCover] = useState(false)

  const mutation = useMutation({
    mutationFn: () => {
      const data = {
        ...form,
        // Empty strings fail backend `.min(3)`/`z.url()` guards; omit instead.
        description: form.description?.trim() || undefined,
        coverImage: form.coverImage || undefined,
        tags: tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }

      return blog ? updateBlog(token, blog.id, data) : createBlog(token, data)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })

      // Keep the detail views in sync after an edit (public + admin caches).
      if (blog) {
        queryClient.invalidateQueries({ queryKey: ['blog', blog.slug] })
        queryClient.invalidateQueries({ queryKey: ['blog', 'admin', blog.slug] })
      }

      setError('')
      onSaved?.()

      if (!blog) {
        setForm(emptyForm)
        setTagsInput('')
        setCoverPreview('')
        setSlugTouched(false)
      }
    },

    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const update = (key: keyof BlogInput, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  /**
   * Handle cover image selection.
   */
  const handleCoverChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    setError('')

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG and WebP images are allowed.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Cover image must be smaller than 5MB.')
      event.target.value = ''
      return
    }

    // Show the local file immediately; the Cloudinary URL replaces it on upload.
    const localPreview = URL.createObjectURL(file)
    setCoverPreview(localPreview)

    try {
      setIsUploadingCover(true)
      const uploadedImage = await uploadImage(token, file, 'blogCover')
      update('coverImage', uploadedImage.url)
      setCoverPreview(uploadedImage.url)
    } catch (err) {
      setCoverPreview(blog?.coverImage ?? '')
      setError(err instanceof Error ? err.message : 'Cover image upload failed.')
    } finally {
      setIsUploadingCover(false)
      URL.revokeObjectURL(localPreview)
      event.target.value = ''
    }
  }

  /**
   * Remove the cover from the form only; the Cloudinary file is left in place.
   */
  const removeCover = () => {
    setCoverPreview('')
    update('coverImage', '')
  }

  const isSaving = mutation.isPending || isUploadingCover

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (isUploadingCover) return
        mutation.mutate()
      }}
      className="grid gap-x-10 gap-y-9 md:grid-cols-2"
    >
      <label className="block md:col-span-2">
        <FieldLabel>Title</FieldLabel>
        <input
          value={String(form.title ?? '')}
          onChange={(event) => {
            const value = event.target.value
            setForm((current) => ({
              ...current,
              title: value,
              ...(blog || slugTouched ? {} : { slug: slugify(value) }),
            }))
          }}
          placeholder="A memorable title"
          required
          className="field-line display w-full border-b border-inkwell-rule bg-transparent py-3 text-[2rem] text-inkwell-cream outline-none transition duration-300 placeholder:text-inkwell-dim/50 focus:border-inkwell-brass sm:text-[2.75rem]"
        />
      </label>

      <label className="block">
        <FieldLabel>Slug</FieldLabel>
        <span className="field-frame flex items-baseline border-b border-inkwell-rule transition duration-300">
          <span aria-hidden="true" className="font-mono text-xs text-inkwell-dim">/</span>
          <input
            value={String(form.slug ?? '')}
            onChange={(event) => {
              setSlugTouched(true)
              update('slug', event.target.value)
            }}
            placeholder="url-friendly-slug"
            required
            className="field-line w-full bg-transparent px-1 py-3 font-mono text-xs text-inkwell-cream outline-none placeholder:text-inkwell-dim/60"
          />
        </span>
      </label>

      <label className="block">
        <FieldLabel>Description</FieldLabel>
        <textarea
          value={String(form.description ?? '')}
          onChange={(event) => update('description', event.target.value)}
          placeholder="A short summary (optional)"
          rows={2}
          className={`${lineInput} resize-none leading-6`}
        />
      </label>

      <div className="md:col-span-2">
        <FieldLabel>Cover image</FieldLabel>

        {coverPreview ? (
          <div className="border border-inkwell-rule">
            <img
              src={coverPreview}
              alt="Cover preview"
              className="aspect-[16/7] w-full object-cover"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-inkwell-rule px-4 py-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-inkwell-dim">
                {isUploadingCover ? 'Uploading…' : 'Cover attached'}
              </p>

              {!isUploadingCover && (
                <div className="flex items-center gap-5">
                  <label className="cursor-pointer font-mono text-[9px] uppercase tracking-[0.16em] text-inkwell-brass transition hover:text-inkwell-cream">
                    Replace
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverChange}
                      disabled={isSaving}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={removeCover}
                    className="font-mono text-[9px] uppercase tracking-[0.16em] text-inkwell-dim transition hover:text-[#c25a54]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center gap-5 border border-dashed border-inkwell-rule px-5 py-8 transition duration-300 hover:border-inkwell-brass/50 hover:bg-inkwell-brass/[0.03]">
            <svg aria-hidden="true" viewBox="0 0 48 48" className="size-8 shrink-0 text-inkwell-brass" fill="none">
              <path d="M8 34l10-11 7 8 6-6 9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="17" cy="17" r="3.5" stroke="currentColor" strokeWidth="1.6" />
              <rect x="6" y="8" width="36" height="32" rx="1" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <span>
              <span className="block font-display text-xl text-inkwell-cream">Add a cover</span>
              <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.16em] text-inkwell-dim">
                JPG · PNG · WebP · 5MB max
              </span>
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              disabled={isSaving}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="md:col-span-2">
        <FieldLabel>Content</FieldLabel>
        <RichTextEditor
          value={String(form.content)}
          onChange={(value) => update('content', value)}
        />
      </div>

      <div>
        <FieldLabel>Status</FieldLabel>
        <div className="flex items-center justify-between gap-5 border-b border-inkwell-rule py-3">
          <div>
            <p className="text-sm font-medium text-inkwell-cream">
              {form.isPublished ? 'Published' : 'Draft'}
            </p>
            <p className="mt-1 font-serif text-xs leading-5 text-inkwell-muted">
              {form.isPublished
                ? 'Visible to everyone in the journal.'
                : 'Only visible to you in this workspace.'}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={Boolean(form.isPublished)}
            aria-label="Publish this entry"
            onClick={() => update('isPublished', !form.isPublished)}
            className={`relative h-6 w-11 shrink-0 rounded-full border transition duration-300 ${
              form.isPublished
                ? 'border-inkwell-brass bg-inkwell-brass'
                : 'border-inkwell-rule bg-transparent'
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute top-1/2 size-4 -translate-y-1/2 rounded-full transition-all duration-300 ${
                form.isPublished ? 'left-[1.45rem] bg-inkwell-950' : 'left-1 bg-inkwell-muted'
              }`}
            />
          </button>
        </div>
      </div>

      <label className="block">
        <FieldLabel>Tags</FieldLabel>
        <input
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          placeholder="Craft, code, slow web"
          className={lineInput}
        />
        <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-inkwell-dim">
          Separate with commas
        </span>
      </label>

      {error && (
        <p className="danger-error font-serif text-sm md:col-span-2" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse items-start gap-5 border-t border-inkwell-rule pt-7 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
        <Link
          to="/admin/blogs/manage"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-muted transition hover:text-inkwell-cream"
        >
          Cancel
        </Link>

        <button
          disabled={isSaving}
          className="group inline-flex items-center gap-2.5 rounded-full bg-inkwell-cream px-6 py-3 text-sm font-semibold text-inkwell-950 transition duration-300 hover:-translate-y-0.5 hover:bg-inkwell-brass disabled:cursor-wait disabled:opacity-60"
        >
          {isUploadingCover
            ? 'Uploading image…'
            : mutation.isPending
              ? 'Saving…'
              : blog
                ? 'Save changes'
                : form.isPublished
                  ? 'Publish entry'
                  : 'Save draft'}
          <span aria-hidden="true" className="transition duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>
    </form>
  )
}
