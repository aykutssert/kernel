import type { MetadataRoute } from 'next'
import { getAllDocParams, getAllTags } from '@/lib/docs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const [docParams, tags] = await Promise.all([
    getAllDocParams().catch(() => []),
    getAllTags().catch(() => []),
  ])

  const docUrls: MetadataRoute.Sitemap = docParams.map(({ category, slug }) => ({
    url: `${baseUrl}/docs/${category}/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const tagUrls: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/prompts?tag=${encodeURIComponent(tag)}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [
    { url: baseUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/prompts`, changeFrequency: 'weekly', priority: 0.8 },
    ...docUrls,
    ...tagUrls,
  ]
}
