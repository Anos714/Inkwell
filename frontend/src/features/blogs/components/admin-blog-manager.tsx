import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { deleteBlog } from '../api/blog-api'
import type { Blog } from '../types'

type Props = { token: string; blogs: Blog[] }

export function AdminBlogManager({ token, blogs }: Props) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBlog(token, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
  })

  return (
    <div className="grid gap-3">
      {blogs.map((blog) => (
        <div key={blog.id} className="flex items-center justify-between gap-4 rounded-xl border border-inkwell-cream/10 bg-inkwell-950/60 px-4 py-3">
          <Link to={`/blogs/${blog.id}`} className="truncate text-sm hover:text-inkwell-gold">{blog.title}</Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link to={`/admin/blogs/edit/${blog.id}`} className="inline-flex min-w-20 items-center justify-center rounded-lg border border-inkwell-gold/60 px-3 py-2 text-xs font-semibold text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950">Edit</Link>
            <button type="button" onClick={() => deleteMutation.mutate(blog.id)} disabled={deleteMutation.isPending} className="inline-flex min-w-20 items-center justify-center rounded-lg border border-red-300/60 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-300 hover:text-inkwell-950 disabled:cursor-wait disabled:opacity-50">{deleteMutation.isPending ? 'Deleting…' : 'Delete'}</button>
          </div>
        </div>
      ))}
    </div>
  )
}
