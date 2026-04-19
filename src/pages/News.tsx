import { useEffect, useState } from 'react';
import { NewsCarousel } from '../components/EventsNewsCarousels';
import { getNewsList, type NewsCardItem } from '../services/cmsApi';

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsCardItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const news = await getNewsList();
        setNewsList(news);
      } catch (error) {
        console.error("Error fetching news:", error);
        setNewsList([]);
      }
    };

    void fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-white py-24 pt-32 dark:bg-[#070d19]">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-12">
        <div className="mb-16 text-center sm:text-left">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">University News</h1>
          <p className="text-xl font-medium text-emerald-700 dark:text-emerald-400">Stay updated with the latest happenings around campus.</p>
        </div>
        <NewsCarousel news={newsList} />
      </div>
    </div>
  );
}