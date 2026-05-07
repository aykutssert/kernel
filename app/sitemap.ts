import type { MetadataRoute } from 'next'
import { getAllDocParams, getAllTags } from '@/lib/docs'
import { siteUrl } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [docParams, tags] = await Promise.all([
    getAllDocParams().catch(() => []),
    getAllTags().catch(() => []),
  ])

  const docUrls: MetadataRoute.Sitemap = docParams.map(({ category, slug }) => ({
    url: `${siteUrl}/docs/${category}/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const tagUrls: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${siteUrl}/prompts?tag=${encodeURIComponent(tag)}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/product-studio/templates`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/prompts`, changeFrequency: 'weekly', priority: 0.8 },
    ...docUrls,
    ...tagUrls,
  ]
}
