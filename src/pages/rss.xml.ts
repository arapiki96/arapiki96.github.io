import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Thomas Manch | Blog',
    description: 'Notes, analysis, and occasional updates from Thomas Manch',
    site: context.site?.toString() ?? 'https://arapiki96.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.slug.replace(/\/index$/, '')}/`,
    })),
    customData: `<language>en-nz</language>`,
  });
}
