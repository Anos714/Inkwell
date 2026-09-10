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
      className="grid gap-3 md:grid-cols-2"
    >
      {(
        ['title', 'slug', 'description'] as const
      ).map((key) => (
        <input
          key={key}
          value={String(form[key] ?? '')}
          onChange={(event) =>
            update(key, event.target.value)
          }
          placeholder={
            key[0].toUpperCase() + key.slice(1)
          }
          required={
            key === 'title' || key === 'slug'
          }
          className="rounded-xl border border-inkwell-cream/15 bg-inkwell-950 px-4 py-3 text-sm text-inkwell-cream outline-none focus:border-inkwell-gold"
        />
      ))}

      {/* Cover image */}
      <div className="space-y-3 md:col-span-2">
        <label className="block text-sm font-medium text-inkwell-cream">
          Cover image
        </label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverChange}
          disabled={isSaving}
          className="block w-full cursor-pointer rounded-xl border border-inkwell-cream/15 bg-inkwell-950 px-4 py-3 text-sm text-inkwell-cream file:mr-4 file:rounded-lg file:border-0 file:bg-inkwell-gold file:px-4 file:py-2 file:font-semibold file:text-inkwell-950"
        />

        <p className="text-xs text-inkwell-muted">
          JPG, PNG or WebP · Maximum 5MB
        </p>

        {isUploadingCover && (
          <p className="text-sm text-inkwell-gold">
            Uploading cover image...
          </p>
        )}

        {coverPreview && (
          <div className="relative overflow-hidden rounded-xl border border-inkwell-cream/15">
            <img
              src={coverPreview}
              alt="Cover preview"
              className="aspect-video w-full object-cover"
            />

            {!isUploadingCover && (
              <button
                type="button"
                onClick={removeCover}
                className="absolute right-3 top-3 rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold text-white"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      <RichTextEditor
        value={String(form.content)}
        onChange={(value) =>
          update('content', value)
        }
      />

      <input
        value={tagsInput}
        onChange={(event) =>
          setTagsInput(event.target.value)
        }
        placeholder="Tags, comma separated"
        className="rounded-xl border border-inkwell-cream/15 bg-inkwell-950 px-4 py-3 text-sm text-inkwell-cream outline-none focus:border-inkwell-gold"
      />

      <label className="flex items-center gap-3 px-2 text-sm text-inkwell-muted">
        <input
          type="checkbox"
          checked={Boolean(form.isPublished)}
          onChange={(event) =>
            update(
              'isPublished',
              event.target.checked,
            )
          }
        />

        Published
      </label>

      <button
        disabled={isSaving}
        className="rounded-xl bg-inkwell-gold px-5 py-3 text-sm font-bold text-inkwell-950 disabled:opacity-60 md:col-span-2"
      >
        {isUploadingCover
          ? 'Uploading image…'
          : mutation.isPending
            ? 'Saving…'
            : blog
              ? 'Update entry'
              : 'Publish entry'}
      </button>

      {error && (
        <p className="text-sm text-red-300 md:col-span-2">
          {error}
        </p>
      )}
    </form>
  )
}