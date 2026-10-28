import type { MetadataRoute } from 'next';
import { site } from '@/lib/config';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/deals', '/join', '/round/solar-nagpur', '/privacy', '/check'].map(p => ({ url: `${site.url}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7 }));
}
