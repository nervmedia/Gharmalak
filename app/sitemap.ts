import type { MetadataRoute } from 'next';
import { site } from '@/lib/config';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/join', '/round/solar-nagpur', '/privacy'].map(p => ({ url: `${site.url}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7 }));
}
