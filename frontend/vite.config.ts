import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://inkwell-blogs.pages.dev').replace(/\/$/, '')
const API_URL = (process.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')

// Static, always-present routes. Admin/auth/profile are noindex and excluded.
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/blogs', priority: '0.9', changefreq: 'daily' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
]

type PublishedBlog = { slug: string; publishedAt: string | null; updatedAt?: string }

function isoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10)
}

async function fetchPublishedBlogs(): Promise<PublishedBlog[]> {
  // Sitemap discovery must never fail a production build: an unreachable API
  // degrades to a static-only sitemap instead of throwing.
  try {
    const response = await fetch(`${API_URL}/api/v1/blogs?limit=100`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return []
    const body = (await response.json()) as { data?: PublishedBlog[] }
    return body.data ?? []
  } catch {
    return []
  }
}

function buildSitemap(routes: { path: string; lastmod?: string; priority: string; changefreq: string }[]) {
  const urls = routes
    .map((route) => {
      const lastmod = route.lastmod ? `\n    <lastmod>${route.lastmod}</lastmod>` : ''
      return `  <url>\n    <loc>${SITE_URL}${route.path}</loc>${lastmod}\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

const robotsTxt = `# https://developers.cloudflare.com/pages/\nUser-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /login\nDisallow: /profile\n\nSitemap: ${SITE_URL}/sitemap.xml\n`

/** Emits robots.txt + sitemap.xml at build time, pulling live blog slugs from the API. */
function seoSitemapPlugin(): Plugin {
  return {
    name: 'inkwell-seo-sitemap',
    apply: 'build',
    async generateBundle() {
      const blogs = await fetchPublishedBlogs()
      const blogRoutes = blogs.map((blog) => ({
        path: `/blogs/${blog.slug}`,
        lastmod: isoDate(blog.updatedAt ?? blog.publishedAt),
        priority: '0.8',
        changefreq: 'monthly',
      }))
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap([...STATIC_ROUTES, ...blogRoutes]) })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt })
      console.log(`[seo] emitted sitemap.xml (${STATIC_ROUTES.length + blogRoutes.length} urls) + robots.txt`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), babel({ presets: [reactCompilerPreset()] }), seoSitemapPlugin()],
})
