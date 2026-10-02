import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  STATIC_PATHS,
} from './src/SEO/site.js'

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// SEO: fills the %SITE_URL%-style placeholders in index.html from
// src/SEO/site.js, and writes sitemap.xml (home, Guide Hub and every guide)
// and robots.txt. Both are also served by the dev server.
function seo() {
  const files = () => {
    const guides = JSON.parse(
      readFileSync(new URL('./src/Data/InfoLib/InfoData.json', import.meta.url), 'utf8'),
    ).data
    const newest = guides.reduce((latest, g) => (g.date > latest ? g.date : latest), '')
    const urls = [
      ...STATIC_PATHS.map((path) => ({ path, lastmod: newest })),
      ...guides.map((g) => ({ path: `/info/${encodeURIComponent(g.id)}`, lastmod: g.date })),
    ]
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${escapeHtml(SITE_URL + u.path)}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`
    const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`
    return { 'sitemap.xml': sitemap, 'robots.txt': robots }
  }

  const placeholders = {
    SITE_URL,
    SITE_NAME,
    DEFAULT_TITLE,
    DEFAULT_DESCRIPTION,
  }

  return {
    name: 'seo',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html.replace(/%(SITE_URL|SITE_NAME|DEFAULT_TITLE|DEFAULT_DESCRIPTION)%/g, (_, key) =>
          escapeHtml(placeholders[key]),
        ),
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = req.url?.slice(1)
        const content = files()[name]
        if (!content) return next()
        res.setHeader('Content-Type', name.endsWith('.xml') ? 'application/xml' : 'text/plain')
        res.end(content)
      })
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(files())) {
        this.emitFile({ type: 'asset', fileName, source })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), seo()],
})
