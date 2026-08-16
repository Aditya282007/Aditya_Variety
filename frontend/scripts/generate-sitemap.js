import { readFileSync, writeFileSync } from 'fs'
import { globSync } from 'glob'

const BASE_URL = 'https://aditya-variety.vercel.app'

// Static routes
const staticRoutes = [
  '',
  '/products',
  '/categories',
  '/contact',
  '/login',
  '/register',
  '/cart',
  '/checkout',
  '/account',
  '/account/orders',
]

// Dynamic routes from built files
function getDynamicRoutes() {
  const routes: string[] = []
  
  // Product pages would be dynamic - add a placeholder
  // In production, you'd query your database for all product slugs
  
  return routes
}

function generateSitemap() {
  const allRoutes = [...staticRoutes, ...getDynamicRoutes()]
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route === '' ? 'daily' : route === '/products' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '' ? '1.0' : route === '/products' ? '0.9' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>`

  writeFileSync('frontend/dist/sitemap.xml', sitemap)
  console.log('Sitemap generated at frontend/dist/sitemap.xml')
}

generateSitemap()