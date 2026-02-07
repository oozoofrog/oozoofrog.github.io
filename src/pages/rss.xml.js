import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  const sortedPosts = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: '우주개구리 | oozoofrog',
    description: 'iOS & macOS 앱 개발, 오픈소스 개발 도구를 만드는 우주개구리입니다.',
    site: context.site,
    items: sortedPosts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
    })),
  });
}
