import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
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

export function AdminBlogForm({
  token,
  blog,
  onSaved,
}: Props) {
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

  const [tagsInput, setTagsInput] = useState(
    blog?.tags.join(', ') ?? '',
  )

  const [error, setError] = useState('')

  const [coverPreview, setCoverPreview] = useState(
    blog?.coverImage ?? '',
  )

  const [isUploadingCover, setIsUploadingCover] =
    useState(false)

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

      return blog
        ? updateBlog(token, blog.id, data)
        : createBlog(token, data)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['blogs'],
      })

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
      }
    },

    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const update = (
    key: keyof BlogInput,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  /**
   * Handle cover image selection
   */
  const handleCoverChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    setError('')

    /**
     * Validate type
     */
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      setError(
        'Only JPG, PNG and WebP images are allowed.',
      )

      event.target.value = ''
      return
    }

    /**
     * Max 5MB
     */
    if (file.size > 5 * 1024 * 1024) {
      setError('Cover image must be smaller than 5MB.')

      event.target.value = ''
      return
    }

    /**
     * Show local preview immediately.
     */
    const localPreview = URL.createObjectURL(file)

    setCoverPreview(localPreview)

    try {
      setIsUploadingCover(true)

      /**
       * Browser → Cloudinary
       *
       * Backend never receives the image.
       */
      const uploadedImage = await uploadImage(
        token,
        file,
        'blogCover',
      )

      /**
       * Store Cloudinary URL in form.
       */
      update('coverImage', uploadedImage.url)

      /**
       * Use Cloudinary URL after successful upload.
       */
      setCoverPreview(uploadedImage.url)
    } catch (err) {
      setCoverPreview(blog?.coverImage ?? '')

      setError(
        err instanceof Error
          ? err.message
          : 'Cover image upload failed.',
      )
    } finally {
      setIsUploadingCover(false)

      URL.revokeObjectURL(localPreview)

      /**
       * Allow selecting same file again.
       */
      event.target.value = ''
    }
  }

  /**
   * Remove selected cover.
   *
   * This only removes it from the blog form.
   *
   * It does NOT delete the Cloudinary file.
   */
  const removeCover = () => {
    setCoverPreview('')
    update('coverImage', '')
  }

  const isSaving =
    mutation.isPending || isUploadingCover

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()

        if (isUploadingCover) return

        mutation.mutate()
      }}
      className="grid gap-4 md:grid-cols-2"
    >
      {(
        ['title', 'slug', 'description'] as const
      ).map((key) => (
        <label key={key} className="group block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-dim">
            {key[0].toUpperCase() + key.slice(1)}
          </span>
          <input
            value={String(form[key] ?? '')}
            onChange={(event) =>
              update(key, event.target.value)
            }
            placeholder={
              key === 'title'
                ? 'A memorable title'
                : key === 'slug'
                  ? 'url-friendly-slug'
                  : 'A short summary (optional)'
            }
            required={
              key === 'title' || key === 'slug'
            }
            className="w-full rounded-xl border border-inkwell-cream/15 bg-inkwell-950 px-4 py-3 text-sm text-inkwell-cream outline-none transition duration-300 placeholder:text-inkwell-dim/60 focus:border-inkwell-gold focus:bg-inkwell-900"
          />
        </label>
      ))}

      {/* Cover image */}
      <div className="space-y-3 md:col-span-2">
        <span className="block font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-dim">
          Cover image
        </span>

        <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-inkwell-cream/20 bg-inkwell-950 px-6 py-10 text-center transition duration-300 hover:border-inkwell-gold/50 hover:bg-inkwell-900/60">
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="size-9 text-inkwell-gold"
            fill="none"
          >
            <path
              d="M8 34l10-11 7 8 6-6 9 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="17" cy="17" r="3.5" stroke="currentColor" strokeWidth="2" />
            <rect x="6" y="8" width="36" height="32" rx="5" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="text-sm font-medium text-inkwell-cream">
            Click to upload a cover
          </span>
          <span className="text-xs text-inkwell-muted">
            JPG, PNG or WebP · Maximum 5MB
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverChange}
            disabled={isSaving}
            className="hidden"
          />
        </label>

        {isUploadingCover && (
          <p className="text-sm text-inkwell-gold">
            Uploading cover image...
          </p>
        )}

        {coverPreview && (
          <div className="relative overflow-hidden rounded-2xl border border-inkwell-cream/15">
            <img
              src={coverPreview}
              alt="Cover preview"
              className="aspect-video w-full object-cover"
            />

            {!isUploadingCover && (
              <button
                type="button"
                onClick={removeCover}
                className="absolute right-3 top-3 rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black/85"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      <div className="md:col-span-2">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-dim">
          Content
        </span>
        <RichTextEditor
          value={String(form.content)}
          onChange={(value) =>
            update('content', value)
          }
        />
      </div>

      <label className="group flex items-center gap-3 rounded-xl border border-inkwell-cream/15 bg-inkwell-950 px-4 py-3.5 text-sm text-inkwell-muted transition hover:border-inkwell-gold/40">
        <input
          type="checkbox"
          checked={Boolean(form.isPublished)}
          onChange={(event) =>
            update(
              'isPublished',
              event.target.checked,
            )
          }
          className="size-4 accent-inkwell-gold"
        />

        <span>
          <span className="font-semibold text-inkwell-cream">
            {form.isPublished ? 'Published' : 'Save as draft'}
          </span>
          <span className="mt-0.5 block text-xs text-inkwell-dim">
            {form.isPublished
              ? 'Visible to everyone in the journal'
              : 'Only visible to you in the admin workspace'}
          </span>
        </span>
      </label>

      <input
        value={tagsInput}
        onChange={(event) =>
          setTagsInput(event.target.value)
        }
        placeholder="Tags, comma separated"
        className="rounded-xl border border-inkwell-cream/15 bg-inkwell-950 px-4 py-3 text-sm text-inkwell-cream outline-none transition duration-300 placeholder:text-inkwell-dim/60 focus:border-inkwell-gold focus:bg-inkwell-900"
      />

      <button
        disabled={isSaving}
        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-inkwell-gold px-5 py-3.5 text-sm font-bold text-inkwell-950 transition duration-300 hover:-translate-y-0.5 hover:bg-inkwell-light hover:shadow-lg hover:shadow-inkwell-gold/20 disabled:cursor-wait disabled:opacity-60 md:col-span-2"
      >
        {isUploadingCover
          ? 'Uploading image…'
          : mutation.isPending
            ? 'Saving…'
            : blog
              ? 'Update entry'
              : form.isPublished
                ? 'Publish entry'
                : 'Save draft'}
      </button>

      {error && (
        <p className="text-sm text-red-300 md:col-span-2">
          {error}
        </p>
      )}
    </form>
  )
}