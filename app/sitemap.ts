import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://astartutorials.com'
  
  // Define the routes for the sitemap
  const routes = [
    '',
    '/tutorials',
    '/group-tutorials',
    '/private-tutorials',
    '/careers',
    '/feedback',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
